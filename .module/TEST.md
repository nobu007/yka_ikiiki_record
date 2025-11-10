# TEST.md - イキイキレコード テスト仕様

## ドキュメントメタ情報

- **文書ID**: TEST-YKA-IR-001
- **処理方式**: SDEC×2SCV×ACR統合管理
- **対象**: イキイキレコードプロジェクト全体
- **上位文書**: SYSTEM_CONSTITUTION.md, AGENTS.md, TASKS.md, MODULE_GOALS.md
- **更新日時**: 2025-01-10T09:33:00+09:00
- **状態**: ACTIVE

## SDEC×2SCV×ACR 適用宣言

本テスト仕様はSDEC×2SCV×ACRフレームワークに基づき自律的に管理される。すべてのテストはSpec→Data→Eval→Changeサイクルで管理され、2SCVによる双方向検証とACRによる自律的補完が適用される。

## テスト定義

### TEST_01_01_01-001: データ生成テスト
**対応目標**: GOAL_01_01_01-001
**対応タスク**: TASK_25_01_10-001
**対応アーキテクチャ**: ARCH_01_01_01-001
**対応構造**: STRUCT_01_01_01-001
**対応挙動**: BEHAV_01_01_01-001
**対応実装**: IMPL_01_01_01-001

**ユニットテスト**:
```typescript
// src/domain/services/__tests__/data-generator.service.test.ts
describe('DataGeneratorService', () => {
  let dataGenerator: DataGeneratorService;
  let mockValidator: jest.Mocked<DataValidator>;
  let mockRepository: jest.Mocked<DataRepository>;
  
  beforeEach(() => {
    mockValidator = createMockDataValidator();
    mockRepository = createMockDataRepository();
    dataGenerator = new DataGeneratorService(mockValidator, mockRepository);
  });
  
  describe('generate', () => {
    it('should generate valid data for normal distribution', async () => {
      // Arrange
      const request: DataGenerationRequest = {
        pattern: {
          type: 'normal',
          parameters: { mean: 50, stdDev: 15, count: 100 }
        }
      };
      
      mockValidator.validate.mockResolvedValue({
        isValid: true,
        errors: []
      });
      
      // Act
      const result = await dataGenerator.generate(request);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.values).toHaveLength(100);
      expect(result.pattern.type).toBe('normal');
      expect(result.metadata.quality).toBeGreaterThan(80);
      
      // データ分布の検証
      const mean = result.values.reduce((a, b) => a + b) / result.values.length;
      expect(mean).toBeCloseTo(50, 1);
      
      // 全ての値が0-100の範囲内
      result.values.forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      });
    });
    
    it('should generate bimodal distribution correctly', async () => {
      // Arrange
      const request: DataGenerationRequest = {
        pattern: {
          type: 'bimodal',
          parameters: { mean1: 30, mean2: 70, stdDev: 10, count: 200 }
        }
      };
      
      mockValidator.validate.mockResolvedValue({
        isValid: true,
        errors: []
      });
      
      // Act
      const result = await dataGenerator.generate(request);
      
      // Assert
      expect(result.values).toHaveLength(200);
      
      // 二峰性の検証
      const peaks = findPeaks(result.values);
      expect(peaks).toHaveLength(2);
      expect(peaks[0]).toBeCloseTo(30, 5);
      expect(peaks[1]).toBeCloseTo(70, 5);
    });
    
    it('should handle validation errors', async () => {
      // Arrange
      const request: DataGenerationRequest = {
        pattern: {
          type: 'invalid',
          parameters: {}
        }
      };
      
      mockValidator.validate.mockResolvedValue({
        isValid: false,
        errors: ['Invalid pattern type']
      });
      
      // Act & Assert
      await expect(dataGenerator.generate(request))
        .rejects.toThrow(ValidationError);
    });
    
    it('should calculate quality score correctly', async () => {
      // Arrange
      const request: DataGenerationRequest = {
        pattern: {
          type: 'normal',
          parameters: { mean: 50, stdDev: 5, count: 100 }
        }
      };
      
      mockValidator.validate.mockResolvedValue({
        isValid: true,
        errors: []
      });
      
      // Act
      const result = await dataGenerator.generate(request);
      
      // Assert
      expect(result.metadata.quality).toBeGreaterThan(90);
    });
  });
});

// src/infrastructure/generators/__tests__/normal-distribution.generator.test.ts
describe('NormalDistributionGenerator', () => {
  let generator: NormalDistributionGenerator;
  
  beforeEach(() => {
    generator = new NormalDistributionGenerator();
  });
  
  describe('generate', () => {
    it('should generate normally distributed data', async () => {
      // Arrange
      const pattern: DataPattern = {
        type: 'normal',
        parameters: { mean: 50, stdDev: 15, count: 1000 }
      };
      
      // Act
      const data = await generator.generate(pattern);
      
      // Assert
      expect(data).toHaveLength(1000);
      
      // 統計的検証
      const mean = data.reduce((a, b) => a + b) / data.length;
      const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
      const stdDev = Math.sqrt(variance);
      
      expect(mean).toBeCloseTo(50, 1);
      expect(stdDev).toBeCloseTo(15, 1);
      
      // 正規性の検証（シャピロ・ウィルク検定の簡易版）
      const skewness = calculateSkewness(data);
      expect(Math.abs(skewness)).toBeLessThan(0.5);
    });
    
    it('should handle edge cases', async () => {
      // Arrange
      const pattern: DataPattern = {
        type: 'normal',
        parameters: { mean: 0, stdDev: 1, count: 10 }
      };
      
      // Act
      const data = await generator.generate(pattern);
      
      // Assert
      expect(data).toHaveLength(10);
      data.forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      });
    });
  });
});
```

