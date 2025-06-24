import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { KafkaService, LocationEntryEvent } from '../kafka/kafka.service';
import { LocationDto } from './dto/location.dto';

@Injectable()
export class LocationsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly kafkaService: KafkaService,
  ) {}

  async processLocation(locationDto: LocationDto) {
    const { userId, lat, lng } = locationDto;

    const areasContainingPoint = (await this.databaseService.$queryRaw`
      SELECT id
      FROM areas 
      WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326))
    `) as Array<{ id: string }>;

    const entryTime = new Date().toISOString();
    const publishPromises = [];

    for (const area of areasContainingPoint) {
      const event: LocationEntryEvent = {
        userId,
        areaId: area.id,
        entryTime,
      };

      publishPromises.push(this.kafkaService.publishLocationEntry(event));
    }

    await Promise.all(publishPromises);

    return {
      message: 'Location processed successfully',
      areasEntered: areasContainingPoint.length,
      areaIds: areasContainingPoint.map((area) => area.id),
    };
  }
}
