import type { IMenuRepository } from '../../../domain/repositories/IMenuRepository';
export class UpdateMenuItem { constructor(private repo: IMenuRepository) {} exec(id:number, data:any){ return this.repo.updateItem(id,data);} }
