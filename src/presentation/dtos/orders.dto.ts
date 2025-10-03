import { z } from "zod";

export const CreateOrderDto = z.object({
  serviceType: z.enum(["DINE_IN","TAKEAWAY","DELIVERY"]),
  tableId: z.number().int().positive().optional(),
  note: z.string().optional(),
  covers: z.number().int().positive().optional(),
  status: z.enum(["DRAFT","OPEN","HOLD"]).optional() // default OPEN
});
export type CreateOrderDtoType = z.infer<typeof CreateOrderDto>;

export const AddOrderItemDto = z.object({
  productId: z.number().int().positive(),
  variantId: z.number().int().positive().optional(),
  quantity: z.number().int().positive().default(1),
  notes: z.string().optional(),
  modifiers: z.array(z.object({
    optionId: z.number().int().positive(),
    quantity: z.number().int().positive().default(1),
  })).default([])
});

export const UpdateOrderItemStatusDto = z.object({
  status: z.enum(["NEW","IN_PROGRESS","READY","SERVED","CANCELED"])
});

export const AddPaymentDto = z.object({
  method: z.enum(["CASH","CARD","TRANSFER","OTHER"]),
  amountCents: z.number().int().nonnegative(),
  tipCents: z.number().int().nonnegative().default(0),
  note: z.string().optional()
});
export const UpdateOrderItemDto = z.object({
  quantity: z.number().int().positive().optional(),
  notes: z.string().optional(),
  // Reemplaza por completo los modificadores del renglón (opcional)
  replaceModifiers: z.array(z.object({
    optionId: z.number().int().positive(),
    quantity: z.number().int().positive().default(1)
  })).optional()
});
export type UpdateOrderItemDtoType = z.infer<typeof UpdateOrderItemDto>;

export const SplitOrderByItemsDto = z.object({
  itemIds: z.array(z.number().int().positive()).min(1),
  // Puedes sobreescribir metadatos del pedido nuevo (opcionales)
  serviceType: z.enum(["DINE_IN","TAKEAWAY","DELIVERY"]).optional(),
  tableId: z.number().int().positive().nullable().optional(),
  note: z.string().optional(),
  covers: z.number().int().positive().optional()
});
export type SplitOrderByItemsDtoType = z.infer<typeof SplitOrderByItemsDto>;
export const UpdateOrderMetaDto = z.object({
  tableId: z.number().int().positive().nullable().optional(), // null para quitar mesa
  note: z.string().nullable().optional(),
  covers: z.number().int().positive().nullable().optional()
});
export type UpdateOrderMetaDtoType = z.infer<typeof UpdateOrderMetaDto>;

export const UpdateOrderStatusDto = z.object({
  status: z.enum(["DRAFT","OPEN","HOLD","CLOSED","CANCELED"])
});
export type UpdateOrderStatusDtoType = z.infer<typeof UpdateOrderStatusDto>;