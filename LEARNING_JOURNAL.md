# DevOps Learning Journey

## December 28-30, 2025: Kubernetes Homelab Setup

### Day 1: Foundation
**Objective:** Set up production k3s cluster on dedicated hardware

**What I Built:**
- Installed k3s on HP ProDesk 600 G1 server
- Configured kubectl remote access from laptop
- Deployed full-stack application (React + NestJS + PostgreSQL)
- Set up Nginx Ingress controller

**Challenges:**
- Understanding kubeconfig and KUBECONFIG environment variable
- Managing multiple cluster contexts
- Network configuration for homelab access

**Solutions:**
- Learned kubectl config management
- Created proper kubeconfig on homelab
- Configured static IP for stable access

**Time Invested:** 6 hours

---

### Day 2: CI/CD Pipeline

**Objective:** Automate deployments with GitHub Actions

**What I Built:**
- Self-hosted GitHub Actions runner on homelab
- Automated Docker build and push pipeline
- Security scanning with Trivy
- Automated Kubernetes deployments

**Challenges:**
1. **Network Access**
   - Cloud runners couldn't reach homelab LAN
   - Solution: Self-hosted runner on same network

2. **Authentication Issues**
   - ImagePullBackOff errors (403 Forbidden)
   - Confusion between K8s secrets vs GitHub secrets
   - Solution: Fresh GitHub PAT in both locations

3. **Secret Management**
   - Understanding Kubernetes imagePullSecrets
   - GitHub repository secrets for CI/CD
   - Solution: Same token, different secret names

**Key Learnings:**
- Kubernetes Secrets vs GitHub Actions Secrets (completely independent!)
- Secret naming is local to each system
- Token values can be shared across systems
- Self-hosted runners solve network isolation issues

**Breakthrough Moment:**
Understanding that `ghcr-secret` (K8s) and `GHCR_PAT` (GitHub) are separate entities that can use the same token value but serve different purposes (pull vs push).

**Time Invested:** 8 hours

**Result:** First successful automated deployment! 🎉

---

### Technical Skills Acquired

#### Kubernetes
- [x] Cluster installation (k3s)
- [x] kubectl configuration and context management
- [x] Deployments, Services, StatefulSets
- [x] Secrets management
- [x] Ingress configuration
- [x] Rolling updates and rollbacks
- [x] Resource management (limits/requests)
- [x] Health checks (liveness/readiness)
- [ ] Horizontal Pod Autoscaling
- [ ] Network Policies

#### CI/CD
- [x] GitHub Actions workflows
- [x] Self-hosted runners
- [x] Docker multi-stage builds
- [x] Container registry (GHCR)
- [x] Security scanning (Trivy)
- [x] Automated deployments
- [x] Tag-based releases

#### Infrastructure
- [x] Linux server administration
- [x] Systemd service management
- [x] Network configuration
- [x] SSH and remote access
- [ ] Terraform
- [ ] Ansible

#### Troubleshooting
- [x] Kubernetes debugging (describe, logs, events)
- [x] Authentication issues
- [x] Network troubleshooting
- [x] Secret management
- [x] Image pull errors

---

### Metrics

**System Uptime:** 45+ hours continuous
**Deployments:** 5+ successful
**Pods Running:** 6/6 healthy
**Zero-Downtime Updates:** ✅ Achieved
**CI/CD Success Rate:** 100% (after fixes)

---

### Next Steps

**Week 1:**
- [ ] Add Prometheus + Grafana monitoring
- [ ] Create architecture diagrams
- [ ] Write comprehensive documentation
- [ ] Record demo video

**Week 2:**
- [ ] Implement Horizontal Pod Autoscaling
- [ ] Add Network Policies
- [ ] Set up log aggregation (Loki)
- [ ] Backup and disaster recovery

**Week 3:**
- [ ] Start job applications
- [ ] Practice interview questions
- [ ] Prepare portfolio presentation

---

### Resources Used
- Kubernetes official documentation
- k3s documentation
- GitHub Actions documentation
- Docker best practices
- Stack Overflow (authentication issues)
- Real-world troubleshooting and experimentation

---

### Reflections

**What Worked Well:**
- Hands-on breaking and fixing
- Understanding concepts before moving forward
- Asking "why" not just "how"
- Building on real hardware (not just cloud)

**What I'd Do Differently:**
- Document issues in real-time
- Take more screenshots during process
- Create architecture diagrams earlier

**Most Valuable Lesson:**
Understanding the distinction between different types of secrets and their purposes. Not all "secrets" are the same - context matters!

---

*Updated: December 30, 2025*