import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { AreaEntryLogsService } from './area-entry-logs.service';
import { QueryAreaEntryLogsDto } from './dto/query-area-entry-logs.dto';

@Controller('logs')
export class AreaEntryLogsController {
  constructor(private readonly areaEntryLogsService: AreaEntryLogsService) {}

  @Get()
  findAll(@Query(ValidationPipe) query: QueryAreaEntryLogsDto) {
    return this.areaEntryLogsService.findAll(query);
  }
}
