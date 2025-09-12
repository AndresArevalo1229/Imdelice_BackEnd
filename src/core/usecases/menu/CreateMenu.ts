import type { IMenuRepository } from '../../domain/repositories/IMenuRepository';
export class CreateMenu { constructor(private repo: IMenuRepository) {} exec(input: { name: string; isActive?: boolean }) { return this.repo.createMenu(input); } }
