import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { origin: true, credentials: true },
  });
  await app.listen(process.env.PORT ?? 3001);
  // eslint-disable-next-line no-console
  console.log(
    `Backend running on http://localhost:${process.env.PORT ?? 3001}`,
  );
}
bootstrap();
