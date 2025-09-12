import type { IProductRepository, ProductWithDetails } from '../../core/domain/repositories/IProductRepository';
import type { Product } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export class PrismaProductRepository implements IProductRepository {
    createSimple(data: {
    name: string; categoryId: number; priceCents: number;
    description?: string; sku?: string;
    image?: { buffer: Buffer; mimeType: string; size: number };
  }): Promise<Product> {
    return prisma.product.create({
      data: {
        name: data.name,
        categoryId: data.categoryId,
        type: 'SIMPLE',
        priceCents: data.priceCents,
        description: data.description,
        sku: data.sku,
        image: data.image?.buffer,
        imageMimeType: data.image?.mimeType,
        imageSize: data.image?.size,
      }
    });
  }

 createVarianted(data: {
    name: string; categoryId: number;
    variants: { name: string; priceCents: number; sku?: string }[];
    description?: string; sku?: string;
    image?: { buffer: Buffer; mimeType: string; size: number };
  }): Promise<Product> {
    return prisma.product.create({
      data: {
        name: data.name,
        categoryId: data.categoryId,
        type: 'VARIANTED',
        description: data.description,
        sku: data.sku,
        image: data.image?.buffer,
        imageMimeType: data.image?.mimeType,
        imageSize: data.image?.size,
        variants: {
          create: data.variants.map(v => ({
            name: v.name, priceCents: v.priceCents, sku: v.sku
          }))
        }
      }
    });
  }

   update(id: number, data: Partial<Pick<Product,
    'name'|'categoryId'|'priceCents'|'description'|'sku'|'isActive'
  >> & {
    image?: { buffer: Buffer; mimeType: string; size: number } | null;
  }): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data: {
        ...data,
        image:      data.image === undefined ? undefined : data.image?.buffer ?? null,
        imageMimeType: data.image === undefined ? undefined : data.image?.mimeType ?? null,
        imageSize:  data.image === undefined ? undefined : data.image?.size ?? null,
      }
    });
  }


  
  async replaceVariants(productId: number, variants: { name: string; priceCents: number; sku?: string }[]): Promise<void> {
    await prisma.$transaction([
      prisma.productVariant.deleteMany({ where: { productId } }),
      prisma.product.update({
        where: { id: productId },
        data: { variants: { create: variants.map(v => ({ name: v.name, priceCents: v.priceCents, sku: v.sku })) } }
      })
    ]);
  }
   // NUEVO: conversiones
  async convertToVarianted(productId: number, variants: { name: string; priceCents: number; sku?: string }[]): Promise<void> {
    await prisma.$transaction([
      prisma.product.update({ where: { id: productId }, data: { type: 'VARIANTED', priceCents: null } }),
      prisma.productVariant.deleteMany({ where: { productId } }),
      prisma.product.update({
        where: { id: productId },
        data: { variants: { create: variants.map(v => ({ name: v.name, priceCents: v.priceCents, sku: v.sku })) } }
      })
    ]);
  }
   async convertToSimple(productId: number, priceCents: number): Promise<void> {
    await prisma.$transaction([
      prisma.productVariant.deleteMany({ where: { productId } }),
      prisma.product.update({ where: { id: productId }, data: { type: 'SIMPLE', priceCents } })
    ]);
  }


  getById(id: number): Promise<ProductWithDetails | null> {
    return prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        modifierGroups: { include: { group: { include: { options: true } } }, orderBy: { position: 'asc' } },
        comboItemsAsCombo: {
          include: {
            componentProduct: { select: { id: true, name: true, type: true, priceCents: true, isActive: true } }
          },
          orderBy: { id: 'asc' }
        }
      }
    }) as any;
  }


  list(filter?: { categorySlug?: string; type?: 'SIMPLE'|'VARIANTED'|'COMBO'; isActive?: boolean }): Promise<Product[]> {
    return prisma.product.findMany({
      where: {
        type: filter?.type as any,
        isActive: filter?.isActive,
        category: filter?.categorySlug ? { slug: filter.categorySlug } : undefined
      },
      orderBy: [{ createdAt: 'desc' }]
    });
  }

  async attachModifierGroup(productId: number, groupId: number, position = 0): Promise<void> {
    await prisma.productModifierGroup.create({ data: { productId, groupId, position } });
  }

  async deactivate(id: number): Promise<void> {
    await prisma.product.update({ where: { id }, data: { isActive: false } });
  }

  async deleteHard(id: number): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.productModifierGroup.deleteMany({ where: { productId: id } });
      await tx.comboItem.deleteMany({ where: { OR: [{ comboProductId: id }, { componentProductId: id }] } });
      await tx.menuItem.deleteMany({ where: { productId: id } });
      await tx.productVariant.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });
    });
  }

//   -------------combos ---------------------

async createCombo(data: {
  name: string; categoryId: number; priceCents: number; description?: string; sku?: string;
  image?: { buffer: Buffer; mimeType: string; size: number };
  items?: { componentProductId: number; quantity?: number; isRequired?: boolean; notes?: string }[];
}): Promise<Product> {
    return prisma.product.create({
      data: {
        name: data.name,
        categoryId: data.categoryId,
        type: 'COMBO',
        priceCents: data.priceCents,
        description: data.description,
        sku: data.sku,
          image: data.image?.buffer,
      imageMimeType: data.image?.mimeType,
      imageSize: data.image?.size,
        comboItemsAsCombo: data.items?.length ? {
          create: data.items.map(it => ({
            componentProductId: it.componentProductId,
            quantity: it.quantity ?? 1,
            isRequired: it.isRequired ?? true,
            notes: it.notes ?? null
          }))
        } : undefined
      }
    });
  }

  async addComboItems(comboProductId: number, items: { componentProductId: number; quantity?: number; isRequired?: boolean; notes?: string }[]): Promise<void> {
    if (!items.length) return;
    await prisma.comboItem.createMany({
      data: items.map(it => ({
        comboProductId,
        componentProductId: it.componentProductId,
        quantity: it.quantity ?? 1,
        isRequired: it.isRequired ?? true,
        notes: it.notes ?? null
      }))
    });
  }

  async updateComboItem(comboItemId: number, data: Partial<{ quantity: number; isRequired: boolean; notes: string }>): Promise<void> {
    await prisma.comboItem.update({
      where: { id: comboItemId },
      data: {
        quantity: data.quantity,
        isRequired: data.isRequired,
        notes: data.notes ?? null
      }
    });
  }

  async removeComboItem(comboItemId: number): Promise<void> {
    await prisma.comboItem.delete({ where: { id: comboItemId } });
  }


  
}
