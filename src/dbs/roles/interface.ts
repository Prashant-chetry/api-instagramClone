import { Document } from 'mongoose';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export default interface IRoles extends Document {
    _id: string;
    children: Array<string>;
    createdAt: Date;
    updatedAt: Date;
}
