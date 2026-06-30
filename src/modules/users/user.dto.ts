import { IsEmail, IsInt, IsNotEmpty, IsString, IsStrongPassword, Length, ValidateIf } from "class-validator";
import { IsMatch } from "src/common/decorator/user.decorator";

export class CreatUserDto {
    @Length(3, 20, { message: "userName length must be between 3 to 20" })
    @IsNotEmpty()
    @IsString()
    userName: string;

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

    @IsNotEmpty()
    @IsString()
    phone: string;

    // @Validate(matchPassword)
    @ValidateIf((data: CreatUserDto) => { return Boolean(data.password) })
    @IsMatch(['password'])
    cPassword: string;
}

export class SignInDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @IsStrongPassword()
    password: string;
}

export class ConfirmEmailDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    otp: string;
}

export class ReSendOtpDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;
}

export class RefreshTokenDto {
    @IsNotEmpty()
    @IsString()
    authorization: string;
}