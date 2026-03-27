// upload.controller.ts
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

//! RISKLI DERECEDE XSS ACIGI (STORED XSS)
//! JPEG HARICI DOSYA YÜKLEME RISKI
//! JPEG UZANTILI FARKLI ICERIKLI DOSYA YÜKLEME RISKI (MIME SPOOFING)

@Controller('uploadimg')
export class UploadimgController {
    @Post()
    @UseInterceptors(
        FileInterceptor('image', {
            storage: diskStorage({
                destination: './pictures',
                filename: (req, file, callback) => {
                    const id = Date.now();
                    const customName = `${id}.jpeg`;
                    callback(null, customName);
                },
            }),
        })
    )
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        // file: Multer dosyası, burada file.buffer, file.originalname vs var
        console.log(file.originalname);
        
        // İstersen dosyayı kaydedebilirsin veya URL dönebilirsin
        return {
        message: 'Upload basarili',
        filename: file.originalname,
        url: `https://hxrefy.art/public/${file.originalname}`
        };
    }
}

