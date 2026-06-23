import { BadRequestException, Body, Controller, DefaultValuePipe, HttpCode, HttpStatus, ParseBoolPipe, ParseEnumPipe, ParseIntPipe, Post, UsePipes, ValidationPipe } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreatUserDto } from "./dto/createUser.dto";

@Controller('user')
// @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    // @HttpCode(HttpStatus.ACCEPTED)
    @UsePipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        // disableErrorMessages:true
        // dismissDefaultMessages:true
        // skipMissingProperties:true
        // skipNullProperties:true
        // skipUndefinedProperties:true
        // errorHttpStatusCode:401
    }))
    createUser(@Body() body: CreatUserDto): any {
        // throw new BadRequestException("no user found")
        return body
        // return this.userService.createUser()
    }
}