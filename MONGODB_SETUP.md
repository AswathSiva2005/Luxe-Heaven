# MongoDB Atlas Setup Guide

## 🔴 IMPORTANT: Fix Connection Error

If you're seeing `querySrv ECONNREFUSED` error, follow these steps:

## Step 1: Configure IP Whitelist (REQUIRED)

1. **Go to MongoDB Atlas Dashboard:**
   - Visit: https://cloud.mongodb.com/
   - Log in with your MongoDB Atlas account

2. **Navigate to Network Access:**
   - Click on your project/cluster
   - Click **"Network Access"** in the left sidebar
   - Or go directly: https://cloud.mongodb.com/v2#/security/network/whitelist

3. **Add IP Address:**
   - Click **"Add IP Address"** button
   - Choose one of these options:
     - **Option A (Easiest for Development):** Click **"Allow Access from Anywhere"**
       - This adds `0.0.0.0/0` which allows all IPs
       - ⚠️ Only use this for development/testing
     - **Option B (More Secure):** Click **"Add Current IP Address"**
       - This adds only your current IP address
       - You'll need to update this if your IP changes

4. **Wait for Changes:**
   - After adding IP, wait **1-2 minutes** for changes to propagate
   - The status will show "Active" when ready

## Step 2: Verify Database User

1. **Go to Database Access:**
   - Click **"Database Access"** in the left sidebar
   - Or go to: https://cloud.mongodb.com/v2#/security/database/users

2. **Check User Credentials:**
   - Verify user `aswathsiva0420` exists
   - If not, create a new user:
     - Click **"Add New Database User"**
     - Username: `aswathsiva0420`
     - Password: `aswathsiva0420` (or your preferred password)
     - Database User Privileges: **"Read and write to any database"**
     - Click **"Add User"**

3. **Update Connection String (if password changed):**
   - If you changed the password, update `backend/server.js`
   - Replace the password in the connection string

## Step 3: Verify Cluster Status

1. **Check Cluster:**
   - Go to **"Clusters"** in the left sidebar
   - Ensure your cluster shows **"Running"** status
   - If paused, click **"Resume"** or **"Resume Cluster"**

## Step 4: Test Connection

After completing the above steps:

1. **Wait 1-2 minutes** for changes to take effect
2. **Restart your backend server:**
   ```powershell
   cd backend
   node server.js
   ```
3. You should see: `✅ MongoDB Atlas Connected Successfully`

## 🔍 Troubleshooting

### Still Getting Connection Error?

1. **Check Your Current IP:**
   - Visit: https://whatismyipaddress.com/
   - Add this specific IP to MongoDB Atlas Network Access

2. **Try Alternative DNS:**
   - The code already sets DNS to Cloudflare (1.1.1.1) and Google (8.8.8.8)
   - If still failing, check your system DNS settings

3. **Firewall/VPN:**
   - Disable VPN temporarily
   - Check if corporate firewall blocks MongoDB ports (27017)
   - Try from a different network

4. **Connection String Format:**
   - Current: `mongodb+srv://...` (SRV format - recommended)
   - If SRV fails, you can try standard format (requires IP whitelist)

5. **Node.js Version:**
   - You're using Node.js v24.13.0
   - There's a known DNS bug in Node.js v24
   - Consider updating to Node.js v25+ if issues persist

## ✅ Quick Checklist

- [ ] IP Address added to Network Access (0.0.0.0/0 or your IP)
- [ ] Database user exists and has correct password
- [ ] Cluster is running (not paused)
- [ ] Waited 1-2 minutes after making changes
- [ ] Restarted backend server
- [ ] Internet connection is working
- [ ] No VPN blocking connection

## 📞 Still Need Help?

If you've completed all steps and still have issues:
1. Check MongoDB Atlas status page: https://status.mongodb.com/
2. Review MongoDB Atlas logs in the dashboard
3. Verify connection string format matches Atlas dashboard

---

**Note:** The most common issue is forgetting to add IP to Network Access. Make sure you complete Step 1!
