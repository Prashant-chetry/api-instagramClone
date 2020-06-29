import { Document, Model } from 'mongoose';

/* eslint-disable @typescript-eslint/interface-name-prefix */
export interface IUsersEmail {
    address: string;
    verified: boolean;
}

export interface IUsersPhone {
    number: string;
    verified: boolean;
}
export interface IUsersProfileName {
    first: string;
    middle?: string;
    last?: string;
}
export interface IUsersProfile {
    name: IUsersProfileName;
    gender?: 'f' | 'm';
    maritalStatus?: 's' | 'se';
    dob?: Date;
    panid?: string;
    aadharId?: string;
    address?: string;
}

export interface IUsersToken {
    token: string;
    expiresIn: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export default interface IUsers extends Document {
    userName: string;
    emails: Array<IUsersEmail>;
    phones?: Array<IUsersPhone>;
    profile: IUsersProfile;
    password: string;
    tokens?: Array<IUsersToken>;
    methods?: 'jwt' | 'google';
    createdAt: Date;
    updatedAt: Date;
    createdBy?: IUsers['_id'];
    updatedBy?: IUsers['_id'];
    removed?: boolean;
    welcomeMailSend?: boolean;
    use: Array<'web' | 'internal'>;
    saveInternal: () => Promise<IUsers> | undefined;
    softRemove(): Promise<IUsers>;
    softRestore(): Promise<IUsers>;
}
