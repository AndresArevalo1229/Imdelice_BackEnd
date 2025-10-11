

// src/core/usecases/modifiers/UpdateModifierGroup.ts
import type { IModifierRepository } from '../../domain/repositories/IModifierRepository';

// Campos editables del grupo (sin opciones)
type GroupEditable = {
  name?: string;
  description?: string | null;
  minSelect?: number;
  maxSelect?: number | null;
  isRequired?: boolean;
  isActive?: boolean;
};

// Payload que puede traer replaceOptions, pero no se pasa al update
type UpdatePayload = GroupEditable & {
  replaceOptions?: Array<{ name: string; priceExtraCents?: number; isDefault?: boolean; position?: number }>;
};

export class UpdateModifierGroup {
  constructor(private repo: IModifierRepository) {}
  exec(id: number, data: UpdatePayload) {
    const { replaceOptions, ...groupData } = data; // ⬅️ filtramos aquí
    return this.repo.updateGroup(id, groupData);
  }
}
