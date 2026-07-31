import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ConfigModule } from '@nestjs/config';
import { CategoryModule } from './modules/category/category.module';
import { BrandModule } from './modules/brand/brand.module';
import { SubCategoryModule } from './modules/subCategory/subCategory.module';
import { ProductModule } from './modules/product/product.module';
import { CartModule } from './modules/cart/cart.module';
import { CouponModule } from './modules/coupon/coupon.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [".env", ".env.development", ".env.production"],
      isGlobal: true
    }),
    MongooseModule.forRoot(process.env.DB_URI!, {
      onConnectionCreate: (connection: Connection) => {
        connection.on('connected', () => console.log('connected to db successfully....'));
        return connection;
      }
    }),
    UserModule,
    CategoryModule,
    BrandModule,
    SubCategoryModule,
    ProductModule,
    CartModule,
    CouponModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
