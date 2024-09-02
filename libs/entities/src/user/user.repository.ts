import { DataSource, Repository } from 'typeorm';
import { EAccessRequestStatus } from '@app/entities/constants';
import { Injectable } from '@nestjs/common';
import { User } from './user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }
  public async deleteAllRecords(): Promise<void> {
    return this.query('DELETE FROM users WHERE id in (SELECT id FROM users)');
  }

  public async findByActive(): Promise<User[]> {
    return this.findBy({ isActive: true });
  }

  public async findByActiveOrByPendingAccessRequestedUserId(
    requestedUserId: User['id'],
  ): Promise<User[]> {
    const QUERY = [
      'select * from users as u',
      `left join user_access_requests uar on u.id = uar."requesterId" and uar.status = '${EAccessRequestStatus.PENDING}'`,
      `where u.is_active = true or uar."requestedUserId" = '${requestedUserId}'`,
      'order by is_active asc',
    ].join(' ');
    return this.query(String(QUERY));
  }
}
