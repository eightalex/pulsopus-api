import { DataSource, Repository } from 'typeorm';
import { EAccessRequestStatus, UserAccessRequest } from '@app/entities';
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

  public async findByPendingAndRequesterIdAndRequestedUserId(
    requesterId: UserAccessRequest['requester']['id'],
    requestedUserId: UserAccessRequest['requestedUser']['id'],
  ): Promise<UserAccessRequest[]> {
    return this.createQueryBuilder('req')
      .leftJoinAndSelect('req.requester', 'requester')
      .leftJoinAndSelect('req.requestedUser', 'requestedUser')
      .where('req.requester_id = :requesterId', { requesterId })
      .andWhere('req.requested_user_id = :requestedUserId', {
        requestedUserId,
      })
      .andWhere('req.status = :status', {
        status: EAccessRequestStatus.PENDING,
      })
      .getMany();
  }

  public async approveById(
    id: UserAccessRequest['id'],
  ): Promise<UserAccessRequest> {
    return this.save({
      id,
      status: EAccessRequestStatus.APPROVED,
    });
  }

  public async rejectById(
    id: UserAccessRequest['id'],
  ): Promise<UserAccessRequest> {
    return this.save({
      id,
      status: EAccessRequestStatus.REJECTED,
    });
  }
}
