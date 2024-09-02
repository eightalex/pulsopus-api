import {
  User,
  UserAccessRequest,
  UserAccessRequestRepository,
  UserActivity,
  UserActivityRepository,
  UserRepository,
} from '@app/entities';

export const entities = [User, UserActivity, UserAccessRequest];

export const repositories = [
  UserRepository,
  UserActivityRepository,
  UserAccessRequestRepository,
];
