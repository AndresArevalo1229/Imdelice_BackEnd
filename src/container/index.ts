import { PrismaUserRepository } from '../infra/repositories/PrismaUserRepository';
import { PrismaRoleRepository } from '../infra/repositories/PrismaRoleRepository';

// Users usecases...
import { CreateUser } from '../core/usecases/users/CreateUser';
import { UpdateUser } from '../core/usecases/users/UpdateUser';
import { DeleteUser } from '../core/usecases/users/DeleteUser';
import { GetUserById } from '../core/usecases/users/GetUserById';
import { ListUsers } from '../core/usecases/users/ListUsers';
import { UsersController } from '../presentation/controllers/UsersController';

// Roles usecases...
import { CreateRole } from '../core/usecases/roles/CreateRole';
import { UpdateRole } from '../core/usecases/roles/UpdateRole';
import { DeleteRole } from '../core/usecases/roles/DeleteRole';
import { GetRoleById } from '../core/usecases/roles/GetRoleById';
import { ListRoles } from '../core/usecases/roles/ListRoles';
import { RolesController } from '../presentation/controllers/RolesController';

// Auth usecases...
import { LoginByEmail } from '../core/usecases/auth/LoginByEmail';
import { LoginByPin } from '../core/usecases/auth/LoginByPin';
import { AuthController } from '../presentation/controllers/AuthController';

// JWT service
import { JwtService } from '../infra/security/JwtService';

// ----- Catalogo (Categories/Products/Modifiers) -----
import { PrismaCategoryRepository } from '../infra/repositories/PrismaCategoryRepository';
import { PrismaProductRepository }  from '../infra/repositories/PrismaProductRepository';
import { PrismaModifierRepository } from '../infra/repositories/PrismaModifierRepository';

import { CreateCategory } from '../core/usecases/categories/CreateCategory';
import { ListCategories } from '../core/usecases/categories/ListCategories';

import { CreateProductSimple }    from '../core/usecases/products/CreateProductSimple';
import { CreateProductVarianted } from '../core/usecases/products/CreateProductVarianted';
import { GetProductDetail }       from '../core/usecases/products/GetProductDetail';
import { ListProducts }           from '../core/usecases/products/ListProducts';
import { AttachModifierGroupToProduct } from '../core/usecases/products/AttachModifierGroupToProduct';

import { CreateModifierGroupWithOptions } from '../core/usecases/modifiers/CreateModifierGroupWithOptions';

import { CategoriesController } from '../presentation/controllers/CategoriesController';
import { ProductsController }   from '../presentation/controllers/ProductsController';
import { ModifiersController }  from '../presentation/controllers/ModifiersController';


import { UpdateCategory } from '../core/usecases/categories/UpdateCategory';
import { DeleteCategory } from '../core/usecases/categories/DeleteCategory';
import { UpdateProduct } from '../core/usecases/products/UpdateProduct';
import { ReplaceProductVariants } from '../core/usecases/products/ReplaceProductVariants';
import { DeleteProduct } from '../core/usecases/products/DeleteProduct';
import { UpdateModifierGroup } from '../core/usecases/modifiers/UpdateModifierGroup';
import { ReplaceModifierOptions } from '../core/usecases/modifiers/ReplaceModifierOptions';
import { DeleteModifierGroup } from '../core/usecases/modifiers/DeleteModifierGroup';
import { ListModifierGroups } from '../core/usecases/modifiers/ListModifierGroups';
import { GetModifierGroup } from '../core/usecases/modifiers/GetModifierGroup';
import { ListModifierGroupsByProduct } from '../core/usecases/modifiers/ListModifierGroupsByProduct';
import { ConvertProductToVarianted } from '../core/usecases/products/ConvertProductToVarianted';
import { ConvertProductToSimple } from '../core/usecases/products/ConvertProductToSimple';


//IMPORTS COMBOSSSS
import { CreateProductCombo } from '../core/usecases/products/CreateProductCombo';
import { AddComboItems } from '../core/usecases/products/AddComboItems';
import { UpdateComboItem } from '../core/usecases/products/UpdateComboItem';
import { RemoveComboItem } from '../core/usecases/products/RemoveComboItem';

