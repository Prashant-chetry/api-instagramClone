import { Response, NextFunction, Request } from 'express';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface IUserController {
    profileAddNew(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    profileEdit(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    userDelete(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    userRestore(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    profileView(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    profileActivate(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    profileDeActivate(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    userList(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    bulkUserLogOut(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    sendEmailVerificationCode(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    emailVerification(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
export default IUserController;
