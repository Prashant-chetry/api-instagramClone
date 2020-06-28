import { Router } from 'express';
import AuthenticationController from '../controllers/auth';
import authMiddleware from '../middleware/auth';
const authenticationRouter = Router();
authenticationRouter.post('/register', new AuthenticationController().register);
authenticationRouter.post('/login', new AuthenticationController().logIn);
authenticationRouter.post('/logout', authMiddleware, new AuthenticationController().logOut);
authenticationRouter.post('/forgotPassword', authMiddleware, new AuthenticationController().forgotPassword);
authenticationRouter.post('/resetPassword', authMiddleware, new AuthenticationController().resetPassword);
export default authenticationRouter;
