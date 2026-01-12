# RUN at local
```bash
# 構建映像
docker build -t cvc-spin-game .

# 運行容器
docker run -p 8080:8080 cvc-spin-game
```





# Deploy to GCP CloudRun
##  this project uses contact2bill@gmail.com for GCP

### 1. docker build
docker build --platform linux/amd64 \
  -t gcr.io/goog-ai-101/cvc-game:latest .

### 2. docker push
docker push gcr.io/goog-ai-101/cvc-game:latest

### 3. gcloud run
gcloud run deploy cvc-game \
    --image gcr.io/goog-ai-101/cvc-game:latest \
    --platform managed \
    --region us-west1 \
    --allow-unauthenticated \
    --memory 256Mi \
    --max-instances 3 \
    --min-instances 1 \
    --concurrency 15

URL:
https://cvc-game-880404139350.us-west1.run.app




