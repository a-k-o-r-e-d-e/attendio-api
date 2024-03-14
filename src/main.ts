import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import EnvVars from './constants/EnvVars';
import { useRequestLogging } from './middlewares/request_logging.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors();
  app.setGlobalPrefix(EnvVars.BASE_URL);
  useRequestLogging(app);
  await app.listen(EnvVars.Port);
}
bootstrap();
