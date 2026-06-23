import { Body, Controller, Get, Headers, Param, Post, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { UserService } from "./user.service";
import { ConfirmEmailDto, CreatUserDto, RefreshTokenDto, ReSendOtpDto, SignInDto } from "./dto/createUser.dto";
@Controller('user')
// @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post('signUp')
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }))
    signUp(@Body() body: CreatUserDto): any {
        return this.userService.signUp(body)
    }

    @Post('signIn')
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }))
    signIn(@Body() body: SignInDto): any {
        return this.userService.signIn(body)
    }

    @Post('confirmEmail')
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }))
    confirmEmail(@Body() body: ConfirmEmailDto): any {
        return this.userService.confirmEmail(body)
    }

    @Post('reSendOtp')
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }))
    reSendOtp(@Body() body: ReSendOtpDto): any {
        return this.userService.reSendOtp(body)
    }

    // @UseGuards(AuthenticationGuard)
    // @Post('refreshToken')
    // @UsePipes(new ValidationPipe({
    //     whitelist: true,
    //     forbidNonWhitelisted: true,
    // }))
    // refreshToken(@Headers() headers: RefreshTokenDto): any {
    //     return this.userService.refreshToken(headers)
    // }

    @Get()
    async getAllUsers(): Promise<any> {
        return this.userService.getAllUsers()
    }

    @Get(":id")
    async getUserById(@Param('id') id: string): Promise<any> {
        return this.userService.getUserById(id)
    }
}