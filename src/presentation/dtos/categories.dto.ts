import { z } from 'zod';

export const CreateCategoryDto = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  parentId: z.number().int().positive().nullable().optional(),
  position: z.number().int().nonnegative().optional()
});
export type CreateCategoryDtoType = z.infer<typeof CreateCategoryDto>;

export const UpdateCategoryDto = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  parentId: z.number().int().positive().nullable().optional(),
  position: z.number().int().nonnegative().optional(),
  isActive: z.boolean().optional()
});
export type UpdateCategoryDtoType = z.infer<typeof UpdateCategoryDto>;
