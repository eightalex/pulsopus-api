import { DataSource, Repository } from 'typeorm';
import { UserActivity } from '@app/entities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserActivityRepository extends Repository<UserActivity> {
  constructor(private dataSource: DataSource) {
    super(UserActivity, dataSource.createEntityManager());
  }
  public async deleteAllRecords(): Promise<void> {
    return this.query(
      'DELETE FROM user_activities WHERE id in (SELECT id FROM user_activities)',
    );
  }
}
