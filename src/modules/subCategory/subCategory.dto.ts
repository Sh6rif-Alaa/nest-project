import { PartialType } from '@nestjs/mapped-types';
import { IsMongoId, IsNotEmpty, IsString, Length } from 'class-validator';
import { Types } from 'mongoose';

export class CreateSubCategoryDto {
    @IsNotEmpty()
    @IsString()
    @Length(3, 20)
    title: string;

    @IsNotEmpty()
    @IsMongoId()
    category: Types.ObjectId;
}

export class UpdateSubCategoryDto extends PartialType(CreateSubCategoryDto) { }
