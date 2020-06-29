import { Schema, model, HookNextFunction } from 'mongoose';
import IRoles from './interface';
import Axios from 'axios';
import apiUrl from '../../common/apiUrl';

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

roleSchema.post('save', async function (doc: IRoles, next: HookNextFunction) {
    if ((doc.isNew || doc.isModified('children')) && doc.children.length) {
        Axios.post(apiUrl('/v1/api/roleAssignment/createRoleAssignment'));
    }
});
const Roles = model<IRoles>('roles', roleSchema);
export default Roles;
