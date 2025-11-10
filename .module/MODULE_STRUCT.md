# MODULE_STRUCT.md - イキイキレコード 構造定義

## 構造概要

イキイキレコードのプロジェクト構造は、クリーンアーキテクチャの原則に基づき、関心の分離と保守性を最大化するように設計されています。各ディレクトリとファイルは明確な責務を持ち、階層的な依存関係を維持します。

## 構造定義

### STRUCT_01_01_01-001: データ生成構造
**対応目標**: GOAL_01_01_01-001
**対応タスク**: TASK_01_01_01-001
**対応アーキテクチャ**: ARCH_01_01_01-001

**ディレクトリ構造**:
```
src/
├── domain/
│   ├── entities/
│   │   ├── generated-data.entity.ts
│   │   ├── data-pattern.entity.ts
│   │   └── validation-result.entity.ts
│   ├── services/
│   │   ├── data-generator.service.ts
│   │   └── data-validator.service.ts
│   └── repositories/
│       └── data-repository.interface.ts
├── application/
│   ├── usecases/
│   │   └── generate-data.usecase.ts
│   ├── services/
│   │   └── data-generation.service.ts
│   └── dto/
│       ├── generate-data.dto.ts
│       └── generated-data.dto.ts
├── infrastructure/
│   ├── workers/
│   │   ├── data-generation.worker.ts
│   │   └── worker-pool.service.ts
│   ├── repositories/
│   │   └── memory-data-repository.ts
│   └── external/
│       └── random-api.client.ts
└── presentation/
    ├── components/
    │   ├── data-generator/
    │   │   ├── DataGenerator.tsx
    │   │   ├── PatternSelector.tsx
    │   │   └── GenerationControls.tsx
    │   └── charts/
    │       └── RealTimeChart.tsx
    └── hooks/
        ├── useDataGeneration.ts
        └── useRealTimeUpdates.ts
```

**ファイル構成**:
```typescript
// src/domain/entities/generated-data.entity.ts
export interface GeneratedData {
  id: string;
  pattern: DataPattern;
  values: number[];
  timestamp: Date;
  metadata: DataMetadata;
}

// src/application/usecases/generate-data.usecase.ts
export class GenerateDataUseCase {
  constructor(
    private generator: DataGenerator,
    private repository: DataRepository
  ) {}
  
  async execute(request: GenerateDataRequest): Promise<GenerateDataResponse> {
    const data = await this.generator.generate(request.pattern);
    await this.repository.save(data);
    return { success: true, data };
  }
}

// src/infrastructure/workers/data-generation.worker.ts
self.onmessage = (event) => {
  const { pattern, id } = event.data;
  const generatedData = generateDataPattern(pattern, id);
  self.postMessage({ id, data: generatedData });
};
```

### STRUCT_01_01_02-002: 可視化構造
**対応目標**: GOAL_01_01_02-002
**対応タスク**: TASK_01_01_02-002
**対応アーキテクチャ**: ARCH_01_01_02-002

**ディレクトリ構造**:
```
src/
├── domain/
│   ├── entities/
│   │   ├── chart-data.entity.ts
│   │   ├── chart-config.entity.ts
│   │   └── export-result.entity.ts
│   ├── services/
│   │   ├── chart-renderer.service.ts
│   │   └── data-processor.service.ts
│   └── repositories/
│       └── chart-repository.interface.ts
├── application/
│   ├── usecases/
│   │   ├── create-chart.usecase.ts
│   │   └── export-chart.usecase.ts
│   ├── services/
│   │   └── visualization.service.ts
│   └── dto/
│       ├── chart-request.dto.ts
│       └── chart-response.dto.ts
├── infrastructure/
│   ├── renderers/
│   │   ├── apexcharts.renderer.ts
│   │   └── canvas.renderer.ts
│   ├── processors/
│   │   └── data-transformer.service.ts
│   └── exporters/
│       ├── csv.exporter.ts
│       ├── pdf.exporter.ts
│       └── json.exporter.ts
└── presentation/
    ├── components/
    │   ├── charts/
    │   │   ├── InteractiveChart.tsx
    │   │   ├── ChartContainer.tsx
    │   │   ├── ChartControls.tsx
    │   │   └── ExportButton.tsx
    │   └── tooltips/
    │       ├── ChartTooltip.tsx
    │       └── DataPointTooltip.tsx
    └── hooks/
        ├── useChart.ts
        ├── useChartInteraction.ts
        └── useChartExport.ts
```

