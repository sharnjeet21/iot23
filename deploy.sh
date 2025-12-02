#!/bin/bash
# IoT-23 ML API Deployment Script

echo "🚀 Deploying IoT-23 ML API..."

# Check if model files exist
if [ ! -f "advanced_iot23_binary_rf.pkl" ] && [ ! -f "iot23_random_forest_model.pkl" ]; then
    echo "❌ Error: No model files found!"
    echo "Please ensure you have trained models before deployment."
    echo "Expected files: advanced_iot23_*.pkl or iot23_*.pkl"
    exit 1
fi

# Build and start services
echo "🔨 Building Docker containers..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 10

# Test the deployment
echo "🧪 Testing deployment..."
curl -f http://localhost/health || {
    echo "❌ Health check failed!"
    docker-compose logs
    exit 1
}

echo "✅ Deployment successful!"
echo "🌐 API is available at: http://localhost"
echo "📊 Health check: http://localhost/health"
echo "🔍 Prediction endpoint: http://localhost/predict/simple"

echo ""
echo "📋 Useful commands:"
echo "  View logs: docker-compose logs -f"
echo "  Stop services: docker-compose down"
echo "  Restart: docker-compose restart"
echo "  Update: docker-compose pull && docker-compose up -d"
