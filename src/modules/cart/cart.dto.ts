import { Type } from "class-transformer";
import { IsMongoId, IsNotEmpty, IsNumber, IsPositive, Min } from "class-validator";
import { Types } from "mongoose";

export class CreateCartDto {
    @IsNotEmpty()
    @IsMongoId()
    productId: Types.ObjectId;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @Min(1)
    @Type(() => Number)
    quantity: number;
}

export class UpdateCartDto extends CreateCartDto { }