//IMPORTS DE MENU
import { PrismaMenuRepository } from '../infra/repositories/PrismaMenuRepository';
import { MenuController } from '../presentation/controllers/MenuController';
import { CreateMenu } from '../core/usecases/menu/CreateMenu';
import { ListMenus } from '../core/usecases/menu/ListMenus';
import { UpdateMenu } from '../core/usecases/menu/UpdateMenu';
import { DeleteMenu } from '../core/usecases/menu/DeleteMenu';
import { CreateMenuSection } from '../core/usecases/menu/sections/CreateMenuSection';
import { UpdateMenuSection } from '../core/usecases/menu/sections/UpdateMenuSection';
import { DeleteMenuSection } from '../core/usecases/menu/sections/DeleteMenuSection';
import { AddMenuItem } from '../core/usecases/menu/items/AddMenuItem';
import { UpdateMenuItem } from '../core/usecases/menu/items/UpdateMenuItem';
import { RemoveMenuItem } from '../core/usecases/menu/items/RemoveMenuItem';
import { GetMenuPublic } from '../core/usecases/menu/items/GetMenuPublic';

//pedidos
import { PrismaOrderRepository } from "../infra/repositories/PrismaOrderRepository";
import { OrdersController } from "../presentation/controllers/OrdersController";
import { CreateOrder } from "../core/usecases/orders/CreateOrder";
import { AddOrderItem } from "../core/usecases/orders/AddOrderItem";
import { UpdateOrderItemStatus } from "../core/usecases/orders/UpdateOrderItemStatus";
import { AddPayment } from "../core/usecases/orders/AddPayment";
import { GetOrderDetail } from "../core/usecases/orders/GetOrderDetail";
import { ListKDS } from "../core/usecases/orders/ListKDS";
import { UpdateOrderItem } from "../core/usecases/orders/UpdateOrderItem";
import { RemoveOrderItem } from "../core/usecases/orders/RemoveOrderItem";
import { SplitOrderByItems } from "../core/usecases/orders/SplitOrderByItems";




const userRepo = new PrismaUserRepository();
const roleRepo = new PrismaRoleRepository();
// repos de productos
const categoryRepo = new PrismaCategoryRepository();
const productRepo  = new PrismaProductRepository();
const modifierRepo = new PrismaModifierRepository();

//REPOS DE MENU
const menuRepo = new PrismaMenuRepository();
//repos de pedidos
const orderRepo = new PrismaOrderRepository();

// Users
const usersController = new UsersController(
  new ListUsers(userRepo),
  new GetUserById(userRepo),
  new CreateUser(userRepo),
  new UpdateUser(userRepo),
  new DeleteUser(userRepo)
);

// Roles
const rolesController = new RolesController(
  new ListRoles(roleRepo),
  new GetRoleById(roleRepo),
  new CreateRole(roleRepo),
  new UpdateRole(roleRepo),
  new DeleteRole(roleRepo)
);

// Auth
const jwtService = new JwtService(); // <-- crea el servicio
const authController = new AuthController(
  new LoginByEmail(userRepo),
  new LoginByPin(userRepo),
  jwtService                      // <-- inyéctalo aquí
);


// usecases
const createCategoryUC = new CreateCategory(categoryRepo);
const listCategoriesUC = new ListCategories(categoryRepo);
const updateCategoryUC = new UpdateCategory(categoryRepo);
const deleteCategoryUC = new DeleteCategory(categoryRepo);


const createProductSimpleUC    = new CreateProductSimple(productRepo);
const createProductVariantedUC = new CreateProductVarianted(productRepo);
const getProductDetailUC       = new GetProductDetail(productRepo);
const listProductsUC           = new ListProducts(productRepo);
const updateProductUC = new UpdateProduct(productRepo);
const replaceVariantsUC = new ReplaceProductVariants(productRepo);
const deleteProductUC = new DeleteProduct(productRepo);
const attachModifierUC         = new AttachModifierGroupToProduct(productRepo);

