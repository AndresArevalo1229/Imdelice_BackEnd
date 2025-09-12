import { Router } from 'express';
import { rolesController } from '../container';
import { asyncHandler } from '../presentation/utils/asyncHandler';
import { authenticate } from "../presentation/middlewares/authenticate";

const r = Router();
// protege todas las rutas de /users
r.use(authenticate);

r.get('/', asyncHandler(rolesController.list));
r.get('/:id', asyncHandler(rolesController.get));
r.post('/', asyncHandler(rolesController.create));
r.put('/:id', asyncHandler(rolesController.update));
r.delete('/:id', asyncHandler(rolesController.delete));
export default r;
