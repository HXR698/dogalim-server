import { Injectable } from '@nestjs/common';
import { CreateBffDto } from './dto/create-bff.dto';
import { UpdateBffDto } from './dto/update-bff.dto';

@Injectable()
export class BffService {
  create(createBffDto: CreateBffDto) {
    return 'This action adds a new bff';
  }

  findAll() {
    return `This action returns all bff`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bff`;
  }

  update(id: number, updateBffDto: UpdateBffDto) {
    return `This action updates a #${id} bff`;
  }

  remove(id: number) {
    return `This action removes a #${id} bff`;
  }
}
