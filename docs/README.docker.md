# Docker Setup for URL Shortener PoC

This setup provides a complete development environment with Kafka, Cassandra, and HDFS.

## Prerequisites

- Docker Desktop installed and running
- At least 4GB RAM allocated to Docker

## Quick Start

### 1. Start All Services

```bash
docker-compose up -d
```

This will start:

- **Zookeeper** (port 2181)
- **Kafka** (port 9092)
- **Cassandra** (port 9042)
- **HDFS NameNode** (port 9870 - Web UI, port 9000 - RPC)
- **HDFS DataNode** (port 9864 - Web UI, port 9866 - data transfer)

### 2. Check Service Health

```bash
# Check all services are running
docker-compose ps

# View logs
docker-compose logs -f

# Check specific service logs
docker-compose logs -f cassandra
docker-compose logs -f namenode
docker-compose logs -f kafka
```

### 3. Verify Services

#### Kafka

```bash
# List topics
docker exec -it kafka kafka-topics --list --bootstrap-server localhost:9092
```

#### Cassandra

```bash
# Connect to Cassandra
docker exec -it cassandra cqlsh

# In cqlsh, verify keyspace
DESCRIBE KEYSPACES;
```

#### HDFS

Open browser to http://localhost:9870 to access NameNode Web UI

Or use CLI:

```bash
# Create directory
docker exec -it namenode hdfs dfs -mkdir -p /home/guanxinwang

# List files
docker exec -it namenode hdfs dfs -ls /home/guanxinwang
```

### 4. Stop Services

```bash
# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes (clean slate)
docker-compose down -v
```

## Service URLs

- **Kafka Broker**: `localhost:9092`
- **Cassandra**: `localhost:9042`
- **HDFS NameNode Web UI**: http://localhost:9870
- **HDFS DataNode Web UI**: http://localhost:9864
- **HDFS WebHDFS API**: http://localhost:9870/webhdfs/v1

## Troubleshooting

### Cassandra Takes Time to Start

Cassandra can take 30-60 seconds to fully initialize. Check logs:

```bash
docker-compose logs -f cassandra
```

Wait until you see: `"Created default superuser role 'cassandra'"`

### HDFS Safe Mode

HDFS may start in safe mode. Check status:

```bash
docker exec -it namenode hdfs dfsadmin -safemode get
```

If stuck in safe mode, force leave:

```bash
docker exec -it namenode hdfs dfsadmin -safemode leave
```

### Port Conflicts

If ports are already in use, modify the port mappings in `docker-compose.yml`:

```yaml
ports:
  - 'NEW_HOST_PORT:CONTAINER_PORT'
```

### Reset Everything

```bash
docker-compose down -v
docker-compose up -d
```

## Development Workflow

1. Start services: `docker-compose up -d`
2. Wait for health checks: `docker-compose ps`
3. Run your NestJS apps:
   ```bash
   pnpm dev:kafka-manager
   pnpm dev:producer
   pnpm dev:consumer
   ```
4. Stop services when done: `docker-compose down`

## Resources

- **Cassandra Memory**: Configured for 512M heap (suitable for PoC)
- **Kafka**: Single broker, replication factor 1 (PoC setup)
- **HDFS**: Single NameNode and DataNode (PoC setup)

For production, you'd want to increase replication factors and add more nodes.
