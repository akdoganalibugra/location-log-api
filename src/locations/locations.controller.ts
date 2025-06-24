import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationDto } from './dto/location.dto';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  async processLocation(@Body(ValidationPipe) locationDto: LocationDto) {
    return this.locationsService.processLocation(locationDto);
  }
}
