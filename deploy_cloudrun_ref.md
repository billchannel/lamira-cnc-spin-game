# CVC Spin Game - Google Cloud Run Deployment Guide

## Overview

This guide explains how to deploy the CVC Spin Game to Google Cloud Run, a fully managed serverless platform that automatically scales your web applications.

## Prerequisites

1. **Google Cloud Account**: Active GCP account with billing enabled
2. **Google Cloud SDK**: Installed and configured on your local machine
3. **Docker**: Installed locally for building container images
4. **Project Setup**: GCP project created and selected

### Installation Commands

```bash
# Install Google Cloud SDK
# macOS
brew install google-cloud-sdk

# Or download from: https://cloud.google.com/sdk/docs/install

# Initialize gcloud
gcloud init

# Login to your Google account
gcloud auth login

# Install Docker
# macOS
brew install docker

# Start Docker Desktop (macOS)
open -a Docker
```

## Deployment Steps

### Step 1: Project Configuration

```bash
# Set your project ID (replace with your actual project ID)
export PROJECT_ID="goog-ai-101"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  containerregistry.googleapis.com

# Verify project configuration
gcloud config list
```

### Step 2: Build Docker Image

```bash
# Navigate to project directory
cd /path/to/cvc-spin-game

# Build Docker image
docker build -t gcr.io/${PROJECT_ID}/cvc-spin-game:latest .

# Test the image locally (optional)
docker run -p 8080:8080 gcr.io/${PROJECT_ID}/cvc-spin-game:latest
```

### Step 3: Push to Container Registry

```bash
# Configure Docker to use gcloud as a credential helper
gcloud auth configure-docker

# Push the image to Google Container Registry
docker push gcr.io/${PROJECT_ID}/cvc-spin-game:latest
```

### Step 4: Deploy to Cloud Run

```bash
# Deploy to Cloud Run
gcloud run deploy cvc-spin-game \
  --image gcr.io/${PROJECT_ID}/cvc-spin-game:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0 \
  --port 8080

# Note: When prompted, allow unauthenticated access to make the app publicly accessible
```

### Step 5: Verify Deployment

```bash
# Get the service URL
gcloud run services describe cvc-spin-game \
  --platform managed \
  --region us-central1 \
  --format 'value(status.url)'

# Open the deployed application
open $(gcloud run services describe cvc-spin-game \
  --platform managed \
  --region us-central1 \
  --format 'value(status.url)')
```

## Configuration Options

### Environment Variables

```bash
# Deploy with custom environment variables
gcloud run deploy cvc-spin-game \
  --image gcr.io/${PROJECT_ID}/cvc-spin-game:latest \
  --platform managed \
  --region us-central1 \
  --set-env-vars="NODE_ENV=production" \
  --allow-unauthenticated
```

### Custom Domain

```bash
# Map custom domain (domain must be verified in your project)
gcloud run domain-mappings create \
  --service cvc-spin-game \
  --domain your-custom-domain.com \
  --region us-central1
```

### Resource Scaling

```bash
# Deploy with custom scaling configuration
gcloud run deploy cvc-spin-game \
  --image gcr.io/${PROJECT_ID}/cvc-spin-game:latest \
  --platform managed \
  --region us-central1 \
  --memory 256Mi \
  --cpu 0.5 \
  --max-instances 5 \
  --min-instances 1 \
  --concurrency 50
```

## Monitoring and Logging

### View Logs

```bash
# View real-time logs
gcloud logging tail "resource.type=cloud_run_revision AND resource.labels.service_name=cvc-spin-game"

# View recent logs
gcloud run logs read cvc-spin-game \
  --platform managed \
  --region us-central1 \
  --limit 50
```

### Monitoring Metrics

```bash
# View service details
gcloud run services describe cvc-spin-game \
  --platform managed \
  --region us-central1

# Get revision information
gcloud run revisions list \
  --service cvc-spin-game \
  --platform managed \
  --region us-central1
```

## Cost Optimization

### Set Resource Limits

```bash
# Deploy with minimal resource allocation for cost savings
gcloud run deploy cvc-spin-game \
  --image gcr.io/${PROJECT_ID}/cvc-spin-game:latest \
  --platform managed \
  --region us-central1 \
  --memory 128Mi \
  --cpu 1 \
  --max-instances 3 \
  --min-instances 0
```

### Enable CPU Throttling

```bash
# Deploy with CPU only allocated during request processing
gcloud run deploy cvc-spin-game \
  --image gcr.io/${PROJECT_ID}/cvc-spin-game:latest \
  --platform managed \
  --region us-central1 \
  --cpu-throttling
```

## Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Check Docker build logs
   docker build -t gcr.io/${PROJECT_ID}/cvc-spin-game:latest .
   ```

2. **Deployment Failures**:
   ```bash
   # Check deployment errors
   gcloud run services describe cvc-spin-game \
     --platform managed \
     --region us-central1
   ```

3. **Service Not Starting**:
   ```bash
   # Check container logs
   gcloud run logs read cvc-spin-game \
     --platform managed \
     --region us-central1 \
     --limit 100
   ```

### Cleanup Commands

```bash
# Delete the Cloud Run service
gcloud run services delete cvc-spin-game \
  --platform managed \
  --region us-central1

# Delete container images
gcloud container images delete gcr.io/${PROJECT_ID}/cvc-spin-game:latest

# Remove domain mapping (if configured)
gcloud run domain-mappings delete \
  --service cvc-spin-game \
  --domain your-custom-domain.com \
  --region us-central1
```

## CI/CD Integration

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up Google Cloud
        uses: google-github-actions/setup-gcloud@v0
        with:
          project_id: ${{ secrets.GCP_PROJECT_ID }}
          service_account_key: ${{ secrets.GCP_SA_KEY }}

      - name: Build and Push Docker Image
        run: |
          docker build -t gcr.io/${{ secrets.GCP_PROJECT_ID }}/cvc-spin-game:latest .
          gcloud auth configure-docker
          docker push gcr.io/${{ secrets.GCP_PROJECT_ID }}/cvc-spin-game:latest

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy cvc-spin-game \
            --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/cvc-spin-game:latest \
            --platform managed \
            --region us-central1 \
            --allow-unauthenticated
```

## Security Considerations

1. **HTTPS Only**: Cloud Run automatically provides HTTPS
2. **IAM Roles**: Use least privilege principle for service accounts
3. **Secrets Management**: Use Google Secret Manager for sensitive data
4. **VPC Access**: Configure VPC connector if needed for private resources

## Performance Tips

1. **Cold Start Optimization**: Set minimum instances to 1 for consistent performance
2. **Caching**: Leverage browser caching for static assets
3. **CDN**: Consider Cloud CDN for global content delivery
4. **Compress**: Enable gzip compression for faster load times

---

**Deployment Complete! 🚀**

Your CVC Spin Game is now deployed to Google Cloud Run and accessible via the provided URL. The service will automatically scale based on traffic and you only pay for the resources you use.