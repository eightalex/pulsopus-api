import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiService {
  public getIndex(): string {
    return 'api index page';
  }
}
