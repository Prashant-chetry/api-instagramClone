import { Schema, model, Model } from 'mongoose';
import IMigration from './interface';
import Joi from '@hapi/joi';

const migrationSchema = new Schema(
    {
        version: {
            type: Number,
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
        _id: false,
    },
);
// eslint-disable-next-line @typescript-eslint/interface-name-prefix
interface IMigrationModel extends Model<IMigration> {
    add({ version, name, up }: { version: number; name: string; up: () => Promise<void> }): Promise<undefined>;
}

const Migrations = model<IMigration, IMigrationModel>('databaseMigrations', migrationSchema);
migrationSchema.static('add', async function ({ version, name, up }: { version: number; name: string; up: () => Promise<void> }) {
    const { error } = Joi.object({
        version: Joi.number().positive().required(),
        name: Joi.string().required(),
        up: Joi.function().required(),
    }).validate({
        version,
        name,
        up,
    });
    if (error) {
        return Promise.reject(error);
    }
    try {
        const doc = await Migrations.findOne({ version }).lean();
        if (doc) return Promise.resolve();
        console.debug(`starting ${version} - ${name}`);
        await up();
        await new Migrations({ version, name }).save();
        console.debug(`finished ${version} - ${name}`);
    } catch (error) {
        console.debug(`error in ${version} - ${name}`);
        return Promise.reject(error);
    }
});
export default Migrations;
