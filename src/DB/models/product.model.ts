import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import slugify from "slugify";
import { User } from "./user.model";
import { Brand } from "./brand.model";
import { SubCategory } from "./subCategory.model";
import { Category } from "./category.model";

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true
})
export class Product {
    @Prop({ type: String, required: true, minLength: 3, maxLength: 20, unique: true, trim: true })
    title: string

    @Prop({
        type: String, required: true, unique: true, lowercase: true, minLength: 3, maxLength: 20,
        default: function () { return slugify(this.title, { lower: true, trim: true }) }
    })
    slug: string

    @Prop({ type: String, trim: true, required: true, minLength: 20, maxLength: 30000 })
    description: string

    @Prop({ type: Types.ObjectId, ref: Category.name, required: true })
    categoryId: Types.ObjectId

    @Prop({ type: Types.ObjectId, ref: SubCategory.name, required: true })
    subCategoryId: Types.ObjectId

    @Prop({ type: Types.ObjectId, ref: Brand.name, required: true })
    brandId: Types.ObjectId

    @Prop({ type: Number, required: true, min: 0 })
    price: number

    @Prop({ type: Number, min: 1, max: 100 })
    discount?: number

    @Prop({ type: Number, required: true, min: 0 })
    stock: number

    @Prop({ type: Number, min: 0, max: 5 })
    rateNum?: number

    @Prop({ type: Number, min: 0 })
    rateAvg?: number

    @Prop({
        type: {
            secure_url: { type: String, required: true },
            public_id: { type: String, required: true },
            _id: false
        },
        required: true
    })
    mainImage: { secure_url: string; public_id: string }

    @Prop([
        {
            secure_url: { type: String, required: true },
            public_id: { type: String, required: true },
            _id: false
        },
    ])
    subImages?: { secure_url: string; public_id: string }[]

    @Prop({ type: Types.ObjectId, ref: User.name, required: true })
    createdBy: Types.ObjectId

    @Prop({ type: Types.ObjectId, ref: User.name })
    updatedBy?: Types.ObjectId

    @Prop({ type: Types.ObjectId, ref: User.name })
    deletedBy?: Types.ObjectId

    @Prop({ type: Date })
    deletedAt?: Date
}

export const ProductSchema = SchemaFactory.createForClass(Product)
export type ProductDocment = HydratedDocument<Product>
export const ProductModel = MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }])