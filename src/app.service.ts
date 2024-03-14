import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);
  constructor(@InjectDataSource() private readonly connection: DataSource) {
    if (this.connection.isInitialized) {
      this.logger.log('Database Connection Successful', AppService.name);
    } else {
      this.logger.error('Database connection failed');
    }
  }
  getHello(): string {
    return 'Hello World!';
  }
}
