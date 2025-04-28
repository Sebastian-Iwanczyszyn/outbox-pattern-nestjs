-- Table

CREATE TABLE outbox_messages
(
    id            UUID PRIMARY KEY,
    exchange_name VARCHAR(255) NOT NULL,
    routing_key   VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP    DEFAULT NOW(),
    payload       JSONB        NOT NULL,
    failed_at     TIMESTAMP NULL DEFAULT NULL,
    status        varchar(255) DEFAULT 'READY'
);

-- PubSub
CREATE
OR REPLACE FUNCTION notify_outbox_message()
RETURNS TRIGGER AS $$
BEGIN
IF
LOWER(NEW.status) = 'ready' THEN
PERFORM pg_notify(
	'outbox_channel',
	json_build_object(
		'operation', TG_OP,
		'table', TG_TABLE_NAME,
		'data', row_to_json(NEW)
	)::text
);
END IF;
RETURN NEW;
END;
$$
LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER outbox_notify_trigger
AFTER INSERT OR UPDATE ON outbox_messages
FOR EACH ROW
EXECUTE FUNCTION notify_outbox_message();
