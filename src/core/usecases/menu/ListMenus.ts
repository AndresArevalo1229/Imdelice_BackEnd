import type { IMenuRepository } from '../../domain/repositories/IMenuRepository';
export class ListMenus { constructor(private repo: IMenuRepository) {} exec() { return this.repo.listMenus(); } }
