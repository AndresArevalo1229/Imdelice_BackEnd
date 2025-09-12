import type { IModifierRepository } from '../../core/domain/repositories/IModifierRepository';
import type { ModifierGroup, ModifierOption } from '@prisma/client';
import { prisma } from '../../lib/prisma';

export class PrismaModifierRepository implements IModifierRepository {
  async listGroups(filter?: {
    isActive?: boolean; categoryId?: number; categorySlug?: string; search?: string;
  }): Promise<(ModifierGroup & { options: ModifierOption[] })[]> {
    return prisma.modifierGroup.findMany({
      where: {
        isActive: filter?.isActive,
        appliesToCategoryId: filter?.categoryId,
        appliesToCategory: filter?.categorySlug ? { slug: filter.categorySlug } : undefined,
        // ❌ NO usar { mode: 'insensitive' } en MySQL
        name: filter?.search ? { contains: filter.search } : undefined,
      },
      include: { options: true }, // 👈 NECESARIO para cumplir el contrato
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
    });
  }
  getGroup(id: number): Promise<(ModifierGroup & { options: ModifierOption[] }) | null> {
    return prisma.modifierGroup.findUnique({
      where: { id },
      include: { options: true }, // 👈 igual aquí
    });
  }

  async listByProduct(productId: number): Promise<
    { id: number; position: number; group: ModifierGroup & { options: ModifierOption[] } }[]
  > {
    const links = await prisma.productModifierGroup.findMany({
      where: { productId },
      include: { group: { include: { options: true } } }, // 👈 incluir options
      orderBy: { position: 'asc' },
    });
    return links.map(l => ({ id: l.id, position: l.position, group: l.group }));
  }



  async createGroupWithOptions(data: { name: string; description?: string; minSelect?: number; maxSelect?: number | null; isRequired?: boolean;
    options: { name: string; priceExtraCents?: number; isDefault?: boolean; position?: number }[]; }): Promise<{ group: ModifierGroup; options: ModifierOption[] }> {
    const group = await prisma.modifierGroup.create({
      data: {
        name: data.name, description: data.description,
        minSelect: data.minSelect ?? 0, maxSelect: data.maxSelect ?? null, isRequired: data.isRequired ?? false,
        options: { create: data.options.map(o => ({ name: o.name, priceExtraCents: o.priceExtraCents ?? 0, isDefault: o.isDefault ?? false, position: o.position ?? 0 })) }
      },
      include: { options: true }
    });
    return { group, options: group.options };
  }

  updateGroup(id: number, data: Partial<Pick<ModifierGroup,'name'|'description'|'minSelect'|'maxSelect'|'isRequired'|'isActive'>>): Promise<ModifierGroup> {
    return prisma.modifierGroup.update({ where: { id }, data });
  }

  async replaceOptions(groupId: number, options: { name: string; priceExtraCents?: number; isDefault?: boolean; position?: number }[]): Promise<void> {
    await prisma.$transaction([
      prisma.modifierOption.deleteMany({ where: { groupId } }),
      prisma.modifierOption.createMany({
        data: options.map(o => ({
          groupId,
          name: o.name,
          priceExtraCents: o.priceExtraCents ?? 0,
          isDefault: o.isDefault ?? false,
          position: o.position ?? 0
        }))
      })
    ]);
  }
  

  async deactivateGroup(id: number): Promise<void> {
    await prisma.modifierGroup.update({ where: { id }, data: { isActive: false } });
  }
// src/infra/repositories/PrismaModifierRepository.ts
async deleteGroupHard(id: number): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // 1) Links a productos
    await tx.productModifierGroup.deleteMany({ where: { groupId: id } });

    // 2) Opciones del grupo
    await tx.modifierOption.deleteMany({ where: { groupId: id } });

    // 3) Borra el grupo
    await tx.modifierGroup.delete({ where: { id } });
  });
}

  
}
