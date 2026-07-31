import { Body, Controller, Delete, Get, Param, Patch, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { CartService } from "./cart.service";
import { CreateCartDto, UpdateCartDto } from "./cart.dto";
import { Auth } from "src/common/decorator/auth.decorator";
import { RoleEnum } from "src/common/enum/user.enum";
import { User } from "src/common/decorator/user.decorator";
import { type UserDocument } from "src/DB/models/user.model";
import { idDto } from "../brand/brand.dto";

@Controller("cart")
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Post()
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }))
    @Auth()
    createCart(@Body() body: CreateCartDto, @User() user: UserDocument): Promise<any> {
        return this.cartService.createCart(body, user);
    }

    @Delete(":id")
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }))
    @Auth()
    removeProductFromCart(@Param() params: idDto, @User() user: UserDocument): Promise<any> {
        return this.cartService.removeProductFromCart(params.id, user._id);
    }

    @Patch()
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }))
    @Auth()
    updateProductQuantity(@Body() body: UpdateCartDto, @User() user: UserDocument): Promise<any> {
        return this.cartService.updateProductQuantity(body, user._id);
    }
}