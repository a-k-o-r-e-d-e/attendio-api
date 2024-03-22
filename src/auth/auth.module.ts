import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { LecturersModule } from '../lecturers/lecturers.module';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import EnvVars from '../constants/EnvVars';
import { JwtStrategy } from './strategies/jwt.strategy';
import { StudentsModule } from '../students/students.module';

@Module({
  imports: [
    UsersModule,
    LecturersModule,
    StudentsModule,
    PassportModule,
    JwtModule.register({
      global: true,
      secret: EnvVars.JWT_SECRET,
      signOptions: { expiresIn: EnvVars.JWT_EXPIRATION_TIME },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
