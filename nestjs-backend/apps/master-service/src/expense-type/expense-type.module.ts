import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExpenseType, ExpenseTypeSchema } from './schemas/expense-type.schema';
import { ExpenseTypeService } from './expense-type.service';
import { ExpenseTypeController } from './expense-type.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: ExpenseType.name, schema: ExpenseTypeSchema }])],
  controllers: [ExpenseTypeController],
  providers: [ExpenseTypeService],
  exports: [ExpenseTypeService],
})
export class ExpenseTypeModule {}
