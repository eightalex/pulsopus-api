export enum EUserStatus {
  INACTIVE = 'INACTIVE',
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  DELETED = 'DELETED',
}

export enum EUserRole {
  VIEWER = 'VIEWER',
  ADMIN = 'ADMIN',
}

export enum EDepartment {
  COMPANY = 'COMPANY',
  DEVELOPMENT = 'DEVELOPMENT',
  QA = 'QA',
  HR = 'HR',
  DESIGN = 'DESIGN',
  DEV_OPS = 'DEV_OPS',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
}

export enum EPosition {
  DEVELOPER_SENIOR = 'DEVELOPER_SENIOR',
  DEVELOPER_JUNIOR = 'DEVELOPER_JUNIOR',
  QA_JUNIOR = 'QA_JUNIOR',
  QA_LEAD = 'QA_LEAD',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
}

export enum EAccessRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum EAccessRequestDecision {
  // NO_DECISION = 'NO_DECISION',
  ACCEPT = 'ACCEPT',
  DECLINE = 'DECLINE',
}
