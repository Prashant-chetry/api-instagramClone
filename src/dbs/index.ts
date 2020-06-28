import Mongoose from 'mongoose';

class MongooseServer {
    constructor() {
        this.connect();
        this.connectionHandling();
    }
    private connect = (): void => {
        Mongoose.connect('mongodb://localhost:27017/instagramClone', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    };
    private connectionHandling = (): void => {
        Mongoose.connection.on('connected', () => {
            console.log('mongodb connected');
        });
        Mongoose.connection.on('disconnected', function () {
            console.log('mongodb disconnected');
        });
        Mongoose.connection.on('error', function (error) {
            console.error('mongodb error', error);
        });
    };
    public connectionClose = (): void => {
        Mongoose.connection.close(function () {
            console.log('mongodb connection closed');
            process.exit(0);
        });
    };
}
export default MongooseServer;
