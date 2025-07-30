//#region Imports
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { join } from "path"
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from "fs";
import * as http from "http";
import * as https from "https";
//#endregion

//#region Main Server Function
async function bootstrap() {
  //#region Set Certificates for HTTPS
  const httpsOptions = {
    key: fs.readFileSync('ssl/private.key'),
    cert: fs.readFileSync('ssl/certificate.crt'),
    ca: fs.readFileSync('ssl/ca_bundle.crt'),
  };
  //#endregion

  // create the app but dont start it with app.listen (we are starting it with "await app.init();" );
  
  //#region Publish Other Directories
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: true,
  });
  app.useStaticAssets(join(__dirname, "..", "pictures"), {
    prefix: "/pictures/",
  });
  app.useStaticAssets(join(__dirname, "..", "public/pictures"), {
    prefix: "/public/pictures/",
  });
  app.useStaticAssets(join(__dirname, "..", "public"));
  await app.init();
  //#endregion

  /*
  // create HTTPS server
  https.createServer(httpsOptions, app.getHttpAdapter().getInstance())
    .listen(3000, () => {
      console.log('HTTPS server started on port 3000');
    });

  // create HTTP server
  http.createServer(app.getHttpAdapter().getInstance())
    .listen(3000, () => {
      console.log('HTTP server started on port 3000');
    });*/
  
  //#region Start Http Server At Port 3000
  await app.listen(3000, () => {
    console.log('HTTP server started on port 3000');
  });
  //#endregion
}
//#endregion

bootstrap();