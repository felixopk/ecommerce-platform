# ArgoCD Installation

This directory contains ArgoCD installation and configuration files.

## Installation Steps

### 1. Install ArgoCD
```bash
kubectl create namespace argocd
kubectl apply -n argocd -f install.yaml
```

### 2. Access ArgoCD UI

**Get admin password:**
```bash
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d; echo
```

**Port forward:**
```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

**Access:** https://localhost:8080
- Username: `admin`
- Password: (from above command)

### 3. Install ArgoCD CLI
```bash
curl -sSL -o /tmp/argocd-linux-amd64 https://github.com/argoproj/argo-cd/releases/latest/download/argocd-linux-amd64
sudo install -m 555 /tmp/argocd-linux-amd64 /usr/local/bin/argocd
rm /tmp/argocd-linux-amd64
```

### 4. Login via CLI
```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443 &
argocd login localhost:8080 --username admin --password <password> --insecure
```

## Applications

# 2. Download current ArgoCD installation manifest
curl -sSL https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml -o install.yaml

# 3. Create applications directory
mkdir -p applications
cat > applications/ecommerce-platform.yaml <<'EOF'
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: ecommerce-platform
  namespace: argocd
spec:
  project: default
  
  source:
    repoURL: https://github.com/YOUR_USERNAME/ecommerce-platform  # CHANGE THIS!
    targetRevision: HEAD
    path: kubernetes
  
  destination:
    server: https://kubernetes.default.svc
    namespace: ecommerce
  
  syncPolicy:
    automated:
      prune: true      # Delete resources when removed from Git
      selfHeal: true   # Revert manual changes
      allowEmpty: false
    syncOptions:
    - CreateNamespace=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
EOF

echo ""
echo "✅ ArgoCD directory structure created!"
echo ""
echo "Next steps:"
echo "1. Update applications/ecommerce-platform.yaml with your GitHub repo URL"
echo "2. Apply the application: kubectl apply -f applications/ecommerce-platform.yaml"