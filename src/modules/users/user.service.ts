import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { ConfirmEmailDto, CreatUserDto, ReSendOtpDto, SignInDto } from "./dto/createUser.dto";
import UserRepo from "../../DB/repo/user.repo";
import { Compare, Hash } from "src/common/utils/security/hash.security";
import { encrypt } from "src/common/utils/security/encrypt.security";
import { generateOTP, sendEmail } from "src/common/utils/email/send.email";
import { eventEmitter } from "src/common/utils/email/email.events";
import { emailTemplate } from "src/common/utils/email/email.template";
import { emailEnum } from "src/common/enum/email.enum";
import RedisService from "src/common/services/redis.service";
import { randomUUID } from "node:crypto";
import { Types } from "mongoose";
import { ProviderEnum } from "src/common/enum/user.enum";
import successResponse from "src/common/utils/response.success";
import TokenService from "src/common/services/token.service";

@Injectable()
export class UserService {
    constructor(
        private readonly userRepo: UserRepo,
        private readonly redisService: RedisService,
        private readonly tokenService: TokenService
    ) { }

    getTokens = async (userId: Types.ObjectId): Promise<{ accessToken: string, refreshToken: string }> => {
        const uuid = randomUUID()

        const accessToken = await this.tokenService.generateToken({
            payload: { id: userId },
            options: {
                secret: process.env.TOKEN_KEY!,
                expiresIn: "1d",
                jwtid: uuid
            }
        })

        const refreshToken = await this.tokenService.generateToken({
            payload: { id: userId },
            options: {
                secret: process.env.REFRESH_TOKEN_KEY!,
                expiresIn: "1y",
                jwtid: uuid
            }
        })

        return { accessToken, refreshToken }
    }

    sendEmailOtp = async ({ email, userName, subject }: { email: string, userName: string | undefined, subject: emailEnum }) => {
        const isBlocked = await this.redisService.ttl(this.redisService.blockedOtpKey({ email, subject }))
        if (isBlocked > 0)
            throw new BadRequestException(`you are blocked, please try again after ${isBlocked} seconds`)

        const otpTtl = await this.redisService.ttl(this.redisService.otpKey({ email, subject }))
        if (otpTtl > 0)
            throw new BadRequestException("you already have an active otp, please wait until it expires")

        const otpTrials = Number(await this.redisService.getValue(this.redisService.maxOtpKey({ email, subject }))) || 0

        if (otpTrials >= 3) {
            await this.redisService.setValue({ key: this.redisService.blockedOtpKey({ email, subject }), value: 1, ttl: 60 * 15 })
            throw new BadRequestException("you exceeded maximum number of otp requests")
        }

        const OTP = await generateOTP()

        await this.redisService.setValue({
            key: this.redisService.otpKey({ email, subject }),
            value: Hash({ plainText: `${OTP}` }),
            ttl: 60 * 5
        })

        await this.redisService.incr(this.redisService.maxOtpKey({ email, subject }))

        if (otpTrials === 0)
            await this.redisService.expire({ key: this.redisService.maxOtpKey({ email, subject }), ttl: 60 * 15 })

        eventEmitter.emit("confirmEmail", async () => {
            await sendEmail({
                to: email,
                subject:
                    subject === emailEnum.forgetPassword
                        ? "Reset Your Password - nestApp"
                        : "Verify Your Email - nestApp",

                html: emailTemplate({
                    userName,
                    otp: OTP,
                    type: subject
                })
            })
        })
    }

    async getAllUsers(): Promise<any> {
        const users = await this.userRepo.find()
        return successResponse({ data: users })
    }

    async getUserById(id: string): Promise<any> {
        const user = await this.userRepo.findById(id)
        return successResponse({ data: user })
    }

    async signUp({ userName, email, password, age, phone }: CreatUserDto): Promise<any> {
        if (await this.userRepo.findOne({ filter: { email } }))
            throw new ConflictException("this email already used")

        await this.sendEmailOtp({ email, userName, subject: emailEnum.confirmEmail })

        const user = await this.userRepo.create({
            userName,
            email,
            password: Hash({ plainText: password }),
            phone: encrypt(phone),
            age
        });

        return successResponse({ data: user })
    }

    signIn = async ({ email, password }: SignInDto) => {
        const user = await this.userRepo.findOne({ filter: { email, confirmed: { $exists: true }, provider: ProviderEnum.system } })
        if (!user) throw new NotFoundException('user not exist or not confirmed (check your email)')
        if (!Compare({ plainText: password, hash: user.password })) throw new UnauthorizedException('invalid password')

        const { accessToken, refreshToken } = await this.getTokens(user._id)

        return successResponse({ token: { accessToken, refreshToken } })
    }

    confirmEmail = async ({ email, otp }: ConfirmEmailDto) => {
        const otpDb = await this.redisService.getValue(
            this.redisService.otpKey({ email, subject: emailEnum.confirmEmail })
        )

        if (!otpDb) throw new BadRequestException("otp expired or not found")

        if (!Compare({ plainText: otp, hash: otpDb })) throw new BadRequestException("otp not match")

        const user = await this.userRepo.findOneAndUpdate({
            filter: { email },
            update: { confirmed: true },
        })

        if (!user) throw new NotFoundException("user not exist")

        await this.redisService.del([
            this.redisService.otpKey({ email, subject: emailEnum.confirmEmail }),
            this.redisService.maxOtpKey({ email, subject: emailEnum.confirmEmail }),
            this.redisService.blockedOtpKey({ email, subject: emailEnum.confirmEmail })
        ])

        return successResponse({ message: "email verified successfully" })
    }

    reSendOtp = async ({ email }: ReSendOtpDto) => {
        const user = await this.userRepo.findOne({ filter: { email, confirmed: { $exists: false }, provider: ProviderEnum.system } })

        if (!user) throw new NotFoundException("user not exist")

        await this.sendEmailOtp({ email, userName: user.userName, subject: emailEnum.confirmEmail })

        return successResponse({ message: "otp sent successfully" })
    }

    // refreshToken = async (userId: string) => {
    //     const accessToken = await this.tokenService.generateToken({
    //         payload: { id: userId },
    //         options: {
    //             secret: process.env.TOKEN_KEY!,
    //             expiresIn: "1d",
    //             jwtid: randomUUID()
    //         }
    //     })

    //     return successResponse({ token: accessToken })
    // }
}