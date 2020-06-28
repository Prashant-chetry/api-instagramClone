import { Router } from 'express';
import RoleAndPermissionController from '../controllers/roles';

const roleAndPermissionRouter: Router = Router();

roleAndPermissionRouter.post('/createRole', new RoleAndPermissionController().createRole);
roleAndPermissionRouter.post('/createPermission', new RoleAndPermissionController().createPermission);
roleAndPermissionRouter.post('/editPermission', new RoleAndPermissionController().editPermission);
roleAndPermissionRouter.post('/editRole', new RoleAndPermissionController().editRole);
roleAndPermissionRouter.post('/roles/list', new RoleAndPermissionController().rolesList);
roleAndPermissionRouter.post('/permissions/list', new RoleAndPermissionController().permissionsList);

export default roleAndPermissionRouter;
