export const userRoles = ['super admin', 'admin', 'beneficiary'] as const;

export type userTypes = (typeof userRoles)[number];

export const statuses = ['active', 'inactive'] as const;

export type statusesTypes = (typeof statuses)[number];

export const requestStatuses = ['pending', 'approved', 'declined'] as const;

export type disbursementStatusesType = (typeof requestStatuses)[number];
