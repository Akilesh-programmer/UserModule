/** TCP message patterns for Order Service — Stock Entry */
export const STOCK_CREATE = 'stock.create';
export const STOCK_FIND_ALL = 'stock.findAll';
export const STOCK_FIND_ONE = 'stock.findOne';
export const STOCK_UPDATE = 'stock.update';
export const STOCK_DELETE = 'stock.delete';
export const STOCK_FIND_BY_DEALER = 'stock.findByDealer';
export const STOCK_DEDUCT = 'stock.deduct';

/** TCP message patterns for Order Service — Order */
export const ORDER_CREATE = 'order.create';
export const ORDER_FIND_ALL = 'order.findAll';
export const ORDER_FIND_ONE = 'order.findOne';
export const ORDER_APPROVE = 'order.approve';
export const ORDER_REJECT = 'order.reject';
export const ORDER_UPDATE = 'order.update';
export const ORDER_DELETE = 'order.delete';
export const ORDER_UPDATE_STATUS = 'order.updateStatus';
export const ORDER_WITH_STOCK_CHECK = 'order.withStockCheck';

/** TCP message patterns for Order Service — Secondary Sale */
export const SECONDARY_SALE_CREATE = 'secondarySale.create';
export const SECONDARY_SALE_FIND_ALL = 'secondarySale.findAll';
export const SECONDARY_SALE_FIND_ONE = 'secondarySale.findOne';
export const SECONDARY_SALE_MARK_DELIVERED = 'secondarySale.markDelivered';
export const SECONDARY_SALE_MARK_RETURNED = 'secondarySale.markReturned';

/** TCP message patterns for Dashboard Stats */
export const DASHBOARD_ORDER_STATS = 'dashboard.orderStats';
export const DASHBOARD_MASTER_STATS = 'dashboard.masterStats';
