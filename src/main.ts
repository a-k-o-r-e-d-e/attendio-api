import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import EnvVars from './constants/EnvVars';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(EnvVars.BASE_URL);
  await app.listen(EnvVars.Port);
}
bootstrap();
