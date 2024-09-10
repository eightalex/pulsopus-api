import { DataLoaderService } from '@app/database/data-loader/data-loader.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DatabaseService {
  constructor(private readonly dataLoaderService: DataLoaderService) {}

  public async reset() {
    return this.dataLoaderService.restart();
  }
}
