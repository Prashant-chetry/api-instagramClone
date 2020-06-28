import { Router } from 'express';
import CommentController from '../controllers/comments';

const commentRouter = Router();

commentRouter.post('/create', new CommentController().commentCreate);
commentRouter.post('/edit/:id', new CommentController().commentEdit);
