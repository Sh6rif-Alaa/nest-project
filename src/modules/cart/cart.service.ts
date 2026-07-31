import { CreateCartDto, UpdateCartDto } from "./cart.dto";
import { type UserDocument } from "src/DB/models/user.model";
import { BadGatewayException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import successResponse from "src/common/utils/response.success";
import CartRepo from "src/DB/repo/cart.repo";
import ProductRepo from "src/DB/repo/product.repo";
import { Cart } from "src/DB/models/cart.model";
import { Types } from "mongoose";

@Injectable()
export class CartService {
    constructor(
        private readonly cartRepo: CartRepo,
        private readonly productRepo: ProductRepo,
    ) { }

    async createCart({ productId, quantity }: CreateCartDto, user: UserDocument): Promise<any> {
        const product = await this.productRepo.findOne({
            filter: { _id: productId, stock: { $gt: quantity } }
        })

        if (!product) throw new NotFoundException("product not found")

        const cart = await this.cartRepo.findOne({ filter: { createdBy: user._id } })

        let newCart: Cart
        if (!cart) {
            newCart = await this.cartRepo.create({
                createdBy: user._id,
                products: [{
                    productId: product._id,
                    quantity,
                    finalPrice: product.price
                }]
            })
            return successResponse({ data: newCart })
        }

        const prodcutExist = cart.products.find((p) => p.productId.toString() === productId.toString())
        if (prodcutExist) throw new ConflictException("product already exists in cart")

        cart.products.push({
            productId: product._id,
            quantity,
            finalPrice: product.price
        })
        await cart.save()

        return successResponse({ data: cart })
    }

    async removeProductFromCart(productId: Types.ObjectId, userId: Types.ObjectId) {
        if (!await this.productRepo.findOne({ filter: { _id: productId } })) throw new NotFoundException("product not found in cart")

        const cart = await this.cartRepo.findOne({
            filter: {
                createdBy: userId,
                "products.productId": new Types.ObjectId(productId)
                // products: { $elemMatch: { productId } }
            }
        })

        if (!cart) throw new NotFoundException("cart not found")


        cart.products = cart.products.filter((p) => p.productId.toString() !== productId.toString())
        await cart.save()

        return successResponse({ data: cart })
    }

    async updateProductQuantity({ productId, quantity }: UpdateCartDto, userId: Types.ObjectId) {
        const cart = await this.cartRepo.findOne({
            filter: {
                createdBy: userId,
                "products.productId": new Types.ObjectId(productId)
                // products: { $elemMatch: { productId } }
            }
        })

        if (!cart) throw new NotFoundException("cart not found")

        if (!await this.productRepo.findOne({ filter: { _id: productId, stock: { $gt: quantity } } }))
            throw new NotFoundException("product not found in cart")

        cart.products.find((p) => {
            if (p.productId.toString() === productId.toString()) p.quantity += quantity
        })
        await cart.save()

        return successResponse({ data: cart })
    }
}