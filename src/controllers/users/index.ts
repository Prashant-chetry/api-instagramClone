import { Request, Response, NextFunction } from 'express';
import HttpError from '../../common/HttpError';
import Joi from '@hapi/joi';
import Users from '../../dbs/users/collection';
import isEmpty from '../../common/isEmpty';
import checkPermissions from '../../common/checkPermission';
import IUsers from '../../dbs/users/interface';
import IUserController from './interface';
import UserVerificationController from './verifications';
import { isValidObjectId } from 'mongoose';

class UserController extends UserVerificationController implements IUserController {
    static validationSchema = Joi.object({
        name: Joi.object({
            first: Joi.when('edit', {
                is: true,
                then: Joi.string()
                    .pattern(/[a-zA-Z]/)
                    .min(6)
                    .max(100)
                    .required(),
                otherwise: Joi.string()
                    .pattern(/[a-zA-Z]/)
                    .min(6)
                    .max(100)
                    .optional(),
            }),
            last: Joi.when('edit', {
                is: true,
                then: Joi.string()
                    .pattern(/[a-zA-Z]/)
                    .min(6)
                    .max(100)
                    .required(),
                otherwise: Joi.string()
                    .pattern(/[a-zA-Z]/)
                    .min(6)
                    .max(100)
                    .optional(),
            }),
            middle: Joi.string()
                .pattern(/[a-zA-Z]/)
                .min(6)
                .max(100)
                .optional(),
        }),
        gender: Joi.string().lowercase().valid('f', 'm').length(1).optional(),
        panid: Joi.string()
            .pattern(/[a-zA-Z]{3}[p|P]{1}[0-9]{4}[a-zA-z]{1}/)
            .length(10)
            .optional(),
        maritalStatus: Joi.string().lowercase().valid('s', 'm').length(1).optional(),
        phones: Joi.array()
            .items({
                number: Joi.string().pattern(/[0-9]/).length(10).optional(),
                verified: Joi.boolean().optional(),
            })
            .optional(),
        aadharId: Joi.string().pattern(/[0-9]/).length(12).optional(),
        address: Joi.string().min(10).max(100).optional(),
        dob: Joi.date().greater('now').optional(),
        emails: Joi.alternatives().conditional('edit', {
            then: Joi.array()
                .items({
                    address: Joi.string().email().min(4).max(100),
                    verified: Joi.boolean().optional(),
                })
                .required(),
            otherwise: Joi.array()
                .items({
                    address: Joi.string().email().min(4).max(100).optional(),
                    verified: Joi.boolean().optional(),
                })
                .optional(),
        }),
        edit: Joi.boolean(),
    });
    public profileAddNew = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const user = req.user as IUsers;
        if (!user._id) {
            return res.status(401).json({ success: false, message: 'user not authorized - user profile edit' });
        }
        const hasPermission = await checkPermissions(user._id, ['userProfileAdd']);
        if (!hasPermission) return res.status(401).json({ success: false, message: 'user not authorized - user profile edit' });
        const { name, gender, panid, maritalStatus, phones, aadharId, address, dob, emails } = req.body;
        const { errors } = UserController.validationSchema.validate({
            name,
            gender,
            panid,
            maritalStatus,
            phones,
            aadharId,
            address,
            dob,
            emails,
            edit: false,
        });
        if (errors)
            return res.status(403).json({
                success: false,
                message: 'error',
                errors,
            });
        try {
            const id = user._id;
            const doc = await Users.findById(id).lean();
            if (!isEmpty(doc || {})) return next(new HttpError(false, 'user already exists', 403));
            const userDoc = new Users({
                profile: {
                    name,
                    gender,
                    panid,
                    maritalStatus,
                    dob,
                    aadharId,
                    address,
                },
                phones,
                emails,
            });
            await userDoc?.saveInternal();
        } catch (error) {
            return next(new HttpError());
        }
    };
    public profileEdit = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const { id } = req.query;
        const user = req.user as IUsers;
        if (!id?.length || !isValidObjectId(id)) return next(new HttpError(false, 'No user Id', 404));
        if (!user._id || !isValidObjectId(user._id)) {
            return res.status(401).json({ success: false, message: 'user not authorized - user profile edit' });
        }
        try {
            if (user._id !== id) {
                const hasPermission = await checkPermissions(user._id, ['userProfileEdit']);
                if (!hasPermission) return res.status(401).json({ success: false, message: 'user not authorized - user profile edit' });
            }
        } catch (error) {
            return next(new HttpError());
        }

        const { name, gender, panid, maritalStatus, phones, aadharId, address, dob, emails } = req.body;
        const { error } = UserController.validationSchema.validate({
            name,
            gender,
            panid,
            maritalStatus,
            phones,
            aadharId,
            address,
            dob,
            emails,
            edit: true,
        });
        if (error) {
            return res.status(403).json({
                success: false,
                message: 'error',
                error,
            });
        }
        try {
            const doc = await Users.findOne({ _id: id, removed: false }).exec();
            if (isEmpty(doc || {})) {
                return next(new HttpError(false, 'No user found by Id', 404));
            }
            doc?.set({
                profile: {
                    name,
                    gender,
                    maritalStatus,
                    panid,
                    address,
                    aadharId,
                    dob,
                },
                emails,
                phones,
            });
            await doc?.save();
        } catch (error) {
            return next(new HttpError());
        }
    };
    public userDelete = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const { id } = req.params;
        const user = req.user as IUsers;
        if (!id?.length || !isValidObjectId(id)) return next(new HttpError(false, 'No user Id', 404));
        if (!user._id || !isValidObjectId(user._id)) {
            return res.status(401).json({ success: false, message: 'user not authorized - user profile delete' });
        }
        if (user._id !== id) {
            try {
                const hasPermission = await checkPermissions(user._id, ['userProfileDelete']);
                if (!hasPermission) return res.status(401).json({ success: false, message: 'user not authorized - user profile delete' });
            } catch (error) {
                return next(new HttpError());
            }
        }
        const { error } = Joi.string().alphanum().required().min(4).validate(id);
        if (error) {
            return res.status(403).json({
                success: false,
                message: 'error',
                error,
            });
        }
        try {
            const userDoc = await Users.findOne({ _id: id, removed: false }).exec();
            if (!userDoc) return res.status(404).json({ success: false, message: 'no user found' });
            await userDoc.softRemove();
            return res.status(200).json({ success: true, message: 'user successful deleted' });
        } catch (error) {
            return next(new HttpError());
        }
    };
    public userRestore = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const { id } = req.params;
        const user = req.user as IUsers;
        if (!user._id || !isValidObjectId(user._id)) {
            return res.status(401).json({ success: false, message: 'user not authorized - user profile delete' });
        }
        const { error } = Joi.string().alphanum().required().min(4).validate(id);
        if (error) {
            return res.status(403).json({
                success: false,
                message: 'error',
                error,
            });
        }
        if (!isValidObjectId(id)) return next(new HttpError(false, 'No user Id', 404));

        try {
            const hasPermission = await checkPermissions(user._id, ['userProfileRestore']);
            if (!hasPermission) return res.status(401).json({ success: false, message: 'user not authorized - user profile restore' });
        } catch (error) {
            return next(new HttpError());
        }
        try {
            const doc = await Users.findOne({ _id: id, removed: true }).exec();
            if (!doc) return res.status(404).json({ success: false, message: 'user not found' });
            await doc.softRestore();
            return res.status(200).json({ success: true, message: 'user successful restored' });
        } catch (error) {
            return next(new HttpError());
        }
    };
    public profileActivate = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const { id } = req.params;
        const user = req.user as IUsers;
        if (!user._id || !isValidObjectId(user._id)) {
            return res.status(401).json({ success: false, message: 'user not authorized - user profile delete' });
        }
        const { error } = Joi.string().alphanum().required().min(4).validate(id);
        if (error) {
            return res.status(403).json({
                success: false,
                message: 'error',
                error,
            });
        }
        if (!isValidObjectId(id)) return next(new HttpError(false, 'No user Id', 404));

        try {
            const hasPermission = await checkPermissions(user._id, ['userProfileActivate']);
            if (!hasPermission) return res.status(401).json({ success: false, message: 'user not authorized - user profile active' });
        } catch (error) {
            return next(new HttpError());
        }
        try {
            const doc = await Users.findOne({ _id: id, removed: true, inActive: true }).exec();
            if (!doc) return res.status(404).json({ success: false, message: 'user not found' });
            doc?.set({ inActive: false });
            await doc.save();
            return res.status(200).json({ success: true, message: 'user successful activated' });
        } catch (error) {
            return next(new HttpError());
        }
    };
    public profileDeActivate = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const { id } = req.params;
        const user = req.user as IUsers;
        if (!user._id || !isValidObjectId(user._id)) {
            return res.status(401).json({ success: false, message: 'user not authorized - user profile delete' });
        }
        const { error } = Joi.string().alphanum().required().min(4).validate(id);
        if (error) {
            return res.status(403).json({
                success: false,
                message: 'error',
                error,
            });
        }
        if (!isValidObjectId(id)) return next(new HttpError(false, 'No user Id', 404));

        try {
            const hasPermission = await checkPermissions(user._id, ['userProfileDeActivate']);
            if (!hasPermission) return res.status(401).json({ success: false, message: 'user not authorized - user profile deactivate' });
        } catch (error) {
            return next(new HttpError());
        }
        try {
            const doc = await Users.findOne({ _id: id, removed: false, inActive: false }).exec();
            if (!doc) return res.status(404).json({ success: false, message: 'user not found' });
            doc.set({ inActive: true });
            await doc.save();
            return res.status(200).json({ success: true, message: 'user successful deactivated' });
        } catch (error) {
            return next(new HttpError());
        }
    };
    public profileView = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const curUser = req.user as IUsers;
        if (!curUser._id) {
            return res.status(401).json({ success: false, message: 'user not authorized - user profile view' });
        }
        try {
            const { id } = req.params;
            const { error } = Joi.string().alphanum().required().max(50).validate(id);
            if (error || !isValidObjectId(id)) {
                return res.status(403).json({
                    success: false,
                    message: 'error',
                    error,
                });
            }
            if (!isValidObjectId(id)) return next(new HttpError(false, 'No user Id', 404));
            const user = await Users.findOne({ _id: id, removed: false }).select({ password: 0, tokens: 0 }).lean();
            if (isEmpty(user || {})) {
                return next(new HttpError(false, "user doesn't exists", 404));
            }
            return res.status(200).json({ success: true, message: 'user found', data: user });
        } catch (error) {
            return next(new HttpError());
        }
    };
    public userList = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        // add filter
        const curUser = req.user as IUsers;
        console.log(curUser, 'curUser');
        if (!curUser._id) {
            return res.status(401).json({ success: false, message: 'user not authorized - user profile List' });
        }
        try {
            // const hasPermission = await checkPermissions(curUser._id, ['userProfileListView']);
            // if (!hasPermission) return res.status(401).json({ success: false, message: 'user not authorized - user profile List' });

            const uDocs = await Users.find({}).select({ password: 0, tokens: 0 }).lean();
            if (!uDocs.length) {
                return next(new HttpError(false, 'No user found', 404));
            }
            return res.status(200).json({ success: true, message: 'user found', data: uDocs });
        } catch (error) {
            console.log(error);
            return next(new HttpError());
        }
    };
    public bulkUserLogOut = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const { from, to } = req.body;
        const { error } = Joi.object({
            from: Joi.date().greater('6-10-2020').less(Joi.ref('to')).required(),
            to: Joi.date().required(),
        }).validate({ from, to });
        if (error) {
            return res.status(403).json({
                success: false,
                message: 'error',
                error,
            });
        }
        try {
            const resp = await Users.updateMany({ 'tokens.createdAt': { $gte: new Date(from), $lte: new Date(to) } }, { tokens: [] });
            return res.status(200).json({ success: true, message: 'bulk user logout successful', data: { userUpdated: resp.nModified } });
        } catch (error) {
            console.debug(error);
            return next(new HttpError());
        }
    };
}
export default UserController;