**ファイル構成**:
```typescript
// src/domain/entities/chart-data.entity.ts
export interface ChartData {
  series: ChartSeries[];
  categories: string[];
  metadata: ChartMetadata;
}

export interface ChartSeries {
  name: string;
  data: number[];
  color?: string;
}

// src/infrastructure/renderers/apexcharts.renderer.ts
export class ApexChartsRenderer implements ChartRenderer {
  render(config: ChartConfig): ChartView {
    return {
      type: 'apexcharts',
      options: this.buildOptions(config),
      series: config.data.series
    };
  }
  
  private buildOptions(config: ChartConfig) {
    return {
      chart: { type: config.type },
      xaxis: { categories: config.data.categories },
      tooltip: { enabled: true }
    };
  }
}

// src/presentation/components/charts/InteractiveChart.tsx
export const InteractiveChart = React.memo<Props>(({ data, onInteraction }) => {
  const chart = useChart(data);
  const { handleHover, handleClick } = useChartInteraction(onInteraction);
  
  return (
    <ChartContainer>
      <ApexChart 
        options={chart.options}
        series={chart.series}
        events={{ dataPointSelection: handleClick, mouseMove: handleHover }}
      />
    </ChartContainer>
  );
});
```

### STRUCT_01_01_03-003: レスポンシブ構造
**対応目標**: GOAL_01_01_03-003
**対応タスク**: TASK_01_01_03-003
**対応アーキテクチャ**: ARCH_01_01_03-003

**ディレクトリ構造**:
```
src/
├── domain/
│   ├── entities/
│   │   ├── device-info.entity.ts
│   │   ├── layout-config.entity.ts
│   │   └── breakpoint.entity.ts
│   ├── services/
│   │   ├── device-detector.service.ts
│   │   └── layout-adapter.service.ts
│   └── repositories/
│       └── device-repository.interface.ts
├── application/
│   ├── usecases/
│   │   └── adapt-layout.usecase.ts
│   ├── services/
│   │   └── responsive.service.ts
│   └── dto/
│       ├── device-request.dto.ts
│       └── layout-response.dto.ts
├── infrastructure/
│   ├── detectors/
│   │   ├── browser-detector.service.ts
│   │   └── screen-detector.service.ts
│   ├── adapters/
│   │   └── css-layout-adapter.service.ts
│   └── workers/
│       └── service-worker.ts
└── presentation/
    ├── components/
    │   ├── layout/
    │   │   ├── ResponsiveLayout.tsx
    │   │   ├── BreakpointManager.tsx
    │   │   └── LayoutProvider.tsx
    │   ├── navigation/
    │   │   ├── MobileNavigation.tsx
    │   │   └── DesktopNavigation.tsx
    │   └── touch/
    │       ├── TouchGesture.tsx
    │       └── SwipeHandler.tsx
    ├── styles/
    │   ├── responsive.css
    │   ├── mobile.css
    │   └── desktop.css
    └── hooks/
        ├── useResponsive.ts
        ├── useBreakpoint.ts
        └── useDeviceDetection.ts
```

