import {
  User,
  UserAccessRequestRepository,
  UserActivity,
  UserActivityRepository,
  UserRepository,
} from '@app/entities';
import { Injectable, Logger } from '@nestjs/common';
import { CsvUserData, presetsUsers } from './csv-user-data';

@Injectable()
export class DataLoaderService {
  private readonly logger = new Logger(DataLoaderService.name);
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userActivityRepository: UserActivityRepository,
    private readonly userAccessRequestRepository: UserAccessRequestRepository,
  ) {
    this.initial();
  }

  private log(txt: string = '') {
    this.logger.log(`[DATA LOAD]: ${txt}`);
  }
  public async dropRecords() {
    await this.userRepository.deleteAllRecords();
    await this.userActivityRepository.deleteAllRecords();
    await this.userAccessRequestRepository.deleteAllRecords();
    this.log('Deleted all records');
  }

  private async insertUsersAndActivity() {
    const readedUserInstances =
      await new CsvUserData().getParsedCsvDataWithRename();
    const usersForCreate = [
      ...new Map(
        [...readedUserInstances, ...presetsUsers].map((u) => [u['email'], u]),
      ).values(),
    ];

    const activities = usersForCreate.reduce(
      (acc, { activity }) => {
        if (!activity) return acc;
        Object.entries(activity).forEach(([d, v]) => {
          const date = Number(d);
          const accValue = acc.get(date) || 0;
          acc.set(date, accValue + v);
        });
        return acc;
      },
      new Map() as Map<number, number>,
    );

    for (const userForCreate of usersForCreate) {
      const { activity, ...u } = userForCreate;
      const user = await this.userRepository.save(await User.create(u));
      this.log(`insert user ${user.id} ${user.username}`);
      for (const key in activity) {
        const value = activity[key];
        const date = Number(key);
        const absolute = activities.get(date) || value;
        const rate = (value / absolute) * 100;

        const act = UserActivity.of({
          date,
          value,
          rate,
          user,
        });
        const savedActivity = await this.userActivityRepository.save(act);
        this.log(`insert activity ${savedActivity.id}`);
      }
    }
  }

  private async initial() {
    const count = await this.userRepository.count();
    if (Boolean(count)) return;

    const key = 'load_data_initial';
    console.time(key);
    this.log('initial start');
    this.logger.log('[LOAD DATA]: ');

    await this.dropRecords();

    await this.insertUsersAndActivity();

    this.log('initial end');
    console.timeEnd(key);
  }

  public async restart(): Promise<{
    users: number;
    activities: number;
  }> {
    const key = 'load_data_restart';
    console.time(key);
    this.log('restart start');
    this.logger.log('[LOAD DATA]: ');

    await this.dropRecords();
    await this.insertUsersAndActivity();

    const users = await this.userRepository.count();
    const activities = await this.userActivityRepository.count();

    this.log('restart end');
    console.timeEnd(key);
    return {
      users,
      activities,
    };
  }
}
