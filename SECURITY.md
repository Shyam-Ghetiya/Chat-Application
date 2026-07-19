# 🔒 Security Best Practices for ChatVerse

## ⚠️ IMPORTANT: Never Commit Secrets!

Your Groq API key and other sensitive data should **NEVER** be committed to Git.

## ✅ How to Store API Keys Securely

### Method 1: Environment Variables (Recommended)

**Set in your terminal:**
```bash
export GROQ_API_KEY="gsk_your_actual_key_here"
```

**Make it permanent (Mac/Linux):**
```bash
echo 'export GROQ_API_KEY="gsk_your_actual_key_here"' >> ~/.zshrc
source ~/.zshrc
```

**Windows (Command Prompt):**
```cmd
setx GROQ_API_KEY "gsk_your_actual_key_here"
```

**Windows (PowerShell):**
```powershell
[System.Environment]::SetEnvironmentVariable('GROQ_API_KEY', 'gsk_your_actual_key_here', 'User')
```

### Method 2: Local .env File (Alternative)

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your real API key:
   ```
   GROQ_API_KEY=gsk_your_actual_key_here
   ```

3. **IMPORTANT**: `.env` is already in `.gitignore` - verify it:
   ```bash
   cat .gitignore | grep .env
   ```

## 🛡️ What's Protected

### Files that should NEVER be committed:
- `.env` - Contains actual API keys
- Any file with real API keys or passwords
- Database passwords
- JWT secrets
- Private keys

### Files that ARE safe to commit:
- `.env.example` - Template with placeholders
- `application.properties` - Uses `${GROQ_API_KEY:placeholder}`
- Source code
- Documentation

## 🔍 If You Accidentally Committed a Secret

### Step 1: Remove it from the latest commit
```bash
# Edit the file to remove the secret
# Then amend the commit:
git add <file>
git commit --amend --no-edit
git push origin main --force-with-lease
```

### Step 2: Rotate the exposed secret
1. Go to https://console.groq.com/
2. Delete the exposed API key
3. Create a new API key
4. Update your local environment variable

### Step 3: Check GitHub Security Alerts
- GitHub will send you an alert if secrets are detected
- Follow the instructions to resolve

## 📝 Security Checklist

- [ ] API key stored in environment variable
- [ ] `.env` file in `.gitignore`
- [ ] No secrets in `application.properties`
- [ ] `.env.example` has placeholders only
- [ ] Database password not in Git
- [ ] JWT secret not hardcoded

## 🔐 Current Configuration

Your `application.properties` uses environment variables:
```properties
groq.api.key=${GROQ_API_KEY:your-groq-api-key-here}
```

This means:
- ✅ Reads from `GROQ_API_KEY` environment variable
- ✅ Falls back to placeholder if not set
- ✅ Safe to commit to Git

## 🚨 Emergency: Key Exposed

If your API key was exposed publicly:

1. **Immediately revoke it:**
   - Go to https://console.groq.com/
   - Delete the exposed key

2. **Create a new key:**
   - Generate a new API key
   - Update your environment variable

3. **Clear Git history (if needed):**
   ```bash
   # This is advanced - ask for help if unsure
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch backend/src/main/resources/application.properties" \
     --prune-empty --tag-name-filter cat -- --all
   ```

## 📚 Learn More

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [Groq API Security](https://console.groq.com/docs/security)
- [Environment Variables Best Practices](https://12factor.net/config)

---

**Remember:** Security is everyone's responsibility! 🛡️

If you're unsure about anything security-related, ask before pushing!