**ファイル構成**:
```typescript
// src/domain/entities/device-info.entity.ts
export interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  screenSize: ScreenSize;
  orientation: 'portrait' | 'landscape';
  capabilities: DeviceCapabilities;
}

export interface LayoutConfig {
  breakpoints: BreakpointConfig;
  grid: GridConfig;
  components: ComponentLayout;
}

// src/infrastructure/detectors/browser-detector.service.ts
export class BrowserDetector implements DeviceDetector {
  detect(): DeviceInfo {
    return {
      type: this.getDeviceType(),
      screenSize: this.getScreenSize(),
      orientation: this.getOrientation(),
      capabilities: this.getCapabilities()
    };
  }
  
  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }
}

// src/presentation/components/layout/ResponsiveLayout.tsx
export const ResponsiveLayout = ({ children }: Props) => {
  const layout = useResponsiveLayout();
  const device = useDeviceDetection();
  
  return (
    <LayoutProvider config={layout}>
      <BreakpointManager>
        <Header device={device} />
        <Main device={device}>
          {children}
        </Main>
        <Footer device={device} />
      </BreakpointManager>
    </LayoutProvider>
  );
};
```

### STRUCT_01_01_04-004: クリーンアーキテクチャ構造
**対応目標**: GOAL_01_01_04-004
**対応タスク**: TASK_01_01_04-004
**対応アーキテクチャ**: ARCH_01_01_04-004

**ディレクトリ構造**:
```
src/
├── domain/
│   ├── entities/
│   │   ├── student-record.entity.ts
│   │   ├── emotion-score.entity.ts
│   │   ├── analysis-result.entity.ts
│   │   └── user.entity.ts
│   ├── services/
│   │   ├── emotion-analyzer.service.ts
│   │   ├── trend-calculator.service.ts
│   │   └── insight-generator.service.ts
│   ├── repositories/
│   │   ├── student-repository.interface.ts
│   │   ├── analysis-repository.interface.ts
│   │   └── user-repository.interface.ts
│   └── events/
│       ├── record-created.event.ts
│       ├── analysis-completed.event.ts
│       └── insight-generated.event.ts
├── application/
│   ├── usecases/
│   │   ├── create-record.usecase.ts
│   │   ├── analyze-student.usecase.ts
│   │   ├── generate-insights.usecase.ts
│   │   └── get-dashboard.usecase.ts
│   ├── services/
│   │   ├── record-service.ts
│   │   ├── analysis-service.ts
│   │   └── dashboard-service.ts
│   ├── dto/
│   │   ├── create-record.dto.ts
│   │   ├── analysis-request.dto.ts
│   │   └── dashboard-response.dto.ts
│   └── events/
│       ├── event-dispatcher.service.ts
│       └── event-handlers/
├── infrastructure/
│   ├── repositories/
│   │   ├── prisma-student-repository.ts
│   │   ├── memory-analysis-repository.ts
│   │   └── api-user-repository.ts
│   ├── external/
│   │   ├── ai-service.client.ts
│   │   ├── notification.client.ts
│   │   └── analytics.client.ts
│   ├── persistence/
│   │   ├── database.connection.ts
│   │   └── migrations/
│   └── config/
│       ├── database.config.ts
│       └── external-services.config.ts
└── presentation/
    ├── components/
    │   ├── dashboard/
    │   │   ├── Dashboard.tsx
    │   │   ├── StatsOverview.tsx
    │   │   └── RecentRecords.tsx
    │   ├── records/
    │   │   ├── RecordForm.tsx
    │   │   ├── RecordList.tsx
    │   │   └── RecordDetail.tsx
    │   └── analysis/
    │       ├── AnalysisChart.tsx
    │       ├── TrendView.tsx
    │       └── InsightPanel.tsx
    ├── pages/
    │   ├── dashboard.page.tsx
    │   ├── records.page.tsx
    │   └── analysis.page.tsx
    └── hooks/
        ├── useRecords.ts
        ├── useAnalysis.ts
        ├── useDashboard.ts
        └── useInsights.ts
```

