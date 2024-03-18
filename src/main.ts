import { NestFactory, Reflector } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import EnvVars from './constants/EnvVars';
import { useRequestLogging } from './middlewares/request_logging.middleware';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  useRequestLogging(app);
  app.use(helmet());
  app.enableCors();
  app.setGlobalPrefix(EnvVars.BASE_URL);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  await app.listen(EnvVars.Port);
}
bootstrap();
