# OneSoko Frontend-Backend Integration

This document explains how the OneSoko frontend (React) and backend (Django) are integrated to work together seamlessly.

## Architecture Overview

OneSoko uses a modern full-stack architecture:

- **Backend**: Django REST Framework API
- **Frontend**: React with TypeScript and Vite
- **Database**: MySQL
- **Caching**: Redis
- **Authentication**: JWT tokens
- **Deployment**: Docker with Nginx

## Development Setup

### Prerequisites

- Python 3.13+
- Node.js 18+
- MySQL 8.0+
- Redis (optional for development)

### Quick Start

1. **Clone and setup the project**:
   ```bash
   git clone <repository-url>
   cd OneSoko
   ```

2. **Run the development environment**:
   ```bash
   ./dev_server.sh
   ```

   This script will:
   - Activate the virtual environment
   - Install Python dependencies
   - Run Django migrations
   - Start the Django backend on http://localhost:8000
   - Install npm dependencies
   - Start the React frontend on http://localhost:5173

### Manual Setup

If you prefer to set up manually:

1. **Backend Setup**:
   ```bash
   # Create virtual environment
   python -m venv env
   source env/bin/activate  # On Windows: env\Scripts\activate

   # Install dependencies
   pip install -r requirements_basic.txt

   # Run migrations
   python manage.py migrate

   # Start Django server
   python manage.py runserver 8000
   ```

2. **Frontend Setup**:
   ```bash
   # Navigate to frontend directory
   cd OneSokoApp/OneSokoFrontend

   # Install dependencies
   npm install

   # Start development server
   npm run dev
   ```

## Integration Features

### 1. API Communication

The frontend communicates with the backend through a well-defined REST API:

- **Base URL**: `http://localhost:8000/api` (development)
- **Authentication**: JWT Bearer tokens
- **Endpoints**: See `OneSokoApp/urls.py` for full API documentation

### 2. Authentication Flow

1. User logs in through the React frontend
2. Django returns JWT access and refresh tokens
3. Frontend stores tokens in localStorage
4. Axios interceptors automatically add tokens to requests
5. Automatic token refresh when access tokens expire

### 3. Static File Handling

- **Development**: Vite dev server serves frontend files
- **Production**: Django serves built frontend from `staticfiles/`
- **Assets**: Images, CSS, and JS are properly versioned and cached

### 4. CORS Configuration

Cross-Origin Resource Sharing is configured to allow:
- Development frontend (localhost:5173)
- Production frontend (through Nginx)
- Proper credentials and headers

### 5. Routing Integration

- **Frontend Routes**: Handled by React Router
- **Backend Routes**: Django serves the main `index.html` template
- **Catch-all**: Any unmatched route serves the React app

## Production Deployment

### Building for Production

1. **Build the frontend**:
   ```bash
   python manage.py build_frontend --production
   ```

2. **Collect static files**:
   ```bash
   python manage.py collectstatic --noinput
   ```

3. **Or use the build script**:
   ```bash
   ./build_production.sh
   ```

### Docker Deployment

1. **Full-stack deployment**:
   ```bash
   docker-compose -f docker-compose.fullstack.yml up --build
   ```

   This includes:
   - Django application
   - MySQL database
   - Redis cache
   - Nginx reverse proxy

2. **Access the application**:
   - Frontend: http://localhost:8080
   - Admin: http://localhost:8080/admin
   - API: http://localhost:8080/api

## File Structure

```
OneSoko/
├── MyOneSoko/              # Django project settings
│   ├── settings.py         # Main settings
│   ├── urls.py            # URL routing
│   └── ...
├── OneSokoApp/            # Main Django app
│   ├── urls.py            # API endpoints
│   ├── views.py           # API views
│   ├── OneSokoFrontend/   # React frontend
│   │   ├── src/           # React source code
│   │   ├── dist/          # Built frontend (production)
│   │   ├── package.json   # npm dependencies
│   │   └── vite.config.ts # Vite configuration
│   └── management/        # Django management commands
├── templates/             # Django templates
│   └── index.html         # Main frontend template
├── staticfiles/           # Collected static files
├── requirements_basic.txt # Python dependencies
├── docker-compose.*.yml   # Docker configurations
├── dev_server.sh         # Development script
└── build_production.sh   # Production build script
```

## Environment Variables

### Development
- `DEBUG=True`
- `CORS_ALLOW_ALL_ORIGINS=True`

### Production
- `DEBUG=False`
- `DATABASE_URL=mysql://...`
- `REDIS_URL=redis://...`

## API Integration

### Frontend API Service

The frontend uses a centralized API service (`src/services/api.ts`):

```typescript
// Automatic environment detection
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:8000/api'  // Development
  : '/api';                      // Production (through Nginx)

// Automatic JWT token handling
// Automatic token refresh
// Error handling and retries
```

### Backend API Views

The backend provides RESTful endpoints:

- Authentication: `/api/auth/`
- Products: `/api/products/`
- Orders: `/api/orders/`
- Users: `/api/users/`
- And more...

## Performance Optimizations

1. **Frontend**:
   - Code splitting with dynamic imports
   - Asset optimization with Vite
   - Service worker for caching
   - Lazy loading of components

2. **Backend**:
   - Database query optimization
   - Redis caching
   - Static file compression
   - API response optimization

3. **Integration**:
   - Optimized static file serving
   - Proper HTTP caching headers
   - Gzip compression

## Troubleshooting

### Common Issues

1. **CORS Errors**:
   - Check `CORS_ALLOWED_ORIGINS` in settings
   - Verify frontend is running on allowed port

2. **Static Files Not Loading**:
   - Run `python manage.py collectstatic`
   - Check `STATICFILES_DIRS` configuration

3. **API Connection Failed**:
   - Verify backend is running on port 8000
   - Check frontend API base URL configuration

4. **Authentication Issues**:
   - Clear localStorage and re-login
   - Check JWT token expiration

### Development Commands

```bash
# Frontend development
npm run dev              # Start frontend dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Backend development
python manage.py runserver           # Start Django server
python manage.py build_frontend      # Build frontend from Django
python manage.py collectstatic       # Collect static files
python manage.py migrate             # Run database migrations

# Combined development
./dev_server.sh                      # Start both frontend and backend
./dev_server.sh --backend-only       # Start only backend
./dev_server.sh --frontend-only      # Start only frontend
./build_production.sh                # Build for production
```

## Contributing

When making changes that affect the frontend-backend integration:

1. Test in development mode with both servers running
2. Test the production build with `./build_production.sh`
3. Test Docker deployment if possible
4. Update this documentation if needed

## Security Considerations

1. **Authentication**: JWT tokens with proper expiration
2. **CORS**: Restricted to specific origins in production
3. **Static Files**: Proper headers and versioning
4. **API**: Rate limiting and authentication required
5. **Database**: Parameterized queries and proper validation
