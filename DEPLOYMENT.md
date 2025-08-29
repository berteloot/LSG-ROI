# Deployment Guide - ROI Calculator Next.js

This guide covers deploying your ROI Calculator application on various platforms.

## 🚀 **Vercel (Recommended for Next.js)**

### **Automatic Deployment**
1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit: ROI Calculator Next.js"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your repository
   - Vercel will auto-detect Next.js settings

3. **Environment Variables**
   - Add `DATABASE_URL` with your PostgreSQL connection string
   - Add any other required environment variables

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically

### **Manual Deployment**
```bash
npm install -g vercel
vercel login
vercel
```

## 🌐 **Render**

### **Web Service Setup**
1. **Create Web Service**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configuration**
   - **Name**: `roi-calculator`
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Choose appropriate plan

3. **Environment Variables**
   - Add `DATABASE_URL` with your PostgreSQL connection string

4. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically

### **PostgreSQL Database on Render**
1. **Create Database**
   - Go to "New +" → "PostgreSQL"
   - Choose plan and region
   - Copy the connection string

2. **Update Environment Variables**
   - Use the connection string as `DATABASE_URL`

## 🚂 **Railway**

### **Setup**
1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub
   - Click "New Project" → "Deploy from GitHub repo"

2. **Add PostgreSQL**
   - Click "New" → "Database" → "PostgreSQL"
   - Railway will provide connection details

3. **Environment Variables**
   - Add `DATABASE_URL` using Railway's PostgreSQL connection string

4. **Deploy**
   - Railway will automatically deploy on every push

## 🐳 **Docker Deployment**

### **Dockerfile**
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### **Docker Compose**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=roi_calculator
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### **Build and Run**
```bash
docker build -t roi-calculator .
docker run -p 3000:3000 -e DATABASE_URL=your_db_url roi-calculator
```

## 🔧 **Environment Variables**

### **Required**
```bash
DATABASE_URL="postgresql://username:password@host:port/database_name"
```

### **Optional**
```bash
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://yourdomain.com
NODE_ENV=production
```

## 📊 **Database Setup**

### **Local Development**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Open Prisma Studio
npm run db:studio
```

### **Production**
```bash
# Generate Prisma client
npm run db:generate

# Run migrations (if using migrations)
npx prisma migrate deploy

# Or push schema directly
npm run db:push
```

## 🚨 **Important Notes**

1. **Database Connection**: Ensure your PostgreSQL database is accessible from your deployment platform
2. **Environment Variables**: Never commit sensitive information like database credentials
3. **Build Process**: The build process includes generating the Prisma client
4. **Database Migrations**: Consider using Prisma migrations for production databases
5. **Performance**: Enable Next.js optimizations for production builds

## 🔍 **Troubleshooting**

### **Common Issues**
- **Build Failures**: Check if all dependencies are properly installed
- **Database Connection**: Verify `DATABASE_URL` is correct and accessible
- **Prisma Client**: Ensure `npm run db:generate` runs during build
- **Environment Variables**: Confirm all required variables are set

### **Debug Commands**
```bash
# Check build output
npm run build

# Check Prisma client
npx prisma generate

# Test database connection
npx prisma db pull

# View logs (platform-specific)
vercel logs
railway logs
```

## 📚 **Additional Resources**

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app/)

---

**Happy Deploying! 🚀**
