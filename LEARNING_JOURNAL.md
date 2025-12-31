# DevOps Learning Journey

## December 24-31, 2025: Kubernetes Homelab Setup

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

### Day 3: GitOps with ArgoCD

**Objective:** Implement GitOps for declarative infrastructure management

**What I Built:**
- Installed ArgoCD on Kubernetes cluster
- Configured Git repository as single source of truth
- Set up automated sync from Git to cluster
- Implemented proper repository structure

**Challenges:**
1. **ArgoCD Sync Failures**
   - Error: "kind.x-k8s.io/Cluster CRD not found"
   - Root Cause: Kind cluster config file in kubernetes/ directory
   - Solution: Moved local dev configs to separate local-dev/ directory

2. **Repository Structure**
   - Mixed deployment manifests with development configs
   - Solution: Proper separation of concerns
     ```
     kubernetes/        # Production manifests (ArgoCD syncs this)
     local-dev/        # Kind configs, Docker Compose (ArgoCD ignores)
     .argocdignore     # Exclusion rules
     ```

**Key Learnings:**
- GitOps principles: Git as single source of truth
- Importance of repository organization
- ArgoCD automatically applies changes from Git
- `.argocdignore` for excluding non-deployable files
- Difference between cluster bootstrap configs and application manifests

**Breakthrough Moment:**
Understanding that ArgoCD tries to deploy EVERYTHING in the synced path - must separate deployable manifests from local tooling configs.

**Time Invested:** 4 hours

**Result:** ArgoCD synced and healthy! Automated GitOps workflow established! 🎉

---

### Day 4: Production Networking Deep Dive

**Objective:** Achieve production-grade networking on bare-metal Kubernetes

**What I Built:**
- Installed and configured MetalLB for LoadBalancer services
- Migrated from NodePort to LoadBalancer service type
- Implemented Layer 2 IP address management
- Achieved standard port 80 access (no more NodePort high ports)

**The 503 Debugging Marathon:**

#### Problem 1: Port Conflict
**Symptom:** 503 Service Unavailable, getting default Nginx welcome page

**Diagnosis Process:**
```bash
curl http://192.168.0.50/
# Result: "Welcome to nginx!" (wrong nginx!)
```

**Root Cause:** Host machine's Nginx service on port 80 blocking Kubernetes ingress

**Investigation:**
- Compared nginx version in response (1.18.0 Ubuntu) vs K8s pods
- Realized traffic hitting host service, never reaching Kubernetes
- Checked systemd services

**Solution:**
```bash
sudo systemctl stop nginx
sudo systemctl disable nginx
```

**Learning:** Port conflicts between host and containerized services - host wins!

---

#### Problem 2: NodePort vs Standard Ports
**Symptom:** Connection refused on port 80

**Diagnosis:**
```bash
kubectl get svc -n ingress-nginx
# Result: NodePort 80:4450/TCP (port 4450 externally)
```

**Root Cause:** Ingress using NodePort service type, mapping port 80→4450

**Service Type Comparison Learned:**
| Type | Ports | Use Case | Production Ready |
|------|-------|----------|-----------------|
| ClusterIP | Internal only | Inter-service communication | N/A |
| NodePort | 30000-32767 | Development/testing | ❌ No |
| LoadBalancer | 80, 443 | Production | ✅ Yes |
| hostPort | Direct binding | Single-node homelab | ⚠️ Limited |

**Why NodePort is NOT production-safe:**
1. Security: Exposes high-numbered ports on all nodes (increased attack surface)
2. Scalability: Limited to ~2000 services
3. UX: Non-standard ports confuse users, break bookmarks
4. Firewalls: Corporate firewalls often block non-standard ports
5. HA: No automatic failover or intelligent load balancing

**Solution:** Implement MetalLB for proper LoadBalancer support

---

#### Problem 3: Host-Based Routing
**Symptom:** 404 Not Found when accessing via IP, works with hostname

**Diagnosis:**
```bash
curl http://192.168.0.50:4450/        # 404 Not Found
curl -H "Host: ecommerce.local" http://192.168.0.50:4450/  # SUCCESS!
```

**Root Cause:** Ingress configured with host-based routing
```yaml
spec:
  rules:
  - host: ecommerce.local  # Expects this specific hostname
```

