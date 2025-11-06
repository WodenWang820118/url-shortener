# Kubernetes Demo Guide

This guide provides step-by-step instructions for demonstrating Kubernetes autoscaling capabilities with the URL Shortener application.

## Demo Overview

**Duration:** 15-20 minutes  
**Objective:** Demonstrate how Kubernetes automatically scales the application based on load  
**Key Metrics:** Request throughput, latency, pod count, CPU/memory usage

## Prerequisites

### Required Tools

- **kubectl** installed and configured
- **Docker** for building images
- **Kubernetes cluster** running (Minikube, Kind, or cloud provider)
- **Local development setup** working (see [QUICKSTART.md](./QUICKSTART.md))

### Verify Kubernetes Cluster

```bash
# Check cluster is running
kubectl cluster-info

# Verify kubectl can connect
kubectl get nodes

# Check metrics-server is installed (required for HPA)
kubectl get deployment metrics-server -n kube-system

# If metrics-server is not installed:
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

## Pre-Demo Preparation (10 minutes)

### 1. Build Docker Image

```bash
# Ensure you're in the project root
cd url-shortener

# Build the consumer image
docker build -t url-shortener-consumer:v1.0.0 -f apps/consumer/Dockerfile .

# If using Minikube, load image into Minikube
minikube image load url-shortener-consumer:v1.0.0

# Verify image exists
docker images | grep url-shortener-consumer
```

**Note:** If you don't have a Dockerfile yet, create `apps/consumer/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install
COPY . .
RUN pnpm nx build consumer --prod

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist/apps/consumer ./
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3002
CMD ["node", "main.js"]
```

### 2. Deploy Supporting Services

You'll need Kafka and Cassandra. Options:

**Option A: Use Docker Compose on host machine**

```bash
# Start Kafka and Cassandra on your local machine
docker-compose up -d kafka cassandra

# They'll be accessible to K8s pods via host.docker.internal
```

**Option B: Deploy to Kubernetes** (more realistic but complex)

```bash
# Deploy Kafka
kubectl apply -f k8s/kafka-deployment.yaml

# Deploy Cassandra
kubectl apply -f k8s/cassandra-deployment.yaml

# Wait for them to be ready
kubectl wait --for=condition=ready pod -l app=kafka --timeout=300s
kubectl wait --for=condition=ready pod -l app=cassandra --timeout=300s
```

### 3. Generate Test Data

Before the demo, pre-populate the database:

```bash
# Start local services if not using K8s for data stores
docker-compose up -d cassandra

# Wait for Cassandra to be ready
sleep 60

# Generate 500K records (takes ~1-2 minutes)
pnpm run data:generate:cassandra 500000 5000

# Verify
curl http://localhost:3002/urls/count
# Should show: {"count": 500000}
```

### 4. Deploy Application to Kubernetes

```bash
# Apply all Kubernetes manifests
kubectl apply -f k8s/consumer-deployment.yaml
kubectl apply -f k8s/prometheus-deployment.yaml
kubectl apply -f k8s/grafana-deployment.yaml

# Verify deployments
kubectl get deployments
kubectl get pods
kubectl get hpa
kubectl get svc

# Wait for all pods to be ready
kubectl wait --for=condition=ready pod -l app=consumer --timeout=120s
```

**Expected output:**

```
NAME                         READY   STATUS    RESTARTS   AGE
consumer-5d8b9c4f7d-abc12   1/1     Running   0          30s
consumer-5d8b9c4f7d-def34   1/1     Running   0          30s
consumer-5d8b9c4f7d-ghi56   1/1     Running   0          30s
prometheus-7b8c9d5f6-xyz89  1/1     Running   0          30s
grafana-6c7d8e9f0-qwe12     1/1     Running   0          30s
```

### 5. Access Monitoring Dashboards

```bash
# Option A: Port forwarding (easiest)
kubectl port-forward svc/grafana 3000:3000 &
kubectl port-forward svc/prometheus 9090:9090 &

# Option B: Get NodePort URLs (if using Minikube)
minikube service grafana --url
minikube service prometheus --url

