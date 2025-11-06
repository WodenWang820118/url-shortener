# URL Shortener Architecture - Load Testing & Monitoring

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Load Testing Tools                          │
│  ┌──────────────────────┐         ┌──────────────────────────┐     │
│  │  data-generator.ts   │         │   load-tester.ts         │     │
│  │  ├─ Producer Mode    │         │   ├─ Burst Mode          │     │
│  │  └─ Cassandra Mode   │         │   └─ Continuous Mode     │     │
│  └──────────────────────┘         └──────────────────────────┘     │
└────────────┬─────────────────────────────────┬────────────────────┘
             │                                  │
             ▼                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Application Layer                              │
│  ┌──────────────┐       ┌──────────────┐      ┌──────────────┐     │
│  │   Producer   │──────▶│    Kafka     │─────▶│   Consumer   │     │
│  │   (Port      │       │   Message    │      │   (Port      │     │
│  │    3001)     │       │    Queue     │      │    3002)     │     │
│  └──────────────┘       └──────────────┘      └──────┬───────┘     │
│                                                       │             │
│                                                       │ Metrics     │
│                                                       │ /metrics    │
└───────────────────────────────────────────────────────┼─────────────┘
                                                        │
                                                        ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Monitoring Layer                               │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │                     Prometheus                           │       │
│  │  ┌────────────────────────────────────────────────┐      │       │
│  │  │  Metrics Collection:                           │      │       │
│  │  │  • kafka_messages_processed_total             │      │       │
│  │  │  • cassandra_queries_total                     │      │       │
│  │  │  • kafka_message_processing_duration_seconds   │      │       │
│  │  │  • cassandra_query_duration_seconds            │      │       │
│  │  │  • cassandra_record_count                      │      │       │
│  │  └────────────────────────────────────────────────┘      │       │
│  │  (Port 9090)                                             │       │
│  └──────────────┬───────────────────────────────────────────┘       │
│                 │                                                    │
│                 ▼                                                    │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │                      Grafana                             │       │
│  │  ┌────────────────────────────────────────────────┐      │       │
│  │  │  Dashboards:                                   │      │       │
│  │  │  • Message Processing Rate                     │      │       │
│  │  │  • Query Rates & Latency (p50, p95)          │      │       │
│  │  │  • Error Tracking                              │      │       │
│  │  │  • Throughput Comparison                       │      │       │
│  │  │  • Resource Utilization                        │      │       │
│  │  └────────────────────────────────────────────────┘      │       │
│  │  (Port 3000)                                             │       │
│  └──────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Storage Layer                                 │
│  ┌──────────────┐       ┌──────────────┐      ┌──────────────┐     │
│  │  Cassandra   │       │     HDFS     │      │  Prometheus  │     │
│  │  Database    │       │   Storage    │      │   TSDB       │     │
│  │  (Port 9042) │       │              │      │              │     │
│  └──────────────┘       └──────────────┘      └──────────────┘     │
└─────────────────────────────────────────────────────────────────────┘
```

## Kubernetes Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Kubernetes Cluster                               │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │              Consumer Deployment (HPA)                     │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │     │
│  │  │Consumer-1│  │Consumer-2│  │Consumer-3│  │   ...    │  │     │
│  │  │  Pod     │  │  Pod     │  │  Pod     │  │ (3-10)   │  │     │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────────┘  │     │
│  │       │             │             │                        │     │
│  │       └─────────────┴─────────────┘                        │     │
│  │                     │                                      │     │
│  │                     ▼                                      │     │
│  │          ┌──────────────────────┐                          │     │
│  │          │  Consumer Service    │                          │     │
│  │          │  (ClusterIP: 3002)   │                          │     │
│  │          └──────────┬───────────┘                          │     │
│  └─────────────────────┼──────────────────────────────────────┘     │
│                        │                                            │
│                        │ Scrapes /metrics                           │
│                        │                                            │
│  ┌─────────────────────▼──────────────────────────────────────┐     │
│  │              Prometheus Deployment                         │     │
│  │  ┌──────────────────────────────────────────────────┐      │     │
│  │  │  • Auto-discovers pods via annotations          │      │     │
│  │  │  • Collects metrics every 15s                    │      │     │
│  │  │  • Stores in TSDB                                │      │     │
│  │  └──────────────────────────────────────────────────┘      │     │
│  │  NodePort: 30090                                           │     │
│  └────────────────────┬───────────────────────────────────────┘     │
│                       │                                             │
│                       ▼                                             │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │               Grafana Deployment                         │       │
│  │  ┌────────────────────────────────────────────────┐      │       │
│  │  │  • Visualizes Prometheus metrics              │      │       │
│  │  │  • Pre-configured dashboards                   │      │       │
│  │  │  • Real-time monitoring                        │      │       │
│  │  └────────────────────────────────────────────────┘      │       │
│  │  NodePort: 30300                                         │       │
│  └──────────────────────────────────────────────────────────┘       │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │         Horizontal Pod Autoscaler (HPA)                  │       │
│  │  ┌────────────────────────────────────────────────┐      │       │
│  │  │  Monitors:                                     │      │       │
│  │  │  • CPU utilization (target: 70%)              │      │       │
│  │  │  • Memory utilization (target: 80%)           │      │       │
│  │  │                                                │      │       │
│  │  │  Actions:                                      │      │       │
│  │  │  • Scale up: +50% or +2 pods (max)            │      │       │
│  │  │  • Scale down: -25% gradually                 │      │       │
│  │  │  • Min: 3 pods, Max: 10 pods                  │      │       │
│  │  └────────────────────────────────────────────────┘      │       │
│  └──────────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Normal Operation Flow

```
1. Load Tester
   ↓
