# ViralDeals Production Admin Setup

## 🚀 Quick Admin Setup for Production

### **Admin Credentials**
- **Email**: `sanjay@admin.com`
- **Password**: `Ss@1234q`
- **Role**: `admin`

### **Method 1: API Endpoint (Recommended)**

Use this curl command to create/update the admin user on your production site:

```bash
curl -X POST https://viraldeals-online-3uwb.vercel.app/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "adminSecret": "viraldeals-admin-setup-2025",
    "name": "Sanjay Admin",
    "email": "sanjay@admin.com",
    "password": "Ss@1234q",
    "phone": "9123456789"
  }'
```

### **Method 2: Direct MongoDB Atlas**

If the API method fails, create the admin user directly in MongoDB Atlas:

1. **Go to**: https://cloud.mongodb.com/
2. **Navigate to**: cluster0.yf0klq1.mongodb.net
3. **Browse Collections** → `viraldeals` → `users`
4. **Insert Document**:

```json
{
  "name": "Sanjay Admin",
  "email": "sanjay@admin.com",
  "password": "$2a$10$YourHashedPasswordHere",
  "phone": "9123456789",
  "role": "admin",
  "avatar": "",
  "addresses": [],
  "isEmailVerified": true,
  "isPhoneVerified": true,
  "createdAt": "2025-01-15T12:00:00.000Z",
  "updatedAt": "2025-01-15T12:00:00.000Z"
}
```

**Password Hash for `Ss@1234q`**: `$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi`

### **Login Instructions**

1. **Go to**: https://viraldeals-online-3uwb.vercel.app/login
2. **Enter**:
   - Email: `sanjay@admin.com`
   - Password: `Ss@1234q`
3. **Access Admin**: After login, go to `/admin`

### **Verification**

Test the login with curl:

```bash
curl -X POST https://viraldeals-online-3uwb.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sanjay@admin.com",
    "password": "Ss@1234q"
  }'
```

Expected response should include `"role": "admin"`.

### **Troubleshooting**

- **API Error**: Check Vercel function logs
- **Database Error**: Verify MongoDB Atlas connection
- **Login Failed**: Ensure user exists and password is correct
- **No Admin Access**: Verify user role is set to "admin"

---

**✅ Once setup is complete, you can access the full admin panel at `/admin`**
