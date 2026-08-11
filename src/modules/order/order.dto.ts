import { PartialType } from "@nestjs/mapped-types";
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { AtLeastOneOf } from "src/common/decorator/brand.decorator";
import { PaymentMethod } from "src/common/enum/order.enum";

export class CreateOrderDto {
    @IsNotEmpty()
    @IsString()
    phone: string;

    @IsNotEmpty()
    @IsString()
    address: string;

    @IsNotEmpty()
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @IsOptional()
    @IsString()
    couponCode?: string;
}