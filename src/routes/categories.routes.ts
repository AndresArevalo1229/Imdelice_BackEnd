import { Router } from "express";
import { asyncHandler } from "../presentation/utils/asyncHandler";
import { authenticate } from "../presentation/middlewares/authenticate";
import { categoriesController } from "../container";

const router = Router();
router.use(authenticate);

router.post("/", asyncHandler(categoriesController.create));
router.get("/", asyncHandler(categoriesController.list));
router.patch("/:id", asyncHandler(categoriesController.update));
router.delete("/:id", asyncHandler(categoriesController.remove)); // ?hard=true

export default router;
