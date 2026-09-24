import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BffService } from './bff.service';
import { CreateBffDto } from './dto/create-bff.dto';
import { UpdateBffDto } from './dto/update-bff.dto';

@Controller('bff')
export class BffController {
  constructor(private readonly bffService: BffService) {}

  @Post()
  create(@Body() createBffDto: CreateBffDto) {
    return this.bffService.create(createBffDto);
  }

  @Get()
  findAll() {
    return this.bffService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bffService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBffDto: UpdateBffDto) {
    return this.bffService.update(+id, updateBffDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bffService.remove(+id);
  }
}
