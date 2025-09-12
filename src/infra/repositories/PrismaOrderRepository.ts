// src/infra/repositories/PrismaOrderRepository.ts
import { prisma } from "../../lib/prisma";
import type { IOrderRepository } from "../../core/domain/repositories/IOrderRepository";
import type { Prisma, Order, OrderItem, Payment } from "@prisma/client";

// ===== Tipos auxiliares (alineados con tus enums Prisma) =====
type ServiceType = "DINE_IN" | "TAKEAWAY" | "DELIVERY";
type OrderDraftStatus = "DRAFT" | "OPEN" | "HOLD";
type OrderItemStatus = "NEW" | "IN_PROGRESS" | "READY" | "SERVED" | "CANCELED";
type PaymentMethod = "CASH" | "CARD" | "TRANSFER" | "OTHER";

interface CreateOrderInput {
  serviceType: ServiceType;
  tableId?: number | null;
  note?: string | null;
  covers?: number | null;
  status?: OrderDraftStatus;
}

interface AddItemModifierInput {
  optionId: number;
  quantity?: number;
}

interface AddItemInput {
  productId: number;
  variantId?: number | null;
  quantity: number;
  notes?: string | null;
  modifiers: AddItemModifierInput[];
}

interface AddPaymentInput {
  method: PaymentMethod;
  amountCents: number;
  tipCents: number;
  receivedByUserId: number;
  note?: string | null;
}

function generateOrderCode() {
  const now = new Date();
  const y = now.getFullYear().toString().slice(-2);
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const s = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `IM-${y}${m}${d}-${s}`;
}

export class PrismaOrderRepository implements IOrderRepository {
  async create(input: CreateOrderInput, servedByUserId: number): Promise<Order> {
    const order = await prisma.order.create({
      data: {
        code: generateOrderCode(),
        status: (input.status ?? "OPEN") as any, // status es enum en DB
        serviceType: input.serviceType as any,    // serviceType enum en DB
        tableId: input.tableId ?? null,
        note: input.note ?? null,
        covers: input.covers ?? null,
        servedByUserId,
      },
    });
    return order;
  }

