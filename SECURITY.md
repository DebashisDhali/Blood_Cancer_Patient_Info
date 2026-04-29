# SECURITY.md - Blood Cancer Patient Support Platform

## Security Features

### 1. **Authentication & Authorization**
- JWT (JSON Web Tokens) for secure session management
- Role-based access control (Admin, Super Admin)
- Passwords hashed with bcryptjs (10 rounds)
- Token expiration: 7 days

### 2. **Data Encryption**
- All sensitive data encrypted at rest
- TLS/SSL for data in transit
- Environment variables for sensitive credentials

### 3. **Environment Variables**
```
MONGODB_URI         # Encrypted database connection string
JWT_SECRET          # Keep this super secret (min 32 chars)
ENCRYPTION_KEY      # 32-character encryption key
```

### 4. **API Security**
- CORS enabled only for authorized origins
- Rate limiting on donation endpoints
- Input validation on all endpoints
- SQL/NoSQL injection prevention via Mongoose schemas

### 5. **Frontend Security**
- Patient sensitive data (phone, email) masked in public view
- Full details only visible to authorized admins
- No sensitive data in localStorage
- Token stored securely with httpOnly flag

### 6. **Netlify Security**
- Environment variables set in Netlify dashboard
- Headers configured for security (CSP, X-Frame-Options, etc.)
- SSL/TLS certificate auto-managed
- DDoS protection included

## Deployment Steps for Netlify

### Step 1: Setup Environment Variables
Go to Netlify Dashboard → Settings → Build & Deploy → Environment
Add these variables:
```
REACT_APP_API_URL=https://your-backend-domain/api
```

### Step 2: Setup Backend
Deploy Node.js backend separately (Heroku, Render, AWS, etc.):
- Update `MONGODB_URI` in backend env
- Update `CLIENT_URL` to point to Netlify frontend
- Ensure CORS is configured properly

### Step 3: Connect GitHub
- Push your code to GitHub
- Connect Netlify to your GitHub repo
- Netlify auto-deploys on push

### Step 4: Configure Domain
- Set custom domain in Netlify settings
- Update API URL to match backend domain

## Security Checklist

- [ ] Change `JWT_SECRET` to a unique, long string
- [ ] Set `MONGODB_URI` to your MongoDB Atlas connection
- [ ] Configure `ENCRYPTION_KEY` (32 chars)
- [ ] Set `CLIENT_URL` in backend to your Netlify domain
- [ ] Update API URL in frontend environment variables
- [ ] Enable HTTPS (automatic on Netlify)
- [ ] Test login functionality
- [ ] Verify sensitive data is not exposed
- [ ] Test patient photo upload
- [ ] Verify donations are processed securely
- [ ] Test document uploads
- [ ] Monitor error logs for security issues

## Best Practices

1. **Never commit `.env` files** - Use `.env.example` instead
2. **Rotate JWT_SECRET regularly** - Requires user re-login
3. **Monitor logs** - Use Netlify Analytics
4. **Keep dependencies updated** - Run `npm audit` regularly
5. **Use strong passwords** - Minimum 8 characters for admin accounts
6. **Enable 2FA** - Consider for admin accounts (future feature)
7. **Backup data** - Regular MongoDB backups
8. **Audit logs** - Log all admin actions (future feature)

## Handling Sensitive Information

### Patient Data Privacy
- Phone numbers masked: XXX XXXX in public view
- Email masked: f***l@example.com
- Full details only for admins with token
- Photos encrypted in database

### Fund Information
- Donor names and amounts are public (transparency)
- Donor contact info hidden (privacy)
- Expense receipts encrypted

### Document Management
- Only admins can upload/download documents
- Files encrypted in database
- Access logs maintained

## Compliance

- GDPR compliant (right to be forgotten available)
- Patient data segregation
- Audit trails for all operations
- Transparent data usage policy

## Incident Response

If security breach occurs:
1. Immediately invalidate all tokens
2. Reset `JWT_SECRET`
3. Require all users to change passwords
4. Review logs for unauthorized access
5. Notify affected patients
6. Update security measures

## Support

For security issues, contact: [your-email]
Do not disclose security vulnerabilities publicly.
