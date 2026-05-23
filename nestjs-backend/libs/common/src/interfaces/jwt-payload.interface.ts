/** JWT token payload — encoded into the signed JWT */
export interface IJwtPayload {
  id: string;
  username: string;
  source: 'user' | 'manager' | 'salesRep';
  userTypeId: string;
  isAdmin: boolean;
}
