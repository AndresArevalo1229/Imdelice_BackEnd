import type { IMenuRepository } from '../../../domain/repositories/IMenuRepository';
export class CreateMenuSection { constructor(private repo: IMenuRepository) {} exec(input:{menuId:number; name:string; position?:number; categoryId?:number|null}){ return this.repo.createSection(input);} }
