import { Body, Controller, Get, Headers, Param, Post, SetMetadata, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { UserService } from "./user.service";
import { ConfirmEmailDto, CreatUserDto, RefreshTokenDto, ReSendOtpDto, SignInDto } from "./dto/createUser.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import multer from "multer";
import { AuthGuard } from "src/common/guards/authentication.guard";
import { TokenTypeEnum } from "src/common/enum/user.enum";
import { Auth, Roles, TokenType } from "src/common/decorator/auth.decorator";
import { AuthorizationGuard } from "src/common/guards/authorization.guard";
import { type UserDocument } from "src/DB/models/user.model";
import { User } from "src/common/decorator/user.decorator";

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

    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: multer.diskStorage({
            destination: './upload',
            filename: (req, file, cb) => {
                cb(null, file.originalname)
            }
        })
    }))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        console.log(file);
    }

    @Post('refreshToken')
    @Auth(TokenTypeEnum.refreshToken)
    refreshToken(@User() user: UserDocument): any {
        return this.userService.refreshToken(user._id.toString())
    }

    @Get()
    async getAllUsers(): Promise<any> {
        return this.userService.getAllUsers()
    }

    @Get('profile')
    @Auth()
    async getProfile(@User() user: UserDocument): Promise<any> {
        return this.userService.getProfile(user)
    }

    @Get(":id")
    @Auth()
    async getUserById(@Param('id') id: string): Promise<any> {
        return this.userService.getUserById(id)
    }
}