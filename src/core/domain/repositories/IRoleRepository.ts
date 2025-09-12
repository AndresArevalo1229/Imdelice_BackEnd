import { Role } from "../entities/Role";

export interface CreateRoleInput {
  name: string;
  description?: string | null;
}

export interface UpdateRoleInput {
  id: number;
  name?: string;
  description?: string | null;
}

export interface IRoleRepository {
  list(): Promise<Role[]>;
  getById(id: number): Promise<Role | null>;
  getByName(name: string): Promise<Role | null>;
  create(input: CreateRoleInput): Promise<Role>;
  update(input: UpdateRoleInput): Promise<Role>;
  delete(id: number): Promise<void>;
}
