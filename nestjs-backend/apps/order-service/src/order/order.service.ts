import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { Order, OrderDocument } from './schemas/order.schema';
import { Counter, CounterDocument } from '../common/schemas/counter.schema';
import { StockService } from '../stock/stock.service';
import { SecondarySale, SecondarySaleDocument } from '../secondary-sale/schemas/secondary-sale.schema';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private readonly model: Model<OrderDocument>,
    @InjectModel(Counter.name) private readonly counterModel: Model<CounterDocument>,
    @InjectModel(SecondarySale.name) private readonly secondarySaleModel: Model<SecondarySaleDocument>,
    private readonly stockService: StockService,
  ) {}

  async getOrderStats() {
    const [ordersCount, secondarySalesCount, activeDispatchesCount] = await Promise.all([
      this.model.countDocuments({}).exec(),
      this.secondarySaleModel.countDocuments({}).exec(),
      this.secondarySaleModel.countDocuments({ status: 'dispatched' }).exec(),
    ]);

    const start2026 = new Date('2026-01-01T00:00:00.000Z');
    const end2026 = new Date('2026-12-31T23:59:59.999Z');

    const incomeRes = await this.secondarySaleModel.aggregate([
      {
        $match: {
          status: { $in: ['dispatched', 'delivered'] },
          saleDate: { $gte: start2026, $lte: end2026 }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]).exec();
    const incomeTotal = incomeRes[0]?.total || 0;

    const returnRes = await this.secondarySaleModel.aggregate([
      {
        $match: {
          status: 'returned'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalAmount' }
        }
      }
    ]).exec();
    const returnsTotal = returnRes[0]?.total || 0;

    return {
      ordersCount,
      secondarySalesCount,
      dispatchCount: activeDispatchesCount,
      incomeTotal,
      returnsTotal
    };
  }

  async findAll(query?: { status?: string; dealerId?: string; salesRepId?: string; marketId?: string }) {
    const filter: Record<string, any> = {};
    
    if (query?.status) filter.status = query.status;
    
    if (query?.dealerId) {
      try {
        filter.dealerId = new Types.ObjectId(query.dealerId);
      } catch {
        filter.dealerId = query.dealerId;
      }
    }
    
    if (query?.salesRepId) {
      try {
        filter.salesRepId = new Types.ObjectId(query.salesRepId);
      } catch {
        filter.salesRepId = query.salesRepId;
      }
    }

    if (query?.marketId) {
      try {
        filter.marketId = new Types.ObjectId(query.marketId);
      } catch {
        filter.marketId = query.marketId;
      }
    }

    return this.model.find(filter).sort({ createdAt: -1 }).lean().exec();
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).lean().exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Order not found' });
    return doc;
  }

  async create(dto: any) {
    dto.orderNumber = await this.generateOrderNumber();
    if (dto.dealerId) dto.dealerId = new Types.ObjectId(dto.dealerId);
    if (dto.salesRepId) dto.salesRepId = new Types.ObjectId(dto.salesRepId);
    if (dto.marketId) dto.marketId = new Types.ObjectId(dto.marketId);
    if (dto.schemeId) {
      dto.schemeId = new Types.ObjectId(dto.schemeId);
    } else {
      dto.schemeId = null;
    }

    let totalBoxes = 0;
    let totalPieces = 0;
    let totalAmount = 0;

    if (dto.items && Array.isArray(dto.items)) {
      dto.items = dto.items.map((item: any) => {
        const boxQty = Number(item.boxQuantity || 0);
        const pieceQty = Number(item.pieceQuantity || 0);
        const boxPrice = Number(item.boxPrice || 0);
        const piecePrice = Number(item.piecePrice || 0);
        const itemsPerBox = Number(item.itemsPerBox || 1);
        const lineTotal = boxQty * boxPrice + pieceQty * piecePrice;

        totalBoxes += boxQty;
        totalPieces += pieceQty;
        totalAmount += lineTotal;

        return {
          groupId: new Types.ObjectId(item.groupId),
          itemId: new Types.ObjectId(item.itemId),
          itemName: item.itemName || '',
          boxQuantity: boxQty,
          pieceQuantity: pieceQty,
          boxPrice,
          piecePrice,
          itemsPerBox,
          lineTotal,
        };
      });
    }

    dto.totalBoxes = totalBoxes;
    dto.totalPieces = totalPieces;
    dto.totalAmount = totalAmount;
    dto.status = 'pending';

    return this.model.create(dto);
  }

  async approve(id: string, approvedBy: string) {
    const order = await this.model.findById(id).exec();
    if (!order) throw new RpcException({ statusCode: 404, message: 'Order not found' });
    if (order.status !== 'pending') {
      throw new RpcException({ statusCode: 400, message: `Only pending orders can be approved (current: ${order.status})` });
    }

    order.status = 'approved';
    order.approvedAt = new Date();
    order.approvedBy = new Types.ObjectId(approvedBy);
    await order.save();

    return this.model.findById(id).lean().exec();
  }

  async reject(id: string, reason: string) {
    const order = await this.model.findById(id).exec();
    if (!order) throw new RpcException({ statusCode: 404, message: 'Order not found' });
    if (order.status !== 'pending') {
      throw new RpcException({ statusCode: 400, message: `Only pending orders can be rejected (current: ${order.status})` });
    }

    order.status = 'rejected';
    order.rejectedReason = reason || 'Rejected by Admin';
    await order.save();

    return this.model.findById(id).lean().exec();
  }

  async updateStatus(id: string, status: string) {
    const order = await this.model.findById(id).exec();
    if (!order) throw new RpcException({ statusCode: 404, message: 'Order not found' });

    // Validate transition
    const allowedTransitions: Record<string, string[]> = {
      pending: ['approved', 'rejected'],
      approved: ['dispatched', 'rejected'],
      rejected: [],
      dispatched: ['delivered'],
      delivered: [],
    };

    const allowed = allowedTransitions[order.status] || [];
    if (!allowed.includes(status)) {
      throw new RpcException({
        statusCode: 400,
        message: `Status transition from '${order.status}' to '${status}' is not allowed`,
      });
    }

    order.status = status;
    await order.save();
    return this.model.findById(id).lean().exec();
  }

  /** Gets an order and annotates each item with stock availability */
  async getOrderWithStockCheck(id: string): Promise<any> {
    const order = await this.model.findById(id).lean().exec();
    if (!order) throw new RpcException({ statusCode: 404, message: 'Order not found' });

    // Fetch active stock items available to this dealer
    const dealerStock = await this.stockService.findByDealer(order.dealerId.toString());

    // Create a quick lookup map of available pieces by itemId
    const stockLookup = new Map<string, number>();
    for (const stock of dealerStock) {
      stockLookup.set(stock.itemId, stock.totalPieces);
    }

    // Annotate order items
    const annotatedItems = order.items.map((item) => {
      const itemIdStr = item.itemId.toString();
      const availablePieces = stockLookup.get(itemIdStr) || 0;
      
      const orderedPieces = item.boxQuantity * item.itemsPerBox + item.pieceQuantity;
      const stockAvailable = availablePieces >= orderedPieces;

      // Convert available total pieces back to readable format for the UI
      const availableBoxes = Math.floor(availablePieces / item.itemsPerBox);
      const availableLoosePieces = availablePieces % item.itemsPerBox;

      return {
        ...item,
        stockAvailable,
        availableQuantity: {
          boxes: availableBoxes,
          pieces: availableLoosePieces,
          totalPieces: availablePieces,
        },
      };
    });

    return {
      ...order,
      items: annotatedItems,
    };
  }

  async update(id: string, dto: any) {
    const order = await this.model.findById(id).exec();
    if (!order) throw new RpcException({ statusCode: 404, message: 'Order not found' });
    if (order.status !== 'pending') {
      throw new RpcException({ statusCode: 400, message: 'Only pending orders can be edited' });
    }

    if (dto.dealerId) dto.dealerId = new Types.ObjectId(dto.dealerId);
    if (dto.salesRepId) dto.salesRepId = new Types.ObjectId(dto.salesRepId);
    if (dto.marketId) dto.marketId = new Types.ObjectId(dto.marketId);
    if (dto.schemeId !== undefined) {
      dto.schemeId = dto.schemeId ? new Types.ObjectId(dto.schemeId) : null;
    }

    let totalBoxes = 0;
    let totalPieces = 0;
    let totalAmount = 0;

    if (dto.items && Array.isArray(dto.items)) {
      dto.items = dto.items.map((item: any) => {
        const boxQty = Number(item.boxQuantity || 0);
        const pieceQty = Number(item.pieceQuantity || 0);
        const boxPrice = Number(item.boxPrice || 0);
        const piecePrice = Number(item.piecePrice || 0);
        const itemsPerBox = Number(item.itemsPerBox || 1);
        const lineTotal = boxQty * boxPrice + pieceQty * piecePrice;

        totalBoxes += boxQty;
        totalPieces += pieceQty;
        totalAmount += lineTotal;

        return {
          groupId: new Types.ObjectId(item.groupId),
          itemId: new Types.ObjectId(item.itemId),
          itemName: item.itemName || '',
          boxQuantity: boxQty,
          pieceQuantity: pieceQty,
          boxPrice,
          piecePrice,
          itemsPerBox,
          lineTotal,
        };
      });

      dto.totalBoxes = totalBoxes;
      dto.totalPieces = totalPieces;
      dto.totalAmount = totalAmount;
    }

    const doc = await this.model.findByIdAndUpdate(id, dto, { new: true, runValidators: true }).lean().exec();
    return doc;
  }

  async delete(id: string) {
    const order = await this.model.findById(id).exec();
    if (!order) throw new RpcException({ statusCode: 404, message: 'Order not found' });
    if (order.status !== 'pending') {
      throw new RpcException({ statusCode: 400, message: 'Only pending orders can be deleted' });
    }

    await this.model.findByIdAndDelete(id).exec();
    return { message: 'Order deleted successfully' };
  }

  private async generateOrderNumber(): Promise<string> {
    const counter = await this.counterModel.findOneAndUpdate(
      { key: 'orderNumber' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    ).exec();
    return `ORD${String(counter!.seq).padStart(5, '0')}`;
  }
}
