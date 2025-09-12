import { Router } from "express";
import { asyncHandler } from "../presentation/utils/asyncHandler";
import { authenticate } from "../presentation/middlewares/authenticate";
import { ordersController } from "../container";

const router = Router();
router.use(authenticate);

router.post("/", asyncHandler(ordersController.create));
router.get("/:id", asyncHandler(ordersController.get));

router.post("/:id/items", asyncHandler(ordersController.addItem));
router.patch("/items/:itemId/status", asyncHandler(ordersController.setItemStatus));

router.post("/:id/payments", asyncHandler(ordersController.addPayment));

router.get("/kds/list", asyncHandler(ordersController.kds));
router.patch("/items/:itemId", asyncHandler(ordersController.updateItem));
router.delete("/items/:itemId", asyncHandler(ordersController.removeItem));

router.post("/:id/split", asyncHandler(ordersController.splitByItems));

export default router;
