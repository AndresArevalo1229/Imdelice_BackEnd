import type { IMenuRepository } from '../../../domain/repositories/IMenuRepository';
export class RemoveMenuItem { constructor(private repo: IMenuRepository) {} exec(id:number){ return this.repo.removeItem(id);} }
