import mongoose, { HydratedDocument } from "mongoose";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../common/enum/user.enum";
import { Types } from "mongoose";
import { MongooseModule, Prop, Schema, SchemaFactory, Virtual } from "@nestjs/mongoose";
import { decrypt } from "src/common/utils/security/encrypt.security";

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true
})
export class User {
    @Prop({ type: String, required: true, minLength: 3, maxLength: 20 })
    firstName: string

    @Prop({ type: String, required: true, minLength: 3, maxLength: 20 })
    lastName: string

    @Virtual({
        get: function () {
            return `${this.firstName} ${this.lastName}`
        },
        set: function (v: string) {
            const [firstName, lastName] = v.split(' ') as [string, string]
            this.firstName = firstName
            this.lastName = lastName
        }
    })
    userName?: string

    @Prop({ type: String, required: true, unique: true, lowercase: true, trim: true })
    email: string

    @Prop({ type: String, required: true, minLength: 6, trim: true })
    password: string

    @Prop({ type: Number, required: true, min: 18, max: 65 })
    age: number

    @Prop({ type: Boolean })
    confirmed?: boolean

    @Prop({ type: String })
    phone?: string | undefined

    @Prop({ type: String })
    address?: string | undefined

    @Prop({ type: String, enum: GenderEnum })
    gender: GenderEnum

    @Prop({ type: String, enum: RoleEnum, default: RoleEnum.user })
    role: RoleEnum

    @Prop({ type: String, enum: ProviderEnum, default: ProviderEnum.system })
    provider: ProviderEnum

    @Prop({
        type: {
            public_id: { type: String },
            secure_url: { type: String }
        }
    })
    profilePicture?: {
        public_id?: string
        secure_url: string
    }

    @Prop({ type: Date })
    changeCredential?: Date

    @Prop({ type: Date })
    deletedAt: Date
}

export const UserSchema = SchemaFactory.createForClass(User);

// Hooks
const decryptPhone = (doc: any) => {
    if (doc && doc.phone) doc.phone = decrypt(doc.phone);
};

UserSchema.post('find', (docs) => docs.forEach(decryptPhone));
UserSchema.post('findOne', (doc) => decryptPhone(doc));

export type UserDocument = HydratedDocument<User>;
export const UserModel = MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])