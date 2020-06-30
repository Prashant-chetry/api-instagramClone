import { Router } from 'express';
import CommentController from '../controllers/comments';
import notPageFound from '../common/notPageFound';

const commentRouter = Router();

commentRouter.post('/create/:postId', new CommentController().commentCreate);
commentRouter.post('/edit/:postId', new CommentController().commentEdit);
commentRouter.post('/delete/:postId', new CommentController().commentDelete);
commentRouter.get('/view/list/:postId', new CommentController().commentListView);
commentRouter.all('*', notPageFound);
export default commentRouter;
