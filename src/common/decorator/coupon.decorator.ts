import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator, ValidationOptions } from "class-validator";

@ValidatorConstraint({ name: 'CouponValidator', async: false })
export class CouponValidator implements ValidatorConstraintInterface {
    validate(value: string, args: ValidationArguments) {
        console.log({ value, args })

        const fromDate: Date = new Date(args.object[args.constraints[0]])
        const toDate: Date = new Date(args.object[args.constraints[1]])
        const now = new Date()

        return fromDate >= now && fromDate < toDate
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.constraints[0]} with ${args.constraints[1]} must be in future and before today`;
    }
}

export function IsCouponDate(constraints: string[], validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints,
            validator: CouponValidator,
        });
    };
}