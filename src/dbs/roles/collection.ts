import { Schema, model } from 'mongoose';
import IRoles from './interface';

const roleSchema = new Schema(
    {
        _id: {
            type: String,
            required: true,
            maxlength: 100,
        },
        children: {
            type: [String],
            default: [],
        },
    },
    { _id: false, timestamps: true },
);

const Roles = model<IRoles>('roles', roleSchema);
export default Roles;
