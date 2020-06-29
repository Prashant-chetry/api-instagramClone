import { Request, Response, NextFunction } from 'express';
import Joi from '@hapi/joi';
import Roles from '../../dbs/roles/collection';
import RoleAssignment from '../../dbs/role-assignments/collection';
import isEmpty from '../../common/isEmpty';
import IRoleAssignment from '../../dbs/role-assignments/interface';
import HttpError from '../../common/HttpError';
import { Schema } from 'mongoose';
import IUsers from '../../dbs/users/interface';
import isAdmin from '../../common/isAdmin';
import checkPermissions from '../../common/checkPermission';

class RoleAssignmentController {
    public assignRoleAndScope = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
        const user = req.user as IUsers;
        if (isEmpty(user || {})) return res.status(401).json({ success: false, message: 'user not authorized' });
        const checkAdmin = await isAdmin(user._id);
        if (!checkAdmin) return res.status(401).json({ success: false, message: 'user not authorized' });

        const { userId, role, scope } = req.body;
        const { error } = Joi.object({
            userId: Joi.string().alphanum().required().max(100).min(6),
            role: Joi.string().alphanum().required().max(100),
            scope: Joi.string().alphanum(),
        }).validate({ userId, role, scope });
        if (error) {
            return res.status(400).json({ success: false, message: 'Bad Request', error });
        }
        try {
            // find roles and roleAssignment
            const [roleDoc, rADoc] = await Promise.all([
                Roles.findOne({ _id: role, children: { $nin: [[]] } }, { children: 1 }).lean(),
                RoleAssignment.findOne({ userId }).lean(),
            ]);
            if (!roleDoc) {
                return res.status(404).json({ success: false, message: 'Role not found' });
            }
            const permissions: Set<string> = new Set([...roleDoc.children]);
            if (isEmpty(rADoc || {})) {
                const doc = await this.createRoleAndScopeAssignment({
                    userId,
                    role,
                    scope,
                    permissions: [...permissions.keys()],
                });
                if (!doc) {
                    return next(new HttpError());
                }
                return res.status(200).json({ success: true, message: 'role assignment created' });
            }
            await this.editRoleAndScopeAssignment({ userId, role, scope, permissions: [...permissions.keys()] });
            return res.status(200).json({ success: true, message: 'role assignment edit successfully' });
        } catch (error) {
            return next(new HttpError());
        }
    };
    public createRoleAndScopeAssignment = async ({
        userId,
        role,
        scope,
        permissions,
    }: {
        userId: string;
        role: string;
        scope: string;
        permissions: Array<string>;
    }): Promise<IRoleAssignment | undefined> => {
        try {
            const doc = new RoleAssignment({ userId, role, scope, permissions });
            return await doc.save();
        } catch (error) {
            return error;
        }
    };
    public editRoleAndScopeAssignment = async ({
        userId,
        role,
        scope,
        permissions,
    }: {
        userId: Schema.Types.ObjectId;
        role: string;
        scope: string;
        permissions: Array<string>;
    }): Promise<IRoleAssignment | void> => {
        try {
            const doc = await RoleAssignment.findOne({ userId }).exec();
            doc?.set({
                role,
                userId,
                permissions,
                scope,
            });
            return doc?.save();
        } catch (error) {
            throw new Error(error);
        }
    };
    public roleAssignmentList = async (req: Request, res: Response, next: NextFunction) => {
        // filter and options
        // find all roles and user associated with it
        const user = req.user as IUsers;
        const hasPermission = checkPermissions(user._id, ['roleAssignmentListView']);
        if (!hasPermission) {
            return res.status(401).json({ success: false, message: "user don't have permissions" });
        }
        // const { filters = {}, options = {} }: { filters: object; options: object } = req.query;
        const pipeline = [
            {
                $group: { _id: '$role' },
                count: { $sum: 1 },
            },
        ];
        const docs = await RoleAssignment.aggregate(pipeline);
        console.debug(docs);
    };
}
export default RoleAssignmentController;
