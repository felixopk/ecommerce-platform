# Troubleshooting Guide

## Connection Issues

### Problem: Can't connect to cluster
**Error:** `The connection to the server localhost:8080 was refused`

**Solution:**
```bash
# Check KUBECONFIG
echo $KUBECONFIG

# Set correct config
export KUBECONFIG=~/.kube/config

# Verify connection
kubectl get nodes
```

## Pod Issues

### Problem: ImagePullBackOff
**Symptoms:** Pods stuck in ImagePullBackOff state

**Debug:**
```bash
kubectl describe pod POD_NAME -n ecommerce
kubectl get events -n ecommerce
```

**Common Causes:**
1. Missing or incorrect imagePullSecrets
2. Image doesn't exist
3. Registry credentials expired

**Solution:**
```bash
# Recreate secret with fresh token
kubectl delete secret ghcr-secret -n ecommerce
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=USERNAME \
  --docker-password=NEW_TOKEN \
  --namespace=ecommerce

# Restart deployment
kubectl rollout restart deployment DEPLOYMENT_NAME -n ecommerce
```

## Deployment Issues

### Problem: Rollout stuck
**Check status:**
```bash
kubectl rollout status deployment/ecommerce-backend -n ecommerce
kubectl get pods -n ecommerce
```

**Rollback:**
```bash
kubectl rollout undo deployment/ecommerce-backend -n ecommerce
```

## Useful Commands

### View logs
```bash
# All backend pods
kubectl logs -n ecommerce -l app=ecommerce-backend --tail=50

# Specific pod
kubectl logs -n ecommerce POD_NAME

# Follow logs
kubectl logs -n ecommerce POD_NAME -f
```

### Debug pod
```bash
kubectl describe pod POD_NAME -n ecommerce
kubectl get events -n ecommerce --sort-by='.lastTimestamp'
```

### Check resources
```bash
kubectl top nodes
kubectl top pods -n ecommerce
```