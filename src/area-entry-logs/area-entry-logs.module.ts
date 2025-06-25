import { Module } from '@nestjs/common';
import { AreaEntryLogsController } from './area-entry-logs.controller';
import { AreaEntryLogsService } from './area-entry-logs.service';

@Module({
  controllers: [AreaEntryLogsController],
  providers: [AreaEntryLogsService],
  exports: [AreaEntryLogsService],
})
export class AreaEntryLogsModule {}
