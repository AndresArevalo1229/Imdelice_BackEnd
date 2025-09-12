import type { IOrderRepository } from "../../domain/repositories/IOrderRepository";
export class ListKDS {
  constructor(private repo: IOrderRepository) {}
  exec(statuses: ("NEW"|"IN_PROGRESS"|"READY")[]) { return this.repo.listKDS(statuses); }
}