**統合テスト**:
```typescript
// src/test/integration/data-generation.integration.test.ts
describe('Data Generation Integration', () => {
  let testContainer: TestContainer;
  let dataGenerator: DataGeneratorService;
  let repository: DataRepository;
  
  beforeAll(async () => {
    testContainer = await setupTestContainer();
    dataGenerator = testContainer.get<DataGeneratorService>('DataGeneratorService');
    repository = testContainer.get<DataRepository>('DataRepository');
  });
  
  afterAll(async () => {
    await testContainer.dispose();
  });
  
  beforeEach(async () => {
    await repository.clear();
  });
  
  describe('End-to-End Data Generation', () => {
    it('should generate and store data correctly', async () => {
      // Arrange
      const request: DataGenerationRequest = {
        pattern: {
          type: 'normal',
          parameters: { mean: 60, stdDev: 10, count: 500 }
        }
      };
      
      // Act
      const result = await dataGenerator.generate(request);
      const saved = await repository.findById(result.id);
      
      // Assert
      expect(saved).toBeDefined();
      expect(saved!.id).toBe(result.id);
      expect(saved!.values).toEqual(result.values);
      expect(saved!.metadata.quality).toBeGreaterThan(80);
    });
    
    it('should handle concurrent generation requests', async () => {
      // Arrange
      const requests = Array.from({ length: 10 }, (_, i) => ({
        pattern: {
          type: 'normal',
          parameters: { mean: 50 + i * 5, stdDev: 10, count: 100 }
        } as DataPattern
      }));
      
      // Act
      const results = await Promise.all(
        requests.map(req => dataGenerator.generate(req))
      );
      
      // Assert
      expect(results).toHaveLength(10);
      results.forEach((result, index) => {
        expect(result.values).toHaveLength(100);
        const mean = result.values.reduce((a, b) => a + b) / result.values.length;
        expect(mean).toBeCloseTo(50 + index * 5, 2);
      });
      
      // 保存されたデータの検証
      const savedResults = await Promise.all(
        results.map(result => repository.findById(result.id))
      );
      
      savedResults.forEach(saved => {
        expect(saved).toBeDefined();
      });
    });
  });
});
```

**E2Eテスト**:
```typescript
// src/test/e2e/data-generation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Data Generation E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });
  
  test('should generate data with normal distribution', async ({ page }) => {
    // Arrange
    await page.click('[data-testid="data-generator-tab"]');
    
    // Act
    await page.selectOption('[data-testid="pattern-select"]', 'normal');
    await page.fill('[data-testid="mean-input"]', '50');
    await page.fill('[data-testid="stddev-input"]', '15');
    await page.fill('[data-testid="count-input"]', '100');
    await page.click('[data-testid="generate-button"]');
    
    // Assert
    await expect(page.locator('[data-testid="generation-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="data-count"]')).toContainText('100');
    
    // グラフの検証
    await expect(page.locator('[data-testid="generated-chart"]')).toBeVisible();
    
    // 統計情報の検証
    await expect(page.locator('[data-testid="mean-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="stddev-value"]')).toBeVisible();
  });
  
  test('should handle invalid input gracefully', async ({ page }) => {
    // Arrange
    await page.click('[data-testid="data-generator-tab"]');
    
    // Act
    await page.selectOption('[data-testid="pattern-select"]', 'normal');
    await page.fill('[data-testid="mean-input"]', '-10'); // 無効な値
    await page.click('[data-testid="generate-button"]');
    
    // Assert
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-error"]')).toContainText('平均値は0以上である必要があります');
    
    // ボタンが無効化されていることを確認
    await expect(page.locator('[data-testid="generate-button"]')).toBeDisabled();
  });
  
  test('should show real-time progress for large datasets', async ({ page }) => {
    // Arrange
    await page.click('[data-testid="data-generator-tab"]');
    
    // Act
    await page.selectOption('[data-testid="pattern-select"]', 'normal');
    await page.fill('[data-testid="count-input"]', '10000'); // 大量データ
    await page.click('[data-testid="generate-button"]');
    
    // Assert
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-percentage"]')).toBeVisible();
    
    // 進捗の更新を確認
    let lastPercentage = 0;
    for (let i = 0; i < 10; i++) {
      const percentage = await page.locator('[data-testid="progress-percentage"]').textContent();
      const currentPercentage = parseInt(percentage || '0');
      
      expect(currentPercentage).toBeGreaterThanOrEqual(lastPercentage);
      lastPercentage = currentPercentage;
      
      await page.waitForTimeout(500);
    }
    
    // 完了を待機
    await expect(page.locator('[data-testid="generation-success"]')).toBeVisible({ timeout: 30000 });
  });
});
```

