#!/bin/bash

# OneSoko Docker Deployment Script
# Usage: ./deploy.sh [platform]
# Platforms: railway, render, digitalocean, heroku

PLATFORM=${1:-railway}

echo "🚀 Deploying OneSoko to $PLATFORM..."

case $PLATFORM in
    "railway")
        echo "📦 Deploying to Railway..."
        echo "1. Make sure you have Railway CLI installed: curl -fsSL https://railway.app/install.sh | sh"
        echo "2. Login: railway login"
        echo "3. Create project: railway init"
        echo "4. Set environment variables:"
        echo "   railway variables set DEBUG=False"
        echo "   railway variables set SECRET_KEY=your-secret-key"
        echo "   railway variables set DATABASE_URL=mysql://user:pass@host:port/db"
        echo "5. Deploy: railway up"
        ;;

    "render")
        echo "📦 Deploying to Render..."
        echo "1. Go to https://render.com"
        echo "2. Create new Web Service from Git"
        echo "3. Connect your GitHub repo"
        echo "4. Set build command: docker build -t onesoko ."
        echo "5. Set start command: docker run -p 8000:8000 onesoko"
        echo "6. Add environment variables in Render dashboard"
        ;;

    "digitalocean")
        echo "📦 Deploying to DigitalOcean..."
        echo "1. Go to https://cloud.digitalocean.com/apps"
        echo "2. Create new app from GitHub"
        echo "3. Select your repository"
        echo "4. Choose Docker as build method"
        echo "5. Set environment variables"
        echo "6. Deploy"
        ;;

    "heroku")
        echo "📦 Deploying to Heroku..."
        echo "1. Install Heroku CLI: curl https://cli-assets.heroku.com/install.sh | sh"
        echo "2. Login: heroku login"
        echo "3. Create app: heroku create your-app-name"
        echo "4. Set buildpack: heroku buildpacks:set heroku/python"
        echo "5. Add PostgreSQL: heroku addons:create heroku-postgresql:hobby-dev"
        echo "6. Set environment variables: heroku config:set DEBUG=False SECRET_KEY=your-key"
        echo "7. Deploy: git push heroku main"
        ;;
    *)
        echo "❌ Unknown platform: $PLATFORM"
        echo "Available platforms: railway, render, digitalocean, heroku"
        exit 1
        ;;
esac

echo "✅ Deployment instructions provided!"
echo "📝 Don't forget to:"
echo "   - Set a strong SECRET_KEY"
echo "   - Configure database URL"
echo "   - Set DEBUG=False"
echo "   - Configure CORS for your frontend domain"
