import { IsArray, IsBoolean, IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class CreateCategoryDto {
    @IsNotEmpty()
    @IsString()
    @Length(3, 20)
    title: string;
}