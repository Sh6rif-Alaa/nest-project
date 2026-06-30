import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true
})
export class Category {
    @Prop({ type: String, required: true, minLength: 3, maxLength: 20, unique: true, trim: true })
    title: string

    @Prop({ type: String, required: true, unique: true, lowercase: true, minLength: 3, maxLength: 20 })
    slug: string

    @Prop({
        type: {
            secure_url: { type: String, required: true },
            public_id: { type: String, required: true },
            _id: false
        },
        required: true
    })
    image: { secure_url: string; public_id: string }

    @Prop({ type: Types.ObjectId, ref: "User", required: true })
    createdBy: Types.ObjectId
}

export const CategorySchema = SchemaFactory.createForClass(Category)
export type CategoryDocment = HydratedDocument<Category>
export const CategoryModel = MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }])