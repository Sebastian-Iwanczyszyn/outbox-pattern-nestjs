import { Inject, Injectable, Logger } from '@nestjs/common';
import { Record, Status } from '../types';
import { Connection } from 'rabbitmq-client';
import { Client } from 'pg';

@Injectable()
export class Publisher {
	constructor(
		private readonly logger: Logger,
		@Inject('DatabaseClient') private readonly databaseClient: Client,
		@Inject('RabbitMqClient') private readonly rabbitMqClient: Connection,
	) {}

	async publish(record: Record): Promise<void> {
		const channel = this.rabbitMqClient.createPublisher({ confirm: true });

		channel
			.send({ exchange: record.exchange_name, routingKey: record.routing_key }, record.payload)
			.then(() => {
				this.databaseClient.query('DELETE FROM outbox_messages WHERE id = $1', [record.id]);
				this.logger.debug(`Consumed record with ID [${record.id}]`, Publisher.name);
			})
			.catch(err => {
				this.logger.error(
					`Failed to send message to RabbitMQ for record ID [${record.id}]: ${err}`,
					Publisher.name,
				);
				const query = `
					UPDATE outbox_messages
					SET status = $1, failed_at = NOW()
					WHERE id = $2
				`;

				const values = [Status.FAILED, record.id];

				this.databaseClient.query(query, values);
			})
			.finally(() => {
				channel.close();
			});
	}
}
