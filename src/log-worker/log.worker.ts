import { Kafka } from 'kafkajs';
import { DatabaseService } from '../database/database.service';
import { LogWorkerService } from './log.worker.service';
import { LocationEntryEvent } from '../kafka/kafka.service';

class LogWorker {
  private kafka: Kafka;
  private databaseService: DatabaseService;
  private logWorkerService: LogWorkerService;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'log-worker',
      brokers: [process.env.KAFKA_BROKER || 'kafka:9092'],
      connectionTimeout: 3000,
      requestTimeout: 30000,
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
    });
  }

  async bootstrap() {
    this.databaseService = new DatabaseService();
    this.logWorkerService = new LogWorkerService(this.databaseService);

    const consumer = this.kafka.consumer({
      groupId: 'log-worker-group',
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
      maxWaitTimeInMs: 5000,
      allowAutoTopicCreation: true,
    });

    await consumer.connect();
    await consumer.subscribe({ topic: 'location-entries' });

    await consumer.run({
      partitionsConsumedConcurrently: 1,
      eachMessage: async ({ message }) => {
        try {
          const event: LocationEntryEvent = JSON.parse(
            message.value?.toString() || '{}',
          );

          await this.logWorkerService.processLocationEntry(event);
        } catch (error) {
          console.error('Error processing message:', error);
        }
      },
    });

    process.on('SIGINT', async () => {
      await this.logWorkerService.shutdown();
      await consumer.disconnect();
      await this.databaseService.$disconnect();
      process.exit(0);
    });
  }
}

const worker = new LogWorker();
worker.bootstrap().catch((error) => {
  console.error('Failed to start Log Worker:', error);
  process.exit(1);
});
