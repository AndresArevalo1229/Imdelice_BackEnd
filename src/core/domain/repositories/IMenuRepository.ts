import type {
  Menu,
  MenuSection,
  MenuItem,
  Product,
  ProductVariant,
  ModifierOption
} from '@prisma/client';

export type MenuRefPayload =
  | {
      kind: 'PRODUCT';
      product: Pick<Product, 'id' | 'name' | 'type' | 'priceCents' | 'isActive' | 'isAvailable'>;
    }
  | {
      kind: 'COMBO';
      product: Pick<Product, 'id' | 'name' | 'type' | 'priceCents' | 'isActive' | 'isAvailable'>;
    }
  | {
      kind: 'VARIANT';
      variant: Pick<ProductVariant, 'id' | 'name' | 'priceCents' | 'isActive' | 'isAvailable'> & {
        product: Pick<Product, 'id' | 'name' | 'type' | 'isActive' | 'isAvailable'>;
      };
    }
  | {
      kind: 'OPTION';
      option: Pick<ModifierOption, 'id' | 'name' | 'priceExtraCents' | 'isActive'>;
    };

export type MenuItemWithRef = MenuItem & { ref: MenuRefPayload };
export type MenuSectionWithItems = MenuSection & { items: MenuItemWithRef[] };
export type MenuPublic = Menu & { sections: MenuSectionWithItems[] };

export interface IMenuRepository {
  createMenu(data: {
    name: string;
    isActive?: boolean;
    publishedAt?: Date | null;
    version?: number;
  }): Promise<Menu>;
  listMenus(): Promise<Menu[]>;
  listArchivedMenus(): Promise<Menu[]>;
  updateMenu(
    id: number,
    data: Partial<Pick<Menu, 'name' | 'isActive' | 'publishedAt' | 'version'>>
  ): Promise<Menu>;
  deleteMenu(id: number, hard?: boolean): Promise<void>;
  restoreMenu(id: number): Promise<void>;

  createSection(data: {
    menuId: number;
    name: string;
    position?: number;
    isActive?: boolean;
    categoryId?: number | null;
  }): Promise<MenuSection>;
  updateSection(
    id: number,
    data: Partial<Pick<MenuSection, 'name' | 'position' | 'isActive' | 'categoryId'>>
  ): Promise<MenuSection>;
  deleteSection(id: number, hard?: boolean): Promise<void>;
  restoreSection(id: number): Promise<void>;
  deleteSectionHard(id: number): Promise<void>;
  listSections(menuId: number): Promise<(MenuSection & { items: MenuItem[] })[]>;
  listArchivedSections(menuId: number): Promise<(MenuSection & { items: MenuItem[] })[]>;

  addItem(data: {
    sectionId: number;
    refType: MenuItem['refType'];
    refId: number;
    displayName?: string | null;
    displayPriceCents?: number | null;
    position?: number;
    isFeatured?: boolean;
    isActive?: boolean;
  }): Promise<MenuItem>;
  updateItem(
    id: number,
    data: Partial<
      Pick<
        MenuItem,
        'displayName' | 'displayPriceCents' | 'position' | 'isFeatured' | 'isActive'
      >
    >
  ): Promise<MenuItem>;
  removeItem(id: number, hard?: boolean): Promise<void>;
  restoreItem(id: number): Promise<void>;
  deleteItemHard(id: number): Promise<void>;
  listItems(sectionId: number): Promise<MenuItem[]>;
  listArchivedItems(sectionId: number): Promise<MenuItem[]>;

  getMenuPublic(id: number): Promise<MenuPublic | null>;
}
