import { Request, Response, NextFunction } from 'express';
import Users from '../../dbs/users/collection';
import { Readable } from 'stream';
import fs from 'fs';
import IUsers from '../../dbs/users/interface';
import { object } from '@hapi/joi';

const columns = [
    { header: 'userId', string: '_id' },
    { header: 'userName', string: 'userName' },
    { header: 'fullName', string: 'profile.name.first' },
    { header: 'emailId', string: 'emails.0.address' },
    { header: 'phoneNo', string: 'phones.0.number' },
    { header: 'gender', string: 'profile.gender' },
    { header: 'maritalStatus', string: 'profile.maritalStatus' },
    { header: 'panid', string: 'profile.panid' },
    { header: 'aadharNo', string: 'profile.aadharNo' },
    { header: 'dob', string: 'profile.dob' },
    { header: 'address', string: 'profile.address' },
];
const getStringFromData = function ({ header, string, value }: { header: string; string: string; value: object }) {
    const keyString = string.split('.');
    const obj = { ...value };
    for (let index = 0; index < keyString.length; index++) {
        const element = keyString[index];
        // obj = obj[element];
    }
};

class UserBulkActionController {
    public bulkDownload = async (req: Request, res: Response, next: NextFunction) => {
        const cursor = Users.collection.find();
        const hasDoc = await cursor.hasNext();
        const stream = new Readable({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            read() {},
        });
        console.log(process.cwd());
        const write = fs.createWriteStream(`${process.cwd()}/src/data.csv`);
        stream.push(columns.map((i) => i.header).join(',') + '\n');
        while (hasDoc) {
            const doc = await cursor.next();
            if (!doc) break;
            let result = '';
            columns.forEach((h) => {
                result += getStringFromData({ header: h.header, string: h.string, value: doc });
                // switch (h.header) {
                //     case 'userId': {
                //         return (result = result + doc._id + ', ');
                //     }
                //     case 'userName': {
                //         return (result = result + doc.userName + ', ');
                //     }
                // }
            });
            result += '\n';
            stream.push(result);
            console.log(result);
        }
        stream.push(null);
        stream.pipe(write);
    };
}
export default UserBulkActionController;