# Option C: Ingress (if configured)
kubectl get ingress
```

**Access Grafana:**

1. Open: `http://localhost:3000`
2. Login: `admin` / `admin`
3. Open: **Dashboards** → **URL Shortener Performance Dashboard**

## Demo Script

### Act 1: Baseline (2 minutes)

**Narration:** "Let's start by looking at our baseline system with 3 replicas."

```bash
# Show initial state
kubectl get pods -l app=consumer
kubectl get hpa consumer-hpa

# Show metrics
kubectl top pods -l app=consumer
```

**In Grafana:** Point out:

- Steady low request rate
- Low CPU/memory usage (~20-30%)
- 3 pods handling traffic comfortably

**Screenshot moment:** Baseline state with 3 pods

---

### Act 2: Moderate Load - Gradual Scaling (4 minutes)

**Narration:** "Now let's simulate moderate user traffic and watch Kubernetes respond."

```bash
# In a separate terminal, start moderate load
pnpm run load:test:continuous 100 180

# In main terminal, watch the scaling
kubectl get hpa consumer-hpa -w
```

**Expected behavior (in 1-2 minutes):**

```
NAME           REFERENCE             TARGETS   MINPODS   MAXPODS   REPLICAS
consumer-hpa   Deployment/consumer   35%/70%   3         10        3
consumer-hpa   Deployment/consumer   75%/70%   3         10        3
consumer-hpa   Deployment/consumer   75%/70%   3         10        4  ← Scaled up
consumer-hpa   Deployment/consumer   62%/70%   3         10        4
consumer-hpa   Deployment/consumer   72%/70%   3         10        5  ← Scaled up
consumer-hpa   Deployment/consumer   65%/70%   3         10        5
```

```bash
# In another terminal, watch pods
kubectl get pods -l app=consumer -w
```

**In Grafana:** Show:

- Request rate increasing
- Latency staying stable (<100ms)
- CPU per pod decreasing as new pods come online
- Total throughput increasing

**Talking points:**

- "Notice HPA detected CPU over 70% threshold"
- "New pods automatically scheduled and started"
- "Traffic automatically distributed to new pods"
- "Latency remains stable as we scale"

**Screenshot moment:** 5 pods running, stable performance

---

### Act 3: High Load - Maximum Scaling (4 minutes)

**Narration:** "Let's push the system harder and see it scale to maximum capacity."

```bash
# Stop previous load test (Ctrl+C)

# Start high load
pnpm run load:test:continuous 300 180
```

**Expected behavior:**

```bash
# Watch HPA
kubectl get hpa consumer-hpa -w

# Should scale to 8-10 pods within 60-90 seconds
NAME           REFERENCE             TARGETS    MINPODS   MAXPODS   REPLICAS
consumer-hpa   Deployment/consumer   89%/70%    3         10        5
consumer-hpa   Deployment/consumer   89%/70%    3         10        7   ← Rapid scale
consumer-hpa   Deployment/consumer   82%/70%    3         10        9   ← Approaching max
consumer-hpa   Deployment/consumer   75%/70%    3         10        10  ← At maximum
consumer-hpa   Deployment/consumer   68%/70%    3         10        10  ← Stabilized
```

```bash
# Show all running pods
kubectl get pods -l app=consumer

# Show resource usage
kubectl top pods -l app=consumer
```

**In Grafana:** Highlight:

- Request rate increased to 3K-5K req/sec
- Latency increased slightly but still acceptable (80-150ms)
- 10 pods all processing requests
- Even distribution of load

**Talking points:**

- "System scales rapidly under spike load"
- "Hit our configured maximum of 10 pods"
- "Handling 3-5x more traffic than baseline"
- "Latency increased but remains under 200ms"
- "No failed requests despite the spike"

**Screenshot moment:** 10 pods at maximum capacity

---

### Act 4: Scale Down - Resource Optimization (4 minutes)

**Narration:** "Now let's see Kubernetes intelligently scale down when load decreases."

