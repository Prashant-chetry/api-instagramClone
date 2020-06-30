import { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export default interface IPostController {
    postCreate(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    postEdit(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    postDelete(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    postView(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    postListView(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
