# 🚀 Cloud Deployment Instructions

## Prerequisites
1. Ensure your trained models (*.pkl files) are in the project directory
2. Test the API locally first: `python cloud_api_server.py`
3. Have your cloud platform CLI tools installed

## 🔥 Quick Deploy Options

### 1. Heroku (Easiest)
```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-iot23-api

# Add Python buildpack
heroku buildpacks:set heroku/python

# Deploy
git add .
git commit -m "Deploy IoT-23 ML API"
git push heroku main

# Scale up
heroku ps:scale web=1

# View logs
heroku logs --tail
```

### 2. Railway (Simple)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up

# Your API will be available at the provided URL
```

### 3. Render (Free Tier Available)
```bash
# Connect your GitHub repo to Render
# Render will automatically detect the render.yaml config
# Deploy with one click from the Render dashboard
```

### 4. DigitalOcean App Platform
```bash
# Install doctl CLI
# Create app from spec
doctl apps create --spec .do/app.yaml

# Monitor deployment
doctl apps list
```

### 5. Google Cloud Platform
```bash
# Install gcloud CLI
gcloud init

# Deploy to App Engine
gcloud app deploy app.yaml

# View your app
gcloud app browse
```

### 6. AWS Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli

# Initialize and deploy
eb init -p python-3.9 iot23-ml-api
eb create production
eb deploy

# View status
eb status
eb logs
```

### 7. Azure Web Apps
```bash
# Install Azure CLI
az login

# Create resource group and app service plan
az group create --name iot23-rg --location "East US"
az appservice plan create --name iot23-plan --resource-group iot23-rg --sku B1 --is-linux

# Create web app
az webapp create --resource-group iot23-rg --plan iot23-plan --name your-iot23-api --runtime "PYTHON|3.9"

# Deploy code
az webapp deployment source config-zip --resource-group iot23-rg --name your-iot23-api --src deployment.zip
```

## 🔧 Environment Variables
Set these environment variables in your cloud platform:

- `FLASK_ENV=production`
- `PYTHONPATH=/app` (if needed)

## 🔒 Security Considerations

### 1. API Rate Limiting
- Most platforms provide built-in rate limiting
- Configure appropriate limits for your use case

### 2. Authentication (Optional)
Add API key authentication for production:
```python
# Add to cloud_api_server.py
@app.before_request
def require_api_key():
    if request.endpoint in ['predict', 'predict_simple']:
        api_key = request.headers.get('X-API-Key')
        if api_key != os.environ.get('API_KEY'):
            return jsonify({'error': 'Invalid API key'}), 401
```

### 3. HTTPS
- All major platforms provide automatic HTTPS
- Ensure your ESP32 uses HTTPS endpoints

### 4. Monitoring
- Enable platform monitoring and alerts
- Monitor API response times and error rates
- Set up log aggregation

## 📊 Performance Optimization

### 1. Model Loading
- Models are loaded once at startup
- Consider model caching for faster responses

### 2. Scaling
- Configure auto-scaling based on CPU/memory usage
- Start with 1 instance, scale up as needed

### 3. Caching
- Add Redis caching for frequent predictions
- Cache model predictions for identical inputs

## 🧪 Testing Your Deployment

### Test the API endpoints:
```bash
# Health check
curl https://your-api-url.com/health

# Simple prediction
curl -X POST https://your-api-url.com/predict/simple \
  -H "Content-Type: application/json" \
  -d '{"id_orig_p": 443, "id_resp_p": 80, "duration": 0.5, "orig_bytes": 1500}'
```

### Update your ESP32 code:
```cpp
const char* api_server = "https://your-api-url.com";
```

## 💰 Cost Estimates (Monthly)

- **Heroku**: $7/month (Hobby tier)
- **Railway**: $5/month (Starter tier)  
- **Render**: Free tier available, $7/month (Starter)
- **DigitalOcean**: $5/month (Basic droplet)
- **Google Cloud**: ~$5-10/month (App Engine)
- **AWS**: ~$5-15/month (Elastic Beanstalk)
- **Azure**: ~$10/month (Basic tier)

## 🚨 Troubleshooting

### Common Issues:
1. **Model files not found**: Ensure *.pkl files are included in deployment
2. **Memory errors**: Increase instance memory or optimize models
3. **Timeout errors**: Increase request timeout settings
4. **Import errors**: Check requirements.txt includes all dependencies

### Debug Commands:
```bash
# View logs (platform-specific)
heroku logs --tail
railway logs
gcloud app logs tail -s default
eb logs
```

Choose the platform that best fits your needs and budget!
