import { IsEmail, IsInt, IsNotEmpty, IsString, IsStrongPassword, Length, Validate, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator, ValidationOptions, ValidateIf } from "class-validator";

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

export class CreatUserDto {
    @Length(3, 20, { message: "name length must be between 3 to 20" })
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @IsStrongPassword()
    password: string;

    @IsNotEmpty()
    @IsInt()
    age: number;

    // @Validate(matchPassword)
    @ValidateIf((data: CreatUserDto) => { return Boolean(data.password) })
    @IsMatch(['password'])
    cPassword: string;
}