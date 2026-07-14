import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { SecondarySale, SecondarySaleDocument } from './schemas/secondary-sale.schema';
import { Counter, CounterDocument } from '../common/schemas/counter.schema';
import { OrderService } from '../order/order.service';
import { StockService } from '../stock/stock.service';

@Injectable()
export class SecondarySaleService {
  constructor(
    @InjectModel(SecondarySale.name) private readonly model: Model<SecondarySaleDocument>,
    @InjectModel(Counter.name) private readonly counterModel: Model<CounterDocument>,
    private readonly orderService: OrderService,
    private readonly stockService: StockService,
  ) {}

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
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Secondary sale record not found' });
    return doc;
  }

  /** Create secondary sale from approved order and deduct stock */
  async create(dto: any) {
    const orderIdStr = dto.orderId;
    if (!orderIdStr) {
      throw new RpcException({ statusCode: 400, message: 'Order ID is required' });
    }

    // 1. Fetch the Order and verify it is approved
    const order = await this.orderService.findOne(orderIdStr);
    if (order.status !== 'approved') {
      throw new RpcException({
        statusCode: 400,
        message: `Only approved orders can be dispatched (current: ${order.status})`,
      });
    }

    // 2. Prepare items for stock deduction
    const stockDeductionItems = order.items.map((item: any) => ({
      itemId: item.itemId.toString(),
      boxes: item.boxQuantity,
      pieces: item.pieceQuantity,
    }));

    // 3. Deduct stock using StockService
    // This will throw an error if stock is insufficient
    await this.stockService.deduct({
      dealerId: order.dealerId.toString(),
      stockEntryId: dto.stockEntryId || undefined,
      items: stockDeductionItems,
    });

    // 4. Generate Secondary Sale Number
    const saleNumber = await this.generateSaleNumber();

    // 5. Create Secondary Sale Record
    const saleData = {
      saleNumber,
      saleDate: dto.saleDate ? new Date(dto.saleDate) : new Date(),
      orderId: new Types.ObjectId(orderIdStr),
      dealerId: order.dealerId,
      salesRepId: order.salesRepId,
      marketId: order.marketId,
      stockEntryId: dto.stockEntryId ? new Types.ObjectId(dto.stockEntryId) : null,
      items: order.items,
      totalAmount: order.totalAmount,
      status: 'dispatched',
      dispatchedBy: dto.dispatchedBy ? new Types.ObjectId(dto.dispatchedBy) : new Types.ObjectId(),
      remarks: dto.remarks || '',
    };

    const doc = await this.model.create(saleData);

    // 6. Update Order status to dispatched
    await this.orderService.updateStatus(orderIdStr, 'dispatched');

    return this.model.findById(doc._id).lean().exec();
  }

  async markDelivered(id: string) {
    const sale = await this.model.findById(id).exec();
    if (!sale) throw new RpcException({ statusCode: 404, message: 'Secondary sale not found' });
    if (sale.status !== 'dispatched') {
      throw new RpcException({
        statusCode: 400,
        message: `Only dispatched sales can be marked delivered (current: ${sale.status})`,
      });
    }

    sale.status = 'delivered';
    sale.deliveredAt = new Date();
    await sale.save();

    // Also update associated Order status to delivered
    await this.orderService.updateStatus(sale.orderId.toString(), 'delivered');

    return this.model.findById(id).lean().exec();
  }

  async markReturned(id: string, reason?: string) {
    const sale = await this.model.findById(id).exec();
    if (!sale) throw new RpcException({ statusCode: 404, message: 'Secondary sale not found' });
    if (sale.status !== 'delivered' && sale.status !== 'dispatched') {
      throw new RpcException({
        statusCode: 400,
        message: `Cannot return secondary sale with status ${sale.status}`,
      });
    }

    sale.status = 'returned';
    if (reason) {
      sale.remarks = sale.remarks ? `${sale.remarks} | Return reason: ${reason}` : `Return reason: ${reason}`;
    }
    await sale.save();

    // If returned, we should return the stock back to the stock entry if stockEntryId is set!
    // Since returning stock is a secondary action, we can re-add it back into the stock entries
    if (sale.stockEntryId) {
      try {
        const stockEntry = await this.stockService.findOne(sale.stockEntryId.toString());
        if (stockEntry) {
          // Construct updated items list
          const updatedItems = stockEntry.items.map((stockItem: any) => {
            const saleItem = sale.items.find((si: any) => si.itemId.toString() === stockItem.itemId.toString());
            if (saleItem) {
              const returnedBoxes = saleItem.boxQuantity;
              const returnedLoosePieces = saleItem.pieceQuantity;
              
              let newLoose = stockItem.availablePieces + returnedLoosePieces;
              let newBoxes = stockItem.availableBoxes + returnedBoxes;
              
              if (newLoose >= stockItem.itemsPerBox) {
                newBoxes += Math.floor(newLoose / stockItem.itemsPerBox);
                newLoose = newLoose % stockItem.itemsPerBox;
              }
              
              return {
                ...stockItem,
                availableBoxes: newBoxes,
                availablePieces: newLoose,
              };
            }
            return stockItem;
          });
          
          await this.stockService.update(sale.stockEntryId.toString(), {
            items: updatedItems,
          });
        }
      } catch (err) {
        console.error('Failed to restore stock for returned secondary sale:', err);
      }
    }

    return this.model.findById(id).lean().exec();
  }

  private async generateSaleNumber(): Promise<string> {
    const counter = await this.counterModel.findOneAndUpdate(
      { key: 'saleNumber' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    ).exec();
    return `SS${String(counter!.seq).padStart(5, '0')}`;
  }
}
