import { type RedisClientType } from "redis"
import { emailEnum } from "../enum/email.enum"
import { Types } from "mongoose"
import { Inject, Injectable, InternalServerErrorException } from "@nestjs/common"

interface SetValueParams {
    key: string
    value: any
    ttl?: number | undefined
};

interface OTPParams {
    email: string
    subject?: emailEnum
}

@Injectable()
class RedisService {
    constructor(@Inject("REDIS_CLIENT") private readonly client: RedisClientType) { }

    // Keys
    revokeKey({ userId, jti }: { userId: Types.ObjectId, jti?: string }) {
        return `revoke_token::${userId}::${jti}`;
    }

    getRevokeKey(userId: Types.ObjectId) {
        return `revoke_token::${userId}`;
    }

    getProfileKey(userId: Types.ObjectId) {
        return `profile::${userId}`;
    }

    otpKey({ email, subject = emailEnum.confirmEmail }: OTPParams) {
        return `otp::${subject}::${email}`;
    }

    maxOtpKey({ email, subject = emailEnum.confirmEmail }: OTPParams) {
        return `otp_max::${subject}::${email}`;
    }

    blockedOtpKey({ email, subject = emailEnum.confirmEmail }: OTPParams) {
        return `otp_blocked::${subject}::${email}`;
    }

    socketIoKey(userId: Types.ObjectId) {
        return `socketIo::${userId}`
    }

    // Methods
    async setValue({ key, value, ttl }: SetValueParams) {
        try {
            const data = typeof value === "string" ? value : JSON.stringify(value);
            return ttl ? await this.client.set(key, data, { EX: ttl }) : await this.client.set(key, data)
        } catch (error) {
            console.error("Error setting value in redis", error);
            throw new InternalServerErrorException('Error setting value in redis');
        }
    }

    async getValue(key: string): Promise<string | null> {
        try {
            const value = await this.client.get(key)
            if (!value) return null

            try {
                return JSON.parse(value)
            } catch {
                return value
            }
        } catch (error) {
            console.error("Error getting value from redis", error);
            throw new InternalServerErrorException('Error getting value from redis');
        }
    }

    async updateValue({ key, value, ttl }: SetValueParams) {
        try {
            const exists = await this.exists(key);
            if (!exists) return;

            return await this.setValue({ key, value, ttl });
        } catch (error) {
            console.error("Error updating value in redis", error);
            throw new InternalServerErrorException('Error updating value in redis');
        }
    }

    async ttl(key: string): Promise<number> {
        try {
            return await this.client.ttl(key);
        } catch (error) {
            console.error("Error getting ttl from redis", error);
            throw new InternalServerErrorException('Error getting ttl from redis');
        }
    }

    async expire({ key, ttl }: { key: string, ttl: number }): Promise<number> {
        try {
            return await this.client.expire(key, ttl);
        } catch (error) {
            console.error("Error setting expire in redis", error);
            throw new InternalServerErrorException('Error setting expire in redis');
        }
    }

    async exists(key: string): Promise<number> {
        try {
            return await this.client.exists(key);
        } catch (error) {
            console.error("Error checking key existence", error);
            throw new InternalServerErrorException('Error checking key existence');
        }
    }

    async del(key: string | string[]): Promise<number> {
        try {
            if (!key || (Array.isArray(key) && key.length === 0)) return 0;
            return await this.client.del(key);
        } catch (error) {
            console.error("Error deleting key", error);
            throw new InternalServerErrorException('Error deleting key');
        }
    }

    async keys(pattern: string): Promise<string[]> {
        try {
            return await this.client.keys(`${pattern}*`);
        } catch (error) {
            console.error("Error getting keys", error);
            throw new InternalServerErrorException('Error getting keys');
        }
    }

    async incr(key: string): Promise<number> {
        try {
            return await this.client.incr(key);
        } catch (error) {
            console.error("Error incrementing value", error);
            throw new InternalServerErrorException('Error incrementing value');
        }
    }

    private FCMKey(userId: Types.ObjectId) {
        return `fcm::${userId}`
    }

    async addFCMToken(userId: Types.ObjectId, fcmToken: string) {
        return await this.client.sAdd(this.FCMKey(userId), fcmToken);
    }

    async removeFCMToken(userId: Types.ObjectId, fcmToken: string) {
        return await this.client.sRem(this.FCMKey(userId), fcmToken);
    }

    async getFCMs(userId: Types.ObjectId): Promise<string[]> {
        return await this.client.sMembers(this.FCMKey(userId));
    }

    async hasFCMToken(userId: Types.ObjectId) {
        return await this.client.sCard(this.FCMKey(userId));
    }

    async removeFCMUser(userId: Types.ObjectId) {
        return await this.client.del(this.FCMKey(userId));
    }

    // User Socket Methods
    async storeUserSocket({ userId, socketId }: { userId: Types.ObjectId, socketId: string }) {
        await this.client.sAdd(this.socketIoKey(userId), socketId);
    }

    async getUserSocket(userId: Types.ObjectId) {
        return await this.client.sMembers(this.socketIoKey(userId));
    }

    async getAllUserSockets(userId: Types.ObjectId) {
        return await this.client.sMembers(this.socketIoKey(userId))
    }

    async removeUserSocket({ userId, socketId }: { userId: Types.ObjectId, socketId: string }) {
        return await this.client.sRem(this.socketIoKey(userId), socketId);
    }

    async hasSocketUser(userId: Types.ObjectId) {
        return await this.exists(this.socketIoKey(userId));
    }

}

export default RedisService