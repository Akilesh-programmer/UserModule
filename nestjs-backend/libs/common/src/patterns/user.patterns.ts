/** TCP message patterns for User Service — UserType */
export const USER_TYPE_CREATE = 'user_type.create';
export const USER_TYPE_FIND_ALL = 'user_type.findAll';
export const USER_TYPE_FIND_ONE = 'user_type.findOne';
export const USER_TYPE_UPDATE = 'user_type.update';
export const USER_TYPE_DELETE = 'user_type.delete';

/** TCP message patterns for User Service — User */
export const USER_CREATE = 'user.create';
export const USER_FIND_ALL = 'user.findAll';
export const USER_FIND_ONE = 'user.findOne';
export const USER_UPDATE = 'user.update';
export const USER_DELETE = 'user.delete';
export const USER_FIND_BY_USERNAME = 'user.findByUsername';
export const USER_CHECK_USERNAME = 'user.checkUsername';

/** TCP message patterns for User Service — Permission */
export const PERMISSION_FIND_ALL = 'permission.findAll';
export const PERMISSION_FIND_BY_USER_TYPE = 'permission.findByUserType';
export const PERMISSION_SAVE = 'permission.save';
export const PERMISSION_GET_FOR_AUTH = 'permission.getForAuth';
