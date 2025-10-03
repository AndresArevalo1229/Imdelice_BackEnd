import { z } from 'zod';

export const CreateProductSimpleDto = z.object({
  name: z.string().min(2),
  categoryId: z.number().int().positive(),
  priceCents: z.number().int().nonnegative(),
  description: z.string().optional(),
  sku: z.string().optional(),
 // imageUrl: z.string().url().optional(),
});

export const VariantInputDto = z.object({
  id: z.number().int().positive().optional(), // para updates
  name: z.string().min(1),
  priceCents: z.number().int().nonnegative(),
  sku: z.string().optional(),
});

export const CreateProductVariantedDto = z.object({
  name: z.string().min(2),
  categoryId: z.number().int().positive(),
  variants: z.array(VariantInputDto.omit({ id: true })).min(1),
  description: z.string().optional(),
  sku: z.string().optional(),
  //imageUrl: z.string().url().optional(),
});

export const UpdateProductDto = z.object({
  name: z.string().min(2).optional(),
  categoryId: z.number().int().positive().optional(),
  priceCents: z.number().int().nonnegative().nullable().optional(), // SIMPLE o null si varianted
  description: z.string().optional(),
  sku: z.string().optional(),
  //imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional()
});
// NUEVOS DTOs para conversión
export const ConvertToVariantedDto = z.object({
  variants: z.array(z.object({
    name: z.string().min(1),
    priceCents: z.number().int().nonnegative(),
    sku: z.string().optional(),
  })).min(1),
})
export const ConvertToSimpleDto = z.object({
  priceCents: z.number().int().nonnegative(),
})

export type ConvertToVariantedDto = z.infer<typeof ConvertToVariantedDto>
export type ConvertToSimpleDto   = z.infer<typeof ConvertToSimpleDto>

export const ReplaceVariantsDto = z.object({
  variants: z.array(VariantInputDto).min(1)
});

export const ListProductsQueryDto = z.object({
  categorySlug: z.string().optional(),
  type: z.enum(['SIMPLE','VARIANTED','COMBO']).optional(),
  isActive: z.coerce.boolean().optional(),
});
export const UpdateAvailabilityDto = z.object({
  isAvailable: z.boolean()
});
export type UpdateAvailabilityDtoType = z.infer<typeof UpdateAvailabilityDto>;