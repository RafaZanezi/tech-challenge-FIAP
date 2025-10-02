# Deployment Timeout Issues - Analysis and Solutions

## Problem
The deployment is timing out during the rollout phase:
```
Waiting for deployment "workshop-app-deployment" rollout to finish: 0 of 3 updated replicas are available...
error: timed out waiting for the condition
```

## Root Cause Analysis

### 1. Database Credentials Mismatch ✅ **FIXED**
- **Issue**: Secret had `user:password` but PostgreSQL expected `postgres:admin`
- **Solution**: Updated secret with correct base64 encoded values
- **Files Modified**: `k8s/secret.yaml`

### 2. Aggressive Health Checks ✅ **IMPROVED**
- **Issue**: Readiness probe was too aggressive (10s initial delay, 5s timeout)
- **Solution**: Increased timeouts and delays for startup
- **New Settings**:
  - Liveness: 60s initial delay, 30s period, 10s timeout, 5 failures
  - Readiness: 45s initial delay, 15s period, 10s timeout, 10 failures
- **Health Endpoint**: Changed from `/` to `/health` (tests DB connection)

### 3. PostgreSQL Startup Dependencies ✅ **IMPROVED**
- **Issue**: App might start before PostgreSQL is fully ready
- **Solution**: Added additional checks and wait time in workflow
- **Improvements**:
  - Extra 30s wait after PostgreSQL pod ready
  - Database connectivity test with `pg_isready`
  - Better error handling

### 4. Deployment Configuration ✅ **OPTIMIZED**
- **Issue**: 3 replicas might be too many for development environment
- **Solution**: Reduced to 1 replica for development
- **Timeout**: Increased rollout timeout from 300s to 600s

### 5. Enhanced Debugging ✅ **ADDED**
- **Added**: Pod logs, events, and detailed status checks
- **Purpose**: Better visibility into deployment failures

## Changes Made

### `/k8s/secret.yaml`
```yaml
# Updated credentials to match PostgreSQL configuration
DB_USER: cG9zdGdyZXM=           # postgres (base64)
DB_PASSWORD: YWRtaW4=           # admin (base64)
DATABASE_URL: cG9zdGdyZXNxbDov... # postgresql://postgres:admin@postgres-service:5432/workshop_db
```

### `/k8s/deployment.yaml`
```yaml
# Improved health checks with proper endpoint and timings
livenessProbe:
  httpGet:
    path: /health              # Uses /health endpoint that tests DB
    port: 3000
  initialDelaySeconds: 60      # More time for startup
  periodSeconds: 30
  timeoutSeconds: 10
  failureThreshold: 5

readinessProbe:
  httpGet:
    path: /health
    port: 3000
  initialDelaySeconds: 45
  periodSeconds: 15
  timeoutSeconds: 10
  failureThreshold: 10         # More lenient for startup
```

### `.github/workflows/ci-cd.yml`
```yaml
# PostgreSQL deployment with enhanced readiness checks
- name: Deploy PostgreSQL Database
  run: |
    kubectl apply -f k8s/namespace.yaml
    kubectl apply -f k8s/secret.yaml
    kubectl apply -f k8s/configmap.yaml
    kubectl apply -f k8s/postgres.yaml
    
    # Wait for pod readiness
    kubectl wait --for=condition=ready pod -l app=postgres -n workshop-app --timeout=300s
    
    # Additional initialization time
    sleep 30
    
    # Test database connectivity
    kubectl exec -n workshop-app deployment/postgres-deployment -- pg_isready -U postgres -d workshop_db

# Application deployment with better configuration
- name: Update Kustomization with new image
  run: |
    cd k8s
    sed -i "s|newName:.*|newName: tech-challenge-app|" kustomization.yaml
    sed -i "s|newTag:.*|newTag: latest|" kustomization.yaml
    sed -i "s|count:.*|count: 1|" kustomization.yaml  # 1 replica for dev

# Deployment with extended timeout and better debugging
- name: Deploy Application
  run: |
    kubectl delete deployment postgres-deployment -n workshop-app --ignore-not-found=true
    kubectl delete deployment workshop-app-deployment -n workshop-app --ignore-not-found=true
    sleep 5
    kubectl apply -k k8s/
    kubectl rollout status deployment/workshop-app-deployment -n workshop-app --timeout=600s
```

## Application Health Endpoint

The app already has a `/health` endpoint that:
- Tests database connectivity with `SELECT 1`
- Returns proper HTTP status codes (200/503)
- Provides detailed status information

```typescript
app.route('/health').get(async (_, res) => {
  try {
    const result = await this._dbConnection.query('SELECT 1 as health');
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
```

## Expected Behavior After Fixes

1. **PostgreSQL**: Starts and becomes ready within 5-6 minutes
2. **Application**: Waits for PostgreSQL, then starts with proper credentials
3. **Health Checks**: Use `/health` endpoint to verify both app and database
4. **Deployment**: Single replica for development, 10-minute timeout
5. **Debugging**: Detailed logs and status information if issues occur

## Next Steps

1. **Commit and push changes**
2. **Monitor CI/CD pipeline** - should complete within 10-15 minutes
3. **Check pod logs** if timeout still occurs
4. **Verify database connection** through health endpoint

## If Still Timing Out

If the deployment still times out, check:
```bash
kubectl get pods -n workshop-app -o wide
kubectl logs -l app=workshop-app -n workshop-app
kubectl describe pod <pod-name> -n workshop-app
kubectl get events -n workshop-app --sort-by='.lastTimestamp'
```

Common remaining issues could be:
- Image pull failures
- Resource constraints in Kind cluster
- Application startup errors
- Network connectivity issues