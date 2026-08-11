import { Body, Controller, Param, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./order.dto";
import { Auth } from "src/common/decorator/auth.decorator";
import { User } from "src/common/decorator/user.decorator";
import { type UserDocument } from "src/DB/models/user.model";
import { idDto } from "../brand/brand.dto";

@Controller("order")
export class OrderController {
    constructor(private readonly OrderService: OrderService) { }

    @Post()
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }))
    @Auth()
    createOrder(@Body() body: CreateOrderDto, @User() user: UserDocument): Promise<any> {
        return this.OrderService.createOrder(body, user._id);
    }

    @Post('stripe/:id')
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }))
    @Auth()
    paymentWithStripe(@Param() params: idDto, @User() user: UserDocument): Promise<any> {
        return this.OrderService.paymentWithStripe(params.id, user);
    }

    @Post('webhook')
    webhook(@Body() body: any): Promise<any> {
        return this.OrderService.webhook(body);
    }

    @Post('refund/:id')
    @Auth()
    refundOrder(@Param() params: idDto, @User() user: UserDocument): Promise<any> {
        return this.OrderService.refundOrder(params.id, user._id);
    }
}