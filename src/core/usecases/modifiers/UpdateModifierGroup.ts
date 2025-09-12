// src/core/usecases/modifiers/UpdateModifierGroup.ts
import type { IModifierRepository } from '../../domain/repositories/IModifierRepository';
export class UpdateModifierGroup {
  constructor(private repo: IModifierRepository) {}
  exec(id: number, data: any) { return this.repo.updateGroup(id, data); }
}