  // El tipo de retorno depende de tu interfaz; si la interfaz espera Order | null, puedes tiparlo así:
  // getById(orderId: number): Promise<Order | null> { ... }
  // Aquí dejamos que TS infiera; si quieres lo tipamos a Promise<any>.
  getById(orderId: number) {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            variant: true,
            product: { select: { id: true, name: true, type: true } },
            modifiers: true,
            childItems: true,
            parentItem: { select: { id: true } },
          },
          orderBy: { id: "asc" },
        },
        payments: true,
        table: true,
      },
    });
  }

  async addItem(orderId: number, data: AddItemInput): Promise<{ item: OrderItem }> {
    return prisma.$transaction(async (tx) => {
      // 1) Trae producto/variante y valida disponibilidad
      const product = await tx.product.findUnique({
        where: { id: data.productId },
        include: { variants: true, comboItemsAsCombo: true },
      });
      if (!product || !product.isActive || !product.isAvailable) {
        throw new Error("Producto no disponible");
      }

      let basePrice = 0;
      let variantName: string | null = null;

      if (product.type === "VARIANTED") {
        if (!data.variantId) throw new Error("variantId requerido para producto VARIANTED");
        const variant = await tx.productVariant.findUnique({ where: { id: data.variantId } });
        if (!variant || !variant.isActive || !variant.isAvailable) {
          throw new Error("Variante no disponible");
        }
        basePrice = variant.priceCents;
        variantName = variant.name;
      } else {
        basePrice = product.priceCents ?? 0;
      }

      // 2) Calcula extras/modifiers
      let extras = 0;
      const mods: {
        optionId: number;
        quantity: number;
        priceExtraCents: number;
        nameSnapshot: string;
      }[] = [];

      if (data.modifiers?.length) {
        const ids = data.modifiers.map((mm) => mm.optionId);
        const options = await tx.modifierOption.findMany({ where: { id: { in: ids } } });
        for (const m of data.modifiers as AddItemModifierInput[]) {
          const opt = options.find((o) => o.id === m.optionId);
          if (!opt) continue;
          const qty = m.quantity ?? 1;
          const extra = (opt.priceExtraCents || 0) * qty;
          extras += extra;
          mods.push({
            optionId: opt.id,
            quantity: qty,
            priceExtraCents: opt.priceExtraCents || 0,
            nameSnapshot: opt.name,
          });
        }
      }

      const totalUnit = basePrice + extras;
      const total = totalUnit * data.quantity;

      // 3) Crea renglón principal
      const item = await tx.orderItem.create({
        data: {
          orderId,
          productId: product.id,
          variantId: data.variantId ?? null,
          quantity: data.quantity,
          status: "NEW",
          basePriceCents: basePrice,
          extrasTotalCents: extras,
          totalPriceCents: total,
          nameSnapshot: product.name,
          variantNameSnapshot: variantName,
          notes: data.notes ?? null,
          modifiers: mods.length ? { createMany: { data: mods } } : undefined,
        },
      });

      // 4) Si es combo, crea hijos
      if (product.type === "COMBO" && product.comboItemsAsCombo.length) {
        for (const ci of product.comboItemsAsCombo) {
          const comp = await tx.product.findUnique({ where: { id: ci.componentProductId } });
          await tx.orderItem.create({
            data: {
              orderId,
              productId: ci.componentProductId,
              parentItemId: item.id,
              quantity: (ci.quantity || 1) * data.quantity,
              status: "NEW",
              basePriceCents: 0,
              extrasTotalCents: 0,
              totalPriceCents: 0,
              nameSnapshot: comp ? comp.name : `Producto ${ci.componentProductId}`,
              variantNameSnapshot: null,
            },
          });
        }
      }

      // 5) Recalcula totales del pedido
      await this.recalcTotalsTx(tx, orderId);

      return { item };
    });
  }

  async updateItemStatus(orderItemId: number, status: OrderItemStatus): Promise<void> {
    await prisma.orderItem.update({ where: { id: orderItemId }, data: { status: status as any } });
  }

  async addPayment(orderId: number, data: AddPaymentInput): Promise<Payment> {
    const payment = await prisma.$transaction(async (tx) => {
      const pay = await tx.payment.create({
        data: {
          orderId,
          method: data.method as any,
          amountCents: data.amountCents,
          tipCents: data.tipCents || 0,
          receivedByUserId: data.receivedByUserId,
          note: data.note ?? null,
        },
      });

      // Suma pagos y cierra si está cubierto
      const agg = await tx.payment.aggregate({
        where: { orderId },
        _sum: { amountCents: true, tipCents: true },
      });
      const ord = await tx.order.findUnique({ where: { id: orderId } });
      const paid = (agg._sum.amountCents || 0) + (agg._sum.tipCents || 0);
      if (ord && paid >= (ord.totalCents || 0)) {
        await tx.order.update({
          where: { id: orderId },
          data: { status: "CLOSED", closedAt: new Date() },
        });
      }
      return pay;
    });
    return payment;
  }

  async recalcTotals(orderId: number): Promise<void> {
    await prisma.$transaction(async (tx) => this.recalcTotalsTx(tx, orderId));
  }

  // 🔧 IMPORTANTE: usar Prisma.TransactionClient aquí
  private async recalcTotalsTx(tx: Prisma.TransactionClient, orderId: number): Promise<void> {
    const items = await tx.orderItem.findMany({ where: { orderId } });
    const subtotal = items.reduce((acc, it) => acc + (it.totalPriceCents || 0), 0);
    // aquí podrías calcular impuestos/servicio/descuentos si aplica
    await tx.order.update({
      where: { id: orderId },
      data: {
        subtotalCents: subtotal,
        discountCents: 0,
        serviceFeeCents: 0,
        taxCents: 0,
        totalCents: subtotal,
      },
    });
  }

  async listKDS(statuses: ("NEW" | "IN_PROGRESS" | "READY")[]) {
    const rows = await prisma.orderItem.findMany({
      where: { status: { in: statuses as any } },
      include: {
        order: { select: { id: true, code: true, table: { select: { name: true } } } },
      },
      orderBy: [{ id: "asc" }],
    });
    return rows.map((r) => ({
      itemId: r.id,
      orderId: r.orderId,
      status: r.status,
      quantity: r.quantity,
      name: r.nameSnapshot,
      variant: r.variantNameSnapshot,
      tableName: r.order.table?.name ?? null,
      code: r.order.code,
      parentItemId: r.parentItemId ?? null,
    }));
  }
    async updateItem(orderItemId: number, data: {
    quantity?: number;
    notes?: string | null;
    replaceModifiers?: { optionId: number; quantity?: number }[];
  }): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const current = await tx.orderItem.findUnique({
        where: { id: orderItemId },
        include: {
          product: { include: { comboItemsAsCombo: true } },
          modifiers: true,
          childItems: true
        }
      });
      if (!current) throw new Error("Order item no encontrado");

      // 1) Reemplazo de modificadores (opcional)
      let extras = current.extrasTotalCents || 0;
      if (data.replaceModifiers) {
        // recalcular extras desde cero
        const ids = data.replaceModifiers.map(m => m.optionId);
        const options = await tx.modifierOption.findMany({ where: { id: { in: ids } } });

        // borra los anteriores
        await tx.orderItemModifier.deleteMany({ where: { orderItemId } });

        // crea los nuevos
        const toCreate = data.replaceModifiers.map(m => {
          const opt = options.find(o => o.id === m.optionId);
          if (!opt) throw new Error(`Modifier option ${m.optionId} inválido`);
          const qty = m.quantity ?? 1;
          return {
            orderItemId,
            optionId: opt.id,
            quantity: qty,
            priceExtraCents: opt.priceExtraCents || 0,
            nameSnapshot: opt.name
          };
        });
        if (toCreate.length) {
          await tx.orderItemModifier.createMany({ data: toCreate });
        }

        // suma extras
        extras = toCreate.reduce((acc, it) => acc + it.priceExtraCents * it.quantity, 0);
      } else {
        // si no se reemplazaron, manten los actuales
        extras = (await tx.orderItemModifier.findMany({ where: { orderItemId } }))
          .reduce((acc, it) => acc + it.priceExtraCents * it.quantity, 0);
      }

      // 2) Actualizar quantity y notas
      const newQty = data.quantity ?? current.quantity;
      const base = current.basePriceCents || 0;
      const totalUnit = base + extras;
      const newTotal = totalUnit * newQty;

      await tx.orderItem.update({
        where: { id: orderItemId },
        data: {
          quantity: newQty,
          notes: data.notes ?? current.notes ?? null,
          extrasTotalCents: extras,
          totalPriceCents: newTotal
        }
      });

      // 3) Si es combo (item padre), escalar cantidades de hijos proporcionalmente
      if (current.childItems?.length) {
        const oldQty = current.quantity || 1;
        if (oldQty !== newQty && oldQty > 0) {
          for (const child of current.childItems) {
            const perParent = Math.max(1, Math.round(child.quantity / oldQty)); // aproximar
            const newChildQty = perParent * newQty;
            await tx.orderItem.update({
              where: { id: child.id },
              data: { quantity: newChildQty }
            });
          }
        }
      }

      await this.recalcTotalsTx(tx, current.orderId);
    });
  }

  async removeItem(orderItemId: number): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const item = await tx.orderItem.findUnique({
        where: { id: orderItemId },
        select: { id: true, orderId: true, parentItemId: true }
      });
      if (!item) return;

      // borra modifiers del item y de los hijos
      await tx.orderItemModifier.deleteMany({
        where: { OR: [{ orderItemId }, { orderItem: { parentItemId: orderItemId } }] }
      });

      // borra hijos si los hay
      await tx.orderItem.deleteMany({ where: { parentItemId: orderItemId } });

      // borra el item
      await tx.orderItem.delete({ where: { id: orderItemId } });

      await this.recalcTotalsTx(tx, item.orderId);
    });
  }

  async splitOrderByItems(sourceOrderId: number, input: {
    itemIds: number[];
    servedByUserId: number;
    serviceType?: ServiceType;
    tableId?: number | null;
    note?: string | null;
    covers?: number | null;
  }): Promise<{ newOrderId: number; code: string }> {
    return prisma.$transaction(async (tx) => {
      // 1) Trae items y valida que pertenecen al pedido
      const items = await tx.orderItem.findMany({
        where: { id: { in: input.itemIds } },
        select: { id: true, orderId: true, parentItemId: true }
      });
      if (!items.length) throw new Error("Sin items para dividir");
      if (items.some(i => i.orderId !== sourceOrderId)) {
        throw new Error("Todos los items deben pertenecer al mismo pedido");
      }

      // 2) Expandir para combos: si uno es padre, incluye todos sus hijos.
      const parentIds = items.filter(i => !i.parentItemId).map(i => i.id);
      const childIds = items.filter(i => i.parentItemId).map(i => i.id);

      // Si enviaron un hijo sin el padre → también movemos el padre y todos sus hijos
      let fullMoveIds = new Set<number>(items.map(i => i.id));

      // incluye hijos de todos los padres seleccionados
      if (parentIds.length) {
        const allChilds = await tx.orderItem.findMany({
          where: { parentItemId: { in: parentIds } },
          select: { id: true }
        });
        for (const c of allChilds) fullMoveIds.add(c.id);
      }

      // Si hay hijos sin su padre en la selección, trae a sus padres y a todos los hermanos
      if (childIds.length) {
        const theirParents = await tx.orderItem.findMany({
          where: { id: { in: childIds } },
          select: { parentItemId: true }
        });
        const pIds = [...new Set(theirParents.map(p => p.parentItemId).filter(Boolean))] as number[];
        if (pIds.length) {
          const theParents = await tx.orderItem.findMany({ where: { id: { in: pIds } }, select: { id: true } });
          for (const p of theParents) fullMoveIds.add(p.id);
          const siblings = await tx.orderItem.findMany({ where: { parentItemId: { in: pIds } }, select: { id: true } });
          for (const s of siblings) fullMoveIds.add(s.id);
        }
      }

      const idsArray = Array.from(fullMoveIds);

      // 3) Crear el nuevo pedido con metadatos (usa los del pedido original si no mandan override)
      const src = await tx.order.findUnique({ where: { id: sourceOrderId } });
      if (!src) throw new Error("Pedido origen no existe");

      const newOrder = await tx.order.create({
        data: {
          code: generateOrderCode(),
          status: "OPEN",
          serviceType: (input.serviceType ?? src.serviceType) as any,
          tableId: input.tableId ?? src.tableId ?? null,
          note: input.note ?? null,
          covers: input.covers ?? src.covers ?? null,
          servedByUserId: input.servedByUserId
        }
      });

      // 4) Mover los items (actualiza orderId; parent/child siguen apuntando a sus ids originales que también fueron movidos)
      await tx.orderItem.updateMany({
        where: { id: { in: idsArray } },
        data: { orderId: newOrder.id }
      });

      // 5) Recalcular totales en ambos pedidos
      await this.recalcTotalsTx(tx, sourceOrderId);
      await this.recalcTotalsTx(tx, newOrder.id);

      return { newOrderId: newOrder.id, code: newOrder.code };
    });
  }
}
