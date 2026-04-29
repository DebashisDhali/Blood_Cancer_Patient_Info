# Secure Deployment Checklist for Netlify

## Pre-Deployment Checklist

### Code Quality
- [ ] All sensitive data removed from code
- [ ] `.env` files added to `.gitignore`
- [ ] No hardcoded passwords/keys
- [ ] `npm audit` passes (no vulnerabilities)
- [ ] Console errors resolved
- [ ] All routes tested locally

### Security Configuration
- [ ] Unique JWT_SECRET created (min 32 chars)
- [ ] ENCRYPTION_KEY created (32 chars)
- [ ] Strong MongoDB password set
- [ ] CORS whitelist configured
- [ ] HTTPS enabled in backend
- [ ] Admin credentials strong

### Testing Before Deployment
- [ ] Login functionality works
- [ ] Patient creation works
- [ ] Photo upload works
- [ ] Donation form submits
- [ ] Documents upload correctly
- [ ] Dashboard loads all data
- [ ] Token validation works
- [ ] Error handling tested

---

## MongoDB Atlas Setup Checklist

- [ ] Cluster created
- [ ] Database user created with strong password
- [ ] Connection string copied
- [ ] IP whitelist configured (0.0.0.0/0 for testing)
- [ ] Backup enabled (optional)
- [ ] Monitoring enabled

---

## Backend Deployment (Render/Heroku)

### Environment Variables Set:
- [ ] `MONGODB_URI` = [your connection string]
- [ ] `JWT_SECRET` = [32+ char random string]
- [ ] `ENCRYPTION_KEY` = [32 char random string]
- [ ] `PORT` = 5000
- [ ] `NODE_ENV` = production
- [ ] `CLIENT_URL` = [your Netlify domain]

### Build Configuration:
- [ ] Build command correct
- [ ] Start command correct
- [ ] Node version compatible
- [ ] All dependencies installed

### After Deployment:
- [ ] Backend running (check logs)
- [ ] Health check endpoint working
- [ ] API endpoints accessible
- [ ] Database connected
- [ ] CORS headers present

---

## Frontend Deployment (Netlify)

### Repository Connected:
- [ ] GitHub account linked
- [ ] Repository selected
- [ ] Correct branch (main)

### Build Settings:
- [ ] Build command: `cd client && npm run build`
- [ ] Publish directory: `client/build`
- [ ] Install command: (leave default)

### Environment Variables:
- [ ] `REACT_APP_API_URL` = [backend URL]/api
- [ ] `REACT_APP_ENV` = production

### Redirects & Headers:
- [ ] `netlify.toml` configured
- [ ] Security headers set
- [ ] 404 redirects to /index.html
- [ ] Cache headers configured

### After Deployment:
- [ ] Site builds successfully
- [ ] No build errors
- [ ] Static files load
- [ ] API calls work
- [ ] Domain working

---

## Post-Deployment Testing

### Functional Testing
- [ ] Homepage loads
- [ ] Patient list visible
- [ ] Patient photos display
- [ ] Donation form appears
- [ ] Admin login works
- [ ] Dashboard accessible
- [ ] New patient creation works
- [ ] Fund creation works
- [ ] Document upload works

### Security Testing
- [ ] Sensitive data masked in public
- [ ] Admin panel requires login
- [ ] Token validation works
- [ ] CORS errors absent
- [ ] No console errors
- [ ] SSL certificate valid
- [ ] HTTPS enforced

### Performance Testing
- [ ] Page load time < 3 seconds
- [ ] Images load quickly
- [ ] API responses < 1 second
- [ ] No memory leaks
- [ ] No console warnings

### Mobile Testing
- [ ] Mobile layout responsive
- [ ] Touch interactions work
- [ ] Images scale properly
- [ ] Forms submit on mobile
- [ ] Navigation works

---

## First Admin Account

- [ ] Registration page accessible
- [ ] Form validation works
- [ ] Account created successfully
- [ ] Login works with credentials
- [ ] Dashboard loads after login
- [ ] Photo upload functional

---

## First Patient Setup

- [ ] Can access admin panel
- [ ] Add patient form works
- [ ] All fields save correctly
- [ ] Photo uploads successfully
- [ ] Appears in patient list
- [ ] Public page shows correctly
- [ ] Fund tracking works

---

## First Donation Test

- [ ] Donation form appears on public page
- [ ] All fields validate
- [ ] Submission succeeds
- [ ] Success message shown
- [ ] Fund amount updates
- [ ] Database records donation

---

## Monitoring & Maintenance

### Daily
- [ ] Check error logs
- [ ] Monitor fund updates
- [ ] Verify document uploads

### Weekly
- [ ] Review security logs
- [ ] Check backup status
- [ ] Monitor performance metrics
- [ ] Review user feedback

### Monthly
- [ ] Run security audit
- [ ] Update dependencies
- [ ] Review access logs
- [ ] Audit patient data access
- [ ] Check storage usage

---

## Emergency Response Plan

### If Hacked:
- [ ] Immediately invalidate all JWT tokens
- [ ] Reset all admin passwords
- [ ] Change JWT_SECRET
- [ ] Review access logs
- [ ] Notify all users
- [ ] Restore from backup if needed

### If Data Loss:
- [ ] Contact MongoDB support
- [ ] Restore from backup
- [ ] Verify data integrity
- [ ] Notify affected users
- [ ] Implement recovery procedure

### If Performance Issues:
- [ ] Check server resource usage
- [ ] Review database queries
- [ ] Check for DDoS attacks
- [ ] Scale resources if needed
- [ ] Enable caching

---

## Documentation to Keep Updated

- [ ] README.md with current features
- [ ] SECURITY.md with latest practices
- [ ] DEPLOY_ON_NETLIFY.md for new deployers
- [ ] API documentation current
- [ ] Troubleshooting guide updated

---

## Sign-Off

- **Date Deployed**: _______________
- **Backend URL**: _______________
- **Frontend URL**: _______________
- **Admin Username**: _______________
- **All Checks Passed**: Yes ☐  No ☐
- **Reviewed By**: _______________
- **Date Reviewed**: _______________

---

Once all items are checked, your Netlify deployment is secure and ready for production!