**How Ingress Host-Based Routing Works:**
- Ingress checks HTTP Host header
- Routes traffic based on hostname match
- Like hotel reception - must give correct name to get room key

**Solution:** Configure DNS via /etc/hosts:
```bash
192.168.0.100  ecommerce.local
```

**Learning:** Layer 7 (HTTP) routing based on hostname - common pattern for multi-tenant systems

---

#### Problem 4: DNS Resolution Issues
**Symptom:** Ping resolving to 127.0.0.1 instead of homelab IP

**Diagnosis:**
```bash
ping ecommerce.local
# Result: 127.0.0.1 (localhost) ❌
```

**Root Cause:** Duplicate /etc/hosts entries, first match wins
```
127.0.0.1      ecommerce.local  # ← This matched first
192.168.0.50   ecommerce.local  # ← Never reached
```

**Solution:** Remove duplicate entry, keep only correct IP

**Learning:** /etc/hosts reads top-to-bottom, stops at first match

---

#### Problem 5: MetalLB Pod Scheduling Failure
**Symptom:** New ingress pod stuck in "Pending" state

**Diagnosis:**
```bash
kubectl describe pod ingress-nginx-controller-xxx
# Events: "0/1 nodes didn't have free ports for the requested pod ports"
```

**Root Cause:** Old ingress pod with hostPort:80 still running, new pod can't bind to same port

**Why It Happened:**
1. Changed service from NodePort to LoadBalancer
2. Kubernetes tried to create new pod with new config
3. Old pod still held port 80 via hostPort
4. New pod couldn't schedule (port conflict)

**Solution:**
```bash
kubectl scale deployment ingress-nginx-controller --replicas=0  # Stop all
kubectl delete replicaset <old-replicaset>                      # Clean up
kubectl scale deployment ingress-nginx-controller --replicas=1  # Restart clean
```

**Learning:** Kubernetes pod scheduling constraints - hostPort creates node-level port reservations

---

### MetalLB Implementation

**What is MetalLB?**
Network load balancer for bare-metal Kubernetes clusters (provides LoadBalancer service type without cloud)

**Installation:**
```bash
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.14.8/config/manifests/metallb-native.yaml
```

**Configuration:**
```yaml
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: homelab-pool
  namespace: metallb-system
spec:
  addresses:
  - 192.168.0.100-192.168.0.110  # Available IPs from my network

---
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: homelab-l2
  namespace: metallb-system
spec:
  ipAddressPools:
  - homelab-pool
```

**How MetalLB Works:**
- **Layer 2 Mode (used):** Responds to ARP requests, announces LoadBalancer IPs on local network
- **BGP Mode:** Integrates with network routers for advanced routing

**Architecture:**
```
MetalLB Controller → Manages IP assignments
MetalLB Speaker → Announces IPs via ARP (DaemonSet on each node)
```

**Result:**
```bash
kubectl get svc -n ingress-nginx
# TYPE: LoadBalancer
# EXTERNAL-IP: 192.168.0.100  ← Assigned by MetalLB!
# PORT(S): 80:32156/TCP

# Access on standard port 80:
curl http://ecommerce.local/  # ✅ Works!
```

**Production Benefits:**
- ✅ Standard ports (80, 443)
- ✅ Proper load balancing across nodes
- ✅ Cloud-native LoadBalancer experience on-premises
- ✅ Automatic IP management
- ✅ No cloud dependency

**Time Invested:** 10 hours (intense troubleshooting!)

**Result:** Production-grade networking achieved! Application accessible on standard HTTP port! 🎉

---

### Technical Skills Acquired

#### Kubernetes Networking (DEEP DIVE)
- [x] Ingress controllers (Nginx)
- [x] Service types (ClusterIP, NodePort, LoadBalancer)
- [x] Host-based routing
- [x] MetalLB installation and configuration
- [x] Layer 2 networking and ARP
- [x] LoadBalancer IP management
- [x] Port conflicts and resolution
- [x] DNS configuration (/etc/hosts)
- [x] Pod scheduling constraints (hostPort)
- [ ] Network Policies
- [ ] Calico/Cilium CNI

