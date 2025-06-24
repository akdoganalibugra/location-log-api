import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { LocationEntryEvent } from '../kafka/kafka.service';

@Injectable()
export class LogWorkerService {
  private batchSize = parseInt(process.env.LOG_BATCH_SIZE || '100');
  private batchTimeout = parseInt(process.env.LOG_BATCH_TIMEOUT || '10000'); // 10 seconds
  private batch: LocationEntryEvent[] = [];
  private batchTimer: NodeJS.Timeout | null = null;

  constructor(private readonly databaseService: DatabaseService) {}

  async processLocationEntry(event: LocationEntryEvent) {
    this.batch.push(event);

    // batch flush logic
    if (this.batch.length >= this.batchSize) {
      await this.flushBatch();
      return;
    }

    // batch timer start logic
    if (this.batch.length === 1) {
      this.startBatchTimer();
    }
  }

  private startBatchTimer() {
    this.batchTimer = setTimeout(async () => {
      if (this.batch.length > 0) {
        await this.flushBatch();
      }
    }, this.batchTimeout);
  }

  private async flushBatch() {
    if (this.batch.length === 0) return;

    const currentBatch = [...this.batch];
    this.batch = [];

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    try {
      await this.databaseService.areaEntryLog.createMany({
        data: currentBatch.map((event) => ({
          userId: event.userId,
          areaId: event.areaId,
          entryTime: new Date(event.entryTime),
        })),
      });

      console.log(
        `Successfully inserted batch of ${currentBatch.length} location entries`,
      );
    } catch (error) {
      console.error('Failed to insert batch:', error);
    }
  }

  async shutdown() {
    if (this.batch.length > 0) {
      await this.flushBatch();
    }
  }
}
