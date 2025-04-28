import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
} from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { CreateShiftDto } from './dto/create-shift.dto';
import { UpdateShiftDto } from './dto/update-shift.dto';

@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Get()
  findAll() {
    return this.shiftsService.findAll();
  }

  @Get('current')
  findCurrent(@Request() req: any) {
    return this.shiftsService.findCurrent(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shiftsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShiftDto: UpdateShiftDto) {
    return this.shiftsService.update(id, updateShiftDto);
  }

  @Post('open')
  create(@Body() createShiftDto: CreateShiftDto, @Request() req: any) {
    return this.shiftsService.create(createShiftDto, req.user);
  }

  @Post('close/:id')
  close(@Param('id') id: string) {
    return this.shiftsService.close(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shiftsService.remove(id);
  }
}
