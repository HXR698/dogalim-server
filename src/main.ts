import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { join } from "path"
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from "fs";
const path = require('path');
const morgan = require('morgan');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  app.useStaticAssets(join(__dirname, "..", "pictures"), {
    prefix: "/pictures/",
  });
  app.useStaticAssets(join(__dirname, "..", "public/pictures"), {
    prefix: "/public/pictures/",
  });
  //app.useStaticAssets(join(__dirname, "..", "/validation"), {
  //  prefix: "/.well-known/pki-validation",
  //});
  app.useStaticAssets(join(__dirname, "..", "public"));
  await app.init();

  // Eğer sunucunun önünde reverse-proxy/nginx/Cloudflare varsa:
  app.set('trust proxy', true); // req.ip doğru gelsin diye

  // Log dosyası (append)
  const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

  // Combined format (okunabilir) veya custom format
  const combined = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

  // Logu hem konsola hem dosyaya yaz
  app.use(morgan(combined, { stream: accessLogStream }));
  app.use(morgan(combined));

  await app.listen(3000, '127.0.0.1', () => {
    console.log('HTTP server started on port 3000');
  });
}
bootstrap();


//! UPLOAD IMAGE KISMINDA RISKLER VAR
//! PRODUCT COMMENT KISMINDA RISKLER VAR
//! HAVE SERIOUSLY PROBLEMS IN USERS
//TODO: WHY THREE EMAILS ???