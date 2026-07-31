import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { User } from "./user.model";
import { Product } from "./product.model";


@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true
})
export class CartProduct {
    @Prop({ type: Types.ObjectId, ref: Product.name, required: true })
    productId: Types.ObjectId

    @Prop({ type: Number, required: true })
    finalPrice: number

    @Prop({ type: Number, required: true })
    quantity: number
}

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true
})
export class Cart {
    @Prop({ type: [CartProduct], required: true })
    products: CartProduct[]

    @Prop({ type: Number })
    subTotal: number

    @Prop({ type: Types.ObjectId, ref: User.name, required: true })
    createdBy: Types.ObjectId
}

export const CartSchema = SchemaFactory.createForClass(Cart)

CartSchema.pre("save", function () {
    this.subTotal = this.products.reduce((acc, item) => acc + item.finalPrice * item.quantity, 0) as number
})

export type CartDocment = HydratedDocument<Cart>
export const CartModel = MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }])