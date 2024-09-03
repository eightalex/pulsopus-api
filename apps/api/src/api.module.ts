import { ConfigModule, JwtModule, LoggerModule } from '@app/common';
import { DatabaseModule } from '@app/database';
import { Module } from '@nestjs/common';
import { ApiController } from '@/api/src/api.controller';
import { ApiService } from '@/api/src/api.service';
import { AuthModule } from '@/auth/src/auth.module';
import { DepartmentsModule } from '@/departments/src/departments.module';
import { UsersModule } from '@/users/src/users.module';

@Module({
  imports: [
    LoggerModule,
    ConfigModule,
    DatabaseModule,
    AuthModule,
    JwtModule,
    UsersModule,
    DepartmentsModule,
  ],
  controllers: [ApiController],
  providers: [ApiService],
})
export class ApiModule {}
