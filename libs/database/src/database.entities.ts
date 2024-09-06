import {
  Department,
  DepartmentRepository,
  User,
  UserAccessRequest,
  UserAccessRequestRepository,
  UserActivity,
  UserActivityRepository,
  UserRepository,
} from '@app/entities';

export const entities = [User, UserActivity, UserAccessRequest, Department];

export const repositories = [
  UserRepository,
  UserActivityRepository,
  UserAccessRequestRepository,
  DepartmentRepository,
];