```bash
# Stop load test (Ctrl+C)

# Watch scale-down process
kubectl get hpa consumer-hpa -w
kubectl get pods -l app=consumer -w
```

**Expected behavior (takes 2-3 minutes due to stabilization window):**

```
NAME           REFERENCE             TARGETS    MINPODS   MAXPODS   REPLICAS
consumer-hpa   Deployment/consumer   68%/70%    3         10        10
consumer-hpa   Deployment/consumer   25%/70%    3         10        10  ← Load dropped
consumer-hpa   Deployment/consumer   25%/70%    3         10        10  ← Waiting...
consumer-hpa   Deployment/consumer   25%/70%    3         10        8   ← Scale down
consumer-hpa   Deployment/consumer   28%/70%    3         10        8
consumer-hpa   Deployment/consumer   28%/70%    3         10        6   ← Continue down
consumer-hpa   Deployment/consumer   35%/70%    3         10        5
consumer-hpa   Deployment/consumer   40%/70%    3         10        4
consumer-hpa   Deployment/consumer   55%/70%    3         10        3   ← Back to minimum
```

**Talking points:**

- "Scale-down is gradual to avoid thrashing"
- "60-second stabilization window prevents over-reaction"
- "Returns to baseline minimum of 3 pods"
- "Cost optimization - not paying for unused capacity"

**In Grafana:** Show:

- Request rate back to baseline
- CPU/memory per pod increasing as count decreases
- System returning to steady state

**Screenshot moment:** Back to 3 pods, stable state

---

### Act 5: Query Performance Demo (3 minutes)

**Narration:** "Let's verify our read performance with the 500K records."

```bash
# Test read endpoints
kubectl get svc consumer

# Port forward to access service
kubectl port-forward svc/consumer 3002:3002 &

# Query count
curl http://localhost:3002/urls/count

# Time a query
time curl http://localhost:3002/urls/count

# Run focused read test
pnpm run load:test:burst 100 50
```

**In Grafana:** Show:

- Cassandra query latency metrics
- Read throughput
- Query success rate

**Talking points:**

- "500K records in database"
- "Query latency under 50ms"
- "Kubernetes scaled to handle read load"
- "Database remains responsive under load"

---

## Post-Demo Analysis (2 minutes)

### Show Detailed Metrics

```bash
# Get HPA details
kubectl describe hpa consumer-hpa

# Show events
kubectl get events --sort-by='.lastTimestamp' | grep consumer

# Show resource usage over time
kubectl top pods -l app=consumer
```

### Explain the Configuration

```bash
# Show HPA configuration
kubectl get hpa consumer-hpa -o yaml

# Highlight key settings:
# - minReplicas: 3
# - maxReplicas: 10
# - targetCPUUtilizationPercentage: 70
# - scaleUp: +50% or +2 pods every 30s
# - scaleDown: -25% every 60s
```

### Review in Prometheus

```bash
# Open Prometheus
kubectl port-forward svc/prometheus 9090:9090
```

Visit `http://localhost:9090` and run queries:

```promql
# Average CPU across all pods
avg(rate(container_cpu_usage_seconds_total{pod=~"consumer.*"}[1m]))

# Request rate per pod
sum by (pod) (rate(kafka_messages_processed_total[1m]))

# P95 latency
histogram_quantile(0.95, rate(cassandra_query_duration_seconds_bucket[1m]))
```

---

## Alternative Demo Scenarios

### Scenario A: Burst Traffic Pattern

Simulate flash sale or viral content:

```bash
# Start low
pnpm run load:test:continuous 50 60

# Wait 30s, then spike
pnpm run load:test:continuous 500 60

# Watch rapid scale-up
kubectl get hpa -w
```

### Scenario B: Sustained High Traffic

Demonstrate steady-state performance:

```bash
# Sustained high load
pnpm run load:test:continuous 250 300

# Show stable operation at scale
kubectl top pods -l app=consumer
```

### Scenario C: Mixed Read/Write