#### Kubernetes
- [x] Cluster installation (k3s)
- [x] kubectl configuration and context management
- [x] Deployments, Services, StatefulSets
- [x] Secrets management
- [x] Ingress configuration
- [x] Rolling updates and rollbacks
- [x] Resource management (limits/requests)
- [x] Health checks (liveness/readiness)
- [x] Pod troubleshooting (describe, logs, events)
- [x] ReplicaSet management
- [x] Service patching
- [ ] Horizontal Pod Autoscaling
- [ ] Custom Resource Definitions (CRDs)

#### GitOps
- [x] ArgoCD installation and setup
- [x] Git as single source of truth
- [x] Automated sync workflows
- [x] Repository structure best practices
- [x] .argocdignore patterns
- [x] Troubleshooting sync failures
- [ ] Multi-environment setup (dev/staging/prod)
- [ ] ArgoCD ApplicationSets

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
- [x] Port conflict resolution
- [x] ARP protocol understanding
- [ ] Terraform
- [ ] Ansible

#### Troubleshooting Methodology
- [x] Systematic layer-by-layer debugging
- [x] Checking pod status and events
- [x] Service endpoint verification
- [x] Testing at each network layer
- [x] Log analysis (kubectl logs)
- [x] Comparing expected vs actual behavior
- [x] Using curl with Host headers
- [x] DNS troubleshooting
- [x] Understanding error messages
- [x] Reading Kubernetes events

---

### Metrics

**System Uptime:** 90+ hours continuous
**Deployments:** 12+ successful
**Pods Running:** 8/8 healthy
**Zero-Downtime Updates:** ✅ Achieved
**CI/CD Success Rate:** 100%
**GitOps Sync Status:** ✅ Synced
**Network Troubleshooting Issues Resolved:** 5 major issues
**MetalLB LoadBalancer IPs Assigned:** 1 (192.168.0.100)

---

### Architecture Evolution

**Before (Development):**
```
User → 192.168.0.50:4450 (NodePort) → Ingress → App
      ↑ Non-standard port, not production-safe
```

**After (Production-Grade):**
```
User → MetalLB (192.168.0.100:80) → Ingress → ┌─ Frontend
                                                ├─ Backend → PostgreSQL
                                                └─ API
      ↑ Standard port, proper load balancing
```

**Technology Stack:**
- **Infrastructure:** Bare-metal K3s cluster (HP ProDesk 600 G1)
- **GitOps:** ArgoCD for declarative deployments
- **Networking:** MetalLB (Layer 2) for LoadBalancer services
- **Ingress:** Nginx Ingress Controller with host-based routing
- **Storage:** StatefulSet with persistent volumes (PostgreSQL)
- **Application:** Multi-tier (React frontend, NestJS backend, PostgreSQL)
- **CI/CD:** GitHub Actions with self-hosted runner

---

### Interview-Ready Talking Points

#### "Tell me about a challenging problem you solved"

**Story: The 503 Debugging Marathon**

"I encountered a 503 error when trying to access my Kubernetes application. What started as a simple connectivity issue turned into a deep dive through the entire networking stack.

**Investigation approach:**
1. Checked application health - pods were running fine
2. Tested service endpoints - properly configured
3. Analyzed response headers - wrong nginx version
4. Discovered port conflict with host service

**Root causes found:**
- Host nginx blocking port 80
- NodePort using non-standard ports
- Missing DNS configuration
- Pod scheduling conflicts with hostPort

**Solution implemented:**
I installed MetalLB to provide production-grade LoadBalancer services, achieving standard port access with proper load balancing.

**What I learned:**
This taught me the importance of systematic troubleshooting, understanding each layer of the network stack, and the difference between development shortcuts (NodePort) and production requirements (LoadBalancer)."

---

#### "Why use MetalLB instead of NodePort?"

"NodePort has several critical production issues:

**Security:** Exposes high-numbered ports (30000-32767) on every node, increasing attack surface

**User Experience:** Non-standard ports confuse users and break workflows. `https://myapp.com:30443` is not acceptable in production.

**Scalability:** Limited to ~2000 services due to port range constraints

**Reliability:** No automatic failover or intelligent load balancing

**MetalLB provides:**
- Cloud-native LoadBalancer experience on bare-metal
- Standard ports (80, 443)
- Proper load balancing
- Production-grade networking without cloud dependency

This is crucial for German companies running on-premises infrastructure like Siemens, BMW, or banks."

---

#### "Explain your troubleshooting methodology"

