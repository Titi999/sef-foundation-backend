import { Module } from '@nestjs/common';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { RefreshTokenIdsStorage } from './refresh-token-ids-storage';
import * as process from 'process';
import { ConfigModule } from '@nestjs/config';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtRefreshTokenStrategy } from './strategy/jwt-refresh-token.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Authentication } from './entities/authentication.entity';
import { NotificationService } from '../shared/notification/notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Authentication]),
    UsersModule,
    ConfigModule.forRoot(),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: String(process.env.JWT_SECRET),
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthenticationController],
  providers: [
    AuthenticationService,
    NotificationService,
    JwtStrategy,
    UsersService,
    RefreshTokenIdsStorage,
    LocalStrategy,
    JwtRefreshTokenStrategy,
  ],
})
export class AuthenticationModule {}
