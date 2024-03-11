import * as dotenv from 'dotenv-flow';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // Enable CORS for all origins

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
}
bootstrap();
