import IUsers from '../dbs/users/interface';
import RoleAssignment from '../dbs/role-assignments/collection';

export default async function isAdmin(userId: IUsers['_id']): Promise<boolean> {
    if (!userId) return false;
    try {
        const doc = await RoleAssignment.findOne({ userId, role: 'admin' }).lean();
        if (!doc) return false;
        return true;
    } catch (error) {
        return false;
    }
}
