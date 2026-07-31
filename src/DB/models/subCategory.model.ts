import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, UpdateQuery } from 'mongoose';
import slugify from 'slugify';
import { User } from './user.model';
import { Category } from './category.model';

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true
})
export class SubCategory {
    @Prop({ type: String, required: true, minLength: 3, maxLength: 20, unique: true, trim: true })
    title: string

    @Prop({
        type: String, required: true, unique: true, lowercase: true, minLength: 3, maxLength: 20,
        default: function () { return slugify(this.title, { lower: true, trim: true }) }
    })
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

    @Prop({ type: Types.ObjectId, ref: Category.name, required: true })
    category: Types.ObjectId

    @Prop({ type: Types.ObjectId, ref: User.name, required: true })
    createdBy: Types.ObjectId

    @Prop({ type: Types.ObjectId, ref: User.name })
    updatedBy?: Types.ObjectId

    @Prop({ type: Types.ObjectId, ref: User.name })
    deletedBy?: Types.ObjectId

    @Prop({ type: Date })
    deletedAt?: Date
}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory)

SubCategorySchema.pre(['findOneAndUpdate', 'updateOne'], function () {
    const updated = this.getUpdate() as UpdateQuery<SubCategory>
    const title = updated.$set?.title ?? updated.title
    if (title)
        this.set({ slug: slugify(title, { lower: true, trim: true }) })
})

export type SubCategoryDocument = HydratedDocument<SubCategory>
export const SubCategoryModel = MongooseModule.forFeature([{ name: SubCategory.name, schema: SubCategorySchema }])
