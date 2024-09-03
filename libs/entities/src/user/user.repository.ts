import { DataSource, Repository } from 'typeorm';
import { UserFindSelectionDto } from '@app/dto/users/user-find-selection.dto';
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

  public async findByActive(selection: UserFindSelectionDto): Promise<User[]> {
    return this.createQueryBuilder('u')
      .leftJoinAndSelect(
        'u.activities',
        'act',
        'act.date BETWEEN :startDate AND :endDate',
        {
          startDate: selection.startDate,
          endDate: selection.endDate,
        },
      )
      .where('u.isActive = :isActive', { isActive: true })
      .orderBy('act.date', 'ASC')
      .cache(true)
      .getMany();
  }

  public async findByActiveOrByPendingAccessRequestedUserId(
    requestedUserId: User['id'],
    selection: UserFindSelectionDto,
  ): Promise<User[]> {
    return this.createQueryBuilder('u')
      .leftJoinAndSelect('u.receivedAccessRequests', 'receivedAccessRequests')
      .leftJoinAndSelect('u.sentAccessRequests', 'sentAccessRequests')
      .leftJoinAndSelect(
        'u.activities',
        'act',
        'act.date BETWEEN :startDate AND :endDate',
        {
          startDate: selection.startDate,
          endDate: selection.endDate,
        },
      )
      .where('u.isActive = :isActive', { isActive: true })
      .orWhere(
        'sentAccessRequests.status = :status AND sentAccessRequests.requestedUser = :requestedUserId',
        {
          status: EAccessRequestStatus.PENDING,
          requestedUserId,
        },
      )
      .orderBy('u.isActive', 'ASC')
      .addOrderBy('act.date', 'ASC')
      .cache(true)
      .getMany();
  }
}
