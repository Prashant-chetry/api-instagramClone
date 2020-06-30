import { Request, Response, NextFunction } from 'express';
import Joi from '@hapi/joi';
import HttpError from '../../common/HttpError';
import Roles from '../../dbs/roles/collection';
import isEmpty from '../../common/isEmpty';
import IUsers from '../../dbs/users/interface';
import isAdmin from '../../common/isAdmin';
import checkPermissions from '../../common/checkPermission';

class RoleAndPermissionController {
    public createPermission = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const user = req.user as IUsers;
        if (!user._id) return res.status(401).json({ success: false, message: 'user not authorized' });
        const checkAdmin = await isAdmin(user._id);
        if (!checkAdmin) return res.status(401).json({ success: false, message: 'user not authorized' });
        const { permission } = req.body;
        const { error } = Joi.string().alphanum().max(100).required().validate(permission);
        if (error) {
            return res.status(403).json({
                success: false,
                message: 'error',
                error,
            });
        }
        const doc = await Roles.findOne({ _id: permission }).lean();
        if (!isEmpty(doc || {})) {
            return res.status(409).json({ success: false, message: 'permission already exists' });
        }
        try {
            await new Roles({ _id: permission }).save();
            return res.status(202).json({ success: true, message: 'permission created' });
        } catch (error) {
            return next(new HttpError());
        }
    };
    public editPermission = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const user = req.user as IUsers;
        if (isEmpty(user || {})) return res.status(401).json({ success: false, message: 'user not authorized' });
        const checkAdmin = await isAdmin(user._id);
        if (!checkAdmin) return res.status(401).json({ success: false, message: 'user not authorized' });
        const { permission } = req.body;
        const { errors } = Joi.string().max(100).required().validate(permission);
        if (errors) {
            return res.status(403).json({
                success: false,
                message: 'error',
                errors,
            });
        }
        const cursor = Roles.findOne({ _id: permission });
        if (!isEmpty((await cursor.lean()) || {})) {
            return res.status(409).json({ success: false, message: 'role already exists' });
        }
        try {
            const pDoc = await cursor.exec();
            pDoc?.set({ _id: permission });
            pDoc?.save();
            return res.status(200).json({ success: true, message: 'permission updated' });
        } catch (error) {
            return next(new HttpError());
        }
    };
    public createRole = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const user = req.user as IUsers;
        if (isEmpty(user || {})) return res.status(401).json({ success: false, message: 'user not authorized' });
        const checkAdmin = await isAdmin(user._id);
        if (!checkAdmin) return res.status(401).json({ success: false, message: 'user not authorized' });
        const { role, permissions } = req.body;
        const { error } = Joi.object({
            role: Joi.string().alphanum().required().max(100),
            permissions: Joi.array().items(Joi.string().alphanum().max(100).required()).required(),
        }).validate({ role, permissions });
        if (error) {
            return res.status(403).json({
                success: false,
                message: 'error',
                error,
            });
        }
        console.log(error, 'eror');
        const permissionExists = await Roles.find({ _id: { $in: permissions }, children: [] }, { _id: 1 }).count();
        if (permissionExists <= 0) {
            return res.status(404).json({ success: false, message: "permission don't exists" });
        }
        const doc = await Roles.findOne({ _id: role }).lean();
        if (!isEmpty(doc || {})) {
            return res.status(409).json({ success: false, message: 'role already exists' });
        }
        try {
            new Roles({ _id: role, children: permissions }).save();
            return res.status(200).json({ success: true, message: 'role created' });
        } catch (error) {
            return next(new HttpError());
        }
    };
    public editRole = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const user = req.user as IUsers;
        if (isEmpty(user || {})) return res.status(401).json({ success: false, message: 'user not authorized' });
        const checkAdmin = await isAdmin(user._id);
        if (!checkAdmin) return res.status(401).json({ success: false, message: 'user not authorized' });
        const { role, permissions } = req.body;
        const { errors } = Joi.object({
            role: Joi.string().required().max(100),
            permissions: Joi.array().items(Joi.string().max(100)),
        }).validate({ role, permissions });
        if (errors) {
            return res.status(403).json({
                success: false,
                message: 'error',
                errors,
            });
        }
        const cursor = Roles.findOne({ _id: role });
        if (!isEmpty((await cursor.lean()) || {})) {
            return res.status(409).json({ success: false, message: 'role already exists' });
        }
        try {
            const rDoc = await cursor.exec();
            rDoc?.set({
                _id: role,
                children: permissions,
            });
            await rDoc?.save();
            return res.status(200).json({ success: true, message: 'roles updated' });
        } catch (error) {
            return next(new HttpError());
        }
    };
    public permissionsList = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        // filter and options
        const user = req.user as IUsers;
        const hasPermission = await checkPermissions(user._id, ['permissionListView']);
        if (!hasPermission) return res.status(401).json({ success: false, message: 'user not authorized - permission list' });
        const docs = await Roles.find(
            {
                $and: [{ _id: { $exists: true } }, { _id: { $nin: [''] } }],
                children: { $in: [[], ''] },
            },
            { limit: 10, skip: 0 },
        ).lean();
        res.status(200).json({ success: true, message: 'permission list view', data: docs });
    };
    public rolesList = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        // filter and options
        const user = req.user as IUsers;
        const hasPermission = await checkPermissions(user._id, ['roleListView']);
        if (!hasPermission) return res.status(401).json({ success: false, message: 'user not authorized - role list' });

        const { filters, options } = req.body;
        const docs = await Roles.find(
            {
                $and: [{ _id: { $exists: true } }, { _id: { $nin: [''] } }],
                children: { $nin: [[], ''] },
            },
            { limit: 10, skip: 0 },
        ).lean();
        res.status(200).json({ success: true, message: 'role list view', data: docs });
    };
    public viewRoleOrPermission = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const user = req.user as IUsers;
        const hasPermission = await checkPermissions(user._id, ['permissionView', 'roleView']);
        if (!hasPermission) return res.status(401).json({ success: false, message: 'user not authorized - roleOrPermissionView' });

        const { permission } = req.body;
        const { error } = Joi.string().alphanum().max(100).required().validate(permission);
        if (error) {
            return res.status(403).json({
                success: false,
                message: 'error',
                error,
            });
        }
        const doc = await Roles.findOne({ _id: permission }).lean();
        if (isEmpty(doc || {})) {
            return res.status(404).json({ success: false, message: "permission or role doesn't exists" });
        }
        return res.status(200).json({ success: true, message: 'permission or role found', data: doc });
    };
}
export default RoleAndPermissionController;
