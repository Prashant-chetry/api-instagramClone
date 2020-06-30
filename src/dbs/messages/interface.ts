/* eslint-disable @typescript-eslint/interface-name-prefix */
import { Document, Types } from 'mongoose';

export interface IMessageValue {
    message: string;
}
export default interface IMessage extends Document {
    conversations: Array<IMessageValue>;
    to: Types.ObjectId;
    encrypted?: boolean;
    createdBy?: Types.ObjectId;
    updatedBy?: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}
