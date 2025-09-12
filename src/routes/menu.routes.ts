import { Router } from "express";
import { asyncHandler } from "../presentation/utils/asyncHandler";
import { authenticate } from "../presentation/middlewares/authenticate";
import { menuController } from "../container";

const router = Router();
router.use(authenticate);

// Menús
router.post("/", asyncHandler(menuController.createMenu));
router.get("/",  asyncHandler(menuController.listMenus));
router.patch("/:id", asyncHandler(menuController.updateMenu));
router.delete("/:id", asyncHandler(menuController.deleteMenu)); // ?hard=true

// Secciones
router.post("/sections", asyncHandler(menuController.createSection));
router.patch("/sections/:id", asyncHandler(menuController.updateSection));
router.delete("/sections/:id", asyncHandler(menuController.deleteSection)); // ?hard=true

// Items
router.post("/items", asyncHandler(menuController.addItem));
router.patch("/items/:id", asyncHandler(menuController.updateItem));
router.delete("/items/:id", asyncHandler(menuController.removeItem));

// Public (para front)
router.get("/:id/public", asyncHandler(menuController.getPublic));

export default router;
