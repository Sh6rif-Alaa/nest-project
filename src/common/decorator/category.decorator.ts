import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator, ValidationOptions } from "class-validator";
import { Types } from "mongoose";

@ValidatorConstraint({ name: 'validateIds', async: false })
export class ValidateIds implements ValidatorConstraintInterface {
    validate(value: string[], args: ValidationArguments) {
        return value.filter(id => Types.ObjectId.isValid(id)).length === value.length
    }

    defaultMessage(args: ValidationArguments) {
        return `some of ${args.property} are not valid`;
    }
}

export function IsIds(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: ValidateIds,
        });
    };
}