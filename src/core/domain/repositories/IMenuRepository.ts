import type { Menu, MenuSection, MenuItem, Product } from '@prisma/client';

export type MenuPublic = Menu & {
  sections: (MenuSection & {
    items: (MenuItem & {
      product: Pick<Product,'id'|'name'|'type'|'priceCents'|'imageUrl'|'isActive'>;
    })[];
  })[];
};

export interface IMenuRepository {
  createMenu(data: { name: string; isActive?: boolean }): Promise<Menu>;
  listMenus(): Promise<Menu[]>;
  updateMenu(id: number, data: Partial<Pick<Menu,'name'|'isActive'>>): Promise<Menu>;
  deleteMenu(id: number, hard?: boolean): Promise<void>;

  createSection(data: { menuId: number; name: string; position?: number; categoryId?: number | null }): Promise<MenuSection>;
  updateSection(id: number, data: Partial<Pick<MenuSection,'name'|'position'|'categoryId'>>): Promise<MenuSection>;
  deleteSection(id: number, hard?: boolean): Promise<void>;

  addItem(data: { sectionId: number; productId: number; displayName?: string | null; displayPriceCents?: number | null; position?: number; isFeatured?: boolean }): Promise<MenuItem>;
  updateItem(id: number, data: Partial<Pick<MenuItem,'displayName'|'displayPriceCents'|'position'|'isFeatured'>>): Promise<MenuItem>;
  removeItem(id: number): Promise<void>;

  getMenuPublic(id: number): Promise<MenuPublic | null>;
}