2. HTTP Request → Consumer Service
   ↓
3. Read from Cassandra
   ↓
4. Return Response
   ↓
5. Update Metrics (Prometheus)
   ↓
6. Display in Grafana
```

### Data Generation Flow

```
Option A (Producer Mode):
1. Data Generator
   ↓
2. POST /shorten → Producer
   ↓
3. Kafka Message
   ↓
4. Consumer processes
   ↓
5. Insert to Cassandra

Option B (Cassandra Mode):
1. Data Generator
   ↓
2. Direct INSERT to Cassandra
   (Faster for bulk loading)
```

## Metrics Collection Flow

```
┌──────────────┐
│  Consumer    │
│  Service     │
└──────┬───────┘
       │
       │ 1. Business logic executes
       │    (e.g., processMessage())
       │
       ▼
┌──────────────────────────────────┐
│   MetricsService                 │
│   ├─ Counter.inc()               │
│   ├─ Histogram.startTimer()      │
│   └─ Gauge.set()                 │
└──────┬───────────────────────────┘
       │
       │ 2. Metrics stored in memory
       │
       ▼
┌──────────────────────────────────┐
│   /metrics endpoint              │
│   (Prometheus format)            │
└──────┬───────────────────────────┘
       │
       │ 3. Prometheus scrapes
       │    every 15 seconds
       │
       ▼
┌──────────────────────────────────┐
│   Prometheus TSDB                │
│   (Time-series database)         │
└──────┬───────────────────────────┘
       │
       │ 4. PromQL queries
       │
       ▼
┌──────────────────────────────────┐
│   Grafana Dashboards             │
│   (Visualization)                │
└──────────────────────────────────┘
```

## Kubernetes Scaling Process

```
1. Load increases
   ↓
2. CPU/Memory utilization rises
   ↓
3. HPA detects threshold exceeded (70% CPU or 80% Memory)
   ↓
4. HPA calculates desired replicas
   desiredReplicas = ceil(currentReplicas * (currentMetric / targetMetric))
   ↓
5. HPA requests Deployment to scale
   ↓
6. Deployment creates new Pod(s)
   ↓
7. Kubernetes scheduler assigns Pod to Node
   ↓
8. Pod starts, runs health checks
   ↓
9. Service starts routing traffic to new Pod
   ↓
10. Prometheus discovers new Pod (via annotations)
    ↓
11. Load distributes across more Pods
    ↓
12. CPU/Memory per Pod decreases
    ↓
13. System stabilizes at new replica count

