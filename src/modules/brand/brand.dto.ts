import { PartialType } from "@nestjs/mapped-types";
import { Type } from "class-transformer";
import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Length } from "class-validator";
import { Types } from "mongoose";
import { AtLeastOneOf } from "src/common/decorator/brand.decorator";

export class CreateBrandDto {
    @IsNotEmpty()
    @IsString()
    @Length(3, 20)
    title: string;

    @IsOptional()
    @IsString()
    @Length(3, 50)
    slogan?: string;
}

@AtLeastOneOf(['title', 'slogan'])
export class UpdateBrandDto extends PartialType(CreateBrandDto) { }

export class idDto {
    @IsNotEmpty()
    @IsMongoId()
    id: Types.ObjectId;
}

export class QueryDto {
    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    page?: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    limit?: number;

    @IsOptional()
    @IsString()
    search?: string
}