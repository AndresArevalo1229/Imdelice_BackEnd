import type { Order, OrderItem, Payment } from "@prisma/client";

export interface IOrderRepository {
  create(input: {
    serviceType: "DINE_IN"|"TAKEAWAY"|"DELIVERY";
    tableId?: number | null;
    note?: string | null;
    covers?: number | null;
    status?: "DRAFT"|"OPEN"|"HOLD";
  }, servedByUserId: number): Promise<Order>;

  getById(orderId: number): Promise<Order | null>;

  addItem(orderId: number, data: {
    productId: number;
    variantId?: number | null;
    quantity: number;
    notes?: string | null;
    modifiers: { optionId: number; quantity: number }[];
  }): Promise<{ item: OrderItem }>;

  updateItemStatus(orderItemId: number, status: "NEW"|"IN_PROGRESS"|"READY"|"SERVED"|"CANCELED"): Promise<void>;

  addPayment(orderId: number, data: {
    method: "CASH"|"CARD"|"TRANSFER"|"OTHER";
    amountCents: number;
    tipCents: number;
    receivedByUserId: number;
    note?: string | null;
  }): Promise<Payment>;

  recalcTotals(orderId: number): Promise<void>;

  // KDS (Kitchen Display): lista renglones por estado
  listKDS(statuses: ("NEW"|"IN_PROGRESS"|"READY")[]): Promise<Array<{
    itemId: number;
    orderId: number;
    status: string;
    quantity: number;
    name: string;
    variant?: string | null;
    tableName?: string | null;
    code: string;
    parentItemId?: number | null;
  }>>;
  
  updateItem(orderItemId: number, data: {
    quantity?: number;
    notes?: string | null;
    replaceModifiers?: { optionId: number; quantity?: number }[];
  }): Promise<void>;

  removeItem(orderItemId: number): Promise<void>;

  splitOrderByItems(sourceOrderId: number, input: {
    itemIds: number[];
    servedByUserId: number;
    serviceType?: "DINE_IN"|"TAKEAWAY"|"DELIVERY";
    tableId?: number | null;
    note?: string | null;
    covers?: number | null;
  }): Promise<{ newOrderId: number; code: string }>;
 updateMeta(orderId: number, data: {
    tableId?: number | null;
    note?: string | null;
    covers?: number | null;
  }): Promise<void>;

  updateStatus(orderId: number, status: "DRAFT"|"OPEN"|"HOLD"|"CLOSED"|"CANCELED"): Promise<void>;

}
