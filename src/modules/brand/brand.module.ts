import { Module } from '@nestjs/common';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';
import { UserModel } from 'src/DB/models/user.model';
import { JwtService } from '@nestjs/jwt';
import S3Service from 'src/common/services/s3.service';
import { RedisModule } from 'src/common/redis/redis.module';
import TokenService from 'src/common/services/token.service';
import UserRepo from 'src/DB/repo/user.repo';
import BrandRepo from 'src/DB/repo/brand.repo';
import { BrandModel } from 'src/DB/models/brand.model';


@Module({
  imports: [BrandModel, UserModel, RedisModule],
  controllers: [BrandController],
  providers: [BrandService, UserRepo, BrandRepo, TokenService, JwtService, S3Service]
})
export class BrandModule { }