import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AreasModule } from './areas/areas.module';
import { LocationsModule } from './locations/locations.module';

@Module({
  imports: [DatabaseModule, AreasModule, LocationsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