### TEST_01_01_02-002: 可視化テスト
**対応目標**: GOAL_01_01_02-002
**対応タスク**: TASK_25_01_10-001
**対応アーキテクチャ**: ARCH_01_01_02-002
**対応構造**: STRUCT_01_01_02-002
**対応挙動**: BEHAV_01_01_02-002
**対応実装**: IMPL_01_01_02-002

**ユニットテスト**:
```typescript
// src/infrastructure/renderers/__tests__/apexcharts.renderer.test.ts
describe('ApexChartsRenderer', () => {
  let renderer: ApexChartsRenderer;
  let mockContainer: HTMLElement;
  
  beforeEach(() => {
    renderer = new ApexChartsRenderer();
    mockContainer = document.createElement('div');
    document.body.appendChild(mockContainer);
  });
  
  afterEach(() => {
    document.body.removeChild(mockContainer);
  });
  
  describe('render', () => {
    it('should render line chart correctly', async () => {
      // Arrange
      const config: ChartConfig = {
        type: 'line',
        data: {
          series: [{
            name: 'Test Series',
            data: [10, 20, 30, 40, 50]
          }],
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May']
        }
      };
      
      // Act
      const chartView = await renderer.render(mockContainer, config);
      
      // Assert
      expect(chartView.type).toBe('apexcharts');
      expect(chartView.chart).toBeDefined();
      expect(chartView.options.chart.type).toBe('line');
      expect(chartView.options.series).toEqual(config.data.series);
    });
    
    it('should build custom tooltip correctly', async () => {
      // Arrange
      const config: ChartConfig = {
        type: 'line',
        data: {
          series: [{
            name: 'Test Series',
            data: [10, 20, 30]
          }],
          categories: ['A', 'B', 'C']
        },
        customTooltip: true
      };
      
      // Act
      const chartView = await renderer.render(mockContainer, config);
      const tooltipFunction = chartView.options.tooltip.custom;
      
      // Assert
      expect(tooltipFunction).toBeDefined();
      
      if (tooltipFunction) {
        const tooltip = tooltipFunction({
          series: [[10, 20, 30]],
          seriesIndex: 0,
          dataPointIndex: 1,
          w: { globals: { labels: ['A', 'B', 'C'] } }
        });
        
        expect(tooltip).toContain('B');
        expect(tooltip).toContain('20');
        expect(tooltip).toContain('Test Series');
      }
    });
    
    it('should handle responsive configuration', async () => {
      // Arrange
      const config: ChartConfig = {
        type: 'bar',
        data: {
          series: [{
            name: 'Test Series',
            data: [10, 20, 30]
          }]
        }
      };
      
      // Act
      const chartView = await renderer.render(mockContainer, config);
      
      // Assert
      expect(chartView.options.responsive).toBeDefined();
      expect(chartView.options.responsive).toHaveLength(1);
      
      const responsiveConfig = chartView.options.responsive[0];
      expect(responsiveConfig.breakpoint).toBe(768);
      expect(responsiveConfig.options.chart.height).toBe(250);
    });
  });
  
  describe('updateData', () => {
    it('should update chart data correctly', async () => {
      // Arrange
      const initialConfig: ChartConfig = {
        type: 'line',
        data: {
          series: [{
            name: 'Test Series',
            data: [10, 20, 30]
          }],
          categories: ['A', 'B', 'C']
        }
      };
      
      const chartView = await renderer.render(mockContainer, initialConfig);
      
      const newData: ChartData = {
        series: [{
          name: 'Updated Series',
          data: [15, 25, 35]
        }],
        categories: ['X', 'Y', 'Z']
      };
      
      // Act
      renderer.updateData(newData);
      
      // Assert
      // ApexChartsのupdateSeriesメソッドが呼ばれることを検証
      expect(chartView.chart.updateSeries).toHaveBeenCalledWith(newData.series);
    });
  });
});
```

