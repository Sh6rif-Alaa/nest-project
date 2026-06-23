import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/users/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ConfigModule } from '@nestjs/config';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
