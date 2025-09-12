import type { IMenuRepository } from '../../../domain/repositories/IMenuRepository';
export class AddMenuItem { constructor(private repo: IMenuRepository) {} exec(input:{sectionId:number; productId:number; displayName?:string|null; displayPriceCents?:number|null; position?:number; isFeatured?:boolean}){ return this.repo.addItem(input);} }
