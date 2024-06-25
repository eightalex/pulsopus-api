import * as moment from 'moment/moment';
import { v4 as uuidv4 } from 'uuid';
import {
  Activity,
  Department,
  EDepartment,
  EUserRole,
  EUserStatus,
  Position,
  Role,
  User,
  UserStatus,
} from '@app/entities';
import { IReaded } from './csv-user-data';

const avatars = [
  'https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-computer-wallpaper.png',
  'https://w7.pngwing.com/pngs/340/946/png-transparent-avatar-user-computer-icons-software-developer-avatar-child-face-heroes.png',
  'https://w7.pngwing.com/pngs/129/292/png-transparent-female-avatar-girl-face-woman-user-flat-classy-users-icon.png',
  'https://banner2.cleanpng.com/20180625/req/kisspng-computer-icons-avatar-business-computer-software-user-avatar-5b3097fcae25c3.3909949015299112927133.jpg',
];

const list = Object.keys(EUserRole).map(
  (k) => EUserRole[k as keyof typeof EUserRole],
);

export const rowParser = (row) => {
  return Object.entries(row).reduce((acc, [k, v = '']) => {
    const keys = ['name', 'position', 'department'];
    if (keys.includes(k.trim().toLowerCase())) {
      acc[k.trim().toLowerCase()] = (v as string).trim();
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

export const userMockByRoles = list.map((role) => {
  const username = `dev ${[role].map((s) => s.toLowerCase()).join(' ')}`;
  return new User({
    id: uuidv4(),
    username,
    email: `${role.toLowerCase()}@pulsopus.dev`,
    password: 'password',
    avatar: avatars[Math.floor(Math.random() * avatars.length)] || '',
    role: Role.of(role),
    status: UserStatus.of(
      [role].includes(EUserRole.ADMIN)
        ? EUserStatus.ACTIVE
        : EUserStatus.INACTIVE,
    ),
  });
});
export const usersMock = [
  ...userMockByRoles,
  new User({
    id: uuidv4(),
    username: 'dev user',
    email: 'user@pulsopus.dev',
    password: 'password',
    avatar: avatars[Math.floor(Math.random() * avatars.length)] || '',
    role: Role.of(EUserRole.VIEWER),
    status: UserStatus.of(EUserStatus.INACTIVE),
  }),
];

const departmentsValuesMap: Map<string, EDepartment> = new Map([
  ['QA', EDepartment.QA],
  ['HR', EDepartment.HR],
  ['UI/UX Design', EDepartment.DESIGN],
  ['Development', EDepartment.DEVELOPMENT],
  ['DevOps', EDepartment.DEV_OPS],
  ['Project Management', EDepartment.PROJECT_MANAGER],
]);
export const createFromCsv = (r: IReaded) => {
  const dep = departmentsValuesMap.get(
    r.department.replace('department', '').trim(),
  );
  const id = uuidv4();
  const createdAt = moment().startOf('day').valueOf();
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
    role: Role.of(EUserRole.VIEWER),
    status: UserStatus.of(EUserStatus.ACTIVE),
    department: Department.of(dep),
    position: Position.ofLabel(r.position),
    activity: Object.entries(r.data).map(([date, v]) =>
      Activity.of(
        moment(date, 'DD-MM-YYYY').valueOf().toString(),
        Number(v || 0),
      ),
    ),
    createdAt,
    updatedAt: createdAt,
  });
};
