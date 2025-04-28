import { Inject, Logger, Module, OnModuleInit } from '@nestjs/common';
import { Client } from 'pg';
import { PgMessage, PgPayload, Record, Status } from './types';
import { Publisher } from './service/publisher';
import { SharedModule } from './shared.module';

@Module({
  imports: [SharedModule],
})
export class AppModule implements OnModuleInit {
  constructor(
    @Inject('DatabaseClient') private readonly databaseClient: Client,
    private readonly publisher: Publisher,
    private readonly logger: Logger,
  ) {}

  async onModuleInit(): Promise<any> {
    await this.databaseClient.connect();

    await this.processAllReadyMessages();

    await this.databaseClient.query('LISTEN outbox_channel');
    this.logger.log('Listen on records...', AppModule.name);

    this.databaseClient.on('notification', async (msg: any): Promise<void> => {
      const message = msg as PgMessage;
      const payload: PgPayload = JSON.parse(message.payload);
      const record = payload.data;

      if (Status.READY !== record.status) {
        return;
      }

      this.logger.debug(`Handled record [${JSON.stringify(record)}]`, AppModule.name);
      this.publisher.publish(record);
    });
  }

  private async processAllReadyMessages(): Promise<void> {
    const result = await this.databaseClient.query<Record>(
      'SELECT * FROM outbox_messages WHERE status = $1 ORDER BY created_at ASC',
      [Status.READY],
    );

    const records: Record[] = result.rows;

    for (const record of records) {
      await this.publisher.publish(record);
    }

    this.logger.log(
      `All READY messages was processed [${records.length}]`,
      AppModule.name,
    );
  }
}
