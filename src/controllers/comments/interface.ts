import { Request, Response, NextFunction } from 'express';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export default interface ICommentController {
    commentCreate(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    commentEdit(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    commentDelete(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
    commentListView(req: Request, res: Response, next: NextFunction): Promise<Response | void>;
}
