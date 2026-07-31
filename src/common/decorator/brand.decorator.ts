import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator, ValidationOptions } from "class-validator";

@ValidatorConstraint({ name: 'requireFields', async: false })
export class requireFields implements ValidatorConstraintInterface {
    validate(value: string, args: ValidationArguments) {
        return args.constraints.some((field: string) => args.object[field])
    }

    defaultMessage(args: ValidationArguments) {
        return `At least one of these fields must be filled: ${args.constraints.join(", ")}`;
    }
}

export function AtLeastOneOf(requiredFields: string[], validationOptions?: ValidationOptions) {
    return function (constructor: Function) {
        registerDecorator({
            target: constructor,
            propertyName: "",
            options: validationOptions,
            constraints: requiredFields,
            validator: requireFields,
        });
    };
}