**ファイル構成**:
```typescript
// src/domain/entities/student-record.entity.ts
export interface StudentRecord {
  id: string;
  studentId: string;
  emotionScore: EmotionScore;
  content: string;
  timestamp: Date;
  metadata: RecordMetadata;
}

export interface EmotionScore {
  overall: number;
  dimensions: {
    happiness: number;
    engagement: number;
    stress: number;
    confidence: number;
  };
}

// src/application/usecases/analyze-student.usecase.ts
export class AnalyzeStudentUseCase {
  constructor(
    private studentRepository: StudentRepository,
    private analyzer: EmotionAnalyzer,
    private eventDispatcher: EventDispatcher
  ) {}
  
  async execute(request: AnalyzeStudentRequest): Promise<AnalyzeStudentResponse> {
    const records = await this.studentRepository.findByStudentId(request.studentId);
    const analysis = await this.analyzer.analyze(records);
    
    await this.eventDispatcher.dispatch(new AnalysisCompletedEvent(analysis));
    
    return { success: true, analysis };
  }
}

// src/infrastructure/repositories/prisma-student-repository.ts
export class PrismaStudentRepository implements StudentRepository {
  async findById(id: string): Promise<StudentRecord | null> {
    const record = await prisma.studentRecord.findUnique({ where: { id } });
    return record ? this.mapToEntity(record) : null;
  }
  
  async save(record: StudentRecord): Promise<void> {
    await prisma.studentRecord.create({
      data: this.mapToPersistence(record)
    });
  }
  
  private mapToEntity(data: PrismaStudentRecord): StudentRecord {
    return {
      id: data.id,
      studentId: data.studentId,
      emotionScore: JSON.parse(data.emotionScore),
      content: data.content,
      timestamp: data.timestamp,
      metadata: JSON.parse(data.metadata)
    };
  }
}
```

### STRUCT_01_01_05-005: テスト構造
**対応目標**: GOAL_01_01_05-005
**対応タスク**: TASK_01_01_05-005
**対応アーキテクチャ**: ARCH_01_01_05-005

**ディレクトリ構造**:
```
src/
├── domain/
│   └── __tests__/
│       ├── entities/
│       │   ├── student-record.test.ts
│       │   └── emotion-score.test.ts
│       ├── services/
│       │   ├── emotion-analyzer.test.ts
│       │   └── trend-calculator.test.ts
│       └── repositories/
│           └── student-repository.test.ts
├── application/
│   └── __tests__/
│       ├── usecases/
│       │   ├── create-record.test.ts
│       │   ├── analyze-student.test.ts
│       │   └── generate-insights.test.ts
│       └── services/
│           ├── record-service.test.ts
│           └── analysis-service.test.ts
├── infrastructure/
│   └── __tests__/
│       ├── repositories/
│       │   ├── prisma-student-repository.test.ts
│       │   └── memory-analysis-repository.test.ts
│       └── external/
│           ├── ai-service.client.test.ts
│           └── notification.client.test.ts
├── presentation/
│   └── __tests__/
│       ├── components/
│       │   ├── dashboard/
│       │   │   ├── Dashboard.test.tsx
│       │   │   └── StatsOverview.test.tsx
│       │   ├── records/
│       │   │   ├── RecordForm.test.tsx
│       │   │   └── RecordList.test.tsx
│       │   └── analysis/
│       │       ├── AnalysisChart.test.tsx
│       │       └── TrendView.test.tsx
│       └── hooks/
│           ├── useRecords.test.ts
│           ├── useAnalysis.test.ts
│           └── useDashboard.test.ts
├── test/
│   ├── fixtures/
│   │   ├── student-record.fixture.ts
│   │   ├── emotion-data.fixture.ts
│   │   └── user-data.fixture.ts
│   ├── mocks/
│   │   ├── student-repository.mock.ts
│   │   ├── ai-service.mock.ts
│   │   └── notification-service.mock.ts
│   ├── utils/
│   │   ├── test-helpers.ts
│   │   ├── mock-data-generator.ts
│   │   └── assertion-helpers.ts
│   ├── setup/
│   │   ├── jest.setup.ts
│   │   ├── test-environment.ts
│   │   └── msw.setup.ts
│   └── e2e/
│       ├── dashboard.spec.ts
│       ├── record-creation.spec.ts
│       ├── data-visualization.spec.ts
│       └── responsive-design.spec.ts
└── __tests__/
    ├── integration/
    │   ├── record-analysis.integration.test.ts
    │   ├── dashboard-data.integration.test.ts
    │   └── ai-processing.integration.test.ts
    └── performance/
        ├── data-generation.performance.test.ts
        ├── chart-rendering.performance.test.ts
        └── memory-usage.performance.test.ts
```

