import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AreasModule } from './areas/areas.module';
import { LocationsModule } from './locations/locations.module';
import { AreaEntryLogsModule } from './area-entry-logs/area-entry-logs.module';

@Module({
  imports: [DatabaseModule, AreasModule, LocationsModule, AreaEntryLogsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
