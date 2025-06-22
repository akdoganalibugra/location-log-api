import { Test, TestingModule } from '@nestjs/testing';
import { AreasService } from './areas.service';
import { DatabaseService } from '../database/database.service';

describe('AreasService', () => {
  let service: AreasService;

  beforeEach(async () => {
    const mockDatabaseService = {
      area: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      $executeRaw: jest.fn(),
      $queryRaw: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AreasService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<AreasService>(AreasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
