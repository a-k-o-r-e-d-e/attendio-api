import { TypeOrmModule } from '@nestjs/typeorm';
import { seeder } from 'nestjs-seeder';
import { baseDataSourceOptions } from '../../config/typeorm.config';
import { UsersSeeder } from './user.seeder';
import { UsersModule } from '../../users/users.module';
import { User } from '../../users/user.entity';

seeder({
  imports: [
    TypeOrmModule.forRoot({
      ...baseDataSourceOptions,
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([User]),
    UsersModule,
  ],
}).run([UsersSeeder]);