"I follow a systematic approach, working through the networking layers:

1. **Define the problem** - What's the expected vs actual behavior?
2. **Check application layer** - Are pods healthy? Check logs and events
3. **Verify service layer** - Are endpoints populated? Correct port mappings?
4. **Test network layer** - Can pods communicate? DNS working?
5. **Inspect ingress layer** - Host-based routing configured correctly?
6. **Check infrastructure** - Port conflicts? Resource constraints?

**Example:** When I got 503 errors:
- Pods: ✅ Healthy
- Services: ✅ Configured
- Network: ✅ Reachable
- Ingress: ⚠️ Wrong nginx responding
- Infrastructure: ❌ Port conflict found!

This layer-by-layer approach prevents assumptions and ensures you find root cause, not just symptoms."

---

### Next Steps

**Week 1: Observability**
- [ ] Install Prometheus + Grafana
- [ ] Set up custom metrics (API latency, request rates)
- [ ] Configure alerting rules
- [ ] Dashboard creation for application metrics
- [ ] PostgreSQL exporter for database monitoring

**Week 2: Security & Reliability**
- [ ] Implement cert-manager for TLS certificates
- [ ] Add Network Policies for pod-level firewall
- [ ] Set up Velero for backup and disaster recovery
- [ ] PostgreSQL automated backups (CronJob)
- [ ] Implement Horizontal Pod Autoscaler

**Week 3: Documentation & Portfolio**
- [ ] Create architecture diagrams (current state)
- [ ] Record demo video walkthrough
- [ ] Write comprehensive README
- [ ] Prepare interview presentation
- [ ] Practice explaining technical decisions

**Week 4: Job Applications**
- [ ] Update CV with homelab projects
- [ ] LinkedIn profile optimization
- [ ] Start applying to German DevOps positions
- [ ] Prepare for technical interviews

---

### Resources Used
- Kubernetes official documentation
- MetalLB documentation (https://metallb.universe.tf)
- k3s documentation
- ArgoCD documentation
- GitHub Actions documentation
- Nginx Ingress documentation
- Docker best practices
- Real-world troubleshooting and experimentation
- Layer-by-layer debugging methodology

---

### Reflections

**What Worked Well:**
- Systematic troubleshooting approach (layer by layer)
- Not giving up when faced with complex issues
- Understanding WHY things work, not just HOW
- Building on real hardware (not just cloud tutorials)
- Documenting the journey in real-time
- Asking questions and seeking clarity

**What I'd Do Differently:**
- Set up monitoring earlier (would have helped debug faster)
- Take screenshots during each troubleshooting step
- Create network diagrams before starting
- Test each component in isolation first

**Most Valuable Lessons:**

1. **Production vs Development**: Understanding the difference between what works for learning and what's acceptable in production (NodePort vs LoadBalancer)

2. **Systematic Debugging**: Don't guess - test each layer methodically

3. **Network Stack Understanding**: Every layer matters - application, service, ingress, infrastructure

4. **Tool Selection**: Choose tools based on environment (MetalLB for bare-metal, cloud LBs for cloud, hostPort for single-node dev)

5. **Port Conflicts**: Host services can block containerized services - check the full stack

**Personal Growth:**
This journey transformed my understanding from "following tutorials" to "solving real production problems." The 10-hour debugging marathon was frustrating but incredibly valuable - these are the experiences that make you a real DevOps engineer, not just someone who can copy YAML files.

**Interview Confidence:**
I can now confidently discuss:
- Kubernetes networking in production
- When to use different service types
- Load balancing strategies
- On-premises vs cloud architectures
- Troubleshooting complex system issues
- Making architectural decisions based on requirements

---

### Breakthrough Moments

**December 28:** "I have a Kubernetes cluster running!" 🎉

**December 29:** "I understand the difference between K8s secrets and GitHub secrets!" 💡

**December 30:** "ArgoCD is syncing from my Git repo - true GitOps!" 🚀

**December 31:** "I achieved production-grade networking on bare-metal - MetalLB is working!" ⭐

**Next:** "My homelab has full observability with Prometheus and Grafana!" (Coming soon...)

---

*Last Updated: December 31, 2025, 8:00 PM*
*Total Time Invested: ~28 hours*
*Production-Ready Systems: GitOps ✅ | Networking ✅ | Monitoring ⏳*