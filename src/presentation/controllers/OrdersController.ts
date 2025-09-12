import { Request, Response } from "express";
import { success, fail } from "../utils/apiResponse";
import { CreateOrderDto, AddOrderItemDto, UpdateOrderItemStatusDto, AddPaymentDto } from "../dtos/orders.dto";
import { CreateOrder } from "../../core/usecases/orders/CreateOrder";
import { AddOrderItem } from "../../core/usecases/orders/AddOrderItem";
import { UpdateOrderItemStatus } from "../../core/usecases/orders/UpdateOrderItemStatus";
import { AddPayment } from "../../core/usecases/orders/AddPayment";
import { GetOrderDetail } from "../../core/usecases/orders/GetOrderDetail";
import { ListKDS } from "../../core/usecases/orders/ListKDS";
import { UpdateOrderItemDto, SplitOrderByItemsDto } from "../dtos/orders.dto";
import { UpdateOrderItem } from "../../core/usecases/orders/UpdateOrderItem";
import { RemoveOrderItem } from "../../core/usecases/orders/RemoveOrderItem";
import { SplitOrderByItems } from "../../core/usecases/orders/SplitOrderByItems";
import type { AuthRequest } from "../middlewares/authenticate";

export class OrdersController {
  constructor(
    private createOrderUC: CreateOrder,
    private addItemUC: AddOrderItem,
    private updateItemStatusUC: UpdateOrderItemStatus,
    private addPaymentUC: AddPayment,
    private getOrderDetailUC: GetOrderDetail,
    private listKDSUC: ListKDS,
      private updateOrderItemUC: UpdateOrderItem,      // 👈 nuevo
  private removeOrderItemUC: RemoveOrderItem,      // 👈 nuevo
  private splitOrderByItemsUC: SplitOrderByItems   // 👈 nuevo
  ) {}

  create = async (req: Request, res: Response) => {
    try {
      const dto = CreateOrderDto.parse(req.body);
    const userId = (req as AuthRequest).auth?.userId;  // ⬅️ CAMBIO AQUÍ
      console.log("ola sou " + userId);
      if (!userId) return fail(res, "Unauthorized", 401);
      const order = await this.createOrderUC.exec(dto, userId);
      return success(res, order, "Created", 201);
    } catch (e: any) { return fail(res, e?.message || "Error creating order", 400, e); }
  };

  get = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const data = await this.getOrderDetailUC.exec(id);
      if (!data) return fail(res, "Not found", 404);
      return success(res, data);
    } catch (e:any) { return fail(res, e?.message || "Error fetching order", 400, e); }
  };

  addItem = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const dto = AddOrderItemDto.parse(req.body);
      const result = await this.addItemUC.exec(id, dto);
      return success(res, result, "Item added", 201);
    } catch (e:any) { return fail(res, e?.message || "Error adding item", 400, e); }
  };

  setItemStatus = async (req: Request, res: Response) => {
    try {
      const itemId = Number(req.params.itemId);
      const dto = UpdateOrderItemStatusDto.parse(req.body);
      await this.updateItemStatusUC.exec(itemId, dto.status);
      return success(res, null, "Updated", 204);
    } catch (e:any) { return fail(res, e?.message || "Error updating status", 400, e); }
  };

  addPayment = async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const dto = AddPaymentDto.parse(req.body);
      const receivedByUserId = (req as any).user?.id;
      if (!receivedByUserId) return fail(res, "Unauthorized", 401);
      const payment = await this.addPaymentUC.exec(id, { ...dto, receivedByUserId });
      return success(res, payment, "Paid", 201);
    } catch (e:any) { return fail(res, e?.message || "Error adding payment", 400, e); }
  };

  kds = async (req: Request, res: Response) => {
    try {
      const statuses = (req.query.status as string || "NEW,IN_PROGRESS").split(",") as any;
      const rows = await this.listKDSUC.exec(statuses);
      return success(res, rows);
    } catch (e:any) { return fail(res, e?.message || "Error KDS", 400, e); }
  };

// handlers nuevos:
updateItem = async (req: Request, res: Response) => {
  try {
    const itemId = Number(req.params.itemId);
    const dto = UpdateOrderItemDto.parse(req.body);
    await this.updateOrderItemUC.exec(itemId, {
      quantity: dto.quantity,
      notes: dto.notes,
      replaceModifiers: dto.replaceModifiers
    });
    return success(res, null, "Updated", 204);
  } catch (e:any) { return fail(res, e?.message || "Error updating order item", 400, e); }
};

removeItem = async (req: Request, res: Response) => {
  try {
    const itemId = Number(req.params.itemId);
    await this.removeOrderItemUC.exec(itemId);
    return success(res, null, "Deleted", 204);
  } catch (e:any) { return fail(res, e?.message || "Error deleting order item", 400, e); }
};

splitByItems = async (req: Request, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const dto = SplitOrderByItemsDto.parse(req.body);
    const servedByUserId = (req as any).user?.id;
    if (!servedByUserId) return fail(res, "Unauthorized", 401);
    const result = await this.splitOrderByItemsUC.exec(orderId, {
      ...dto,
      servedByUserId
    });
    return success(res, result, "Order split", 201);
  } catch (e:any) { return fail(res, e?.message || "Error splitting order", 400, e); }
};
}
