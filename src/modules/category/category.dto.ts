import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";
import { Types } from "mongoose";
import { IsIds } from "src/common/decorator/category.decorator";

export class CreateCategoryDto {
    @IsNotEmpty()
    @IsString()
    @Length(3, 20)
    title: string;

    @IsArray()
    @IsIds()
    @IsOptional()
    brands?: Types.ObjectId[]
}