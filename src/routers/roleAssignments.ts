import { Router } from 'express';
import RoleAssignmentController from '../controllers/roleAssignments';

const roleAssignmentRouter = Router();
roleAssignmentRouter.post('/createRoleAssignment', new RoleAssignmentController().assignRoleAndScope);
roleAssignmentRouter.get('/view/List', new RoleAssignmentController().roleAssignmentList);
export default roleAssignmentRouter;
