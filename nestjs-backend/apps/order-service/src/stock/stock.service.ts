import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RpcException } from '@nestjs/microservices';
import { StockEntry, StockEntryDocument } from './schemas/stock-entry.schema';
import { Counter, CounterDocument } from '../common/schemas/counter.schema';

@Injectable()
export class StockService {
  constructor(
    @InjectModel(StockEntry.name) private readonly model: Model<StockEntryDocument>,
    @InjectModel(Counter.name) private readonly counterModel: Model<CounterDocument>,
  ) {}

  async findAll(query?: { salesRepId?: string; status?: string }) {
    const filter: Record<string, any> = {};
    if (query?.salesRepId) {
      try {
        filter.salesRepId = new Types.ObjectId(query.salesRepId);
      } catch {
        filter.salesRepId = query.salesRepId;
      }
    }
    if (query?.status) {
      filter.status = query.status;
    }
    return this.model.find(filter).sort({ createdAt: -1 }).lean().exec();
  }

  async findOne(id: string) {
    const doc = await this.model.findById(id).lean().exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Stock entry not found' });
    return doc;
  }

  async create(dto: any) {
    dto.stockNumber = await this.generateStockNumber();
    if (dto.salesRepId) {
      dto.salesRepId = new Types.ObjectId(dto.salesRepId);
    }
    if (dto.dealerIds && Array.isArray(dto.dealerIds)) {
      dto.dealerIds = dto.dealerIds.map((id: string) => new Types.ObjectId(id));
    }
    if (dto.items && Array.isArray(dto.items)) {
      dto.items = dto.items.map((item: any) => {
        const boxes = Number(item.boxes || 0);
        const loosePieces = Number(item.loosePieces || 0);
        const itemsPerBox = Number(item.itemsPerBox || 1);
        const totalPieces = boxes * itemsPerBox + loosePieces;
        return {
          groupId: new Types.ObjectId(item.groupId),
          itemId: new Types.ObjectId(item.itemId),
          boxes,
          loosePieces,
          itemsPerBox,
          totalPieces,
          availableBoxes: boxes,
          availablePieces: loosePieces,
        };
      });
    }
    return this.model.create(dto);
  }

  async update(id: string, dto: any) {
    const existing = await this.model.findById(id).exec();
    if (!existing) throw new RpcException({ statusCode: 404, message: 'Stock entry not found' });

    if (existing.status === 'closed' && dto.status !== 'active') {
      throw new RpcException({ statusCode: 400, message: 'Cannot edit closed stock entry' });
    }

    if (dto.status) existing.status = dto.status;
    if (dto.remarks !== undefined) existing.remarks = dto.remarks;
    
    // If updating dealers or items (only allowed if active)
    if (existing.status === 'active') {
      if (dto.dealerIds && Array.isArray(dto.dealerIds)) {
        existing.dealerIds = dto.dealerIds.map((dId: string) => new Types.ObjectId(dId));
      }
      if (dto.items && Array.isArray(dto.items)) {
        existing.items = dto.items.map((item: any) => {
          const boxes = Number(item.boxes || 0);
          const loosePieces = Number(item.loosePieces || 0);
          const itemsPerBox = Number(item.itemsPerBox || 1);
          const totalPieces = boxes * itemsPerBox + loosePieces;
          
          // Try to match with existing item to preserve already deducted counts if possible,
          // or just reset if we are editing raw quantities. For simplicity and consistency,
          // we re-assign. If details are edited, we reset available to new totals.
          return {
            groupId: new Types.ObjectId(item.groupId),
            itemId: new Types.ObjectId(item.itemId),
            boxes,
            loosePieces,
            itemsPerBox,
            totalPieces,
            availableBoxes: item.availableBoxes !== undefined ? Number(item.availableBoxes) : boxes,
            availablePieces: item.availablePieces !== undefined ? Number(item.availablePieces) : loosePieces,
          };
        }) as any;
      }
    }

    await existing.save();
    return this.model.findById(id).lean().exec();
  }

  async delete(id: string) {
    const doc = await this.model.findByIdAndDelete(id).exec();
    if (!doc) throw new RpcException({ statusCode: 404, message: 'Stock entry not found' });
    return { message: 'Stock entry deleted successfully' };
  }

