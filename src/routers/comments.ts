import { Router } from 'express';
import CommentController from '../controllers/comments';

const commentRouter = Router();

commentRouter.post('/create/:postId', new CommentController().commentCreate);
commentRouter.post('/edit/:id', new CommentController().commentEdit);
export default commentRouter;
