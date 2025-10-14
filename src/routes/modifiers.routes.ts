import { Router } from "express";
import { asyncHandler } from "../presentation/utils/asyncHandler";
import { authenticate } from "../presentation/middlewares/authenticate";
import { modifiersController } from "../container";

const router = Router();
router.use(authenticate);

router.post("/groups", asyncHandler(modifiersController.createGroup));
router.patch("/groups/:id", asyncHandler(modifiersController.updateGroup));
router.delete("/groups/:id", asyncHandler(modifiersController.removeGroup)); // ?hard=true
router.patch('/modifier-options/:optionId', modifiersController.updateOption);

// LISTADOS
router.get("/groups", asyncHandler(modifiersController.listGroups));
router.get("/groups/by-product/:productId", asyncHandler(modifiersController.listByProduct)); // poner antes de :id
router.get("/groups/:id", asyncHandler(modifiersController.getGroup));
router.get("/groups/:groupId/products", asyncHandler(modifiersController.listProductsByGroup));

export default router;
