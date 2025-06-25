import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { QueryAreaEntryLogsDto } from './dto/query-area-entry-logs.dto';
import { PaginationUtil } from '../utils/pagination.util';
import { Prisma } from '@prisma/client';

@Injectable()
export class AreaEntryLogsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll(queryDto: QueryAreaEntryLogsDto) {
    const where: Prisma.AreaEntryLogWhereInput = {};

    if (queryDto.userId) where.userId = queryDto.userId;
    if (queryDto.areaId) where.areaId = queryDto.areaId;

    const { skip, take } = PaginationUtil.getSkipTake(
      queryDto.page,
      queryDto.limit,
    );

    const [total, logs] = await Promise.all([
      this.databaseService.areaEntryLog.count({ where }),
      this.databaseService.areaEntryLog.findMany({
        where,
        include: {
          user: true,
          area: true,
        },
        orderBy: { entryTime: 'desc' },
        skip,
        take,
      }),
    ]);

    return PaginationUtil.paginate(logs, queryDto.page, queryDto.limit, total);
  }
}
