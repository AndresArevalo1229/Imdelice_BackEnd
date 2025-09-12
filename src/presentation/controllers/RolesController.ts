import { Request, Response } from "express";
import { success, fail } from "../utils/apiResponse";
import { CreateRole } from "../../core/usecases/roles/CreateRole";
import { UpdateRole } from "../../core/usecases/roles/UpdateRole";
import { DeleteRole } from "../../core/usecases/roles/DeleteRole";
import { GetRoleById } from "../../core/usecases/roles/GetRoleById";
import { ListRoles } from "../../core/usecases/roles/ListRoles";
import { CreateRoleDto, UpdateRoleDto } from "../dtos/roles.dto";

export class RolesController {
  constructor(
    private listRoles: ListRoles,
    private getRoleById: GetRoleById,
    private createRole: CreateRole,
    private updateRole: UpdateRole,
    private deleteRole: DeleteRole
  ) {}

  list = async (_: Request, res: Response) => {
    const roles = await this.listRoles.execute();
    return success(res, roles, "Roles obtenidos");
  };

  get = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return fail(res, "ID inválido", 400);

    const role = await this.getRoleById.execute(id);
    if (!role) return fail(res, "Rol no encontrado", 404);
    return success(res, role, "Rol encontrado");
  };

  create = async (req: Request, res: Response) => {
    const parsed = CreateRoleDto.safeParse(req.body);
    if (!parsed.success) return fail(res, "Datos inválidos", 400, parsed.error.format());

    const created = await this.createRole.execute(parsed.data);
    return success(res, created, "Rol creado", 201);
  };

  update = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return fail(res, "ID inválido", 400);

    const parsed = UpdateRoleDto.safeParse(req.body);
    if (!parsed.success) return fail(res, "Datos inválidos", 400, parsed.error.format());

    const updated = await this.updateRole.execute({ id, ...parsed.data });
    return success(res, updated, "Rol actualizado");
  };

  delete = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) return fail(res, "ID inválido", 400);

    await this.deleteRole.execute(id);
    return success(res, { id }, "Rol eliminado");
  };
}