**パフォーマンステスト**:
```typescript
// src/test/performance/chart-rendering.performance.test.ts
describe('Chart Rendering Performance', () => {
  let renderer: ApexChartsRenderer;
  let mockContainer: HTMLElement;
  
  beforeEach(() => {
    renderer = new ApexChartsRenderer();
    mockContainer = document.createElement('div');
    document.body.appendChild(mockContainer);
  });
  
  afterEach(() => {
    document.body.removeChild(mockContainer);
  });
  
  it('should render large datasets within performance limits', async () => {
    // Arrange
    const largeData: ChartData = {
      series: [{
        name: 'Large Dataset',
        data: Array.from({ length: 10000 }, (_, i) => Math.random() * 100)
      }],
      categories: Array.from({ length: 10000 }, (_, i) => `Point ${i}`)
    };
    
    const config: ChartConfig = {
      type: 'line',
      data: largeData
    };
    
    // Act
    const startTime = performance.now();
    const chartView = await renderer.render(mockContainer, config);
    const endTime = performance.now();
    
    // Assert
    const renderTime = endTime - startTime;
    expect(renderTime).toBeLessThan(2000); // 2秒以内
    expect(chartView.chart).toBeDefined();
  });
  
  it('should handle frequent data updates efficiently', async () => {
    // Arrange
    const initialConfig: ChartConfig = {
      type: 'line',
      data: {
        series: [{
          name: 'Dynamic Data',
          data: [10, 20, 30]
        }],
        categories: ['A', 'B', 'C']
      }
    };
    
    const chartView = await renderer.render(mockContainer, initialConfig);
    
    // Act
    const updateTimes: number[] = [];
    
    for (let i = 0; i < 100; i++) {
      const newData: ChartData = {
        series: [{
          name: 'Dynamic Data',
          data: Array.from({ length: 3 }, () => Math.random() * 100)
        }],
        categories: ['A', 'B', 'C']
      };
      
      const startTime = performance.now();
      renderer.updateData(newData);
      const endTime = performance.now();
      
      updateTimes.push(endTime - startTime);
    }
    
    // Assert
    const averageUpdateTime = updateTimes.reduce((a, b) => a + b) / updateTimes.length;
    expect(averageUpdateTime).toBeLessThan(50); // 50ms以内
  });
});
```

### TEST_01_01_03-003: レスポンシブテスト
**対応目標**: GOAL_01_01_03-003
**対応タスク**: TASK_25_01_10-001
**対応アーキテクチャ**: ARCH_01_01_03-003
**対応構造**: STRUCT_01_01_03-003
**対応挙動**: BEHAV_01_01_03-003
**対応実装**: IMPL_01_01_03-003

**ユニットテスト**:
```typescript
// src/infrastructure/detectors/__tests__/device-detector.service.test.ts
describe('DeviceDetectorService', () => {
  let detector: DeviceDetectorService;
  let originalInnerWidth: number;
  let originalInnerHeight: number;
  
  beforeEach(() => {
    detector = new DeviceDetectorService();
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;
  });
  
  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: originalInnerHeight
    });
  });
  
  describe('detect', () => {
    it('should detect mobile device correctly', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667
      });
      
      // Act
      const deviceInfo = detector.detect();
      
      // Assert
      expect(deviceInfo.type).toBe('mobile');
      expect(deviceInfo.screenSize.width).toBe(375);
      expect(deviceInfo.screenSize.height).toBe(667);
      expect(deviceInfo.orientation).toBe('portrait');
    });
    
    it('should detect tablet device correctly', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1024
      });
      
      // Act
      const deviceInfo = detector.detect();
      
      // Assert
      expect(deviceInfo.type).toBe('tablet');
      expect(deviceInfo.screenSize.width).toBe(768);
      expect(deviceInfo.screenSize.height).toBe(1024);
      expect(deviceInfo.orientation).toBe('portrait');
    });
    
    it('should detect desktop device correctly', () => {
      // Arrange
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 800
      });
      
      // Act
      const deviceInfo = detector.detect();
      
      // Assert
      expect(deviceInfo.type).toBe('desktop');
      expect(deviceInfo.screenSize.width).toBe(1200);
      expect(deviceInfo.screenSize.height).toBe(800);
      expect(deviceInfo.orientation).toBe('landscape');
    });
  });
});
```

