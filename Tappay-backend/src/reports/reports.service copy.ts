import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../orders/entities/order.entity';
import { ProductStore } from '../products/entities/product-store.entity';
import { ReportFilterDto } from './dto/report-filter.dto';
import { Shift } from '../shifts/entities/shift.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(ProductStore)
    private readonly productStoreRepository: Repository<ProductStore>,
    @InjectRepository(Shift)
    private readonly shiftRepository: Repository<Shift>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getSalesSummary(reportFilterDto: ReportFilterDto) {
    console.log('reportFilterDto: ', reportFilterDto);
    const now = new Date();
    const defaultStartDate = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate(),
    ).toISOString();
    const defaultEndDate = now.toISOString();
    const {
      storeId,
      startDate = defaultStartDate,
      endDate = defaultEndDate,
      ordersStatus,
    } = reportFilterDto;

    // Create a new query builder for daily data
    const dailyDataQuery = this.orderRepository.createQueryBuilder('order');
    dailyDataQuery
      .select('DATE(order.dateTime)', 'date')
      .addSelect('SUM(order.totalAmount)', 'totalSales')
      .addSelect(
        'SUM(order.totalAmount - order.totalDiscount - order.totalRefund)',
        'netSales',
      )
      .addSelect('SUM(order.totalCost)', 'costOfGoodsSold')
      .addSelect('SUM(order.totalRefund)', 'refunds')
      .addSelect('SUM(order.totalDiscount)', 'discounts')
      .addSelect('SUM(order.totalProfit)', 'profit')
      .where('order.dateTime BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    if (storeId) {
      dailyDataQuery.andWhere('order.storeId = :storeId', { storeId });
    }
    if (ordersStatus && ordersStatus.length > 0) {
      dailyDataQuery.andWhere('order.status IN (:...statuses)', {
        statuses: ordersStatus,
      });
    }

    dailyDataQuery
      .groupBy('DATE(order.dateTime)')
      .orderBy('DATE(order.dateTime)', 'ASC');
    const dailyDataResult = await dailyDataQuery.getRawMany();

    // Create a separate query builder for the total summary
    const totalSummaryQuery = this.orderRepository.createQueryBuilder('order');
    totalSummaryQuery
      .select('SUM(order.totalAmount)', 'totalSales')
      .addSelect(
        'SUM(order.totalAmount - order.totalDiscount - order.totalRefund)',
        'netSales',
      )
      .addSelect('SUM(order.totalCost)', 'costOfGoodsSold')
      .addSelect('SUM(order.totalRefund)', 'refunds')
      .addSelect('SUM(order.totalDiscount)', 'discounts')
      .addSelect('SUM(order.totalProfit)', 'profit')
      .where('order.dateTime BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    if (storeId) {
      totalSummaryQuery.andWhere('order.storeId = :storeId', { storeId });
    }
    if (ordersStatus && ordersStatus.length > 0) {
      totalSummaryQuery.andWhere('order.status IN (:...statuses)', {
        statuses: ordersStatus,
      });
    }
    const totalSummaryResult = await totalSummaryQuery.getRawOne();

    return { dailyData: dailyDataResult, totalSummary: totalSummaryResult };
  }

  async getProductsReports(reportFilterDto: ReportFilterDto): Promise<any> {
    console.log('reportFilterDto: ', reportFilterDto);
    const now = new Date();
    const defaultStartDate = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate(),
    ).toISOString();
    const defaultEndDate = now.toISOString();
    const {
      storeId,
      startDate = defaultStartDate,
      endDate = defaultEndDate,
      categoriesIds,
      displayLimit = 5,
    } = reportFilterDto;

    // Calculate the start of the startDate day (00:00:00)
    const startOfDay = new Date(startDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    // Calculate the start of the endDate day (00:00:00) and the next day for an exclusive upper bound
    const endDateObj = new Date(endDate);
    endDateObj.setUTCHours(0, 0, 0, 0);
    const nextDay = new Date(endDateObj);
    nextDay.setDate(endDateObj.getDate() + 1);

    // --- Top Selling Products ---
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.purchasedItems', 'orderItem')
      .leftJoinAndSelect('orderItem.product', 'product');

    queryBuilder
      .select('product.name', 'productName')
      .addSelect('SUM(orderItem.quantity)', 'totalQuantity')
      .addSelect('SUM(orderItem.total)', 'totalSales')
      .where('order.dateTime >= :startOfDay AND order.dateTime < :nextDay', {
        startOfDay: startOfDay.toISOString(),
        nextDay: nextDay.toISOString(),
      });

    if (storeId) {
      queryBuilder.andWhere('order.storeId = :storeId', { storeId });
    }
    if (categoriesIds && categoriesIds.length > 0) {
      queryBuilder.andWhere('product.categoryId IN (:...categoriesIds)', {
        categoriesIds,
      });
    }

    queryBuilder
      .groupBy('product.id')
      .orderBy('totalQuantity', 'DESC')
      .limit(displayLimit);

    const topSellingProducts = await queryBuilder.getRawMany();

    // --- Profitability Distribution ---
    const profitQueryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.purchasedItems', 'orderItem')
      .leftJoinAndSelect('orderItem.product', 'product');

    profitQueryBuilder
      .select('product.name', 'productName')
      .addSelect('SUM(orderItem.profit)', 'totalProfit')
      .where('order.dateTime >= :startOfDay AND order.dateTime < :nextDay', {
        startOfDay: startOfDay.toISOString(),
        nextDay: nextDay.toISOString(),
      });

    if (storeId) {
      profitQueryBuilder.andWhere('order.storeId = :storeId', { storeId });
    }
    if (categoriesIds && categoriesIds.length > 0) {
      profitQueryBuilder.andWhere('product.categoryId IN (:...categoriesIds)', {
        categoriesIds,
      });
    }

    profitQueryBuilder
      .groupBy('product.id')
      .orderBy('totalProfit', 'DESC')
      .limit(displayLimit);

    const profitabilityDistribution = await profitQueryBuilder.getRawMany();

    // --- Product Data ---
    const productDataQueryBuilder = this.productStoreRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.stockBatches', 'stockBatch')
      .leftJoinAndSelect('product.orderItems', 'orderItem')
      .leftJoinAndSelect('orderItem.order', 'order')
      .select('product.name', 'productName')
      .addSelect('SUM(orderItem.quantity)', 'soldQuantity')
      .addSelect('product.stock', 'currentQuantity')
      .addSelect('SUM(orderItem.quantity) + product.stock', 'totalQuantity')
      .addSelect('SUM(orderItem.total)', 'netSales')
      .addSelect('SUM(orderItem.profit)', 'totalProfit')
      .addSelect(
        '(SUM(orderItem.profit) / SUM(orderItem.total)) * 100',
        'margin',
      )
      .addSelect('stockBatch.costInclTax', 'currentCost')
      .addSelect('MIN(stockBatch.costInclTax)', 'leastCost')
      .addSelect('SUM(orderItem.quantity * orderItem.cost)', 'totalCost')
      .addSelect('SUM(orderItem.quantity * orderItem.cost)', 'itemsRefunded')
      .where('order.dateTime >= :startOfDay AND order.dateTime < :nextDay', {
        startOfDay: startOfDay.toISOString(),
        nextDay: nextDay.toISOString(),
      });

    if (storeId) {
      productDataQueryBuilder.andWhere('order.storeId = :storeId', { storeId });
    }
    if (categoriesIds && categoriesIds.length > 0) {
      productDataQueryBuilder.andWhere(
        'product.categoryId IN (:...categoriesIds)',
        { categoriesIds },
      );
    }

    productDataQueryBuilder.groupBy('product.id').addGroupBy('stockBatch.id');

    const productData = await productDataQueryBuilder.getRawMany();

    return { productData, topSellingProducts, profitabilityDistribution };
  }

  async getUsersReports(reportFilterDto: ReportFilterDto): Promise<any> {
    const now = new Date();
    const defaultStartDate = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate(),
    ).toISOString();
    const defaultEndDate = now.toISOString();
    const {
      storeId,
      startDate = defaultStartDate,
      endDate = defaultEndDate,
      userId,
    } = reportFilterDto;

    const queryBuilder = this.shiftRepository
      .createQueryBuilder('shift')
      .leftJoinAndSelect('shift.user', 'user')
      .leftJoinAndSelect('shift.orders', 'order')
      .where('shift.startTime BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    if (storeId) {
      queryBuilder.andWhere('order.storeId = :storeId', { storeId });
    }
    if (userId) {
      queryBuilder.andWhere('user.id = :userId', { userId });
    }

    const shifts = await queryBuilder.getMany();

    const userReports = shifts.reduce(
      (acc: { [key: number]: any }, shift: Shift) => {
        const user = shift.user as User; // Cast to User type
        if (!acc[user.id]) {
          acc[user.id] = {
            userId: user.id,
            userName: user.username,
            numberOfShifts: 0,
            totalSales: 0,
            totalProfit: 0,
            totalTransactions: 0,
            totalItems: 0,
            totalDiscounts: 0,
            totalRefunds: 0,
            totalCost: 0,
            averageSalesPerShift: 0,
          };
        }

        acc[user.id].numberOfShifts += 1;
        acc[user.id].totalSales += shift.totalSales;
        acc[user.id].totalProfit += shift.totalProfit;
        acc[user.id].totalTransactions += shift.totalTransactions;
        acc[user.id].totalItems += shift.totalItems;
        acc[user.id].totalDiscounts += shift.totalDiscounts;
        acc[user.id].totalRefunds += shift.totalRefunds;
        acc[user.id].totalCost += shift.totalCost;
        acc[user.id].averageSalesPerShift =
          acc[user.id].totalSales / acc[user.id].numberOfShifts;

        return acc;
      },
      {},
    );

    const userData = Object.values(userReports);

    const totalSalesByUser = userData.map((user) => ({
      userName: user.userName,
      totalSales: user.totalSales,
    }));

    const averageSalesPerShiftByUser = userData.map((user) => ({
      userName: user.userName,
      averageSalesPerShift: user.averageSalesPerShift,
    }));

    return {
      userData,
      totalSalesByUser,
      averageSalesPerShiftByUser,
    };
  }
}
