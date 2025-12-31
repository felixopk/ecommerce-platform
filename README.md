# E-Commerce Platform - Production DevOps Portfolio

> A full-stack e-commerce application demonstrating production-grade DevOps practices including Kubernetes orchestration, automated CI/CD pipelines, infrastructure as code, and comprehensive monitoring.

[![CI/CD Pipeline](https://github.com/felixopk/ecommerce-platform/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/felixopk/ecommerce-platform/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🎯 Project Overview

This project showcases a production-ready deployment of a microservices-based e-commerce platform, deployed on a self-hosted Kubernetes cluster with full CI/CD automation.

**Live Demo:** `http:// *(Available on request)*

### Key Achievements
- ✅ **45+ hours continuous uptime** on self-hosted k3s cluster
- ✅ **Zero-downtime deployments** with rolling updates
- ✅ **Automated CI/CD** pipeline from git tag to production
- ✅ **High availability** with 3 backend replicas and load balancing
- ✅ **Security-first** approach with secrets management and vulnerability scanning

---

## 🏗️ Architecture

### System Architecture
```
┌─────────────────────────────────────────────┐
│           Nginx Ingress Controller          │
│                 (Port 4450)                  │
└─────────────────┬───────────────────────────┘
                  │
      ┌───────────┴──────────┐
      │                      │
┌─────▼──────┐      ┌────────▼────────┐
│  Frontend  │      │    Backend API  │
│  (React)   │      │    (NestJS)     │
│  2 replicas│      │    3 replicas   │
└────────────┘      └────────┬────────┘
                             │
                   ┌─────────┴─────────┐
                   │                   │
              ┌────▼────┐         ┌───▼────┐
              │PostgreSQL│         │ Redis  │
              │StatefulSet│        │(Future)│
              └──────────┘         └────────┘
```

### Infrastructure
- **Kubernetes:** k3s v1.33.6 on HP ProDesk 600 G1
- **Hardware:** Intel i5-4590, 16GB RAM, 120GB SSD
- **Network:** Self-hosted runner with direct cluster access
- **CI/CD:** GitHub Actions with self-hosted runner

---

## �� Technology Stack

### Frontend
- **Framework:** React 18 with Vite
- **Server:** Nginx (Alpine)
- **Container:** Multi-stage Docker build

### Backend
- **Framework:** NestJS (TypeScript)
- **Database:** PostgreSQL 15 with Prisma ORM
- **Caching:** Redis (planned)
- **Metrics:** Prometheus integration

### DevOps & Infrastructure
- **Container Orchestration:** Kubernetes (k3s)
- **CI/CD:** GitHub Actions
- **Container Registry:** GitHub Container Registry (ghcr.io)
- **IaC:** Terraform (planned)
- **Configuration:** Ansible (planned)
- **Monitoring:** Prometheus + Grafana (in progress)
- **Security:** Trivy vulnerability scanning

---

## �� Features Implemented

### Kubernetes Configuration
- ✅ **Deployments** with replica management
- ✅ **StatefulSets** for PostgreSQL with persistent storage
- ✅ **Services** (ClusterIP, headless)
- ✅ **Ingress** with nginx controller
- ✅ **Secrets** management for sensitive data
- ✅ **Resource limits** (CPU/memory)
- ✅ **Health checks** (liveness/readiness probes)
- ✅ **Rolling updates** with zero downtime
- ⏳ **Horizontal Pod Autoscaling** (next phase)
- ⏳ **Network Policies** (next phase)

### CI/CD Pipeline
- ✅ **Tag-based releases** (semantic versioning)
- ✅ **Automated Docker builds** (multi-stage)
- ✅ **Security scanning** with Trivy
- ✅ **Automated deployments** to Kubernetes
- ✅ **Image versioning** and tagging
- ✅ **Self-hosted runner** on homelab

### Security
- ✅ **Non-root containers**
- ✅ **Secrets management** (Kubernetes Secrets)
- ✅ **Image pull secrets** for private registry
- ✅ **Vulnerability scanning** in CI pipeline
- ✅ **HTTPS/TLS** ready (via Ingress)

---

## 🛠️ Getting Started

### Prerequisites
```bash
- Docker & Docker Compose
- kubectl
- Access to Kubernetes cluster
- GitHub account (for CI/CD)
```

### Local Development
```bash
# Clone repository
git clone https://github.com/felixopk/ecommerce-platform
cd ecommerce-platform

# Start with Docker Compose
docker-compose up -d

# Access application
# Frontend: http://localhost:8080
# Backend: http://localhost:3000
# Backend API: http://localhost:3000/api/products
```

### Kubernetes Deployment
```bash
# Apply all manifests
kubectl apply -f kubernetes/

# Check deployment status
kubectl get pods -n ecommerce

# Access via Ingress
# http://192.168.0.50:4450
```

---

## 🔄 CI/CD Workflow

### Automated Deployment Process
```bash
# 1. Create a new release tag
git tag v1.0.8
git push origin v1.0.8

# 2. GitHub Actions automatically:
#    - Builds Docker image
#    - Scans for vulnerabilities
#    - Pushes to ghcr.io
#    - Updates Kubernetes deployment
#    - Deploys to homelab cluster

# 3. Zero-downtime rolling update
#    - New pods start
#    - Health checks pass
#    - Old pods terminate
```

### Pipeline Stages
1. **Build** - Multi-stage Docker build
2. **Scan** - Trivy security scan (HIGH/CRITICAL)
3. **Push** - Push to GitHub Container Registry
4. **Deploy** - Update Kubernetes deployment
5. **Verify** - Health check validation

---

## 📊 Monitoring & Observability

### Current Metrics
- **Uptime:** 45+ hours continuous
- **Pod Health:** 100% (6/6 pods running)
- **Response Time:** < 100ms
- **Deployment Frequency:** Tag-based releases

### Planned Monitoring Stack
- Prometheus (metrics collection)
- Grafana (visualization)
- Loki (log aggregation)
- AlertManager (alerting)

---

## 🧪 Testing & Quality

### Implemented
- ✅ Liveness probes (application health)
- ✅ Readiness probes (traffic routing)
- ✅ Security scanning (Trivy)

### Planned
- ⏳ Unit tests
- ⏳ Integration tests
- ⏳ E2E tests
- ⏳ Load testing

---

## 📚 Documentation

- [Architecture Decisions](./docs/adr/) *(coming soon)*
- [Deployment Guide](./docs/deployment.md) *(coming soon)*
- [Troubleshooting](./docs/troubleshooting.md) *(coming soon)*
- [API Documentation](./docs/api.md) *(coming soon)*

---

## 🎓 Learning Journey

### Challenges Overcome
1. **Kubernetes Authentication**
   - Problem: Lost connection to cluster due to kubeconfig misconfiguration
   - Solution: Understood KUBECONFIG environment variable and context management
   - Learning: Deep dive into kubectl configuration and context switching

2. **CI/CD Network Access**
   - Problem: GitHub Actions cloud runners couldn't reach homelab
   - Solution: Configured self-hosted runner on homelab server
   - Learning: Runner configuration, systemd services, and network topologies

3. **Container Registry Authentication**
   - Problem: ImagePullBackOff due to expired registry credentials
   - Solution: Proper secrets management in both Kubernetes and GitHub
   - Learning: Distinction between Kubernetes secrets and GitHub Actions secrets

4. **Rolling Deployments**
   - Problem: Understanding zero-downtime updates
   - Solution: Proper health checks and resource management
   - Learning: Kubernetes deployment strategies and pod lifecycle

### Skills Developed
- Kubernetes administration and troubleshooting
- CI/CD pipeline design and implementation
- Secrets management and security best practices
- Docker multi-stage builds and optimization
- Infrastructure debugging and problem-solving
- Git-based deployment workflows

---

## 🚧 Roadmap

### Phase 1: Foundation ✅
- [x] Kubernetes cluster setup
- [x] Application containerization
- [x] Basic CI/CD pipeline
- [x] Secrets management

### Phase 2: Monitoring (In Progress)
- [ ] Prometheus deployment
- [ ] Grafana dashboards
- [ ] Log aggregation (Loki)
- [ ] Alert rules

### Phase 3: Advanced Features (Planned)
- [ ] Horizontal Pod Autoscaling
- [ ] Network Policies
- [ ] Service Mesh (Istio/Linkerd)
- [ ] Distributed tracing (Jaeger)

### Phase 4: IaC (Planned)
- [ ] Terraform for infrastructure
- [ ] Ansible for configuration
- [ ] GitOps with ArgoCD
- [ ] Backup and disaster recovery

---

## 📈 Performance

### Current Metrics
- **Deployment Time:** ~2 minutes (tag to production)
- **Pod Startup Time:** ~10 seconds
- **Rolling Update Time:** ~30 seconds
- **Zero Downtime:** ✅ Achieved

---

## 🤝 Contributing

This is a portfolio project, but feedback and suggestions are welcome!

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file

---

## 👨‍💻 Author

**Felix Opk**
- GitHub: [@felixopk](https://github.com/felixopk)
- LinkedIn: [My LinkedIn](https://linkedin.com/in/felixopk)
- Portfolio: [My Website](https://opkcloudz.com)

---

## 🙏 Acknowledgments

- Built as part of DevOps learning journey
- Targeting junior-to-mid DevOps roles in Germany
- Self-taught through breaking, fixing, and understanding

---

*Last Updated: December 30, 2025*

## Production-Grade Networking with MetalLB

### Architecture

This project demonstrates production-ready Kubernetes networking on bare-metal infrastructure:
```
Internet/Users
    ↓
MetalLB LoadBalancer (192.168.0.100)
    ↓
Nginx Ingress Controller
    ↓
┌─────────────┬──────────────┬─────────────┐
│  Frontend   │   Backend    │  PostgreSQL │
│  (Nginx)    │  (NestJS)    │  (StatefulSet)
└─────────────┴──────────────┴─────────────┘
```

### Why MetalLB?

**Problem**: Kubernetes LoadBalancer services require cloud providers (AWS, GCP, Azure). On bare-metal, LoadBalancer services remain in "Pending" state forever.

**Solution**: MetalLB provides network load balancer implementation for bare-metal Kubernetes clusters.

**Benefits**:
- ✅ Standard ports (80, 443) instead of NodePort high-numbered ports
- ✅ Production-grade load balancing
- ✅ Proper IP address management
- ✅ L2/L3 mode support
- ✅ No cloud dependency

### Technical Implementation

**MetalLB Configuration**:
- IP Pool: `192.168.0.100-192.168.0.110`
- Mode: Layer 2 (ARP-based)
- LoadBalancer IP: `192.168.0.100`

**Access**:
- Application: http://ecommerce.local/
- API: http://ecommerce.local/api/products
- Health: http://ecommerce.local/healthz

### Interview Talking Points

**Q: "Why use MetalLB instead of NodePort?"**

NodePort has several production issues:
1. Non-standard ports (30000-32767) confuse users and break bookmarks
2. Increased attack surface (exposes ports on all nodes)
3. No proper load balancing
4. Limited port range (~2000 services max)
5. Doesn't work with corporate firewalls

MetalLB provides cloud-native LoadBalancer experience on-premises.

**Q: "How does MetalLB work?"**

MetalLB operates in two modes:
- **Layer 2 mode** (used here): Uses ARP to announce IP addresses
- **BGP mode**: Integrates with network routers for advanced routing

In L2 mode, MetalLB responds to ARP requests for the LoadBalancer IP, directing traffic to the correct node.

**Q: "What about production at scale?"**

For multi-node production:
- Use MetalLB in BGP mode with proper routers
- Or integrate with existing F5/HAProxy infrastructure
- Or use cloud-native load balancers (AWS ALB, GCP LB)

The principles remain the same - this homelab demonstrates understanding of the architecture.

