import type { Product, ProductVariant } from '@prisma/client';

export type ProductWithDetails = Product & {
  variants: ProductVariant[];
  modifierGroups: {
    id: number;
    position: number;
    group: {
      id: number; name: string; minSelect: number; maxSelect: number | null; isRequired: boolean;
      options: { id: number; name: string; priceExtraCents: number; isDefault: boolean }[];
    }
  }[];
  comboItemsAsCombo: {
    id: number;
    quantity: number;
    isRequired: boolean;
    notes: string | null;
    componentProduct: {
      id: number;
      name: string;
      type: 'SIMPLE' | 'VARIANTED' | 'COMBO';
      priceCents: number | null;
      isActive: boolean;
    }
  }[];
};

export interface IProductRepository {
  createSimple(data: {
    name: string; categoryId: number; priceCents: number;
    description?: string; sku?: string;     image?: { buffer: Buffer; mimeType: string; size: number };

  }): Promise<Product>;

 createVarianted(data: {
    name: string;
    categoryId: number;
    variants: { name: string; priceCents: number; sku?: string }[];
    description?: string;
    sku?: string;
    image?: { buffer: Buffer; mimeType: string; size: number };
  }): Promise<Product>;


  update(id: number, data: Partial<Pick<Product,
    'name'|'categoryId'|'priceCents'|'description'|'sku'|'isActive'
  >> & {
    image?: { buffer: Buffer; mimeType: string; size: number } | null; // null para eliminar imagen
  }): Promise<Product>;

  // NUEVO: conversión
  convertToVarianted(productId: number, variants: { name: string; priceCents: number; sku?: string }[]): Promise<void>;
  convertToSimple(productId: number, priceCents: number): Promise<void>;

  // estrategia “reemplazar todas las variantes”
  replaceVariants(productId: number, variants: { name: string; priceCents: number; sku?: string }[]): Promise<void>;

  getById(id: number): Promise<ProductWithDetails | null>;
  list(filter?: { categorySlug?: string; type?: 'SIMPLE'|'VARIANTED'|'COMBO'; isActive?: boolean }): Promise<Product[]>;
  attachModifierGroup(productId: number, groupId: number, position?: number): Promise<void>;
  deactivate(id: number): Promise<void>;
  deleteHard(id: number): Promise<void>;


  //COMBOS 
  createCombo(data: {
    name: string;
    categoryId: number;
    priceCents: number;
    description?: string;
    sku?: string;
    image?: { buffer: Buffer; mimeType: string; size: number } | null; // null para eliminar imagen
    items?: { componentProductId: number; quantity?: number; isRequired?: boolean; notes?: string }[];
  }): Promise<Product>;

  addComboItems(comboProductId: number, items: { componentProductId: number; quantity?: number; isRequired?: boolean; notes?: string }[]): Promise<void>;
  updateComboItem(comboItemId: number, data: Partial<{ quantity: number; isRequired: boolean; notes: string }>): Promise<void>;
  removeComboItem(comboItemId: number): Promise<void>;

}