**E2Eテスト**:
```typescript
// src/test/e2e/responsive-design.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Responsive Design E2E', () => {
  test('should adapt layout for mobile devices', async ({ page }) => {
    // Arrange
    await page.goto('/');
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Act & Assert
    // モバイルナビゲーションの確認
    await expect(page.locator('[data-testid="mobile-navigation"]')).toBeVisible();
    await expect(page.locator('[data-testid="desktop-navigation"]')).not.toBeVisible();
    
    // ハンバーガーメニューの確認
    await expect(page.locator('[data-testid="hamburger-menu"]')).toBeVisible();
    
    // グリッドレイアウトの確認
    await expect(page.locator('[data-testid="mobile-grid"]')).toBeVisible();
    await expect(page.locator('[data-testid="desktop-grid"]')).not.toBeVisible();
  });
  
  test('should adapt layout for tablet devices', async ({ page }) => {
    // Arrange
    await page.goto('/');
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Act & Assert
    // タブレットナビゲーションの確認
    await expect(page.locator('[data-testid="tablet-navigation"]')).toBeVisible();
    
    // サイドバーの確認
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    
    // グリッドレイアウトの確認
    await expect(page.locator('[data-testid="tablet-grid"]')).toBeVisible();
  });
  
  test('should adapt layout for desktop devices', async ({ page }) => {
    // Arrange
    await page.goto('/');
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Act & Assert
    // デスクトップナビゲーションの確認
    await expect(page.locator('[data-testid="desktop-navigation"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-navigation"]')).not.toBeVisible();
    
    // 水平ナビゲーションの確認
    await expect(page.locator('[data-testid="horizontal-nav"]')).toBeVisible();
    
    // グリッドレイアウトの確認
    await expect(page.locator('[data-testid="desktop-grid"]')).toBeVisible();
  });
});
```

### TEST_01_01_04-004: クリーンアーキテクチャテスト
**対応目標**: GOAL_01_01_04-004
**対応タスク**: TASK_25_01_10-001
**対応アーキテクチャ**: ARCH_01_01_04-004
**対応構造**: STRUCT_01_01_04-004
**対応挙動**: BEHAV_01_01_04-004
**対応実装**: IMPL_01_01_04-004

**ユニットテスト**:
```typescript
// src/domain/entities/__tests__/student-record.entity.test.ts
describe('StudentRecord', () => {
  describe('create', () => {
    it('should create valid student record', () => {
      // Arrange
      const props: CreateStudentRecordProps = {
        studentId: 'student-001',
        emotionScore: EmotionScore.create({
          overall: 75,
          dimensions: {
            happiness: 80,
            engagement: 70,
            stress: 30,
            confidence: 85
          }
        }),
        content: '今日の授業は楽しかったです。',
        metadata: {
          source: 'manual',
          validated: true
        }
      };
      
      // Act
      const record = StudentRecord.create(props);
      
      // Assert
      expect(record.id).toBeDefined();
      expect(record.studentId).toBe(props.studentId);
      expect(record.emotionScore).toEqual(props.emotionScore);
      expect(record.content).toBe(props.content);
      expect(record.metadata).toEqual(props.metadata);
      expect(record.timestamp).toBeInstanceOf(Date);
    });
    
    it('should validate record correctly', () => {
      // Arrange
      const validRecord = StudentRecord.create({
        studentId: 'student-001',
        emotionScore: EmotionScore.create({
          overall: 75,
          dimensions: {
            happiness: 80,
            engagement: 70,
            stress: 30,
            confidence: 85
          }
        }),
        content: 'Valid content'
      });
      
      // Act & Assert
      expect(validRecord.isValid()).toBe(true);
    });
    
    it('should identify invalid record', () => {
      // Arrange
      const invalidRecord = new StudentRecord(
        '', // 空のID
        'student-001',
        EmotionScore.create({
          overall: 75,
          dimensions: {
            happiness: 80,
            engagement: 70,
            stress: 30,
            confidence: 85
          }
        }),
        'Valid content',
        new Date(),
        {}
      );
      
      // Act & Assert
      expect(invalidRecord.isValid()).toBe(false);
    });
  });
});
```

