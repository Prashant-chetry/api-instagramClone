import { Schema, model } from 'mongoose';
import IRoleAssignment from './interface';

const roleAssignmentSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'users',
            required: true,
            unique: true,
        },
        role: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        permissions: {
            type: [String],
            required: true,
        },
        scope: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true },
);

const RoleAssignment = model<IRoleAssignment>('role-assignment', roleAssignmentSchema);
export default RoleAssignment;
