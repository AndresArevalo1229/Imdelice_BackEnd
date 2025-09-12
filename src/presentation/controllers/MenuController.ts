import { Request, Response } from 'express';
import { success, fail } from '../utils/apiResponse';
import { CreateMenu } from '../../core/usecases/menu/CreateMenu';
import { ListMenus } from '../../core/usecases/menu/ListMenus';
import { UpdateMenu } from '../../core/usecases/menu/UpdateMenu';
import { DeleteMenu } from '../../core/usecases/menu/DeleteMenu';
import { CreateMenuSection } from '../../core/usecases/menu/sections/CreateMenuSection';
import { UpdateMenuSection } from '../../core/usecases/menu/sections/UpdateMenuSection';
import { DeleteMenuSection } from '../../core/usecases/menu/sections/DeleteMenuSection';
import { AddMenuItem } from '../../core/usecases/menu/items/AddMenuItem';
import { UpdateMenuItem } from '../../core/usecases/menu/items/UpdateMenuItem';
import { RemoveMenuItem } from '../../core/usecases/menu/items/RemoveMenuItem';
import { GetMenuPublic } from '../../core/usecases/menu/items/GetMenuPublic';
import { CreateMenuDto, UpdateMenuDto, CreateMenuSectionDto, UpdateMenuSectionDto, AddMenuItemDto, UpdateMenuItemDto } from '../dtos/menu.dto';

export class MenuController {
  constructor(
    private createMenuUC: CreateMenu,
    private listMenusUC: ListMenus,
    private updateMenuUC: UpdateMenu,
    private deleteMenuUC: DeleteMenu,
    private createSectionUC: CreateMenuSection,
    private updateSectionUC: UpdateMenuSection,
    private deleteSectionUC: DeleteMenuSection,
    private addItemUC: AddMenuItem,
    private updateItemUC: UpdateMenuItem,
    private removeItemUC: RemoveMenuItem,
    private getMenuPublicUC: GetMenuPublic
  ) {}

  createMenu = async (req: Request, res: Response) => {
    try { const dto = CreateMenuDto.parse(req.body); return success(res, await this.createMenuUC.exec(dto), "Created", 201); }
    catch (e:any) { return fail(res, e?.message || "Error creating menu", 400, e); }
  };
  listMenus = async (_req: Request, res: Response) => {
    try { return success(res, await this.listMenusUC.exec()); }
    catch (e:any) { return fail(res, e?.message || "Error listing menus", 400, e); }
  };
  updateMenu = async (req: Request, res: Response) => {
    try { const id = +req.params.id; const dto = UpdateMenuDto.parse(req.body); return success(res, await this.updateMenuUC.exec(id, dto), "Updated"); }
    catch (e:any) { return fail(res, e?.message || "Error updating menu", 400, e); }
  };
  deleteMenu = async (req: Request, res: Response) => {
    try { const id = +req.params.id; const hard = req.query.hard === 'true'; await this.deleteMenuUC.exec(id, hard); return success(res, null, hard?"Deleted":"Deactivated", 204); }
    catch (e:any) { return fail(res, e?.message || "Error deleting menu", 400, e); }
  };

  createSection = async (req: Request, res: Response) => {
    try { const dto = CreateMenuSectionDto.parse(req.body); return success(res, await this.createSectionUC.exec(dto), "Created", 201); }
    catch (e:any) { return fail(res, e?.message || "Error creating section", 400, e); }
  };
  updateSection = async (req: Request, res: Response) => {
    try { const id = +req.params.id; const dto = UpdateMenuSectionDto.parse(req.body); return success(res, await this.updateSectionUC.exec(id, dto), "Updated"); }
    catch (e:any) { return fail(res, e?.message || "Error updating section", 400, e); }
  };
  deleteSection = async (req: Request, res: Response) => {
    try { const id = +req.params.id; const hard = req.query.hard === 'true'; await this.deleteSectionUC.exec(id, hard); return success(res, null, hard?"Deleted":"Hidden", 204); }
    catch (e:any) { return fail(res, e?.message || "Error deleting section", 400, e); }
  };

  addItem = async (req: Request, res: Response) => {
    try { const dto = AddMenuItemDto.parse(req.body); return success(res, await this.addItemUC.exec(dto), "Created", 201); }
    catch (e:any) { return fail(res, e?.message || "Error adding item", 400, e); }
  };
  updateItem = async (req: Request, res: Response) => {
    try { const id = +req.params.id; const dto = UpdateMenuItemDto.parse(req.body); return success(res, await this.updateItemUC.exec(id, dto), "Updated"); }
    catch (e:any) { return fail(res, e?.message || "Error updating item", 400, e); }
  };
  removeItem = async (req: Request, res: Response) => {
    try { const id = +req.params.id; await this.removeItemUC.exec(id); return success(res, null, "Deleted", 204); }
    catch (e:any) { return fail(res, e?.message || "Error deleting item", 400, e); }
  };

  // Public menu (para front)
  getPublic = async (req: Request, res: Response) => {
    try { const id = +req.params.id; const data = await this.getMenuPublicUC.exec(id); if (!data) return fail(res, "Not found", 404); return success(res, data); }
    catch (e:any) { return fail(res, e?.message || "Error fetching menu", 400, e); }
  };
}
