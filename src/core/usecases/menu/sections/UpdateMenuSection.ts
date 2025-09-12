
// UpdateMenuSection.ts
import type { IMenuRepository } from '../../../domain/repositories/IMenuRepository';
export class UpdateMenuSection { constructor(private repo: IMenuRepository) {} exec(id:number, data:any){ return this.repo.updateSection(id,data);} }
