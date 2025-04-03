import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api')

  const configService = app.get(ConfigService);
  const port = configService.get('app.port');

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))

  await app.listen(port ?? 3000);
}
bootstrap();
