import { Logger, Module } from '@nestjs/common';
import { Client } from 'pg';
import { Connection } from 'rabbitmq-client';
import { Publisher } from './service/publisher';

@Module({
	imports: [],
	providers: [
		Logger,
		Publisher,
		{
			provide: 'DatabaseClient',
			useValue: new Client({
				user: 'your_username',
				host: 'localhost',
				database: 'your_database',
				password: 'your_password',
				port: 5432,
			}),
		},
		{
			provide: 'RabbitMqClient',
			useValue: new Connection('amqp://guest:guest@localhost:5672'),
		},
	],
	exports: [Publisher, 'DatabaseClient', 'RabbitMqClient', Logger],
})
export class SharedModule {}