**ファイル構成**:
```typescript
// src/test/fixtures/student-record.fixture.ts
export const createStudentRecordFixture = (overrides?: Partial<StudentRecord>): StudentRecord => {
  return {
    id: 'test-record-1',
    studentId: 'test-student-1',
    emotionScore: {
      overall: 75,
      dimensions: {
        happiness: 80,
        engagement: 70,
        stress: 30,
        confidence: 85
      }
    },
    content: 'Test content for student record',
    timestamp: new Date('2024-01-01T10:00:00Z'),
    metadata: {
      source: 'manual',
      validated: true
    },
    ...overrides
  };
};

// src/test/mocks/student-repository.mock.ts
export const createMockStudentRepository = (): jest.Mocked<StudentRepository> => ({
  findById: jest.fn(),
  save: jest.fn(),
  findByStudentId: jest.fn(),
  findByDateRange: jest.fn()
});

// src/test/e2e/dashboard.spec.ts
test('dashboard displays student records correctly', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Generate test data
  await page.click('[data-testid="generate-data"]');
  await page.waitForSelector('[data-testid="record-item"]');
  
  // Verify data display
  const recordItems = await page.locator('[data-testid="record-item"]').count();
  expect(recordItems).toBeGreaterThan(0);
  
  // Verify chart rendering
  await expect(page.locator('[data-testid="emotion-chart"]')).toBeVisible();
  
  // Test responsive behavior
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(page.locator('[data-testid="mobile-layout"]')).toBeVisible();
});
```

### STRUCT_01_01_06-006: AI処理構造
**対応目標**: GOAL_01_01_06-006
**対応タスク**: TASK_01_01_06-006
**対応アーキテクチャ**: ARCH_01_01_06-006

**ディレクトリ構造**:
```
src/
├── domain/
│   ├── entities/
│   │   ├── emotion-analysis.entity.ts
│   │   ├── pattern-detection.entity.ts
│   │   ├── insight.entity.ts
│   │   └── ai-model.entity.ts
│   ├── services/
│   │   ├── emotion-analyzer.service.ts
│   │   ├── pattern-detector.service.ts
│   │   ├── insight-generator.service.ts
│   │   └── model-validator.service.ts
│   └── repositories/
│       └── ai-model-repository.interface.ts
├── application/
│   ├── usecases/
│   │   ├── analyze-emotion.usecase.ts
│   │   ├── detect-patterns.usecase.ts
│   │   ├── generate-insights.usecase.ts
│   │   └── validate-model.usecase.ts
│   ├── services/
│   │   ├── ai-processing.service.ts
│   │   └── model-management.service.ts
│   └── dto/
│       ├── emotion-analysis.dto.ts
│       ├── pattern-detection.dto.ts
│       └── insight-generation.dto.ts
├── infrastructure/
│   ├── ai/
│   │   ├── tensorflow/
│   │   │   ├── emotion-model.service.ts
│   │   │   ├── pattern-model.service.ts
│   │   │   └── model-loader.service.ts
│   │   ├── workers/
│   │   │   ├── emotion-analysis.worker.ts
│   │   │   └── pattern-detection.worker.ts
│   │   └── processors/
│   │       ├── text-preprocessor.service.ts
│   │       └── feature-extractor.service.ts
│   ├── repositories/
│   │   ├── model-registry.repository.ts
│   │   └── analysis-cache.repository.ts
│   └── monitoring/
│       ├── model-performance.monitor.ts
│       └── prediction-accuracy.tracker.ts
└── presentation/
    ├── components/
    │   ├── ai/
    │   │   ├── EmotionAnalysis.tsx
    │   │   ├── PatternDetection.tsx
    │   │   ├── InsightPanel.tsx
    │   │   └── ModelStatus.tsx
    │   └── charts/
    │       ├── EmotionTrendChart.tsx
    │       └── PatternVisualization.tsx
    └── hooks/
        ├── useEmotionAnalysis.ts
        ├── usePatternDetection.ts
        ├── useInsights.ts
        └── useAIModels.ts
```

