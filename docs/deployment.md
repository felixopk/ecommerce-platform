# Deployment Guide

## Prerequisites
- Kubernetes cluster (k3s recommended)
- kubectl configured
- GitHub account
- Docker registry access

## Initial Setup

### 1. Create Namespace
```bash
kubectl create namespace ecommerce
```

### 2. Create Secrets
```bash
# PostgreSQL credentials
kubectl create secret generic postgres-secret \
  --from-literal=POSTGRES_DB=ecommerce \
  --from-literal=POSTGRES_USER=admin \
  --from-literal=POSTGRES_PASSWORD=SecurePassword123! \
  --namespace=ecommerce

# Database URL
kubectl create secret generic ecommerce-db-secret \
  --from-literal=DATABASE_URL='postgresql://admin:SecurePassword123!@postgres.ecommerce.svc.cluster.local:5432/ecommerce' \
  --namespace=ecommerce

# Container registry
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=YOUR_USERNAME \
  --docker-password=YOUR_TOKEN \
  --namespace=ecommerce
```

### 3. Deploy Application
```bash
kubectl apply -f kubernetes/
```

### 4. Verify Deployment
```bash
kubectl get pods -n ecommerce
kubectl get services -n ecommerce
kubectl get ingress -n ecommerce
```

## CI/CD Setup

### Configure Self-Hosted Runner
1. Download runner on homelab
2. Configure as systemd service
3. Verify kubectl access

### GitHub Secrets
Required secrets in repository settings:
- `GHCR_PAT`: GitHub Personal Access Token with packages permission

## Troubleshooting

### ImagePullBackOff
- Check `ghcr-secret` exists
- Verify token has correct permissions
- Test: `docker pull ghcr.io/username/image:tag`

### CrashLoopBackOff
- Check logs: `kubectl logs -n ecommerce POD_NAME`
- Verify database connection
- Check resource limits

### Pending Pods
- Check PVC status
- Verify StorageClass exists
- Check node resources