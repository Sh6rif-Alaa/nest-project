import { Module } from "@nestjs/common";
import RedisService from "../services/redis.service";
import { createClient } from "redis";
import { InternalServerErrorException } from "@nestjs/common";

@Module({
    providers: [
        RedisService,
        {
            provide: "REDIS_CLIENT",
            useFactory: async () => {
                const redis = createClient({
                    url: process.env.REDIS_URL!
                })
                await redis.connect()
                console.log("connected to redis successfully")
                redis.on("error", (err) => {
                    console.log("redis error", err)
                    throw new InternalServerErrorException(`failed to connect to redis: ${err}`)
                })
                return redis
            }
        }
    ],
    exports: [RedisService, "REDIS_CLIENT"]
})
export class RedisModule { }