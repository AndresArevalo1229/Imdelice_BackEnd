import { Router } from "express";
import { asyncHandler } from "../presentation/utils/asyncHandler";
import { authenticate } from "../presentation/middlewares/authenticate";
import { ordersController } from "../container";
import { authorize } from "../presentation/middlewares/authorize";

const router = Router();
router.use(authenticate);

router.post("/", authorize('orders.create'), asyncHandler(ordersController.create));
router.get("/:id", authorize('orders.read'), asyncHandler(ordersController.get));

router.post("/:id/items", authorize('orders.update'), asyncHandler(ordersController.addItem));
router.patch("/items/:itemId/status", authorize('orders.update'), asyncHandler(ordersController.setItemStatus));

router.post("/:id/payments", authorize('orders.update'), asyncHandler(ordersController.addPayment));

router.get("/kds/list", authorize('orders.read'), asyncHandler(ordersController.kds));
router.patch("/items/:itemId", authorize('orders.update'), asyncHandler(ordersController.updateItem));
router.delete("/items/:itemId", authorize('orders.update'), asyncHandler(ordersController.removeItem));

router.post("/:id/split", authorize('orders.update'), asyncHandler(ordersController.splitByItems));

export default router;
