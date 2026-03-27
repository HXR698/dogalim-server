import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ProdhtService } from './prodht.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('prodht')
export class ProdhtController {
  constructor(private readonly prodhtService: ProdhtService) {}
  
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.prodhtService.findOne(+id);
  }
}