**統合テスト**:
```typescript
// src/test/integration/clean-architecture.integration.test.ts
describe('Clean Architecture Integration', () => {
  let testContainer: TestContainer;
  let createRecordUseCase: CreateRecordUseCase;
  let studentRepository: StudentRepository;
  
  beforeAll(async () => {
    testContainer = await setupTestContainer();
    createRecordUseCase = testContainer.get<CreateRecordUseCase>('CreateRecordUseCase');
    studentRepository = testContainer.get<StudentRepository>('StudentRepository');
  });
  
  afterAll(async () => {
    await testContainer.dispose();
  });
  
  beforeEach(async () => {
    await studentRepository.clear();
  });
  
  describe('Domain Layer Integration', () => {
    it('should maintain domain invariants', async () => {
      // Arrange
      const request: CreateRecordRequest = {
        studentId: 'student-001',
        content: '今日の授業は楽しかったです。'
      };
      
      // Act
      const result = await createRecordUseCase.execute(request);
      
      // Assert
      expect(result.success).toBe(true);
      
      const record = result.record!;
      
      // ドメイン不変条件の検証
      expect(record.id).toBeDefined();
      expect(record.studentId).toBe(request.studentId);
      expect(record.emotionScore.overall).toBeGreaterThanOrEqual(0);
      expect(record.emotionScore.overall).toBeLessThanOrEqual(100);
      
      Object.values(record.emotionScore.dimensions).forEach(value => {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(100);
      });
    });
  });
});
```

### TEST_01_01_05-005: 包括的テスト体制テスト
**対応目標**: GOAL_01_01_05-005
**対応タスク**: TASK_25_01_10-001
**対応アーキテクチャ**: ARCH_01_01_05-005
**対応構造**: STRUCT_01_01_05-005
**対応挙動**: BEHAV_01_01_05-005
**対応実装**: IMPL_01_01_05-005

**テスト設定**:
```typescript
// src/test/setup/jest.setup.ts
import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { server } from './msw.setup';

// MSWサーバーの起動
beforeAll(() => server.listen());

// 各テスト後にハンドラーをリセット
afterEach(() => server.resetHandlers());

// テスト完了後にサーバーを停止
afterAll(() => server.close());

// Testing Libraryの設定
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
});

// グローバルモック
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
```

**カバレッジ設定**:
```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup/jest.setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/test/**/*',
    '!src/**/*.stories.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    './src/domain/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
    './src/application/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json-summary'
  ],
};
```

### TEST_01_01_06-006: AI処理テスト
**対応目標**: GOAL_01_01_06-006
**対応タスク**: TASK_25_01_10-006
**対応アーキテクチャ**: ARCH_01_01_06-006
**対応構造**: STRUCT_01_01_06-006
**対応挙動**: BEHAV_01_01_06-006
**対応実装**: IMPL_01_01_06-006

**ユニットテスト**:
```typescript
// src/infrastructure/ai/tensorflow/__tests__/emotion-model.service.test.ts
describe('TensorFlowEmotionModel', () => {
  let model: TensorFlowEmotionModel;
  let mockTensorFlow: jest.Mocked<typeof tf>;
  
  beforeEach(() => {
    mockTensorFlow = createMockTensorFlow();
    model = new TensorFlowEmotionModel();
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  describe('initialize', () => {
    it('should initialize model successfully', async () => {
      // Arrange
      const mockModel = createMockLayersModel();
      mockTensorFlow.loadLayersModel.mockResolvedValue(mockModel);
      
      // Act
      await model.initialize();
      
      // Assert
      expect(mockTensorFlow.loadLayersModel).toHaveBeenCalledWith('/models/emotion/model.json');
    });
    
    it('should handle initialization failure', async () => {
      // Arrange
      mockTensorFlow.loadLayersModel.mockRejectedValue(new Error('Model load failed'));
      
      // Act & Assert
      await expect(model.initialize()).rejects.toThrow('Failed to initialize emotion model');
    });
  });
  
  describe('analyze', () => {
    beforeEach(async () => {
      const mockModel = createMockLayersModel();
      mockTensorFlow.loadLayersModel.mockResolvedValue(mockModel);
      await model.initialize();
    });
    
    it('should analyze emotion correctly', async () => {
      // Arrange
      const text = '今日の授業はとても楽しかったです。';
      const mockPrediction = createMockTensor([0.8, 0.7, 0.2, 0.9]);
      mockModel.predict.mockResolvedValue(mockPrediction);
      mockPrediction.data.mockResolvedValue(new Float32Array([0.8, 0.7, 0.2, 0.9]));
      
      // Act
      const result = await model.analyze(text);
      
      // Assert
      expect(result).toBeDefined();
      expect(result.overall).toBeGreaterThan(0);
      expect(result.overall).toBeLessThanOrEqual(100);
      
      expect(result.dimensions.happiness).toBeGreaterThan(0);
      expect(result.dimensions.engagement).toBeGreaterThan(0);
      expect(result.dimensions.stress).toBeGreaterThanOrEqual(0);
      expect(result.dimensions.confidence).toBeGreaterThan(0);
    });
  });
});
```

### TEST_01_01_07-007: ユーザビリティテスト
**対応目標**: GOAL_01_01_07-007
**対応タスク**: TASK_25_01_10-007
**対応アーキテクチャ**: ARCH_01_01_07-007
**対応構造**: STRUCT_01_01_07-007
**対応挙動**: BEHAV_01_01_07-007
**対応実装**: IMPL_01_01_07-007

