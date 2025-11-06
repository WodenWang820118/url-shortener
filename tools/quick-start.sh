#!/bin/bash

# URL Shortener Load Testing Quick Start Script
# This script helps you quickly set up and run load tests

set -e

echo "🚀 URL Shortener Load Testing Setup"
echo "===================================="
echo ""

# Function to check if a service is running
check_service() {
    local service=$1
    local url=$2
    if curl -s -f "$url" > /dev/null 2>&1; then
        echo "✅ $service is running"
        return 0
    else
        echo "❌ $service is not running"
        return 1
    fi
}

# Check prerequisites
echo "📋 Checking prerequisites..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi
echo "✅ Docker is running"

# Check if services are running
echo ""
echo "🔍 Checking services..."
check_service "Producer" "http://localhost:3001" || echo "   Run: pnpm run dev:producer"
check_service "Consumer" "http://localhost:3002" || echo "   Run: pnpm run dev:consumer"
check_service "Cassandra" "http://localhost:9042" || echo "   Run: docker-compose up -d cassandra"

echo ""
echo "📊 What would you like to do?"
echo ""
echo "1. Generate test data (via Producer API)"
echo "2. Generate test data (direct to Cassandra - fast)"
echo "3. Run burst load test"
echo "4. Run continuous load test"
echo "5. Start monitoring stack (Prometheus + Grafana)"
echo "6. Full demo setup (data + monitoring)"
echo "0. Exit"
echo ""

read -p "Enter your choice [0-6]: " choice

case $choice in
    1)
        echo ""
        read -p "How many URLs to generate? [default: 10000]: " count
        count=${count:-10000}
        read -p "Batch size? [default: 100]: " batch
        batch=${batch:-100}
        echo ""
        echo "🔄 Generating $count URLs via Producer API..."
        npx tsx tools/data-generator.ts producer "$count" "$batch"
        ;;
    2)
        echo ""
        read -p "How many URLs to generate? [default: 100000]: " count
        count=${count:-100000}
        read -p "Batch size? [default: 1000]: " batch
        batch=${batch:-1000}
        echo ""
        echo "🔄 Generating $count URLs directly in Cassandra..."
        npx tsx tools/data-generator.ts cassandra "$count" "$batch"
        ;;
    3)
        echo ""
        read -p "Concurrent users? [default: 50]: " users
        users=${users:-50}
        read -p "Requests per user? [default: 100]: " requests
        requests=${requests:-100}
        echo ""
        echo "🔥 Starting burst load test..."
        npx tsx tools/load-tester.ts burst "$users" "$requests"
        ;;
    4)
        echo ""
        read -p "Concurrent users? [default: 100]: " users
        users=${users:-100}
        read -p "Duration in seconds? [default: 60]: " duration
        duration=${duration:-60}
        echo ""
        echo "🔥 Starting continuous load test..."
        npx tsx tools/load-tester.ts continuous "$users" "$duration"
        ;;
    5)
        echo ""
        echo "🔧 Starting monitoring stack..."
        docker-compose up -d prometheus grafana
        echo ""
        echo "✅ Monitoring stack started!"
        echo "   📊 Prometheus: http://localhost:9090"
        echo "   📈 Grafana: http://localhost:3000 (admin/admin)"
        echo ""
        ;;
    6)
        echo ""
        echo "🎯 Setting up full demo environment..."
        echo ""
        
        # Start monitoring
        echo "1️⃣ Starting monitoring stack..."
        docker-compose up -d prometheus grafana
        sleep 3
        
        # Generate data
        echo ""
        echo "2️⃣ Generating test data (500,000 records)..."
        npx tsx tools/data-generator.ts cassandra 500000 10000
        
        echo ""
        echo "✅ Demo setup complete!"
        echo ""
        echo "📊 Access points:"
        echo "   - Consumer API: http://localhost:3002"
        echo "   - Consumer Metrics: http://localhost:3002/metrics"
        echo "   - Prometheus: http://localhost:9090"
        echo "   - Grafana: http://localhost:3000 (admin/admin)"
        echo ""
        echo "🚀 Ready to run load tests!"
        echo "   - Burst test: pnpm run load:test:burst 200 500"
        echo "   - Continuous: pnpm run load:test:continuous 200 300"
        echo ""
        ;;
    0)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "✨ Done!"
