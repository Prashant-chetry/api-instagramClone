import { Schema, Document } from 'mongoose';

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface IRoleAssignment extends Document {
    userId: Schema.Types.ObjectId;
    role: string;
    permission: Array<string>;
    scope: string;
    createdAt: Date;
    updatedAt: Date;
}

export default IRoleAssignment;
