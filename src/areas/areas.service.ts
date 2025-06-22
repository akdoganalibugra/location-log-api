import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AreasService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(createAreaDto: Prisma.AreaCreateInput) {
    const area = await this.databaseService.area.create({
      data: {
        name: createAreaDto.name,
        polygon: createAreaDto.polygon,
      },
    });

    const geojson = JSON.stringify({
      type: 'Polygon',
      coordinates: [createAreaDto.polygon],
    });

    await this.databaseService.$executeRaw`
      UPDATE areas
      SET geom = ST_GeomFromGeoJSON(${geojson})
      WHERE id = ${area.id}
    `;

    return this.findOne(area.id);
  }

  async findAll() {
    return this.databaseService.area.findMany({});
  }

  async findOne(id: string) {
    return this.databaseService.area.findUnique({
      where: {
        id,
      },
    });
  }

  async update(id: string, updateAreaDto: Prisma.AreaUpdateInput) {
    await this.databaseService.area.update({
      where: { id },
      data: updateAreaDto,
    });

    if (updateAreaDto.polygon) {
      const geojson = JSON.stringify({
        type: 'Polygon',
        coordinates: [updateAreaDto.polygon],
      });

      await this.databaseService.$executeRaw`
        UPDATE areas
        SET geom = ST_GeomFromGeoJSON(${geojson})
        WHERE id = ${id}
      `;
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    return this.databaseService.area.delete({
      where: {
        id,
      },
    });
  }

  async findAreasContainingPoint(latitude: number, longitude: number) {
    // PostGIS spatial query using raw SQL
    return this.databaseService.$queryRaw`
      SELECT id,
      FROM areas 
      WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326))
    `;
  }
}
