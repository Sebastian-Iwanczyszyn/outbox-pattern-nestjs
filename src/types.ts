export enum Status {
	READY = 'READY',
	FAILED = 'FAILED',
}

export interface PgMessage {
	payload: string;
}

export interface PgPayload {
	data: Record;
}

export interface Record {
	id: string;
	exchange_name: string;
	routing_key: string;
	created_at: Date;
	payload: {};
	status: Status;
}
