// ── User Types ──────────────────────────────────────────────────────────────
export const USER_ROLES = ['STUDENT', 'INSTITUTE', 'ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ['ACTIVE', 'PENDING', 'SUSPENDED'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export interface PublicUser {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
}

export interface UserDocument {
  _id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}
