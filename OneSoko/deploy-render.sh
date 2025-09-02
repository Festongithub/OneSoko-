#!/bin/bash

# OneSoko Render Deployment Script
echo "🚀 Deploying OneSoko to Render..."

echo "📋 Prerequisites:"
echo "1. Create account at https://render.com"
echo "2. Connect your GitHub repository"
echo ""

echo "📝 Render Configuration:"
echo "Service Type: Web Service"
echo "Build Command: docker build -t onesoko ."
echo "Start Command: docker run -p 8000:8000 onesoko"
echo ""

echo "🔧 Environment Variables to set in Render:"
echo "DEBUG=False"
echo "SECRET_KEY=your-super-secure-secret-key-here"
echo "DJANGO_SETTINGS_MODULE=MyOneSoko.settings"
echo "DATABASE_URL=mysql://user:password@host:port/database"
echo "REDIS_URL=redis://host:port"
echo "ALLOWED_HOSTS=your-render-app.onrender.com"
echo "CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app"
echo ""

echo "🗄️ Database Setup:"
echo "1. Create a MySQL database on Render"
echo "2. Copy the DATABASE_URL from database settings"
echo "3. Add it to your web service environment variables"
echo ""

echo "✅ Deployment Steps:"
echo "1. Go to https://dashboard.render.com"
echo "2. Click 'New' → 'Web Service'"
echo "3. Connect your GitHub repo: Festongithub/OneSoko-"
echo "4. Configure as above"
echo "5. Click 'Create Web Service'"
echo ""

echo "🔗 After deployment:"
echo "1. Copy your Render app URL"
echo "2. Update .env.production:"
echo "   VITE_API_BASE_URL=https://your-app.onrender.com/api"
echo "3. Commit and push changes"
echo ""

echo "🎉 Your app will be live at: https://your-app.onrender.com"