Scale-down follows reverse process after stabilization window (60s)
```

## Key Components Interaction

```
┌─────────────────────────────────────────────────────────────────┐
│                         External                                │
│  ┌──────────────┐                    ┌──────────────┐           │
│  │ Data         │                    │ Load         │           │
│  │ Generator    │                    │ Tester       │           │
│  └──────┬───────┘                    └──────┬───────┘           │
└─────────┼────────────────────────────────────┼──────────────────┘
          │                                    │
          ▼                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Application Services                       │
│  ┌──────────────┐       ┌──────────────┐                        │
│  │  Producer    │──────▶│  Consumer    │                        │
│  │              │       │  ┌─────────┐ │                        │
│  │              │       │  │ Metrics │◀┼────┐                   │
│  └──────────────┘       │  │ Service │ │    │                   │
│                         │  └─────────┘ │    │                   │
│                         └──────────────┘    │                   │
└─────────────────────────────────────────────┼───────────────────┘
                                              │
                                              │ Scrape
                                              │
┌─────────────────────────────────────────────┼───────────────────┐
│                    Monitoring & Orchestration                   │
│                                             │                   │
│  ┌──────────────┐       ┌─────────────────▼┐                   │
│  │  Grafana     │──────▶│  Prometheus      │                   │
│  │  (Visualize) │       │  (Collect)       │                   │
│  └──────────────┘       └──────────────────┘                   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐      │
│  │  Kubernetes HPA                                      │      │
│  │  • Monitors: CPU, Memory                             │      │
│  │  • Scales: Consumer Deployment (3-10 replicas)       │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
url-shortener/
├── apps/
│   ├── consumer/
│   │   └── src/
│   │       ├── consumer.service.ts (✨ Enhanced with metrics)
│   │       └── metrics/
│   │           ├── metrics.service.ts (📊 NEW)
│   │           ├── metrics.module.ts (📊 NEW)
│   │           └── metrics.controller.ts (📊 NEW)
│   └── producer/
│       └── src/
│           └── producer.service.ts
├── tools/
│   ├── data-generator.ts (🔧 NEW)
│   ├── load-tester.ts (🔧 NEW)
│   └── quick-start.sh (🔧 NEW)
├── monitoring/
│   ├── prometheus.yml (📊 NEW)
│   └── grafana/
│       ├── datasources/
│       │   └── datasource.yml (📊 NEW)
│       └── dashboards/
│           ├── dashboard-provider.yml (📊 NEW)
│           └── url-shortener-dashboard.json (📊 NEW)
├── k8s/
│   ├── consumer-deployment.yaml (☸️ NEW)
│   ├── prometheus-deployment.yaml (☸️ NEW)
│   ├── grafana-deployment.yaml (☸️ NEW)
│   └── README.md (📚 NEW)
├── docker-compose.yml (✨ Enhanced with Prometheus & Grafana)
├── package.json (✨ Enhanced with new scripts)
├── LOAD_TESTING.md (📚 NEW)
└── MONITORING_SUMMARY.md (📚 NEW)
```

## Quick Reference Commands

```bash
# Data Generation
pnpm run data:generate:producer 10000 100    # Via Producer
pnpm run data:generate:cassandra 500000 1000 # Direct to DB

# Load Testing
pnpm run load:test:burst 200 500            # Burst mode
pnpm run load:test:continuous 200 300       # Continuous mode

# Monitoring
pnpm run monitoring:up                       # Start Prometheus + Grafana
curl http://localhost:3002/metrics           # View raw metrics

# Kubernetes
kubectl apply -f k8s/                        # Deploy all
kubectl get hpa consumer-hpa -w              # Watch autoscaling
kubectl top pods                             # View resource usage
kubectl port-forward svc/grafana 3000:3000   # Access Grafana
```

## Access Points

| Service    | Local Development             | Kubernetes (NodePort) |
| ---------- | ----------------------------- | --------------------- |
| Producer   | http://localhost:3001         | N/A                   |
| Consumer   | http://localhost:3002         | ClusterIP only        |
| Metrics    | http://localhost:3002/metrics | Pod endpoint          |
| Prometheus | http://localhost:9090         | http://node-ip:30090  |
| Grafana    | http://localhost:3000         | http://node-ip:30300  |

---

**This architecture enables comprehensive monitoring and demonstration of Kubernetes autoscaling capabilities! 🎉**
