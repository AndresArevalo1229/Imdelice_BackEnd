import type { IProductRepository } from '../../domain/repositories/IProductRepository';
export class CreateProductCombo {
  constructor(private repo: IProductRepository) {}
  exec(input: {
    name: string; categoryId: number; priceCents: number; description?: string; sku?: string; imageUrl?: string;
    items?: { componentProductId: number; quantity?: number; isRequired?: boolean; notes?: string }[];
  }) {
    return this.repo.createCombo(input);
  }
}