**ファイル構成**:
```typescript
// src/domain/entities/emotion-analysis.entity.ts
export interface EmotionAnalysis {
  id: string;
  recordId: string;
  scores: EmotionScores;
  confidence: number;
  processedAt: Date;
  modelVersion: string;
}

export interface EmotionScores {
  happiness: number;
  engagement: number;
  stress: number;
  confidence: number;
  overall: number;
}

// src/infrastructure/ai/tensorflow/emotion-model.service.ts
export class TensorFlowEmotionModel implements EmotionAnalyzer {
  private model: tf.LayersModel | null = null;
  
  async initialize(): Promise<void> {
    this.model = await tf.loadLayersModel('/models/emotion/model.json');
  }
  
  async analyze(text: string): Promise<EmotionAnalysis> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }
    
    const preprocessed = this.preprocessText(text);
    const prediction = await this.model.predict(preprocessed) as tf.Tensor;
    const scores = await this.extractScores(prediction);
    
    return {
      id: generateId(),
      recordId: '',
      scores,
      confidence: this.calculateConfidence(scores),
      processedAt: new Date(),
      modelVersion: this.model.version
    };
  }
  
  private preprocessText(text: string): tf.Tensor {
    // Text preprocessing logic
    const tokens = this.tokenize(text);
    const encoded = this.encodeTokens(tokens);
    return tf.tensor2d([encoded]);
  }
}

// src/presentation/components/ai/EmotionAnalysis.tsx
export const EmotionAnalysis = ({ recordId }: Props) => {
  const { analysis, loading, error } = useEmotionAnalysis(recordId);
  
  if (loading) return <AnalysisLoader />;
  if (error) return <AnalysisError error={error} />;
  if (!analysis) return null;
  
  return (
    <AnalysisContainer>
      <EmotionScores scores={analysis.scores} />
      <ConfidenceIndicator confidence={analysis.confidence} />
      <ModelInfo version={analysis.modelVersion} />
    </AnalysisContainer>
  );
};
```

### STRUCT_01_01_07-007: ユーザビリティ構造
**対応目標**: GOAL_01_01_07-007
**対応タスク**: TASK_01_01_07-007
**対応アーキテクチャ**: ARCH_01_01_07-007

**ディレクトリ構造**:
```
src/
├── domain/
│   ├── entities/
│   │   ├── user-preference.entity.ts
│   │   ├── accessibility-config.entity.ts
│   │   ├── localization.entity.ts
│   │   └── user-experience.entity.ts
│   ├── services/
│   │   ├── accessibility.service.ts
│   │   ├── localization.service.ts
│   │   ├── user-guidance.service.ts
│   │   └── preference-manager.service.ts
│   └── repositories/
│       └── user-preference-repository.interface.ts
├── application/
│   ├── usecases/
│   │   ├── configure-accessibility.usecase.ts
│   │   ├── set-localization.usecase.ts
│   │   ├── provide-guidance.usecase.ts
│   │   └── manage-preferences.usecase.ts
│   ├── services/
│   │   ├── user-experience.service.ts
│   │   └── personalization.service.ts
│   └── dto/
│       ├── accessibility-config.dto.ts
│       ├── localization-request.dto.ts
│       └── guidance-response.dto.ts
├── infrastructure/
│   ├── localization/
│   │   ├── i18n/
│   │   │   ├── locales/
│   │   │   │   ├── ja.json
│   │   │   │   ├── en.json
│   │   │   │   └── index.ts
│   │   │   └── i18n.config.ts
│   │   └── formatters/
│   │       ├── date-formatter.service.ts
│   │       └── number-formatter.service.ts
│   ├── accessibility/
│   │   ├── screen-reader.service.ts
│   │   ├── keyboard-navigation.service.ts
│   │   └── color-contrast.service.ts
│   └── guidance/
│       ├── tutorial.service.ts
│       ├── help-system.service.ts
│       └── onboarding.service.ts
└── presentation/
    ├── components/
    │   ├── accessibility/
    │   │   ├── AccessibilityMenu.tsx
    │   │   ├── KeyboardNavigation.tsx
    │   │   ├── ScreenReaderSupport.tsx
    │   │   └── HighContrastMode.tsx
    │   ├── localization/
    │   │   ├── LanguageSelector.tsx
    │   │   └── LocalizedText.tsx
    │   └── guidance/
    │       ├── Tutorial.tsx
    │       ├── HelpButton.tsx
    │       ├── OnboardingFlow.tsx
    │       └── Tooltip.tsx
    ├── hooks/
    │   ├── useAccessibility.ts
    │   ├── useLocalization.ts
    │   ├── useGuidance.ts
    │   └── usePreferences.ts
    └── providers/
        ├── AccessibilityProvider.tsx
        ├── LocalizationProvider.tsx
        └── GuidanceProvider.tsx
```

