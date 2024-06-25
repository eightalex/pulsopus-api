import { EDepartment } from '@app/entities';

export const departmentNamesMap = new Map<keyof typeof EDepartment, string>([
  ['COMPANY', 'Company'],
  ['DEVELOPMENT', 'Development'],
  ['DESIGN', 'UI/UX Design'],
  ['HR', 'HR'],
  ['QA', 'QA'],
  ['PROJECT_MANAGER', 'Project Management'],
  ['DEV_OPS', 'DevOps'],
]);