// NUEVOS
const convertToVariantedUC     = new ConvertProductToVarianted(productRepo);
const convertToSimpleUC        = new ConvertProductToSimple(productRepo);


// instancias COMBOSSS
const createProductComboUC = new CreateProductCombo(productRepo);
const addComboItemsUC      = new AddComboItems(productRepo);
const updateComboItemUC    = new UpdateComboItem(productRepo);
const removeComboItemUC    = new RemoveComboItem(productRepo);



const createModifierGroupUC = new CreateModifierGroupWithOptions(modifierRepo);

const updateModGroupUC = new UpdateModifierGroup(modifierRepo);
const replaceModOptionsUC = new ReplaceModifierOptions(modifierRepo);
const deleteModGroupUC = new DeleteModifierGroup(modifierRepo);
const listModGroupsUC = new ListModifierGroups(modifierRepo);
const getModGroupUC   = new GetModifierGroup(modifierRepo);
const listByProductUC = new ListModifierGroupsByProduct(modifierRepo);



//instancias de menus 

const createMenuUC = new CreateMenu(menuRepo);
const listMenusUC  = new ListMenus(menuRepo);
const updateMenuUC = new UpdateMenu(menuRepo);
const deleteMenuUC = new DeleteMenu(menuRepo);

const createSecUC = new CreateMenuSection(menuRepo);
const updateSecUC = new UpdateMenuSection(menuRepo);
const deleteSecUC = new DeleteMenuSection(menuRepo);

const addItemUC    = new AddMenuItem(menuRepo);
const updateItemUC = new UpdateMenuItem(menuRepo);
const removeItemUC = new RemoveMenuItem(menuRepo);

const getMenuPublicUC = new GetMenuPublic(menuRepo);
// usecases de pedidos
const createOrderUC = new CreateOrder(orderRepo);
const addOrderItemUC = new AddOrderItem(orderRepo);
const updateOrderItemStatusUC = new UpdateOrderItemStatus(orderRepo);
const addPaymentUC = new AddPayment(orderRepo);
const getOrderDetailUC = new GetOrderDetail(orderRepo);
const listKDSUC = new ListKDS(orderRepo);
const updateOrderItemUC = new UpdateOrderItem(orderRepo);
const removeOrderItemUC = new RemoveOrderItem(orderRepo);
const splitOrderByItemsUC = new SplitOrderByItems(orderRepo);

// controllers
// controllers (reconstruye con deps nuevas)
export const categoriesController = new CategoriesController(
  createCategoryUC, listCategoriesUC, updateCategoryUC, deleteCategoryUC
);

export const productsController = new ProductsController(
  createProductSimpleUC,
  createProductVariantedUC,
  getProductDetailUC,
  listProductsUC,
  attachModifierUC,         // o attachModUC, iguala el nombre con tu var real
  updateProductUC,
  replaceVariantsUC,
  deleteProductUC,

  // ⬇️ primero las conversiones
  convertToVariantedUC,
  convertToSimpleUC,

  // ⬇️ luego COMBOS
  createProductComboUC,
  addComboItemsUC,
  updateComboItemUC,
  removeComboItemUC,
);

export const modifiersController = new ModifiersController(
  createModifierGroupUC, updateModGroupUC, replaceModOptionsUC, deleteModGroupUC,
  listModGroupsUC, getModGroupUC, listByProductUC
);


//menu
export const menuController = new MenuController(
  createMenuUC, listMenusUC, updateMenuUC, deleteMenuUC,
  createSecUC, updateSecUC, deleteSecUC,
  addItemUC, updateItemUC, removeItemUC,
  getMenuPublicUC
);
export const ordersController = new OrdersController(
  createOrderUC, addOrderItemUC, updateOrderItemStatusUC, addPaymentUC, getOrderDetailUC, listKDSUC,
  updateOrderItemUC, removeOrderItemUC, splitOrderByItemsUC
);
export { usersController, rolesController, authController };
