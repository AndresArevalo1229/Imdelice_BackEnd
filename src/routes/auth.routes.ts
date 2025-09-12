import { Router } from 'express';
import { authController } from '../container';
import { asyncHandler } from '../presentation/utils/asyncHandler';

const r = Router();
r.post('/email', asyncHandler(authController.loginEmail));
r.post('/pin', asyncHandler(authController.loginPin));
export default r;