**アクセシビリティテスト**:
```typescript
// src/test/accessibility/a11y.test.ts
import { axe, toHaveNoViolations } from 'jest-axe';
import { render, screen } from '@testing-library/react';
import { AccessibilityMenu } from '../../components/accessibility/AccessibilityMenu';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('should have no accessibility violations', async () => {
    // Arrange
    const { container } = render(<AccessibilityMenu />);
    
    // Act
    const results = await axe(container);
    
    // Assert
    expect(results).toHaveNoViolations();
  });
  
  it('should support keyboard navigation', async () => {
    // Arrange
    render(<AccessibilityMenu />);
    
    // Act
    const menuButton = screen.getByRole('button', { name: /accessibility/i });
    menuButton.focus();
    
    // Tabキーでナビゲーション
    fireEvent.keyDown(menuButton, { key: 'Tab' });
    
    // Assert
    expect(document.activeElement).toBeVisible();
  });
});
```

**E2Eアクセシビリティテスト**:
```typescript
// src/test/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Accessibility E2E', () => {
  test('should be accessible on mobile devices', async ({ page }) => {
    // Arrange
    await page.goto('/');
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Act
    const results = await page.accessibility.snapshot();
    
    // Assert
    expect(results).toBeDefined();
    expect(results.violations).toHaveLength(0);
  });
  
  test('should support keyboard navigation', async ({ page }) => {
    // Arrange
    await page.goto('/');
    
    // Act
    await page.keyboard.press('Tab');
    const firstFocusable = await page.locator(':focus');
    
    await page.keyboard.press('Tab');
    const secondFocusable = await page.locator(':focus');
    
    // Assert
    expect(await firstFocusable.isVisible()).toBe(true);
    expect(await secondFocusable.isVisible()).toBe(true);
    expect(firstFocusable).not.toEqual(secondFocusable);
  });
});
```

### TEST_01_01_08-008: 運用テスト
**対応目標**: GOAL_01_01_08-008
**対応タスク**: TASK_25_01_10-008
**対応アーキテクチャ**: ARCH_01_01_08-008
**対応構造**: STRUCT_01_01_08-008
**対応挙動**: BEHAV_01_01_08-008
**対応実装**: IMPL_01_01_08-008

**ヘルスチェックテスト**:
```typescript
// src/test/infrastructure/monitoring/health-check.service.test.ts
describe('HealthCheckService', () => {
  let healthCheckService: HealthCheckService;
  
  beforeEach(() => {
    healthCheckService = new HealthCheckService();
  });
  
  describe('runAllChecks', () => {
    it('should run all registered checks', async () => {
      // Arrange
      const mockCheck1 = jest.fn().mockResolvedValue({
        status: 'healthy',
        message: 'Check 1 passed'
      });
      
      const mockCheck2 = jest.fn().mockResolvedValue({
        status: 'healthy',
        message: 'Check 2 passed'
      });
      
      healthCheckService.registerCheck('check1', mockCheck1);
      healthCheckService.registerCheck('check2', mockCheck2);
      
      // Act
      const result = await healthCheckService.runAllChecks();
      
      // Assert
      expect(result.status).toBe('healthy');
      expect(result.checks).toHaveProperty('check1');
      expect(result.checks).toHaveProperty('check2');
      expect(mockCheck1).toHaveBeenCalledTimes(1);
      expect(mockCheck2).toHaveBeenCalledTimes(1);
    });
    
    it('should handle check failures', async () => {
      // Arrange
      const mockCheck1 = jest.fn().mockResolvedValue({
        status: 'healthy',
        message: 'Check 1 passed'
      });
      
      const mockCheck2 = jest.fn().mockRejectedValue(new Error('Check 2 failed'));
      
      healthCheckService.registerCheck('check1', mockCheck1);
      healthCheckService.registerCheck('check2', mockCheck2);
      
      // Act
      const result = await healthCheckService.runAllChecks();
      
      // Assert
      expect(result.status).toBe('unhealthy');
      expect(result.checks.check1.status).toBe('healthy');
      expect(result.checks.check2.status).toBe('unhealthy');
    });
  });
});
```

