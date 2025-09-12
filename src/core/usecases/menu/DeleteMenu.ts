import type { IMenuRepository } from '../../domain/repositories/IMenuRepository';
export class DeleteMenu { constructor(private repo: IMenuRepository) {} exec(id:number, hard=false){ return this.repo.deleteMenu(id, hard);} }
