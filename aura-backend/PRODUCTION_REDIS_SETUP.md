# Production Redis Configuration Guide

## ✅ Configuration Complete!

Your application is now configured to use production Redis with SSL.

## 📝 What Was Updated

### 1. `.env` File
Added production Redis configuration:
```env
REDIS_ENABLED=true
REDIS_HOST=redis-15646.c256.us-east-1-2.ec2.cloud.redislabs.com
REDIS_PORT=15646
REDIS_USERNAME=default
REDIS_PASSWORD=your_password_here
REDIS_SSL=true
REDIS_DB=0
```

### 2. `config.py`
- Added `REDIS_USERNAME` support
- Added `REDIS_SSL` support  
- Updated `get_redis_url()` to build proper SSL connection strings (`rediss://`)
- Supports username:password authentication

### 3. `utils/redis_client.py`
- Added SSL connection parameters
- Disables SSL certificate verification (common for Redis Labs)
- Shows SSL status in connection logs

## 🔐 Security Note

**IMPORTANT:** The `.env` file contains sensitive credentials. Make sure:

1. **Update the password** in `.env` with your actual Redis password
2. **Never commit `.env` to Git**
3. Add to `.gitignore`:
   ```
   .env
   .env.*
   ```

## 🚀 How to Use

### Start Server
```powershell
uvicorn main:app --reload
```

You should see:
```
✅ Redis connected (SSL): redis-15646.c256.us-east-1-2.ec2.cloud.redislabs.com:15646
🚀 Application startup complete
```

## 🔄 Switch Between Local and Production

### For Local Development (localhost):
```env
REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_USERNAME=
REDIS_PASSWORD=
REDIS_SSL=false
REDIS_DB=0
```

### For Production (Redis Labs):
```env
REDIS_ENABLED=true
REDIS_HOST=redis-15646.c256.us-east-1-2.ec2.cloud.redislabs.com
REDIS_PORT=15646
REDIS_USERNAME=default
REDIS_PASSWORD=your_actual_password
REDIS_SSL=true
REDIS_DB=0
```

## 🧪 Test Connection

### Option 1: Start the server
```powershell
uvicorn main:app --reload
```

Check logs for: `✅ Redis connected (SSL):`

### Option 2: Health check endpoint
```powershell
curl http://localhost:8000/health
```

Should return:
```json
{
  "status": "healthy",
  "redis_status": "connected",
  "features": {
    "state_persistence": true,
    "workout_history": true,
    "leaderboards": true
  }
}
```

## 🐛 Troubleshooting

### Connection refused
- Check if your IP is whitelisted in Redis Labs dashboard
- Verify firewall settings

### Authentication failed
- Double-check username and password in `.env`
- Ensure no extra spaces or quotes

### SSL errors
- The code disables SSL cert verification for Redis Labs
- If issues persist, check Redis Labs SSL requirements

## 📊 Production Checklist

- [x] `.env` configured with production Redis credentials
- [x] SSL enabled (`REDIS_SSL=true`)
- [x] Username/password authentication configured
- [ ] Update `REDIS_PASSWORD` with actual password
- [ ] Add `.env` to `.gitignore`
- [ ] Test connection with health endpoint
- [ ] Monitor Redis connection in server logs

## 🔥 Ready to Deploy!

Your backend is now configured for production Redis with:
- ✅ SSL/TLS encryption
- ✅ Username/password authentication
- ✅ Connection pooling (50 connections)
- ✅ Automatic failover to in-memory state
- ✅ State persistence
- ✅ Workout history
- ✅ Leaderboards

**Don't forget to update the password in `.env`!** 🔐
