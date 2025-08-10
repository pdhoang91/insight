# 🚀 Development Guide

## Quick Start

### Option 1: From Project Root (Recommended)
```bash
# Install frontend dependencies
npm run frontend:install

# Start frontend only
npm run dev

# Start backend services
npm run backend:up

# Start both backend and frontend
npm run full:dev
```

### Option 2: From Frontend Directory
```bash
cd frontend
npm install
npm run dev
```

## 🐛 Common Issues & Solutions

### 1. Image Loading Errors
```
⨯ The requested resource isn't a valid image for /images/placeholder.svg
```

**Solution**: Updated SafeImage component to use PNG fallback instead of SVG.

### 2. npm run dev from Wrong Directory
```
npm error code ENOENT
npm error path .../insight/package.json
```

**Solution**: 
- Use `npm run dev` from project root (uses the new package.json)
- Or use `cd frontend && npm run dev`

## 📁 Project Structure

```
insight/
├── package.json          # Root package.json with shortcuts
├── frontend/             # Next.js frontend
│   ├── package.json      # Frontend dependencies
│   └── ...
├── backend/              # Go microservices
│   ├── application/      # Main API service
│   ├── auth-service/     # Authentication service
│   └── ...
└── docker-compose.yml    # Backend services
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend development server |
| `npm run build` | Build frontend for production |
| `npm run backend:up` | Start all backend services |
| `npm run backend:down` | Stop all backend services |
| `npm run full:dev` | Start backend + frontend |

## 🌐 Service URLs

- **Frontend**: http://localhost:3000
- **Main API**: http://localhost:8080
- **Auth Service**: http://localhost:8081
- **Image Service**: http://localhost:8082

## 🔍 Debugging

### Check if services are running:
```bash
docker-compose ps
```

### View backend logs:
```bash
npm run backend:logs
```

### Frontend logs:
Check the terminal where `npm run dev` is running. 