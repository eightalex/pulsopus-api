import { DataSource, Repository } from 'typeorm';
import { UserAccessRequest } from '@app/entities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserAccessRequestRepository extends Repository<UserAccessRequest> {
  constructor(private dataSource: DataSource) {
    super(UserAccessRequest, dataSource.createEntityManager());
  }
  public async deleteAllRecords(): Promise<void> {
    return this.query(
      'DELETE FROM user_access_requests WHERE id in (SELECT id FROM user_access_requests)',
    );
  }
}
