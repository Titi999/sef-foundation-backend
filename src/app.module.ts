import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { dataSourceOptions } from './db/data-source';
import { AuthenticationModule } from './authentication/authentication.module';
import * as process from 'process';
import { join } from 'path';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { StudentsModule } from './students/students.module';
import { FinanceModule } from './finance/finance.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    UsersModule,
    AuthenticationModule,
    MailerModule.forRoot({
      transport: {
        host: process.env.TRANSPORT_HOST,
        port: 587,
        auth: {
          user: process.env.TRANSPORT_USERNAME,
          pass: process.env.TRANSPORT_PASSWORD,
        },
      },
      defaults: {
        from: '"No Reply" <info@sef.com',
      },
      template: {
        dir: join(__dirname, '/templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    StudentsModule,
    ConfigModule.forRoot(),
    FinanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
