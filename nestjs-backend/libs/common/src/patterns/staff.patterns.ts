/** TCP message patterns for Staff Service — Manager */
export const MANAGER_CREATE = 'manager.create';
export const MANAGER_FIND_ALL = 'manager.findAll';
export const MANAGER_FIND_ONE = 'manager.findOne';
export const MANAGER_UPDATE = 'manager.update';
export const MANAGER_DELETE = 'manager.delete';
export const MANAGER_FIND_ACTIVE = 'manager.findActive';

/** TCP message patterns for Staff Service — SalesRep */
export const SALES_REP_CREATE = 'salesRep.create';
export const SALES_REP_FIND_ALL = 'salesRep.findAll';
export const SALES_REP_FIND_ONE = 'salesRep.findOne';
export const SALES_REP_UPDATE = 'salesRep.update';
export const SALES_REP_DELETE = 'salesRep.delete';

/** TCP message patterns for Staff Service — Cross-entity operations */
export const STAFF_CHECK_USERNAME = 'staff.checkUsername';
export const STAFF_FIND_BY_USERNAME = 'staff.findByUsername';
export const STAFF_FIND_ALL_FOR_USERS = 'staff.findAllForUsers';
