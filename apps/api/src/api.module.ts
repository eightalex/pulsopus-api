import { ConfigModule, JwtModule, LoggerModule } from '@app/common';
import { Module } from '@nestjs/common';
import { ApiController } from '@/api/src/api.controller';
import { ApiService } from '@/api/src/api.service';
import { MockModule } from '@/api/src/mock/mock.module';
import { MockService } from '@/api/src/mock/mock.service';
import { AuthModule } from '@/auth/src/auth.module';
import { DepartmentsModule } from '@/departments/src/departments.module';
import { UsersModule } from '@/users/src/users.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    JwtModule,
    MockModule,
    AuthModule,
    UsersModule,
    DepartmentsModule,
  ],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
