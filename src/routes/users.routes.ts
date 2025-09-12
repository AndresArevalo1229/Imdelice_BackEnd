import { Router } from "express";
import { usersController } from "../container";
import { asyncHandler } from "../presentation/utils/asyncHandler";
import { authenticate } from "../presentation/middlewares/authenticate";

const router = Router();

// protege todas las rutas de /users
router.use(authenticate);

router.get("/", asyncHandler(usersController.list));
router.get("/:id", asyncHandler(usersController.get));
router.post("/", asyncHandler(usersController.create));
router.put("/:id", asyncHandler(usersController.update));
router.delete("/:id", asyncHandler(usersController.delete));

export default router;
