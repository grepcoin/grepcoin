# GrepCoin Infrastructure

Production deployment on Google Kubernetes Engine (GKE) with grepcoin.io domain.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        grepcoin.io                               │
│                    (Squarespace DNS)                             │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Google Cloud Platform                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │   Nginx     │     │    Cert     │     │   Let's     │       │
│  │   Ingress   │────▶│   Manager   │────▶│  Encrypt    │       │
│  │  Controller │     │             │     │   (SSL)     │       │
│  └─────────────┘     └─────────────┘     └─────────────┘       │
│         │                                                        │
│         ▼                                                        │
│  ┌────────────────────────────────────────────────────────┐     │
│  │                    GKE Autopilot                        │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐              │     │
│  │  │   Pod    │  │   Pod    │  │   Pod    │  (2-10)      │     │
│  │  │ Next.js  │  │ Next.js  │  │ Next.js  │              │     │
│  │  └──────────┘  └──────────┘  └──────────┘              │     │
│  └────────────────────────────────────────────────────────┘     │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      NeonDB                               │   │
│  │                  (Serverless Postgres)                    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Domain Configuration (Squarespace)

### Current Nginx Ingress IP

The nginx-ingress controller has been assigned IP: **34.94.204.248**

### Configure Squarespace DNS

1. Log in to Squarespace
2. Go to **Settings** → **Domains** → **grepcoin.io**
3. Click **DNS Settings**
4. Delete any existing A records for @ (root)
5. Add these DNS records:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | `34.94.204.248` | 3600 |
| A | www | `34.94.204.248` | 3600 |
| CNAME | docs | grepcoin.github.io | 3600 |

### Step 3: Verify DNS Propagation

```bash
# Check A record
dig grepcoin.io +short

# Check www
dig www.grepcoin.io +short

# Check docs subdomain
dig docs.grepcoin.io +short
```

---

## GKE Cluster Setup

### Prerequisites

```bash
# Install gcloud CLI
brew install google-cloud-sdk

# Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable container.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable compute.googleapis.com
```

### Create GKE Cluster

```bash
# Create cluster (Autopilot mode - recommended)
gcloud container clusters create-auto grepcoin-cluster \
  --region us-central1 \
  --release-channel regular

# Or Standard mode with more control
gcloud container clusters create grepcoin-cluster \
  --zone us-central1-a \
  --num-nodes 3 \
  --machine-type e2-medium \
  --enable-autoscaling \
  --min-nodes 2 \
  --max-nodes 10 \
  --enable-autorepair \
  --enable-autoupgrade
```

### Get Credentials

```bash
gcloud container clusters get-credentials grepcoin-cluster \
  --zone us-central1-a \
  --project YOUR_PROJECT_ID
```

### Reserve Static IP

```bash
gcloud compute addresses create grepcoin-ip --global
```

---

## Secrets Management

### Option 1: Kubernetes Secrets (Simple)

```bash
# Create secrets from .env file
kubectl create namespace grepcoin

kubectl create secret generic grepcoin-secrets \
  --namespace grepcoin \
  --from-env-file=.env.production
```

### Option 2: Google Secret Manager (Recommended)

```bash
# Create secrets in Secret Manager
gcloud secrets create database-url --data-file=- <<< "postgresql://..."
gcloud secrets create nextauth-secret --data-file=- <<< "your-secret"

# Grant GKE access
gcloud secrets add-iam-policy-binding database-url \
  --member="serviceAccount:YOUR_PROJECT_ID.svc.id.goog[grepcoin/grepcoin-sa]" \
  --role="roles/secretmanager.secretAccessor"
```

---

## Deployment

### Manual Deployment

```bash
# Build and push image
docker build -t gcr.io/YOUR_PROJECT_ID/grepcoin-web:latest -f apps/web/Dockerfile .
docker push gcr.io/YOUR_PROJECT_ID/grepcoin-web:latest

# Apply manifests
kubectl apply -f infra/k8s/namespace.yaml
kubectl apply -f infra/k8s/configmap.yaml
kubectl apply -f infra/k8s/secret.yaml  # Or use Secret Manager
kubectl apply -f infra/k8s/deployment.yaml
kubectl apply -f infra/k8s/service.yaml
kubectl apply -f infra/k8s/ingress.yaml
kubectl apply -f infra/k8s/hpa.yaml

# Check status
kubectl get pods -n grepcoin
kubectl get services -n grepcoin
kubectl get ingress -n grepcoin
```

