# Kubernetes Deployment Fixes

## Problems Identified

The CI/CD pipeline was failing with two main Kubernetes deployment issues:

### 1. Selector Immutability Error
```
Deployment.apps "postgres-deployment" is invalid: spec.selector: Invalid value: v1.LabelSelector{...}: field is immutable
```

**Cause**: Kubernetes doesn't allow changing deployment selectors after creation. The kustomization was trying to apply `commonLabels` which modified existing selector labels.

**Solution**: Delete existing deployments before applying new ones with updated selectors.

### 2. Invalid imagePullPolicy Location
```
unknown field "spec.template.spec.imagePullPolicy"
```

**Cause**: `imagePullPolicy` was placed at the pod spec level instead of the container level.

**Solution**: Moved `imagePullPolicy: Always` to the container specification.

## Files Modified

### 1. `/k8s/deployment.yaml`
- **Fixed**: Moved `imagePullPolicy` from pod spec to container spec
- **Before**: Located under `spec.template.spec.imagePullPolicy`
- **After**: Located under `spec.template.spec.containers[].imagePullPolicy`

### 2. `/k8s/deploy.sh`
- **Added**: Logic to delete existing deployments before applying new ones
- **Purpose**: Handle selector immutability gracefully in manual deployments

### 3. `/.github/workflows/ci-cd.yml`
- **Updated**: Both development and production deployment steps
- **Added**: Deletion of existing deployments before `kubectl apply -k k8s/`
- **Improved**: Error handling for deployment updates

### 4. `/k8s/deploy-fix.sh` (New)
- **Created**: Dedicated script for fixing deployment issues
- **Features**: 
  - Deletes existing deployments safely
  - Applies kustomization
  - Provides status feedback

## Root Cause Analysis

The issue occurred because:

1. **Kustomize commonLabels**: When using `commonLabels` in `kustomization.yaml`, Kustomize applies these labels to both metadata and selectors
2. **Existing Deployments**: If deployments already exist with different selectors, Kubernetes rejects the update
3. **immutable Fields**: Deployment selectors are immutable in Kubernetes for consistency and safety

## Solution Strategy

Instead of avoiding `commonLabels`, we:

1. **Delete and Recreate**: Remove existing deployments before applying updated ones
2. **Graceful Handling**: Use `--ignore-not-found=true` to avoid errors if deployments don't exist
3. **Wait Period**: Add a 5-second wait to ensure complete deletion before recreation

## Prevention

To prevent this issue in the future:

1. **Initial Design**: Include proper labels from the beginning
2. **Blue-Green Deployments**: Use deployment strategies that don't modify existing resources
3. **Helm**: Consider using Helm charts which handle updates better
4. **ArgoCD**: Use GitOps tools that understand Kubernetes resource lifecycles

## Testing

To test the fixes:

```bash
# Manual test
./k8s/deploy-fix.sh

# Or use the updated deploy script
./k8s/deploy.sh

# Verify deployment
kubectl get pods -n workshop-app
kubectl get deployments -n workshop-app
```

## Deployment Status

After these fixes, the CI/CD pipeline should successfully:

✅ Deploy to development environment (Kind cluster)  
✅ Handle existing deployments gracefully  
✅ Apply kustomize configurations properly  
✅ Complete without selector immutability errors  

## Next Steps

1. **Monitor Pipeline**: Watch the next CI/CD run for successful deployment
2. **Validate Application**: Check that the application starts and functions correctly
3. **Health Checks**: Ensure readiness and liveness probes work as expected