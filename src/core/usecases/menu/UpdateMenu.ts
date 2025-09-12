import type { IMenuRepository } from '../../domain/repositories/IMenuRepository';
export class UpdateMenu { constructor(private repo: IMenuRepository) {} exec(id:number, data:any){ return this.repo.updateMenu(id,data);} }
