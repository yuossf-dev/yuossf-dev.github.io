# Moving Website to Root Domain - Complete Guide

## 🎯 Goal:
Change your website from:
- ❌ `https://yuossf-dev.github.io/file-converter1/`
- ✅ `http://the-best-converter.me/`

---

## Step-by-Step Instructions:

### Step 1: Create a New Repository on GitHub

1. **Go to**: https://github.com/new

2. **Fill in the details**:
   - Repository name: **`yuossf-dev.github.io`** (EXACTLY this name!)
   - Description: File converter website
   - ✅ Make it **Public** (required!)
   - ❌ Do NOT add README
   - ❌ Do NOT add .gitignore
   - ❌ Do NOT add license

3. **Click**: "Create repository"

⚠️ **IMPORTANT**: The repository name MUST be `your-username.github.io` format!

---

### Step 2: Move Your Files to the New Repository

After creating the repository, open PowerShell or Command Prompt and run these commands:

```powershell
# Navigate to your project folder
cd C:\Users\Victus\Desktop\file-converter-github

# Change the remote URL to the new repository
git remote set-url origin https://github.com/yuossf-dev/yuossf-dev.github.io.git

# Add the CNAME file
git add CNAME

# Commit the changes
git commit -m "Move to user site repository with custom domain"

# Push files to the new repository
git push -u origin main
```

**What this does:**
- Changes where Git pushes your files
- Adds the CNAME file (already created with `the-best-converter.me`)
- Uploads everything to the new repository

---

### Step 3: Enable GitHub Pages

1. **Go to**: https://github.com/yuossf-dev/yuossf-dev.github.io/settings/pages

2. **Under "Build and deployment"**:
   - Source: Deploy from a branch
   - Branch: **main**
   - Folder: **/ (root)**
   - Click **Save**

3. **Under "Custom domain"**:
   - Enter: `the-best-converter.me`
   - Click **Save**
   - Wait 1 minute, then check: ☑️ **Enforce HTTPS**

---

### Step 4: Configure DNS in Namecheap

Go to: Namecheap → Domain List → Manage `the-best-converter.me` → Advanced DNS

#### Add these DNS records:

**A Records** (Delete old ones first if any exist):
```
Type: A Record
Host: @
Value: 185.199.108.153
TTL: Automatic
```
```
Type: A Record
Host: @
Value: 185.199.109.153
TTL: Automatic
```
```
Type: A Record
Host: @
Value: 185.199.110.153
TTL: Automatic
```
```
Type: A Record
Host: @
Value: 185.199.111.153
TTL: Automatic
```

**CNAME Record**:
```
Type: CNAME Record
Host: www
Value: yuossf-dev.github.io.
TTL: Automatic
```

⚠️ **IMPORTANT**: Delete any old A or CNAME records pointing to different IPs!

---

### Step 5: Wait for DNS Propagation

- **DNS changes**: 5-60 minutes (sometimes up to 24 hours)
- **GitHub Pages**: 2-5 minutes

---

### Step 6: Test Your Website

After 10 minutes, try these URLs:

1. ✅ **http://the-best-converter.me/**
2. ✅ **https://the-best-converter.me/** (after HTTPS is enabled)
3. ✅ **https://www.the-best-converter.me/**
4. ✅ **https://yuossf-dev.github.io/** (will redirect to your domain)

---

## ✅ After Migration:

### Update AdSense:
1. Go to AdSense Dashboard
2. Update site URL to: `http://the-best-converter.me`
3. May need to re-verify ownership

### Delete Old Repository (Optional):
After confirming everything works:
1. Go to: https://github.com/yuossf-dev/file-converter1/settings
2. Scroll down to **Danger Zone**
3. Click **Delete this repository**

---

## 🚨 Troubleshooting:

### Problem: "404 - File not found"
**Solution**: 
- Verify repository name is exactly: `yuossf-dev.github.io`
- Make sure GitHub Pages is enabled
- Wait 5 minutes and refresh

### Problem: "DNS_PROBE_FINISHED_NXDOMAIN"
**Solution**:
- Check DNS settings in Namecheap
- Wait 1-2 hours for DNS propagation
- Clear DNS cache: `ipconfig /flushdns`
- Try from mobile data (different network)

### Problem: "Your connection is not private" (HTTPS error)
**Solution**:
- Wait for HTTPS to be activated (can take up to 1 hour)
- Make sure "Enforce HTTPS" is enabled in GitHub Pages settings
- Try accessing with http:// first, then https://

### Problem: Push fails with "Authentication failed"
**Solution**:
- You may need to use a Personal Access Token
- Go to: https://github.com/settings/tokens
- Generate new token (classic) with "repo" scope
- Use token as password when pushing

---

## 💡 Important Notes:

1. ✅ Repository name MUST be exactly: `yuossf-dev.github.io`
2. ✅ CNAME file is ready with: `the-best-converter.me`
3. ✅ All AdSense files are included
4. ✅ ads.txt will work at: `http://the-best-converter.me/ads.txt`
5. ✅ All 3 ad units are configured

---

## 📋 Quick Commands Summary:

```powershell
cd C:\Users\Victus\Desktop\file-converter-github
git remote set-url origin https://github.com/yuossf-dev/yuossf-dev.github.io.git
git add CNAME
git commit -m "Move to user site with custom domain"
git push -u origin main
```

---

## 🎯 What You'll Have After This:

**Before:**
- URL: `https://yuossf-dev.github.io/file-converter1/`
- Custom domain doesn't work properly

**After:**
- URL: `http://the-best-converter.me/` ✅
- Clean, professional domain
- AdSense works perfectly
- HTTPS enabled
- www subdomain works

---

## ⏰ Timeline:

1. **Create repository**: 2 minutes
2. **Run commands**: 1 minute
3. **Configure GitHub Pages**: 2 minutes
4. **Setup DNS**: 5 minutes
5. **Wait for DNS**: 10-60 minutes
6. **Enable HTTPS**: 5-60 minutes

**Total**: ~30 minutes to 2 hours

---

## 🔔 Ready to Start?

1. ✅ CNAME file is created
2. ✅ All files are ready to move
3. ✅ Instructions are clear

**Just create the repository at https://github.com/new and let me know when done!**

I'll help you run the commands! 🚀