### Automated Deployment (GitHub Actions)

1. Set up Workload Identity Federation in GCP
2. Add secrets to GitHub repository:
   - `GCP_PROJECT_ID`
   - `GCP_WORKLOAD_IDENTITY_PROVIDER`
   - `GCP_SERVICE_ACCOUNT`

Push to `main` branch triggers automatic deployment.

---

## GitHub Actions Secrets Setup

### Create Service Account

```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions"

# Grant permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/container.developer"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"
```

### Configure Workload Identity

```bash
# Create workload identity pool
gcloud iam workload-identity-pools create "github" \
  --location="global" \
  --display-name="GitHub Actions Pool"

# Create provider
gcloud iam workload-identity-pools providers create-oidc "github-provider" \
  --location="global" \
  --workload-identity-pool="github" \
  --display-name="GitHub Provider" \
  --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
  --issuer-uri="https://token.actions.githubusercontent.com"

# Allow GitHub to impersonate service account
gcloud iam service-accounts add-iam-policy-binding \
  github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github/attribute.repository/grepcoin/grepcoin"
```

### Add to GitHub Secrets

| Secret | Value |
|--------|-------|
| `GCP_PROJECT_ID` | your-project-id |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | projects/PROJECT_NUMBER/locations/global/workloadIdentityPools/github/providers/github-provider |
| `GCP_SERVICE_ACCOUNT` | github-actions@YOUR_PROJECT_ID.iam.gserviceaccount.com |

---

## Monitoring

### View Logs

```bash
# Pod logs
kubectl logs -f deployment/grepcoin-web -n grepcoin

# All pod logs
kubectl logs -f -l app=grepcoin -n grepcoin
```

### Check Health

```bash
# Pod status
kubectl get pods -n grepcoin -w

# HPA status
kubectl get hpa -n grepcoin

# Ingress status
kubectl describe ingress grepcoin-ingress -n grepcoin
```

### Cloud Monitoring

Enable in GCP Console:
- Cloud Monitoring
- Cloud Logging
- Error Reporting

---

## Troubleshooting

### Certificate Not Provisioning

```bash
# Check managed certificate status
kubectl describe managedcertificate grepcoin-cert -n grepcoin
```

Certificates can take 15-60 minutes to provision.

### Pods Not Starting

```bash
# Check events
kubectl get events -n grepcoin --sort-by='.lastTimestamp'

# Describe pod
kubectl describe pod <pod-name> -n grepcoin
```

### Ingress 502 Errors

- Wait for pods to pass readiness checks
- Check backend service health in GCP Console

---

## Cost Estimate

| Resource | Specification | Monthly Cost (est.) |
|----------|--------------|---------------------|
| GKE Autopilot | 2-10 pods | $50-150 |
| Load Balancer | 1 global | $20 |
| Static IP | 1 global | $7 |
| Container Registry | ~1GB | $5 |
| **Total** | | **$80-180/mo** |

*NeonDB costs are separate (typically $0-25/mo for starter tier)*

---

## Files Reference

| File | Purpose |
|------|---------|
| `apps/web/Dockerfile` | Multi-stage Next.js build |
| `infra/k8s/namespace.yaml` | Kubernetes namespace |
| `infra/k8s/configmap.yaml` | Non-secret configuration |
| `infra/k8s/secret.yaml` | Secret template (don't commit!) |
| `infra/k8s/deployment.yaml` | Pod deployment spec |
| `infra/k8s/service.yaml` | ClusterIP service |
| `infra/k8s/ingress.yaml` | Ingress + SSL certificate |
| `infra/k8s/hpa.yaml` | Horizontal pod autoscaler |
| `.github/workflows/deploy-gke.yml` | CI/CD pipeline |
