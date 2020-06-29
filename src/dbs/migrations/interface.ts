import { Document } from 'mongoose';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export default interface IMigration extends Document {
    version: number;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
}
