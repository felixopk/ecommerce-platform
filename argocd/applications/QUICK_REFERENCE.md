# ArgoCD Quick Reference

## Access ArgoCD UI

```bash
# Port forward
kubectl port-forward svc/argocd-server -n argocd 8080:443

# Get password
kubectl -n argocd get secret argocd-initial-admin-secret \
  -o jsonpath="{.data.password}" | base64 -d; echo

# Open: https://localhost:8080
# Username: admin
```

## Common Commands

```bash
# Application status
argocd app get ecommerce-platform

# Manual sync
argocd app sync ecommerce-platform

# View logs
argocd app logs ecommerce-platform

# List apps
argocd app list

# Diff with Git
argocd app diff ecommerce-platform
```

## Troubleshooting

```bash
# Check app status
kubectl describe application ecommerce-platform -n argocd

# ArgoCD logs
kubectl logs -n argocd deployment/argocd-server

# Force sync
argocd app sync ecommerce-platform --force --prune
```

## Current Configuration

- **Repo:** https://github.com/felixopk/ecommerce-platform
- **Path:** kubernetes/
- **Namespace:** ecommerce
- **Sync:** Automated (prune: true, selfHeal: true)