import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsNumber, IsPositive, IsString, Length, Max, Min } from "class-validator";
import { AtLeastOneOf } from "src/common/decorator/brand.decorator";
import { IsCouponDate } from "src/common/decorator/coupon.decorator";

export class CreateCouponDto {
    @IsNotEmpty()
    @IsString()
    @Length(5, 10)
    code: string;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    amount: number;

    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    @IsCouponDate(['fromDate', 'toDate'])
    fromDate: Date;

    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    toDate: Date;
}

@AtLeastOneOf(["code", "amount", "fromDate", "toDate"])
export class UpdateCouponDto extends PartialType(CreateCouponDto) { }