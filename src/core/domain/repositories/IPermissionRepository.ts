// src/core/domain/repositories/IPermissionRepository.ts
import { Permission } from '../entities/Permission'

export interface IPermissionRepository {
  list(): Promise<Permission[]>
  getByCodes(codes: string[]): Promise<Permission[]>
  listByRole(roleId: number): Promise<Permission[]>
  replaceRolePermissions(roleId: number, codes: string[]): Promise<void>
}
