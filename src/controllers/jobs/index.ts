import Migrations from '../../dbs/migrations/collections';
import mongoose from 'mongoose';
// Migrations.add({
//     version: 1,
//     name: 'first',
//     up: async () => {
//         'asa';
//         return;
//     },
// });

import { CronJob } from 'cron';
import Users from '../../dbs/users/collection';
import IUsers from '../../dbs/users/interface';
import sendMail from '../../common/sendMail';
// new CronJob('*, 0, 0, *, *, *', async function () {
//     console.debug('wishing birthDay');
//     const docs = Users.collection.find<IUsers>({ 'profile.name.first': { $nin: [null, ''] } }, { fields: { userName: 1, 'emails.address': 1 } });
//     docs.forEach(async (doc) => {
//         const msg = {
//             to: doc.userName,
//             subject: `Happy birthDay ${doc.profile.name.first}`,
//             html: `<p>Happy BirthDay ${doc.profile.name.first}</p>`,
//         };
//         await sendMail(msg);
//     });
// }).start();

// new CronJob('*, *, *, *, *, *', async function () {
//     console.debug('BackUp data');
//     const collections = ['users', 'posts'];
//     const batchSize = 10000;
//     collections.forEach(async (collection) => {
//         const backBb = mongoose.connection.db.collection(`${collection}.vermongo`);
//         const db = mongoose.connection.db.collection(collection);
//         const docs = db.find();
//         try {
//             await backBb.drop();
//             const numberOfDocs = await docs.count();
//             const bulkOps = backBb.initializeUnorderedBulkOp();
//             for (let i = 0; i < numberOfDocs; i++) {
//                 const doc = await docs.next();
//                 bulkOps.insert(doc);
//                 if (i % batchSize === 0) {
//                     await bulkOps.execute();
//                 }
//             }
//             await bulkOps.execute();
//         } catch (error) {
//             console.error(error);
//         }
//     });
// }).start();
