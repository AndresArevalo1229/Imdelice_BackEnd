import { z } from 'zod';

export const CreateMenuDto = z.object({ name: z.string().min(2), isActive: z.boolean().optional() });
export const UpdateMenuDto = z.object({ name: z.string().min(2).optional(), isActive: z.boolean().optional() });

export const CreateMenuSectionDto = z.object({
  menuId: z.number().int().positive(),
  name: z.string().min(2),
  position: z.number().int().nonnegative().optional(),
  categoryId: z.number().int().positive().nullable().optional()
});
export const UpdateMenuSectionDto = z.object({
  name: z.string().min(2).optional(),
  position: z.number().int().nonnegative().optional(),
  categoryId: z.number().int().positive().nullable().optional()
});

export const AddMenuItemDto = z.object({
  sectionId: z.number().int().positive(),
  productId: z.number().int().positive(),
  displayName: z.string().optional(),
  displayPriceCents: z.number().int().nonnegative().nullable().optional(),
  position: z.number().int().nonnegative().optional(),
  isFeatured: z.boolean().optional()
});
export const UpdateMenuItemDto = z.object({
  displayName: z.string().optional(),
  displayPriceCents: z.number().int().nonnegative().nullable().optional(),
  position: z.number().int().nonnegative().optional(),
  isFeatured: z.boolean().optional()
});
