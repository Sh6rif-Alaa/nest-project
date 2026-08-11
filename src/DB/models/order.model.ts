import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { User } from "./user.model";
import { Cart } from "./cart.model";
import { Coupon } from "./coupon.model";
import { OrderStatus, PaymentMethod, PaymentStatus } from "src/common/enum/order.enum";

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true
})
export class Order {
    @Prop({ type: Types.ObjectId, ref: User.name, required: true })
    userId: Types.ObjectId

    @Prop({ type: Types.ObjectId, ref: Cart.name, required: true })
    cart: Types.ObjectId

    @Prop({ type: Types.ObjectId, ref: Coupon.name })
    coupon: Types.ObjectId

    @Prop({ type: Number, required: true })
    totalPrice: number

    @Prop({ type: String, required: true })
    phone: string

    @Prop({ type: String, required: true })
    address: string

    @Prop({ type: String, enum: PaymentMethod, required: true })
    paymentMethod: PaymentMethod

    @Prop({ type: String, enum: PaymentStatus })
    paymentStatus: PaymentStatus

    @Prop({ type: Date, default: Date.now() + 3 * 24 * 60 * 60 * 1000 })
    arrivedAt: Date

    @Prop({
        type: {
            paidAt: Date,
            deliveredAt: Date,
            deliveredBy: { type: String, ref: User.name },
            cancelledAt: Date,
            cancelledBy: { type: String, ref: User.name },
            refundedAt: Date,
            refundedBy: { type: String, ref: User.name },
        },
        default: {}
    })
    orderChanges: Object

    @Prop({ type: String })
    paymentIntent: string
}

export const OrderSchema = SchemaFactory.createForClass(Order)
export type OrderDocument = HydratedDocument<Order>
export const OrderModel = MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }])