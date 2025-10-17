# ROI Calculator - Next.js Version

A modern, responsive web application for calculating Return on Investment (ROI) built with **Next.js 14 App Router**, **Prisma ORM**, and **PostgreSQL**.

## 🚀 **Quick Start**

### 1. **Install Dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. **Set up Environment Variables**
```bash
cp env.local.example .env.local
# Edit .env.local with your database credentials
```

### 3. **Generate Prisma Client**
```bash
npm run db:generate
```

### 4. **Push Database Schema** (if you want to create tables)
```bash
npm run db:push
```

### 5. **Run Development Server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ **Project Structure**

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── calculate/     # ROI calculation endpoint
│   │   └── history/       # Calculation history endpoint
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/             # React components
│   ├── ROICalculator.tsx  # Main calculator form
│   ├── ResultsDisplay.tsx # Results display
│   └── HistorySection.tsx # Calculation history
├── lib/                    # Utility functions
│   ├── prisma.ts          # Prisma client
│   ├── roi-calculations.ts # ROI calculation logic
│   └── utils.ts           # CSS utilities
├── prisma/                 # Database schema
│   └── schema.prisma      # Prisma schema file
└── package.json            # Dependencies
```

## 🗄️ **Database Schema**

The application uses your existing PostgreSQL database with these models:

```prisma
model EmployerCostData {
  id               String   @id
  state            String
  category         String
  item             String
  ratePercent      Float    @map("ratePercent")
  employerCostUSD  Float    @map("employerCostUSD")
  notes            String?
  source           String?
  createdAt        DateTime @default(now()) @map("createdAt")

  @@map("EmployerCostData")
}

model LSGBaseSeat {
  id          String   @id
  delivery    String
  role        String
  monthlyCost Float    @map("monthlyCost")
  notes       String?
  updatedAt   DateTime @map("updatedAt")

  @@map("LSGBaseSeat")
}

model role_categories {
  id           Int     @id @default(autoincrement())
  name         String
  monthly_cost Float?
  @@map("role_categories")
}
```

## 🔧 **Adding ROI Calculations Table**

To save ROI calculations, add this model to your `prisma/schema.prisma`:

```prisma
model ROICalculation {
  id                 String   @id @default(cuid())
  project_name       String
  initial_investment Float
  annual_revenue     Float
  annual_expenses    Float
  project_duration   Int
  calculated_roi     Float
  created_at         DateTime @default(now())

  @@map("roi_calculations")
}
```

Then run:
```bash
npm run db:push
npm run db:generate
```

## 🎯 **Features**

- **Modern UI/UX**: Built with Tailwind CSS and Lucide React icons
- **Type Safety**: Full TypeScript support
- **Form Validation**: Client-side validation with error handling
- **Responsive Design**: Mobile-first approach
- **Real-time Calculations**: Instant ROI results
- **Calculation History**: View previous calculations
- **Database Integration**: PostgreSQL with Prisma ORM

## 🚀 **Deployment**

### **Vercel (Recommended)**
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy automatically

### **Render**
1. Push code to GitHub
2. Create Web Service on Render
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Set `DATABASE_URL` environment variable

### **Railway**
1. Push code to GitHub
2. Connect repository to Railway
3. Add PostgreSQL service
4. Set environment variables
5. Deploy

## 🔌 **API Endpoints**

### **POST /api/calculate**
Calculate ROI for a project.

**Request:**
```json
{
  "project_name": "Project Name",
  "initial_investment": 10000.00,
  "annual_revenue": 5000.00,
  "annual_expenses": 2000.00,
  "project_duration": 5
}
```

**Response:**
```json
{
  "success": true,
  "roi_percentage": 15.0,
  "total_revenue": 25000.0,
  "total_expenses": 10000.0,
  "net_profit": 5000.0,
  "payback_period": 3.33
}
```

### **GET /api/history**
Get calculation history (returns empty array until you add the ROI table).

## 🎨 **Styling**

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Components**: Reusable component classes
- **Responsive Design**: Mobile-first approach
- **Modern Icons**: Lucide React icon library
- **Smooth Animations**: CSS transitions and transforms

## 🧪 **Development**

### **Available Scripts**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
```

### **Code Quality**
- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Component-based architecture

## 🔒 **Environment Variables**

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret key | No |
| `NEXTAUTH_URL` | NextAuth URL | No |

## 🚧 **TODOs & Next Steps**

- [ ] Add ROI calculations table to Prisma schema
- [ ] Implement user authentication
- [ ] Add calculation export functionality
- [ ] Create comparison tools
- [ ] Add advanced ROI scenarios
- [ ] Implement caching for better performance

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 **License**

This project is licensed under the MIT License.

---

**Built with Next.js 14, Prisma, and PostgreSQL** 🚀
