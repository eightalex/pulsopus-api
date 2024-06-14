import { ConfigModule, JwtModule, LoggerModule } from '@app/common';
import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';
import { ApiController } from '@/api/src/api.controller';
import { ApiService } from '@/api/src/api.service';
import { MockModule } from '@/api/src/mock/mock.module';
import { AuthModule } from '@/auth/src/auth.module';
import { DepartmentsModule } from '@/departments/src/departments.module';
import { UsersModule } from '@/users/src/users.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    DatabaseModule,
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
