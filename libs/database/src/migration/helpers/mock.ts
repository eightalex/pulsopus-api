import * as moment from 'moment/moment';
import { EDepartment, EUserRole, EUserStatus } from '@app/entities';
import { IReaded } from './csv-user-data';

const avatars = [
  'https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-computer-wallpaper.png',
  'https://w7.pngwing.com/pngs/340/946/png-transparent-avatar-user-computer-icons-software-developer-avatar-child-face-heroes.png',
  'https://w7.pngwing.com/pngs/129/292/png-transparent-female-avatar-girl-face-woman-user-flat-classy-users-icon.png',
  'https://banner2.cleanpng.com/20180625/req/kisspng-computer-icons-avatar-business-computer-software-user-avatar-5b3097fcae25c3.3909949015299112927133.jpg',
];

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

interface IParseCsvDataReturn {
  username: string;
  email: string;
  password: string;
  refreshToken?: string;
  avatar: string;
  department?: EDepartment;
  position?: string;
  activity?: Record<number, number | null>;
  status?: EUserStatus;
}

const departmentsValuesMap: Map<string, EDepartment> = new Map([
  ['QA', EDepartment.QA],
  ['HR', EDepartment.HR],
  ['UI/UX Design', EDepartment.DESIGN],
  ['Development', EDepartment.DEVELOPMENT],
  ['DevOps', EDepartment.DEV_OPS],
  ['Project Management', EDepartment.PROJECT_MANAGER],
]);

export const presetsUsers: IParseCsvDataReturn[] = [
  {
    username: 'user',
    role: EUserRole.VIEWER,
    status: EUserStatus.INACTIVE,
  },
  {
    username: 'admin',
    role: EUserRole.ADMIN,
    status: EUserStatus.ACTIVE,
  },
].map((data) => {
  const username = `${data.username} test`;
  const email = `${data.username}@pulsopus.dev`;
  return {
    ...data,
    username,
    email,
    password: 'password',
    avatar: avatars[Math.floor(Math.random() * avatars.length)] || '',
  };
});

export const parseCsvData = (r: IReaded): IParseCsvDataReturn => {
  const department = departmentsValuesMap.get(
    r.department.replace('department', '').trim(),
  );
  return {
    username: r.name,
    email: r.name
      .split(' ')
      .map((s) => s.toLowerCase())
      .join('.')
      .concat('@pulsopus.dev'),
    password: 'password',
    refreshToken: 'refreshToken',
    avatar: avatars[Math.floor(Math.random() * avatars.length)] || '',
    department,
    status: EUserStatus.ACTIVE,
    position: r.position,
    activity: Object.entries(r.data).reduce(
      (acc, [date, v]) => {
        const d = moment(date, 'YYYY-MM-DD').valueOf();
        let dV: number = !v ? null : 0;
        if (dV !== null) {
          const regexp = /,/gm;
          const replaced = v.replace(regexp, '');
          const numValue = Number(replaced);
          dV = !numValue ? numValue : Number(numValue.toFixed(2));
        }
        acc[d] = dV;
        return acc;
      },
      {} as Record<number, number | null>,
    ),
  };
};
