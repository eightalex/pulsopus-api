import { EDepartment } from '@app/entities';

export const departmentNames: Record<EDepartment, string> = {
  [EDepartment.COMPANY]: 'Company',
  [EDepartment.ADMINISTRATION]: 'Admin',
  [EDepartment.DEVELOPMENT]: 'Development',
  [EDepartment.DESIGN]: 'Design',
  [EDepartment.PRODUCT]: 'Product',
  [EDepartment.MARKETING]: 'Marketing',
  [EDepartment.HR]: 'HR',
};
