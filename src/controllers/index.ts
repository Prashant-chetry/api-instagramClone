import express, { Application, Request, Response, NextFunction } from 'express';
import { Server } from 'http';
import MongooseServer from '../dbs';
import cors from 'cors';
import userRouter from '../routers/users';
import roleAndPermissionRouter from '../routers/roles';
import roleAssignmentRouter from '../routers/roleAssignments';
import authenticationRouter from '../routers/authentication';
import rateLimiter from '../middleware/rateLimiter';
import authMiddleware from '../middleware/auth';
import postRouter from '../routers/posts';
import notPageFound from '../common/notPageFound';
import HttpError from '../common/HttpError';
import commentRouter from '../routers/comments';
require('dotenv').config();

class MainServerApp {
    private port: number = parseInt(process.env.PORT || '8080', 10);
    private server: Application;
    private httpServer: Server | undefined;
    private mongodbServer: MongooseServer | undefined;
    constructor() {
        this.server = express();
        this.initializeMongoDbServer();
        this.initializeMiddleWare();
        this.initializeRouteHandler();
        this.startServer();
        this.serverCrashHandler();
        this.initializeErrorHandling();
    }
    private startServer = (): void => {
        this.httpServer = new Server(this.server);
        this.httpServer.listen(this.port);
    };
    private initializeMongoDbServer = (): void => {
        this.mongodbServer = new MongooseServer();
    };
    private serverCrashHandler = (): void => {
        const mongo = {
            connectionClose: (): void => {
                console.log('error');
            },
        };
        process.on('SIGINT', (this.mongodbServer || mongo).connectionClose);
    };
    private initializeMiddleWare = (): void => {
        this.server.use(express.json({ limit: 1000 }));
        this.server.set('trust proxy', true);
        this.server.use(
            cors({
                origin: '*',
                methods: 'GET,,PUT,PATCH,POST,DELETE',
            }),
        );
        this.server.use(rateLimiter);
    };
    private initializeErrorHandling = (): void => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        this.server.use(function (error: HttpError, req: Request, res: Response, next: NextFunction) {
            return res.status(error.statusCode).json({ success: error.success, message: error.message });
        });
    };
    private initializeRouteHandler = (): void => {
        this.server.use('/v1/api/authentication', authenticationRouter);
        this.server.use('/v1/api/user', authMiddleware, userRouter);
        this.server.use('/v1/api/roleAssignment', authMiddleware, roleAssignmentRouter);
        this.server.use('/v1/api/roleAndPermission', authMiddleware, roleAndPermissionRouter);
        this.server.use('/v1/api/post', authMiddleware, postRouter);
        this.server.use('/v1/api/comment', authMiddleware, commentRouter);
        this.server.use('/v1/jobs', authMiddleware);
        this.server.use('*', notPageFound);
    };
}
export default MainServerApp;
