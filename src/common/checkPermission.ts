import IUsers from '../dbs/users/interface';
import RoleAssignment from '../dbs/role-assignments/collection';

async function checkPermissions(userId: IUsers['_id'], permissions: Array<string>): Promise<boolean> {
    if (!userId) return false;
    try {
        const doc = await RoleAssignment.findOne({ userId, permissions: { $in: permissions } }).lean();
        if (!doc) return false;
        return true;
    } catch (error) {
        return false;
    }
}
export default checkPermissions;
