# 📨 Simple Outbox Pattern Implementation

A minimal example of the **Outbox Pattern** using:
- **NestJS** (Node.js Framework)
- **RabbitMQ** (Message Broker)
- **PostgreSQL** (Database)

## 📚 About the Outbox Pattern

The **Outbox Pattern** ensures reliable event publishing by saving events in the same database transaction as the business data. This guarantees that messages are not lost even if the service crashes before sending them.

## Getting Started

### Prerequisites
- Node.js (v20+)
- Yarn package manager
- Docker (optional, for RabbitMQ and PostgreSQL)

### Installation

Install dependencies:

```bash
yarn
```

### Running the Application

Start the NestJS server:

```bash
yarn start
```

### Environment

Make sure you have:
- RabbitMQ and PostgreSQL running locally or accessible remotely.
- Proper environment variables set (e.g., database and message broker connection strings).