**ファイル構成**:
```typescript
// src/domain/entities/accessibility-config.entity.ts
export interface AccessibilityConfig {
  screenReader: boolean;
  keyboardNavigation: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  colorBlindSupport: ColorBlindType;
}

export interface UserPreference {
  userId: string;
  language: string;
  accessibility: AccessibilityConfig;
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationConfig;
}

// src/infrastructure/localization/i18n/i18n.config.ts
export const i18nConfig = {
  lng: 'ja',
  fallbackLng: 'en',
  debug: process.env.NODE_ENV === 'development',
  resources: {
    ja: {
      translation: require('./locales/ja.json'),
      common: require('./locales/ja-common.json')
    },
    en: {
      translation: require('./locales/en.json'),
      common: require('./locales/en-common.json')
    }
  },
  interpolation: {
    escapeValue: false
  }
};

// src/presentation/components/accessibility/AccessibilityMenu.tsx
export const AccessibilityMenu = () => {
  const { config, updateConfig } = useAccessibility();
  const { t } = useLocalization();
  
  return (
    <MenuContainer role="menu" aria-label={t('accessibility.menu')}>
      <MenuItem>
        <Switch
          checked={config.screenReader}
          onChange={(checked) => updateConfig({ screenReader: checked })}
          aria-label={t('accessibility.screenReader')}
        />
        <Label>{t('accessibility.screenReader')}</Label>
      </MenuItem>
      
      <MenuItem>
        <Select
          value={config.fontSize}
          onChange={(size) => updateConfig({ fontSize: size })}
          aria-label={t('accessibility.fontSize')}
        >
          <Option value="small">{t('accessibility.fontSizes.small')}</Option>
          <Option value="medium">{t('accessibility.fontSizes.medium')}</Option>
          <Option value="large">{t('accessibility.fontSizes.large')}</Option>
        </Select>
      </MenuItem>
    </MenuContainer>
  );
};
```

### STRUCT_01_01_08-008: 運用構造
**対応目標**: GOAL_01_01_08-008
**対応タスク**: TASK_01_01_08-008
**対応アーキテクチャ**: ARCH_01_01_08-008

