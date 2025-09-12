import type { IMenuRepository, MenuPublic } from '../../core/domain/repositories/IMenuRepository';
import type { Menu, MenuSection, MenuItem } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export class PrismaMenuRepository implements IMenuRepository {
  createMenu(data: { name: string; isActive?: boolean }): Promise<Menu> {
    return prisma.menu.create({ data: { name: data.name, isActive: data.isActive ?? true } });
  }
  listMenus(): Promise<Menu[]> {
    return prisma.menu.findMany({ orderBy: [{ isActive: 'desc' }, { name: 'asc' }] });
  }
  updateMenu(id: number, data: Partial<Pick<Menu,'name'|'isActive'>>): Promise<Menu> {
    return prisma.menu.update({ where: { id }, data });
  }
  async deleteMenu(id: number, hard?: boolean): Promise<void> {
    if (hard) {
      await prisma.$transaction(async (tx) => {
        const sections = await tx.menuSection.findMany({ where: { menuId: id }, select: { id: true } });
        const sectionIds = sections.map(s => s.id);
        if (sectionIds.length) await tx.menuItem.deleteMany({ where: { sectionId: { in: sectionIds } } });
        await tx.menuSection.deleteMany({ where: { menuId: id } });
        await tx.menu.delete({ where: { id } });
      });
    } else {
      await prisma.menu.update({ where: { id }, data: { isActive: false } });
    }
  }

  createSection(data: { menuId: number; name: string; position?: number; categoryId?: number | null }): Promise<MenuSection> {
    return prisma.menuSection.create({
      data: { menuId: data.menuId, name: data.name, position: data.position ?? 0, categoryId: data.categoryId ?? null }
    });
  }
  updateSection(id: number, data: Partial<Pick<MenuSection,'name'|'position'|'categoryId'>>): Promise<MenuSection> {
    return prisma.menuSection.update({ where: { id }, data });
  }
  async deleteSection(id: number, hard?: boolean): Promise<void> {
    if (hard) {
      await prisma.$transaction([
        prisma.menuItem.deleteMany({ where: { sectionId: id } }),
        prisma.menuSection.delete({ where: { id } })
      ]);
    } else {
      await prisma.menuSection.update({ where: { id }, data: { position: 9999 } }); // “ocultar” moviéndolo al final
    }
  }

  addItem(data: { sectionId: number; productId: number; displayName?: string | null; displayPriceCents?: number | null; position?: number; isFeatured?: boolean }): Promise<MenuItem> {
    return prisma.menuItem.create({
      data: {
        sectionId: data.sectionId,
        productId: data.productId,
        displayName: data.displayName ?? null,
        displayPriceCents: data.displayPriceCents ?? null,
        position: data.position ?? 0,
        isFeatured: data.isFeatured ?? false
      }
    });
  }
  updateItem(id: number, data: Partial<Pick<MenuItem,'displayName'|'displayPriceCents'|'position'|'isFeatured'>>): Promise<MenuItem> {
    return prisma.menuItem.update({ where: { id }, data });
  }
  async removeItem(id: number): Promise<void> {
    await prisma.menuItem.delete({ where: { id } });
  }

  getMenuPublic(id: number): Promise<MenuPublic | null> {
    return prisma.menu.findUnique({
      where: { id },
      include: {
        sections: {
          orderBy: { position: 'asc' },
          include: {
            items: {
              orderBy: { position: 'asc' },
              include: {
                product: { select: { id: true, name: true, type: true, priceCents: true, imageUrl: true, isActive: true } }
              }
            }
          }
        }
      }
    }) as any;
  }
}