**負荷テスト**:
```typescript
// src/test/performance/load-test.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Load Tests', () => {
  test('should handle concurrent users', async ({ browser }) => {
    // Arrange
    const concurrentUsers = 10;
    const contexts = await Promise.all(
      Array.from({ length: concurrentUsers }, () => browser.newContext())
    );
    
    const pages = await Promise.all(
      contexts.map(context => context.newPage())
    );
    
    // Act
    const startTime = Date.now();
    
    await Promise.all(
      pages.map(async (page) => {
        await page.goto('/');
        await page.click('[data-testid="generate-data-button"]');
        await page.waitForSelector('[data-testid="generation-success"]');
      })
    );
    
    const endTime = Date.now();
    
    // Assert
    const totalTime = endTime - startTime;
    expect(totalTime).toBeLessThan(30000); // 30秒以内
    
    // 全てのページで成功を確認
    for (const page of pages) {
      await expect(page.locator('[data-testid="generation-success"]')).toBeVisible();
    }
    
    // クリーンアップ
    await Promise.all(contexts.map(context => context.close()));
  });
});
```

## テスト戦略

### 1. テストピラミッド
- **70% ユニットテスト**: 個別コンポーネントと関数のテスト
- **20% 統合テスト**: コンポーネント間の連携テスト
- **10% E2Eテスト**: ユーザーフローの全体テスト

### 2. カバレッジ要件
- **全体**: 80%以上
- **ドメイン層**: 95%以上
- **アプリケーション層**: 90%以上
- **インフラ層**: 80%以上
- **プレゼンテーション層**: 75%以上

### 3. パフォーマンス基準
- **ユニットテスト実行**: < 5分
- **統合テスト実行**: < 10分
- **E2Eテスト実行**: < 15分
- **並列実行**: 最大8プロセス

### 4. 品質ゲート
- 全てのテストが成功すること
- カバレッジ要件を満たすこと
- パフォーマンス基準を満たすこと
- アクセシビリティ違反がないこと

## アンカーID対応関係検証

### 1:1対応マトリクス

| TEST ID | 対応GOAL | 対応TASK | 対応ARCH | 対応STRUCT | 対応BEHAV | 対応IMPL | 状態 |
|---------|-----------|-----------|-----------|-------------|------------|-----------|------|
| TEST_01_01_01-001 | GOAL_01_01_01-001 | TASK_25_01_10-001 | ARCH_01_01_01-001 | STRUCT_01_01_01-001 | BEHAV_01_01_01-001 | IMPL_01_01_01-001 | ✅ |
| TEST_01_01_02-002 | GOAL_01_01_02-002 | TASK_25_01_10-001 | ARCH_01_01_02-002 | STRUCT_01_01_02-002 | BEHAV_01_01_02-002 | IMPL_01_01_02-002 | ✅ |
| TEST_01_01_03-003 | GOAL_01_01_03-003 | TASK_25_01_10-001 | ARCH_01_01_03-003 | STRUCT_01_01_03-003 | BEHAV_01_01_03-003 | IMPL_01_01_03-003 | ✅ |
| TEST_01_01_04-004 | GOAL_01_01_04-004 | TASK_25_01_10-001 | ARCH_01_01_04-004 | STRUCT_01_01_04-004 | BEHAV_01_01_04-004 | IMPL_01_01_04-004 | ✅ |
| TEST_01_01_05-005 | GOAL_01_01_05-005 | TASK_25_01_10-001 | ARCH_01_01_05-005 | STRUCT_01_01_05-005 | BEHAV_01_01_05-005 | IMPL_01_01_05-005 | ✅ |
| TEST_01_01_06-006 | GOAL_01_01_06-006 | TASK_25_01_10-006 | ARCH_01_01_06-006 | STRUCT_01_01_06-006 | BEHAV_01_01_06-006 | IMPL_01_01_06-006 | ✅ |
| TEST_01_01_07-007 | GOAL_01_01_07-007 | TASK_25_01_10-007 | ARCH_01_01_07-007 | STRUCT_01_01_07-007 | BEHAV_01_01_07-007 | IMPL_01_01_07-007 | ✅ |
| TEST_01_01_08-008 | GOAL_01_01_08-008 | TASK_25_01_10-008 | ARCH_01_01_08-008 | STRUCT_01_01_08-008 | BEHAV_01_01_08-008 | IMPL_01_01_08-008 | ✅ |

### 階層整合性確認

**✅ 全てのTESTアンカーIDが対応するGOAL/TASK/ARCH/STRUCT/BEHAV/IMPLアンカーIDと1:1対応を確立**

**検証結果**:
- アンカーIDパターン適合: 100%
- 1:1対応関係: 100%
- 階層整合性: 100%
- トレーサビリティ: 完全確保

---

**更新履歴**:
- 2025-01-10: 初版作成（1:1アンカーID対応強制実行）
- 2025-01-10: SDEC×2SCV×ACR完全適用
- 2025-01-10: 包括的テスト体制定義

**次回更新**: 2025-01-11（テスト実行結果反映）

---
*本ドキュメントはSDEC×2SCV×ACRフレームワークに基づき自律的に管理される*