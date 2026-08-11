import { CreateOrderDto } from "./order.dto";
import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import successResponse from "src/common/utils/response.success";
import OrderRepo from "src/DB/repo/order.repo";
import UserRepo from "src/DB/repo/user.repo";
import { Types } from "mongoose";
import CouponRepo from "src/DB/repo/coupon.repo";
import CartRepo from "src/DB/repo/cart.repo";
import ProductRepo from "src/DB/repo/product.repo";
import { OrderStatus, PaymentMethod, PaymentStatus } from "src/common/enum/order.enum";
import { StripeService } from "src/common/services/stripe.service";
import { UserDocument } from "src/DB/models/user.model";

@Injectable()
export class OrderService {
    constructor(
        private readonly orderRepo: OrderRepo,
        private readonly couponRepo: CouponRepo,
        private readonly cartRepo: CartRepo,
        private readonly productRepo: ProductRepo,
        private readonly userRepo: UserRepo,
        private readonly stripeService: StripeService,
    ) { }

    async createOrder({ address, couponCode, paymentMethod, phone }: CreateOrderDto, userId: Types.ObjectId): Promise<any> {
        let coupon;
        if (couponCode) {
            coupon = await this.couponRepo.findOne({ filter: { code: couponCode.trim().toLowerCase(), usedBy: { $nin: [userId] } } })
            if (!coupon) throw new NotFoundException("Coupon not found or used befor")
        }

        const cart = await this.cartRepo.findOne({ filter: { createdBy: userId } })
        console.log({ cart, products: cart?.products })
        if (!cart || !cart?.products?.length) throw new NotFoundException("Cart not found or empty")

        for (const product of cart.products) {
            const productExist = await this.productRepo.findOne({
                filter: {
                    _id: product?.productId,
                    stock: { $gte: product?.quantity }
                }
            })
            if (!productExist) throw new NotFoundException("Product not found or stock is not enough")
        }

        const order = await this.orderRepo.create({
            userId,
            address,
            coupon: coupon ? coupon._id : undefined,
            paymentMethod,
            phone,
            cart: cart._id,
            totalPrice: coupon ? (cart.subTotal - (cart.subTotal * (coupon.amount / 100))) : cart.subTotal,
            paymentStatus: paymentMethod === PaymentMethod.Cash ? PaymentStatus.Paid : PaymentStatus.Pending,
        })
        if (!order) throw new InternalServerErrorException("Order not created")

        for (const product of cart.products) {
            const productExist = await this.productRepo.findOneAndUpdate({
                filter: { _id: product?.productId },
                update: {
                    $inc: { stock: -product?.quantity }
                }
            })
            if (!productExist) throw new NotFoundException("Product not found or stock is not enough")
        }

        if (couponCode) {
            const coupon = await this.couponRepo.findOneAndUpdate({
                filter: { code: couponCode.trim().toLowerCase(), usedBy: { $nin: [userId] } },
                update: {
                    $push: { usedBy: userId }
                }
            })
            if (!coupon) throw new NotFoundException("Coupon not found or used befor")
        }

        if (paymentMethod === PaymentMethod.Cash) {
            await this.cartRepo.findOneAndUpdate({ filter: { createdBy: userId }, update: { $set: { products: [] } } })
        }

        return successResponse({ data: order })
    }

    async paymentWithStripe(id: Types.ObjectId, user: UserDocument): Promise<any> {
        const order = await this.orderRepo.findOne({
            filter: {
                _id: id,
                paymentStatus: PaymentStatus.Pending,
                paymentMethod: PaymentMethod.Card
            },
            options: {
                populate: [
                    {
                        path: 'cart',
                        populate: {
                            path: 'products.productId',
                        }
                    },
                    {
                        path: "coupon",
                    }
                ]
            }
        })
        if (!order) throw new NotFoundException("Order not found")

        let coupon: any

        if (order?.coupon) {
            coupon = await this.stripeService.createCoupon(order.coupon["amount"])
        }

        const session = await this.stripeService.createCheckOutSession({
            customer_email: user.email,
            metadata: { orderId: order._id.toString() },
            discounts: coupon ? [{ coupon: coupon.id }] : [],
            line_items: order.cart["products"].map((product) => {
                return {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: product.productId.title,
                        },
                        unit_amount: product.finalPrice * 100,
                    },
                    quantity: product.quantity,
                };
            })
        })

        return successResponse({ data: session })
    }

    async webhook(body: any): Promise<any> {
        const orderId = body?.data.object.metadata?.orderId
        const paymentIntent = body?.data?.object?.payment_intent

        const order = await this.orderRepo.findOneAndUpdate({
            filter: {
                _id: orderId,
            },
            update: {
                $set: {
                    paymentStatus: PaymentStatus.Paid,
                    paymentIntent,
                    orderChanges: {
                        paidAt: new Date()
                    }
                }
            }
        })
        if (!order) throw new NotFoundException("Order not found")

        return successResponse({ data: order })
    }

    async refundOrder(orderId: Types.ObjectId, userId: Types.ObjectId): Promise<any> {
        const order = await this.orderRepo.findOneAndUpdate({
            filter: {
                _id: orderId,
                paymentStatus: { $in: [PaymentStatus.Paid] },
                paymentMethod: PaymentMethod.Card
            },
            update: {
                $set: {
                    paymentStatus: PaymentStatus.Refunded,
                    orderChanges: {
                        refundedAt: new Date(),
                    }
                }
            }
        })
        if (!order) throw new NotFoundException("Order not found")

        await this.stripeService.createRefundPayment(order.paymentIntent!)

        return successResponse({ data: order })
    }
}