import { v4 as uuidv4 } from 'uuid';
import {
  EDepartment,
  EPosition,
  EUserRole,
  EUserStatus,
  Position,
  User,
  UserRole,
  UserStatus,
} from '@app/entities';
import { Department } from '@app/entities/department.entity';
import { UserActivity } from '@app/entities/user-activity.entity';
import { IReaded } from '@/api/src/mock/helpers/csv-read';

const avatars = [
  'https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-computer-wallpaper.png',
  'https://w7.pngwing.com/pngs/340/946/png-transparent-avatar-user-computer-icons-software-developer-avatar-child-face-heroes.png',
  'https://w7.pngwing.com/pngs/129/292/png-transparent-female-avatar-girl-face-woman-user-flat-classy-users-icon.png',
  'https://banner2.cleanpng.com/20180625/req/kisspng-computer-icons-avatar-business-computer-software-user-avatar-5b3097fcae25c3.3909949015299112927133.jpg',
];

const list = [[EUserRole.ADMIN], [EUserRole.USER], [EUserRole.VIEWER]];

export const rowParser = (row) => {
  return Object.entries(row).reduce((acc, [k, v]) => {
    const keys = ['name', 'position', 'department'];
    if (keys.includes(k.trim().toLowerCase())) {
      acc[k.trim().toLowerCase()] = (v as string).trim();
      return acc;
    }
    if (k === 'Department') {
      acc[k] = v;
      return acc;
    }
    const d = acc.data || {};
    acc.data = {
      ...d,
      [k]: v,
    };
    return acc;
  }, {} as any);
};

export const usersMock = list.map((roles) => {
  return new User({
    username: [roles[0], roles[0]].map((s) => s.toLowerCase()).join(' '),
    email: `${roles[0].toLowerCase()}@pulsopus.dev`,
    password: 'password',
    avatar: avatars[Math.floor(Math.random() * avatars.length)] || '',
    roles: roles.map(UserRole.of),
    status: UserStatus.of(
      roles.includes(EUserRole.ADMIN)
        ? EUserStatus.ACTIVE
        : EUserStatus.INACTIVE,
    ),
    department: Department.of(EDepartment.UNKNOWN),
    position: Position.of(EPosition.UNKNOWN),
  });
});

export const createFromCsv = (r: IReaded) => {
  const id = uuidv4();
  return new User({
    id,
    username: r.name,
    email: r.name
      .split(' ')
      .map((s) => s.toLowerCase())
      .join('.')
      .concat('@pulsopus.dev'),
    password: 'password',
    refreshToken: 'refreshToken',
    avatar: avatars[Math.floor(Math.random() * avatars.length)] || '',
    roles: [UserRole.of(EUserRole.VIEWER)],
    status: UserStatus.of(EUserStatus.ACTIVE),
    department: Department.of(EDepartment.DEVELOPMENT),
    position: Position.ofLabel(r.position),
    activity: Object.entries(r.data).map(([k, v]) => UserActivity.of(id, k, v)),
  });
};
