import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { baseDataSourceOptions } from 'src/config/typeorm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...baseDataSourceOptions,
      autoLoadEntities: true,
      synchronize: true,
      // logging: true
    }),
  ],
})
export class DatabaseModule {}