```bash
# Terminal 1: Write load
pnpm run data:generate:producer 10000 100

# Terminal 2: Read load
pnpm run load:test:continuous 150 180

# Show both pipelines operating
```

---

## Cleanup

```bash
# Stop port forwards
pkill -f "kubectl port-forward"

# Delete Kubernetes resources
kubectl delete -f k8s/

# Or delete everything in the namespace
kubectl delete all --all

# Stop local services
docker-compose down

# Clean up Minikube (if used)
minikube stop
minikube delete
```

---

## Troubleshooting

### Pods not scaling

**Check HPA:**

```bash
kubectl describe hpa consumer-hpa
# Look for: "unable to fetch metrics"
```

**Fix:**

```bash
# Verify metrics-server
kubectl get deployment metrics-server -n kube-system

# If missing, install:
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml

# For Minikube, enable addon:
minikube addons enable metrics-server
```

### Metrics not appearing in Grafana

**Check Prometheus:**

```bash
# Port forward Prometheus
kubectl port-forward svc/prometheus 9090:9090

# Visit http://localhost:9090/targets
# Consumer pods should show as "UP"
```

**Fix:**

```bash
# Check pod annotations
kubectl get pod -l app=consumer -o yaml | grep -A 3 annotations

# Should have:
# prometheus.io/scrape: "true"
# prometheus.io/port: "3002"
# prometheus.io/path: "/metrics"
```

### Load test can't reach service

**Port forward consumer:**

```bash
kubectl port-forward svc/consumer 3002:3002
```

**Or use NodePort:**

```bash
# If using Minikube
minikube service consumer --url

# Update load test to use that URL
```

### Image pull errors

**If using Minikube:**

```bash
# Use Minikube's Docker daemon
eval $(minikube docker-env)

# Rebuild image
docker build -t url-shortener-consumer:v1.0.0 .

# Update deployment to use imagePullPolicy: Never
kubectl patch deployment consumer -p '{"spec":{"template":{"spec":{"containers":[{"name":"consumer","imagePullPolicy":"Never"}]}}}}'
```

---

## Demo Checklist

Before starting the demo:

- [ ] Kubernetes cluster is running
- [ ] `kubectl` is configured
- [ ] metrics-server is installed
- [ ] Docker image is built and available
- [ ] Test data is pre-populated (500K records)
- [ ] All K8s resources are deployed
- [ ] Grafana is accessible and dashboard is loaded
- [ ] Prometheus is collecting metrics
- [ ] Load test scripts are tested and working
- [ ] Port forwards are configured

During the demo:

- [ ] Show baseline state (3 pods)
- [ ] Demonstrate gradual scaling (to 5 pods)
- [ ] Show maximum scaling (to 10 pods)
- [ ] Demonstrate scale-down (back to 3)
- [ ] Query performance with large dataset
- [ ] Show Grafana metrics throughout

After the demo:

- [ ] Answer questions about configuration
- [ ] Show Prometheus queries
- [ ] Explain HPA decision-making
- [ ] Discuss production considerations

---

## Production Considerations

When presenting to stakeholders, mention:

1. **Resource Requests/Limits**: Prevents resource starvation
2. **Pod Disruption Budgets**: Ensures availability during scaling
3. **Readiness/Liveness Probes**: Health checking
4. **Multiple Availability Zones**: High availability
5. **Alerting**: Prometheus AlertManager for production monitoring
6. **Cost Optimization**: Cluster Autoscaler for node scaling
7. **Security**: RBAC, Network Policies, Pod Security Policies

---

## Presentation Tips

1. **Start simple**: Begin with baseline, then build complexity
2. **Use visuals**: Grafana is your friend - keep it visible
3. **Tell a story**: "Normal day → Traffic spike → System responds"
4. **Show, don't tell**: Let the metrics speak
5. **Explain the 'why'**: Why 70% CPU? Why 3 min replicas?
6. **Anticipate questions**: Have kubectl commands ready
7. **Be prepared to debug**: Things can go wrong - stay calm

---

**You're ready to deliver an impressive Kubernetes scaling demo! 🚀**