**ディレクトリ構造**:
```
├── deployment/
│   ├── docker/
│   │   ├── Dockerfile
│   │   ├── docker-compose.yml
│   │   └── docker-compose.prod.yml
│   ├── kubernetes/
│   │   ├── namespace.yaml
│   │   ├── configmap.yaml
│   │   ├── secret.yaml
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   ├── ingress.yaml
│   │   └── hpa.yaml
│   ├── helm/
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   ├── values-prod.yaml
│   │   └── templates/
│   │       ├── deployment.yaml
│   │       ├── service.yaml
│   │       ├── ingress.yaml
│   │       └── configmap.yaml
│   └── terraform/
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       └── modules/
├── monitoring/
│   ├── prometheus/
│   │   ├── prometheus.yml
│   │   ├── rules/
│   │   │   ├── application.rules.yml
│   │   │   └── infrastructure.rules.yml
│   │   └── alerts/
│   │       ├── critical.yml
│   │       └── warning.yml
│   ├── grafana/
│   │   ├── dashboards/
│   │   │   ├── application.json
│   │   │   ├── infrastructure.json
│   │   │   └── business.json
│   │   └── provisioning/
│   │       ├── datasources/
│   │       └── dashboards/
│   └── loki/
│       ├── loki.yml
│       └── rules/
├── logging/
│   ├── elasticsearch/
│   │   ├── elasticsearch.yml
│   │   └── mappings/
│   ├── logstash/
│   │   ├── logstash.yml
│   │   └── pipelines/
│   │       ├── application.conf
│   │       └── access.conf
│   └── kibana/
│       ├── kibana.yml
│       └── dashboards/
├── scripts/
│   ├── deploy/
│   │   ├── deploy.sh
│   │   ├── rollback.sh
│   │   └── health-check.sh
│   ├── backup/
│   │   ├── backup-database.sh
│   │   ├── restore-database.sh
│   │   └── cleanup-backups.sh
│   └── maintenance/
│       ├── update-certificates.sh
│       ├── security-scan.sh
│       └── performance-tune.sh
├── config/
│   ├── environments/
│   │   ├── development.env
│   │   ├── staging.env
│   │   └── production.env
│   ├── nginx/
│   │   ├── nginx.conf
│   │   └── ssl/
│   └── ssl/
│       ├── certbot/
│       └── certificates/
└── docs/
    ├── deployment/
    │   ├── getting-started.md
    │   ├── kubernetes-setup.md
    │   └── monitoring-setup.md
    ├── runbooks/
    │   ├── incident-response.md
    │   ├── disaster-recovery.md
    │   └── maintenance-procedures.md
    └── architecture/
        ├── infrastructure-overview.md
        └── security-considerations.md
```

**ファイル構成**:
```yaml
# deployment/kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ikiiki-record
  labels:
    app: ikiiki-record
    version: v1
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ikiiki-record
  template:
    metadata:
      labels:
        app: ikiiki-record
        version: v1
    spec:
      containers:
      - name: frontend
        image: ikiiki-record:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: API_URL
          valueFrom:
            configMapKeyRef:
              name: ikiiki-config
              key: API_URL
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

# monitoring/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"
  - "alerts/*.yml"

scrape_configs:
  - job_name: 'ikiiki-record'
    static_configs:
      - targets: ['ikiiki-record:3000']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

# scripts/deploy/deploy.sh
#!/bin/bash
set -e

echo "Starting deployment..."

# Build and push Docker image
docker build -t ikiiki-record:$VERSION .
docker push ikiiki-record:$VERSION

# Deploy to Kubernetes
kubectl apply -f deployment/kubernetes/
kubectl set image deployment/ikiiki-record frontend=ikiiki-record:$VERSION

# Wait for rollout
kubectl rollout status deployment/ikiiki-record

# Health check
./scripts/deploy/health-check.sh

echo "Deployment completed successfully!"
```

## 構造原則

### 1. 関心の分離
- 各ディレクトリは明確な責務を持つ
- レイヤー間の依存は一方向に制限
- 横断的関心は共有モジュールに集約

### 2. 命名規則
- ファイル名はケバブケースを使用
- コンポーネントはPascalCase
- サービスは機能名 + Service
- テストファイルは.test/.specサフィックス

### 3. 依存管理
- 外部依存はinfrastructure層に限定
- domain層は純粋なビジネスロジックのみ
- presentation層はUIに特化

### 4. スケーラビリティ
- モジュール単位での分割を可能に
- マイクロサービスへの移行を考慮
- 水平スケーリングをサポート

---

**更新履歴**:
- 2024-01-01: 初版作成
- 2024-01-15: AI構造追加
- 2024-02-01: 運用構造拡充