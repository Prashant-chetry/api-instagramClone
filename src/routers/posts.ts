import { Router } from 'express';
import PostController from '../controllers/posts';
import notPageFound from '../common/notPageFound';

const postRouter = Router();

postRouter.post('/create', new PostController().postCreate);
postRouter.post('/edit/:id', new PostController().postEdit);
postRouter.post('/delete/:id', new PostController().postDelete);
postRouter.get('/view/one/:id', new PostController().postView);
postRouter.get('/view/list', new PostController().postListView);
postRouter.all('/*', notPageFound);
export default postRouter;
