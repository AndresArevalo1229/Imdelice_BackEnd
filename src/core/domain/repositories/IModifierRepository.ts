import type { Product, ModifierGroup, ModifierOption } from '@prisma/client';

export interface IModifierRepository {
  createGroupWithOptions(data: {
    name: string; description?: string; minSelect?: number; maxSelect?: number | null; isRequired?: boolean;
    options: { name: string; priceExtraCents?: number; isDefault?: boolean; position?: number }[];
  }): Promise<{ group: ModifierGroup; options: ModifierOption[] }>;

  updateGroup(id: number, data: Partial<Pick<ModifierGroup,'name'|'description'|'minSelect'|'maxSelect'|'isRequired'|'isActive'>>): Promise<ModifierGroup>;

  replaceOptions(groupId: number, options: { name: string; priceExtraCents?: number; isDefault?: boolean; position?: number }[]): Promise<void>;

  deactivateGroup(id: number): Promise<void>;
  deleteGroupHard(id: number): Promise<void>;
  

listGroups(filter?: {
    isActive?: boolean;
    categoryId?: number;
    categorySlug?: string;
    search?: string;
  }): Promise<(ModifierGroup & { options: ModifierOption[] })[]>;

  getGroup(id: number): Promise<(ModifierGroup & { options: ModifierOption[] }) | null>;

  listByProduct(productId: number): Promise<
    { id: number; position: number; group: ModifierGroup & { options: ModifierOption[] } }[]
  >;
// NUEVO: listar productos vinculados a un grupo de modificadores
listProductsByGroup(
  groupId: number,
  filter?: { isActive?: boolean; search?: string; limit?: number; offset?: number }
): Promise<Array<{
  linkId: number;               // id de productModifierGroup
  position: number;
  product: {
    id: number; name: string; type: 'SIMPLE'|'VARIANTED'|'COMBO';
    priceCents: number | null; isActive: boolean; categoryId: number;
  };
}>>;


}
