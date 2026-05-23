import { PermissionMap } from '../constants/permissions';

/** Full user context attached to req.user after JWT validation */
export interface IUserContext {
  id: string;
  username: string;
  source: 'user' | 'manager' | 'salesRep';
  userTypeId: string;
  userTypeName: string;
  isAdmin: boolean;
  permissions: PermissionMap;
}
