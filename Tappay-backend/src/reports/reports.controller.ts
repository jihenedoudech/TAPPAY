import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportFilterDto } from './dto/report-filter.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales-summary')
  getSalesSummary(@Query() reportFilterDto: ReportFilterDto) {
    return this.reportsService.getSalesSummary(reportFilterDto);
  }

  @Get('products-reports')
  getProductsReports(@Query() reportFilterDto: ReportFilterDto) {
    console.log('reportFilterDto: ', reportFilterDto);
    return this.reportsService.getProductsReports(reportFilterDto);
  }

  @Get('users-reports')
  getUsersReports(@Query() reportFilterDto: ReportFilterDto) {
    return this.reportsService.getUsersReports(reportFilterDto);
  }
}
