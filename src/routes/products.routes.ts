import { Router } from "express";
import { asyncHandler } from "../presentation/utils/asyncHandler";
import { authenticate } from "../presentation/middlewares/authenticate";
import { productsController } from "../container";
import { uploadImage } from "../presentation/middlewares/uploadImage";

const router = Router();
router.use(authenticate);

router.post("/simple",    uploadImage.single('image'), asyncHandler(productsController.createSimple));
router.post("/varianted", uploadImage.single('image'), asyncHandler(productsController.createVarianted));

router.get("/",           asyncHandler(productsController.list));
router.get("/:id",        asyncHandler(productsController.getDetail));
router.post("/attach-modifier", asyncHandler(productsController.attachModifier));
router.post('/detach-modifier', asyncHandler(productsController.detachModifierGroup)); // 👈 NUEVA
router.post('/modifier-position', asyncHandler(productsController.updateModifierGroupPosition)); // 👈 NUEVA
router.post('/modifier-reorder', asyncHandler(productsController.reorderModifierGroups)); // 👈 OPCIONAL


router.patch("/:id",uploadImage.single('image'),      asyncHandler(productsController.update));
router.put("/:id/variants", asyncHandler(productsController.replaceVariants));
router.delete("/:id",     asyncHandler(productsController.remove)); // ?hard=true
// Imagen binaria (para que el front la muestre)
router.get("/:id/image", asyncHandler(productsController.getImage));

// Conversión SIMPLE → VARIANTED y VARIANTED → SIMPLE
router.post("/:id/convert-to-varianted", asyncHandler(productsController.convertToVarianted));
router.post("/:id/convert-to-simple",    asyncHandler(productsController.convertToSimple));



//COMBOSSSSS
router.post("/combo", uploadImage.single('image'), asyncHandler(productsController.createCombo));
router.post("/:id/combo-items", asyncHandler(productsController.addComboItems));
router.patch("/combo-items/:comboItemId", asyncHandler(productsController.updateComboItem));
router.delete("/combo-items/:comboItemId", asyncHandler(productsController.removeComboItem));

export default router;
