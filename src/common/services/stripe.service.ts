import { Injectable } from "@nestjs/common";
import Stripe from "stripe";

@Injectable()
export class StripeService {
    private stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    constructor() { }

    createCheckOutSession = async ({
        customer_email,
        metadata,
        discounts,
        line_items
    }: {
        customer_email: string,
        metadata?: Record<string, string>,
        discounts?: any[],
        line_items: any[]
    }) => {
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            customer_email,
            mode: 'payment',
            success_url: `${process.env.BASE_FRONTEND_URL}/order/success`,
            cancel_url: `${process.env.BASE_FRONTEND_URL}/order/cancel`,
            discounts,
            metadata,
            line_items
        });
        return session.url;
    }

    createCoupon = async (percent_off: number) => {
        const coupon = await this.stripe.coupons.create({
            percent_off,
            duration: "once",
        });
        return coupon
    }

    createRefundPayment = async (payment_intent: string) => {
        return await this.stripe.refunds.create({
            payment_intent,
            reason: 'requested_by_customer'
        });
    }
}