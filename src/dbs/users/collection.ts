import { Schema, model } from 'mongoose';
import IUsers from './interface';
import useInfo from '../../common/info/use';
import genderInfo from '../../common/info/genderInfo';
import martialStatusInfo from '../../common/info/maritalStatus';

const nameSchema = new Schema({
    first: {
        type: String,
        min: 4,
        max: 100,
        required: true,
        trim: true,
        default: 'No-Name',
    },
    last: {
        type: String,
        min: 4,
        max: 100,
        trim: true,
    },
    middle: {
        type: String,
        min: 4,
        max: 100,
        trim: true,
    },
});
const emailsSchema = new Schema(
    {
        address: {
            type: String,
            min: 4,
            max: 100,
            index: true,
            trim: true,
        },
        verified: {
            type: Boolean,
            default: false,
        },
    },
    { _id: false },
);
const phoneSchema = new Schema(
    {
        number: {
            type: String,
            max: 13,
            min: 10,
            index: true,
            trim: true,
        },
        verified: {
            type: Boolean,
            default: false,
        },
    },
    { _id: false },
);
const profileSchema = new Schema(
    {
        name: {
            type: nameSchema,
        },
        gender: {
            type: String,
            enum: genderInfo.map((i) => i.code),
            trim: true,
        },
        panid: {
            type: String,
            max: 10,
            index: true,
            trim: true,
        },
        aadharId: {
            type: String,
            max: 12,
            index: true,
            trim: true,
        },
        maritalStatus: {
            type: String,
            enum: martialStatusInfo.map((i) => i.code),
            max: 2,
            min: 1,
            trim: true,
        },
        address: {
            type: String,
            min: 10,
            max: 100,
            trim: true,
        },
        dob: {
            type: Date,
        },
    },
    { _id: false },
);
const tokenSchema = new Schema(
    {
        token: {
            type: String,
            trim: true,
        },
        expiresIn: {
            type: Date,
            default: new Date(),
        },
    },
    {
        _id: false,
        timestamps: true,
    },
);
const userSchema = new Schema(
    {
        userName: {
            type: String,
            min: 6,
            max: 100,
            trim: true,
            index: true,
            required: true,
        },
        emails: {
            type: [emailsSchema],
        },
        phones: {
            type: [phoneSchema],
            default: [],
        },
        profile: {
            type: profileSchema,
            default: {},
        },
        password: {
            type: String,
            min: 6,
            max: 100,
            required: true,
        },
        tokens: {
            type: [tokenSchema],
        },
        methods: {
            type: String,
            enum: ['jwt', 'google'],
            required: true,
            default: 'jwt',
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'users',
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'users',
        },
        removed: {
            type: Boolean,
            default: false,
        },
        welcomeMailSend: {
            type: Boolean,
            default: false,
        },
        use: {
            type: [String],
            enum: useInfo.map((i) => i.code),
            default: ['web'],
        },
        inActive: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

require('./server');
const Users = model<IUsers>('users', userSchema);
export default Users;
export { userSchema };
