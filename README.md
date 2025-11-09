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

- **Frontend**: Next.js 13+ (App Router), TypeScript, Tailwind CSS
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
# Mock mode for development
NEXT_PUBLIC_MOCK=true

# API configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
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

## 🚀 Deployment

### Vercel (Recommended)

The easiest way to deploy is using [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
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