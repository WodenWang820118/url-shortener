# URL Shortener - Kubernetes Deployment Scripts

## Prerequisites

- kubectl configured
- Docker installed
- Access to a Kubernetes cluster (local or cloud)

## Quick Deploy

```bash
# Build and deploy everything
./deploy-all.sh

# Or deploy individually:
kubectl apply -f consumer-deployment.yaml
kubectl apply -f prometheus-deployment.yaml
kubectl apply -f grafana-deployment.yaml
```

## Verify Deployment

```bash
# Check all resources
kubectl get all

# Check HPA status
kubectl get hpa

# Check pod metrics
kubectl top pods
```

## Access Services

```bash
# Port forward services
kubectl port-forward svc/consumer 3002:3002
kubectl port-forward svc/prometheus 9090:9090
kubectl port-forward svc/grafana 3000:3000
```

Or use NodePort (if using Minikube/Kind):

- Grafana: http://<node-ip>:30300
- Prometheus: http://<node-ip>:30090

## Scaling

The HorizontalPodAutoscaler (HPA) will automatically scale the consumer deployment:

- **Min replicas:** 3
- **Max replicas:** 10
- **Target CPU:** 70%
- **Target Memory:** 80%

Monitor scaling:

```bash
kubectl get hpa consumer-hpa -w
```

## Monitoring

1. Access Grafana at http://localhost:3000 (after port-forward)
2. Login: admin/admin
3. Add Prometheus datasource: http://prometheus:9090
4. Import dashboard from: ../monitoring/grafana/dashboards/url-shortener-dashboard.json

## Load Testing from K8s

```bash
# Create a load test pod
kubectl run load-tester --image=node:18 -it --rm -- /bin/bash

# Inside the pod:
apt-get update && apt-get install -y curl
# Run continuous requests
while true; do curl http://consumer:3002/urls; sleep 0.1; done
```

## Troubleshooting

### Pods not starting

```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Metrics not available

```bash
# Check metrics-server
kubectl get apiservice v1beta1.metrics.k8s.io -o yaml

# Install if missing
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### HPA not scaling

```bash
# Check HPA conditions
kubectl describe hpa consumer-hpa

# Check resource requests are set
kubectl describe deployment consumer
```

## Cleanup

```bash
kubectl delete -f .
# Or
kubectl delete deployment,service,hpa,configmap --all
```
