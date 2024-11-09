export type Role = 'admin' | 'manager' | 'valet';

export type GetUserType = {
  id: string;
  roles: Role[];
};
