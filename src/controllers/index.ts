import express, { Application } from 'express';
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
    private initializeRouteHandler = (): void => {
        this.server.use('/v1/api/authentication', authenticationRouter);
        this.server.use('/v1/api/user', authMiddleware, userRouter);
        this.server.use('/v1/api/roleAssignment', authMiddleware, roleAssignmentRouter);
        this.server.use('/v1/api/roleAndPermission', authMiddleware, roleAndPermissionRouter);
        this.server.use('/v1/api/post', authMiddleware, postRouter);
        this.server.use('/v1/jobs', authMiddleware);
        this.server.use('*', notPageFound);
    };
}
export default MainServerApp;
