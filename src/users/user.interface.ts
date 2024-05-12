export const userRoles = ['super admin', 'admin'] as const;

export type userTypes = (typeof userRoles)[number];
