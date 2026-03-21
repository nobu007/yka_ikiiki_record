# イキイキレコード デモ (IkiIki Record Demo)

このプロジェクトは、日本の学校向けに紹介される教育インフラ「IkiIki Record」のデモンストレーションです。最新のAI技術を用いて、学生の日々の成長と教室文化を1分間の記録で可視化します。

IkiIki Record is an innovative educational infrastructure aimed at schools in Japan, designed to visualize the internal growth and classroom culture of students through brief, daily one-minute records using advanced AI technologies.

## 🚀 Features

- **リアルタイムデータ生成**: テストデータを動的に生成してダッシュボード機能を体験
- **統計的可視化**: 月別、曜日別、時間帯別の感情スコアをグラフ表示
- **レスポンシブデザイン**: デスクトップ、タブレット、モバイルに対応
- **クリーンアーキテクチャ**: ドメイン駆動設計とクリーンアーキテクチャを採用
- **包括的テスト**: ユニットテスト、統合テスト、E2Eテストを完備

## 🛠️ Technology Stack

- **Frontend**: Next.js 16 (App Router), TypeScript 5, Tailwind CSS
- **Testing**: Jest, React Testing Library, Playwright
- **Architecture**: Clean Architecture, Domain-Driven Design
- **Charts**: ApexCharts
- **Icons**: Lucide React

## 📋 Prerequisites

- [Node.js 18+](https://nodejs.org/en/) installed using [nvm](https://github.com/nvm-sh/nvm)
- [pnpm](https://pnpm.io/) package manager

## 🚀 Quick Start

### 1. Installation

```bash
# Clone the repository
git clone <repository-url>
cd yka_ikiiki_record

# Install Node.js 18
nvm install 18
nvm use 18

# Install pnpm globally
npm i -g pnpm

# Install dependencies
pnpm install
```

### 2. Development

```bash
# Start development server
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### 3. Production Build

```bash
# Build for production
pnpm run build

# Start production server
pnpm start
```

## 🧪 Testing

This project includes comprehensive testing:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode
npm run test:e2e:headed
```

### Test Coverage

- **Unit Tests**: Utility functions, business logic
- **Integration Tests**: API endpoints, data flow
- **E2E Tests**: Complete user workflows
- **Component Tests**: React components

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (dashboard)/        # Dashboard routes
│   ├── api/               # API routes
│   └── landing/           # Landing page
├── application/           # Application layer
│   └── hooks/             # Custom hooks
├── domain/                # Domain layer
│   ├── entities/          # Domain entities
│   ├── repositories/      # Repository interfaces
│   └── services/          # Domain services
├── infrastructure/        # Infrastructure layer
│   ├── api/              # API clients
│   └── storage/          # Data storage
├── presentation/         # Presentation layer
│   └── components/       # UI components
├── lib/                  # Utility libraries
├── utils/                 # Utility functions
└── types/                 # TypeScript types
```

## 🎯 How to Use

1. **ランディングページ**: プロジェクト概要を確認
2. **ダッシュボード**: 「初期データを生成」ボタンでテストデータを作成
3. **統計表示**: 生成されたデータの統計情報をグラフで確認
4. **インタラクション**: グラフのホバー機能で詳細情報を表示

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database provider: 'mirage' (mock) for development, 'prisma' (PostgreSQL) for production
DATABASE_PROVIDER=mirage

# Mock mode for development (set to "true" to use MirageJS instead of real API)
NEXT_PUBLIC_MOCK=true

# API configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Database URL (only needed when DATABASE_PROVIDER=prisma)
# For development with SQLite:
# DATABASE_URL="file:./dev.db"

# For production with PostgreSQL (Vercel Postgres / Supabase):
# DATABASE_URL="postgresql://user:password@host:port/database"
```

### Data Generation Configuration

The system supports various data generation patterns:

- **normal**: 正規分布
- **bimodal**: 二峰性分布
- **stress**: ストレス型分布
- **happy**: ハッピー型分布

## 🏗️ Architecture

This project follows Clean Architecture principles:

- **Domain Layer**: Core business logic and entities
- **Application Layer**: Use cases and application services
- **Infrastructure Layer**: External dependencies and data access
- **Presentation Layer**: UI components and user interfaces

## 🚀 Production Deployment

### Prerequisites

The project is fully prepared for production deployment with:
- ✅ PostgreSQL database schema (Prisma)
- ✅ Database migrations ready (`20260317000000_init_postgresql`)
- ✅ Vercel configuration (`vercel.json`)
- ✅ TypeScript strict mode compliance
- ✅ Comprehensive test coverage (99.64% statements, 96.63% branches, 98.1% functions, 99.68% lines)
- ✅ All 1312 tests passing (177 test suites)
- ✅ Prisma provider coverage: 100% (seed API route)

### Automated Deployment Scripts

The project includes automated deployment scripts for production:

```bash
# One-command production deployment
npm run deploy:production

# Verify production deployment
bash scripts/verify-deployment.sh
```

### Manual Deployment Steps

If you prefer manual deployment or need to customize:

#### 1. Install and Login to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login
```

#### 2. Create Production Database

**Option A: Vercel Postgres (Recommended)**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → Storage → Create Database → Postgres
3. Copy the `DATABASE_URL` from Vercel

**Option B: External PostgreSQL (Supabase, Neon, etc.)**
1. Create a PostgreSQL database
2. Copy the connection string
3. Set environment variable:
   ```bash
   vercel env add DATABASE_URL production
   # Paste your connection string when prompted
   ```

#### 3. Deploy to Production

```bash
# Deploy to Vercel production
vercel --prod

# Or use the automated script
npm run deploy:production
```

#### 4. Run Database Migrations

```bash
# Deploy Prisma migrations to production
vercel exec -- npm run db:migrate:deploy

# Or manually:
vercel env pull .env.production
npx prisma migrate deploy
```

#### 5. Verify Deployment

```bash
# Run verification script
bash scripts/verify-deployment.sh

# Or manually test:
# 1. Visit production URL
# 2. Test POST /api/seed to populate data
# 3. Verify GET /api/stats returns data
# 4. Check /dashboard displays correctly
```

### Environment Variables (Production)

Required environment variables for production:

```env
DATABASE_PROVIDER=prisma
DATABASE_URL=postgresql://user:password@host:port/database
```

### Database Setup

1. **Create a PostgreSQL database**:
   - Option A: [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
   - Option B: [Supabase](https://supabase.com/docs/guides/database)

2. **Run migrations** (automatic on Vercel, or manual):
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy
```

### Build Verification

Before deploying, ensure the build succeeds:

```bash
# Run tests
npm test

# Build for production
npm run build
```

### Docker

```bash
# Build Docker image
docker build -t ikiiki-record .

# Run container
docker run -p 3000:3000 ikiiki-record
```

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Tailwind CSS](https://tailwindcss.com/docs) - utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org/docs/) - typed JavaScript
- [Jest](https://jestjs.io/docs/getting-started) - JavaScript testing framework
- [Playwright](https://playwright.dev/) - E2E testing framework

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [documentation](docs/)
2. Search existing [issues](../../issues)
3. Create a new [issue](../../issues/new)

---

**Built with ❤️ for Japanese education**