  async findByDealer(dealerId: string) {
    let dId: any;
    try {
      dId = new Types.ObjectId(dealerId);
    } catch {
      dId = dealerId;
    }
    // Find all active stock entries assigned to this dealer
    const entries = await this.model.find({
      dealerIds: dId,
      status: 'active',
    }).lean().exec();

    // Aggregate stock by itemId
    const stockMap = new Map<string, { itemId: string; groupId: string; availableBoxes: number; availablePieces: number; itemsPerBox: number; totalPieces: number }>();
    
    for (const entry of entries) {
      for (const item of entry.items) {
        const itemKey = item.itemId.toString();
        const existing = stockMap.get(itemKey);
        
        const boxes = item.availableBoxes || 0;
        const pieces = item.availablePieces || 0;
        const ipb = item.itemsPerBox || 1;
        const total = boxes * ipb + pieces;

        if (existing) {
          existing.availableBoxes += boxes;
          existing.availablePieces += pieces;
          existing.totalPieces += total;
          
          // Re-normalize loose pieces
          if (existing.availablePieces >= existing.itemsPerBox) {
            const extraBoxes = Math.floor(existing.availablePieces / existing.itemsPerBox);
            existing.availableBoxes += extraBoxes;
            existing.availablePieces = existing.availablePieces % existing.itemsPerBox;
          }
        } else {
          stockMap.set(itemKey, {
            itemId: item.itemId.toString(),
            groupId: item.groupId.toString(),
            availableBoxes: boxes,
            availablePieces: pieces,
            itemsPerBox: ipb,
            totalPieces: total,
          });
        }
      }
    }

    return Array.from(stockMap.values());
  }

  /** Deduct stock from active stock entries containing this dealer */
  async deduct(data: { dealerId: string; stockEntryId?: string; items: { itemId: string; boxes: number; pieces: number }[] }) {
    let dId: Types.ObjectId;
    try {
      dId = new Types.ObjectId(data.dealerId);
    } catch {
      throw new RpcException({ statusCode: 400, message: 'Invalid dealer ID' });
    }

    // Determine query: either a specific stockEntryId or any active entry for this dealer
    const query: Record<string, any> = { dealerIds: dId, status: 'active' };
    if (data.stockEntryId) {
      query._id = new Types.ObjectId(data.stockEntryId);
    }

    const entries = await this.model.find(query).exec();
    if (!entries || entries.length === 0) {
      throw new RpcException({ statusCode: 400, message: 'No active stock entries found for this dealer' });
    }

    // Go through each item to deduct
    for (const itemToDeduct of data.items) {
      const targetItemId = new Types.ObjectId(itemToDeduct.itemId);
      let boxesNeeded = Number(itemToDeduct.boxes || 0);
      let piecesNeeded = Number(itemToDeduct.pieces || 0);
      
      // Calculate total pieces needed
      let totalPiecesNeeded = 0;
      let itemsPerBox = 1;
      
      // Find itemsPerBox first from any entry
      for (const entry of entries) {
        const found = entry.items.find((i: any) => i.itemId.equals(targetItemId));
        if (found) {
          itemsPerBox = found.itemsPerBox || 1;
          break;
        }
      }
      totalPiecesNeeded = boxesNeeded * itemsPerBox + piecesNeeded;

      // Deduct from entries sequentially
      let totalAvailableForThisItem = 0;
      for (const entry of entries) {
        const found = entry.items.find((i: any) => i.itemId.equals(targetItemId));
        if (found) {
          const entryAvailableTotal = (found.availableBoxes || 0) * itemsPerBox + (found.availablePieces || 0);
          totalAvailableForThisItem += entryAvailableTotal;
        }
      }

      if (totalAvailableForThisItem < totalPiecesNeeded) {
        throw new RpcException({
          statusCode: 400,
          message: `Insufficient stock for item ${itemToDeduct.itemId}. Required pieces: ${totalPiecesNeeded}, Available: ${totalAvailableForThisItem}`,
        });
      }

      // Perform deduction across entries
      let piecesRemainingToDeduct = totalPiecesNeeded;
      for (const entry of entries) {
        if (piecesRemainingToDeduct <= 0) break;
        const foundIndex = entry.items.findIndex((i: any) => i.itemId.equals(targetItemId));
        if (foundIndex !== -1) {
          const found = entry.items[foundIndex];
          const entryAvailableTotal = (found.availableBoxes || 0) * itemsPerBox + (found.availablePieces || 0);
          
          if (entryAvailableTotal > 0) {
            const deductedFromThisEntry = Math.min(piecesRemainingToDeduct, entryAvailableTotal);
            piecesRemainingToDeduct -= deductedFromThisEntry;

            const remainingEntryPieces = entryAvailableTotal - deductedFromThisEntry;
            found.availableBoxes = Math.floor(remainingEntryPieces / itemsPerBox);
            found.availablePieces = remainingEntryPieces % itemsPerBox;

            // Mark modified for mongoose subdocument save
            entry.markModified('items');
            await entry.save();
          }
        }
      }
    }

    return { message: 'Stock deducted successfully' };
  }

  private async generateStockNumber(): Promise<string> {
    const counter = await this.counterModel.findOneAndUpdate(
      { key: 'stockNumber' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    ).exec();
    return `STK${String(counter!.seq).padStart(5, '0')}`;
  }
}
