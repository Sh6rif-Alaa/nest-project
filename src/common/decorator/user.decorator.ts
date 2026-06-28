import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator, ValidationOptions } from "class-validator";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

@ValidatorConstraint({ name: 'matchKey', async: false })
export class matchKey implements ValidatorConstraintInterface {
    validate(value: string, args: ValidationArguments) {
        return args.value === args.object[args.constraints[0]]
    }

    defaultMessage(args: ValidationArguments) {
        return `${args.property} not match with ${args.constraints[0]}`;
    }
}

export function IsMatch(constraints: string[], validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints,
            validator: matchKey,
        });
    };
}

export const User = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    },
);