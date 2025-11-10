# MODULE_IMPL.md - イキイキレコード 実装詳細

## 実装概要

イキイキレコードの実装詳細は、開発者が具体的なコード実装を行うための技術仕様とベストプラクティスを提供します。各コンポーネントの具体的な実装方法、コード例、技術的決定事項を詳細に規定します。

## 実装定義

### IMPL_01_01_01-001: データ生成実装
**対応目標**: GOAL_01_01_01-001
**対応タスク**: TASK_01_01_01-001
**対応アーキテクチャ**: ARCH_01_01_01-001
**対応構造**: STRUCT_01_01_01-001
**対応挙動**: BEHAV_01_01_01-001

**コア実装**:
```typescript
// src/domain/services/data-generator.service.ts
export class DataGeneratorService implements DataGenerator {
  private readonly patterns: Map<DataPatternType, PatternGenerator>;
  private readonly validator: DataValidator;
  
  constructor(validator: DataValidator) {
    this.patterns = new Map([
      ['normal', new NormalDistributionGenerator()],
      ['bimodal', new BimodalDistributionGenerator()],
      ['stress', new StressPatternGenerator()],
      ['happy', new HappyPatternGenerator()]
    ]);
    this.validator = validator;
  }
  
  async generate(request: DataGenerationRequest): Promise<GeneratedData> {
    // 1. リクエスト検証
    const validation = await this.validator.validate(request);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors);
    }
    
    // 2. パターンジェネレーター取得
    const generator = this.patterns.get(request.pattern.type);
    if (!generator) {
      throw new Error(`Unsupported pattern: ${request.pattern.type}`);
    }
    
    // 3. データ生成
    const rawData = await generator.generate(request.pattern);
    
    // 4. メタデータ付与
    const metadata: DataMetadata = {
      generatedAt: new Date(),
      pattern: request.pattern,
      count: rawData.length,
      quality: this.calculateQuality(rawData)
    };
    
    return {
      id: generateId(),
      pattern: request.pattern,
      values: rawData,
      timestamp: new Date(),
      metadata
    };
  }
  
  private calculateQuality(data: number[]): number {
    const mean = data.reduce((a, b) => a + b) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const standardDeviation = Math.sqrt(variance);
    
    // 品質スコア計算（0-100）
    const completeness = 100;
    const consistency = Math.max(0, 100 - (standardDeviation / mean) * 100);
    const validity = data.every(val => val >= 0 && val <= 100) ? 100 : 0;
    
    return (completeness + consistency + validity) / 3;
  }
}

// src/infrastructure/workers/data-generation.worker.ts
class DataGenerationWorker {
  private generators: Map<string, PatternGenerator>;
  
  constructor() {
    this.generators = new Map([
      ['normal', new NormalDistributionGenerator()],
      ['bimodal', new BimodalDistributionGenerator()],
      ['stress', new StressPatternGenerator()],
      ['happy', new HappyPatternGenerator()]
    ]);
  }
  
  async generateInWorker(pattern: DataPattern, count: number): Promise<number[]> {
    const generator = this.generators.get(pattern.type);
    if (!generator) {
      throw new Error(`Unknown pattern type: ${pattern.type}`);
    }
    
    return await generator.generate({ ...pattern, count });
  }
}

// Web Worker entry point
const worker = new DataGenerationWorker();

self.onmessage = async (event: MessageEvent<DataGenerationRequest>) => {
  try {
    const { pattern, id, count } = event.data;
    const result = await worker.generateInWorker(pattern, count);
    
    self.postMessage({
      id,
      success: true,
      data: result,
      timestamp: Date.now()
    });
  } catch (error) {
    self.postMessage({
      id: event.data.id,
      success: false,
      error: error.message,
      timestamp: Date.now()
    });
  }
};

// src/infrastructure/workers/worker-pool.service.ts
export class WorkerPoolService {
  private workers: Worker[] = [];
  private taskQueue: QueuedTask[] = [];
  private maxWorkers: number;
  
  constructor(maxWorkers: number = navigator.hardwareConcurrency || 4) {
    this.maxWorkers = maxWorkers;
    this.initializeWorkers();
  }
  
  private initializeWorkers(): void {
    for (let i = 0; i < this.maxWorkers; i++) {
      const worker = new Worker('/workers/data-generation.worker.js');
      worker.onmessage = this.handleWorkerMessage.bind(this);
      this.workers.push(worker);
    }
  }
  
  async executeTask(task: DataGenerationTask): Promise<number[]> {
    return new Promise((resolve, reject) => {
      const queuedTask: QueuedTask = {
        id: generateId(),
        task,
        resolve,
        reject,
        timestamp: Date.now()
      };
      
      this.taskQueue.push(queuedTask);
      this.processQueue();
    });
  }
  
  private processQueue(): void {
    if (this.taskQueue.length === 0) return;
    
    const availableWorker = this.workers.find(w => !w.busy);
    if (!availableWorker) return;
    
    const task = this.taskQueue.shift()!;
    availableWorker.busy = true;
    
    availableWorker.postMessage({
      id: task.id,
      pattern: task.task.pattern,
      count: task.task.count
    });
  }
  
  private handleWorkerMessage(event: MessageEvent): void {
    const { id, success, data, error } = event.data;
    const worker = event.target as Worker;
    worker.busy = false;
    
    const task = this.taskQueue.find(t => t.id === id);
    if (!task) return;
    
    if (success) {
      task.resolve(data);
    } else {
      task.reject(new Error(error));
    }
    
    this.processQueue();
  }
}
```

**パターンジェネレーター実装**:
```typescript
// src/infrastructure/generators/normal-distribution.generator.ts
export class NormalDistributionGenerator implements PatternGenerator {
  async generate(pattern: DataPattern): Promise<number[]> {
    const { count, mean = 50, stdDev = 15 } = pattern.parameters;
    const data: number[] = [];
    
    for (let i = 0; i < count; i++) {
      data.push(this.generateNormalRandom(mean, stdDev));
    }
    
    return data.map(val => Math.max(0, Math.min(100, val)));
  }
  
  private generateNormalRandom(mean: number, stdDev: number): number {
    // Box-Muller変換
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    
    return z0 * stdDev + mean;
  }
}

// src/infrastructure/generators/bimodal-distribution.generator.ts
export class BimodalDistributionGenerator implements PatternGenerator {
  async generate(pattern: DataPattern): Promise<number[]> {
    const { count, mean1 = 30, mean2 = 70, stdDev = 10 } = pattern.parameters;
    const data: number[] = [];
    
    for (let i = 0; i < count; i++) {
      const mean = i % 2 === 0 ? mean1 : mean2;
      data.push(this.generateNormalRandom(mean, stdDev));
    }
    
    return data.map(val => Math.max(0, Math.min(100, val)));
  }
  
  private generateNormalRandom(mean: number, stdDev: number): number {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    
    return z0 * stdDev + mean;
  }
}
```

### IMPL_01_01_02-002: 可視化実装
**対応目標**: GOAL_01_01_02-002
**対応タスク**: TASK_01_01_02-002
**対応アーキテクチャ**: ARCH_01_01_02-002
**対応構造**: STRUCT_01_01_02-002
**対応挙動**: BEHAV_01_01_02-002

**コア実装**:
```typescript
// src/infrastructure/renderers/apexcharts.renderer.ts
export class ApexChartsRenderer implements ChartRenderer {
  private chart: ApexCharts | null = null;
  
  async render(container: HTMLElement, config: ChartConfig): Promise<ChartView> {
    const options = this.buildApexOptions(config);
    
    this.chart = new ApexCharts(container, options);
    await this.chart.render();
    
    return {
      type: 'apexcharts',
      chart: this.chart,
      options,
      container
    };
  }
  
  updateData(data: ChartData): void {
    if (!this.chart) return;
    
    this.chart.updateSeries(data.series);
    if (data.categories) {
      this.chart.updateOptions({
        xaxis: { categories: data.categories }
      });
    }
  }
  
  private buildApexOptions(config: ChartConfig): ApexOptions {
    const baseOptions: ApexOptions = {
      series: config.data.series,
      chart: {
        type: config.type as ChartType,
        height: config.height || 350,
        toolbar: {
          show: config.showToolbar ?? true
        },
        animations: {
          enabled: config.animations ?? true,
          easing: 'easeinout',
          speed: 800,
          animateGradually: {
            enabled: true,
            delay: 150
          },
          dynamicAnimation: {
            enabled: true,
            speed: 350
          }
        }
      },
      xaxis: {
        categories: config.data.categories,
        labels: {
          style: {
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif'
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            fontSize: '12px',
            fontFamily: 'Inter, sans-serif'
          }
        }
      },
      tooltip: {
        enabled: true,
        theme: 'light',
        style: {
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif'
        },
        custom: this.buildCustomTooltip(config)
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            chart: {
              height: 250
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      ]
    };
    
    return this.mergeTypeSpecificOptions(baseOptions, config);
  }
  
  private buildCustomTooltip(config: ChartConfig): (({ series, seriesIndex, dataPointIndex, w }: any) => string) | undefined {
    if (!config.customTooltip) return undefined;
    
    return ({ series, seriesIndex, dataPointIndex, w }) => {
      const value = series[seriesIndex][dataPointIndex];
      const category = w.globals.labels[dataPointIndex];
      
      return `
        <div class="custom-tooltip">
          <div class="tooltip-header">${category}</div>
          <div class="tooltip-value">${value.toFixed(1)}</div>
          <div class="tooltip-footer">${config.data.series[seriesIndex].name}</div>
        </div>
      `;
    };
  }
  
  private mergeTypeSpecificOptions(base: ApexOptions, config: ChartConfig): ApexOptions {
    switch (config.type) {
      case 'line':
        return {
          ...base,
          stroke: {
            curve: 'smooth',
            width: 3
          },
          markers: {
            size: 4,
            hover: {
              size: 6
            }
          }
        };
        
      case 'bar':
        return {
          ...base,
          plotOptions: {
            bar: {
              borderRadius: 4,
              columnWidth: '70%'
            }
          }
        };
        
      case 'area':
        return {
          ...base,
          stroke: {
            curve: 'smooth',
            width: 2
          },
          fill: {
            type: 'gradient',
            gradient: {
              shadeIntensity: 1,
              opacityFrom: 0.7,
              opacityTo: 0.3
            }
          }
        };
        
      default:
        return base;
    }
  }
}

// src/presentation/components/charts/InteractiveChart.tsx
export const InteractiveChart = React.memo<Props>(({ 
  data, 
  config, 
  onInteraction,
  className 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<ChartView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // データ変更時のチャート更新
  useEffect(() => {
    if (!containerRef.current || !data) return;
    
    const renderChart = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 既存のチャートを破棄
        if (chartRef.current) {
          chartRef.current.chart?.destroy();
        }
        
        // 新しいチャートをレンダリング
        const renderer = new ApexChartsRenderer();
        const chart = await renderer.render(containerRef.current, {
          ...config,
          data
        });
        
        chartRef.current = chart;
        
        // イベントリスナーを設定
        if (onInteraction) {
          setupChartEvents(chart, onInteraction);
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'チャートの描画に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };
    
    renderChart();
  }, [data, config, onInteraction]);
  
  // クリーンアップ
  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.chart?.destroy();
      }
    };
  }, []);
  
  const setupChartEvents = (chart: ChartView, onInteraction: ChartInteractionHandler) => {
    if (!chart.chart) return;
    
    chart.chart.addEventListener('dataPointSelection', (event: any, chartContext: any, config: any) => {
      const dataPoint = {
        seriesIndex: config.seriesIndex,
        dataPointIndex: config.dataPointIndex,
        value: config.w.globals.series[config.seriesIndex][config.dataPointIndex],
        category: config.w.globals.labels[config.dataPointIndex]
      };
      
      onInteraction('dataPointSelection', dataPoint);
    });
    
    chart.chart.addEventListener('mouseMove', (event: any, chartContext: any, config: any) => {
      if (config.dataPointIndex !== -1) {
        const dataPoint = {
          seriesIndex: config.seriesIndex,
          dataPointIndex: config.dataPointIndex,
          value: config.w.globals.series[config.seriesIndex][config.dataPointIndex],
          category: config.w.globals.labels[config.dataPointIndex]
        };
        
        onInteraction('hover', dataPoint);
      }
    });
  };
  
  if (error) {
    return (
      <div className={cn('chart-error', className)}>
        <AlertCircle className="h-5 w-5 text-red-500" />
        <span className="text-sm text-red-700">{error}</span>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.location.reload()}
        >
          再読み込み
        </Button>
      </div>
    );
  }
  
  return (
    <div className={cn('chart-container', className)}>
      {isLoading && (
        <div className="chart-loading">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm text-gray-600">チャートを読み込み中...</span>
        </div>
      )}
      <div 
        ref={containerRef} 
        className="chart-wrapper"
        style={{ height: config.height || 350 }}
      />
    </div>
  );
});

InteractiveChart.displayName = 'InteractiveChart';
```

### IMPL_01_01_03-003: レスポンシブ実装
**対応目標**: GOAL_01_01_03-003
**対応タスク**: TASK_01_01_03-003
**対応アーキテクチャ**: ARCH_01_01_03-003
**対応構造**: STRUCT_01_01_03-003
**対応挙動**: BEHAV_01_01_03-003

**コア実装**:
```typescript
// src/infrastructure/detectors/device-detector.service.ts
export class DeviceDetectorService implements DeviceDetector {
  private breakpoints = {
    mobile: 767,
    tablet: 1023,
    desktop: 1024
  };
  
  detect(): DeviceInfo {
    return {
      type: this.getDeviceType(),
      screenSize: this.getScreenSize(),
      orientation: this.getOrientation(),
      capabilities: this.getCapabilities()
    };
  }
  
  private getDeviceType(): DeviceType {
    const width = window.innerWidth;
    
    if (width <= this.breakpoints.mobile) {
      return 'mobile';
    } else if (width <= this.breakpoints.tablet) {
      return 'tablet';
    } else {
      return 'desktop';
    }
  }
  
  private getScreenSize(): ScreenSize {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1
    };
  }
  
  private getOrientation(): ScreenOrientation {
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }
  
  private getCapabilities(): DeviceCapabilities {
    return {
      touch: 'ontouchstart' in window,
      hover: window.matchMedia('(hover: hover)').matches,
      webgl: this.checkWebGLSupport(),
      webWorker: typeof Worker !== 'undefined',
      serviceWorker: 'serviceWorker' in navigator,
      localStorage: this.checkLocalStorageSupport()
    };
  }
  
  private checkWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }
  
  private checkLocalStorageSupport(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
}

// src/presentation/hooks/useResponsive.ts
export const useResponsive = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => 
    new DeviceDetectorService().detect()
  );
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => 
    getCurrentBreakpoint()
  );
  
  useEffect(() => {
    const handleResize = debounce(() => {
      const detector = new DeviceDetectorService();
      const newDeviceInfo = detector.detect();
      const newBreakpoint = getCurrentBreakpoint();
      
      setDeviceInfo(newDeviceInfo);
      setBreakpoint(newBreakpoint);
    }, 100);
    
    const handleOrientationChange = debounce(() => {
      const detector = new DeviceDetectorService();
      setDeviceInfo(detector.detect());
    }, 100);
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);
  
  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const isDesktop = breakpoint === 'desktop';
  
  return {
    deviceInfo,
    breakpoint,
    isMobile,
    isTablet,
    isDesktop
  };
};

function getCurrentBreakpoint(): Breakpoint {
  const width = window.innerWidth;
  
  if (width <= 767) return 'mobile';
  if (width <= 1023) return 'tablet';
  return 'desktop';
}

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// src/presentation/components/layout/ResponsiveLayout.tsx
export const ResponsiveLayout = ({ children }: ResponsiveLayoutProps) => {
  const { breakpoint, isMobile, isTablet, isDesktop } = useResponsive();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const layoutConfig = useMemo(() => {
    switch (breakpoint) {
      case 'mobile':
        return {
          navigation: 'hamburger',
          sidebar: 'overlay',
          content: 'full-width',
          grid: { cols: 1, gap: 4 }
        };
      case 'tablet':
        return {
          navigation: 'sidebar',
          sidebar: 'collapsible',
          content: 'with-sidebar',
          grid: { cols: 2, gap: 6 }
        };
      case 'desktop':
        return {
          navigation: 'horizontal',
          sidebar: 'fixed',
          content: 'with-sidebar',
          grid: { cols: 3, gap: 8 }
        };
      default:
        return {
          navigation: 'hamburger',
          sidebar: 'overlay',
          content: 'full-width',
          grid: { cols: 1, gap: 4 }
        };
    }
  }, [breakpoint]);
  
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);
  
  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);
  
  return (
    <LayoutProvider config={layoutConfig}>
      <div className={`responsive-layout responsive-layout--${breakpoint}`}>
        <Header 
          config={layoutConfig}
          onMenuToggle={isMobile ? toggleSidebar : undefined}
        />
        
        <div className="layout-body">
          {layoutConfig.sidebar !== 'none' && (
            <Sidebar
              config={layoutConfig}
              isOpen={sidebarOpen}
              onClose={closeSidebar}
              isMobile={isMobile}
            />
          )}
          
          <main className="layout-content">
            <ResponsiveGrid config={layoutConfig.grid}>
              {children}
            </ResponsiveGrid>
          </main>
        </div>
        
        {isMobile && sidebarOpen && (
          <div 
            className="sidebar-overlay"
            onClick={closeSidebar}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                closeSidebar();
              }
            }}
          />
        )}
      </div>
    </LayoutProvider>
  );
};

// src/presentation/components/layout/ResponsiveGrid.tsx
export const ResponsiveGrid = ({ 
  children, 
  config 
}: ResponsiveGridProps) => {
  const gridClass = useMemo(() => {
    const { cols, gap } = config;
    
    return cn(
      'responsive-grid',
      `grid-cols-${cols}`,
      `gap-${gap}`,
      // レスポンシブクラス
      cols > 1 && 'md:grid-cols-2',
      cols > 2 && 'lg:grid-cols-3'
    );
  }, [config]);
  
  return (
    <div className={gridClass}>
      {React.Children.map(children, (child, index) => (
        <div 
          key={index}
          className="grid-item"
          style={{
            gridColumn: `span ${Math.ceil(config.cols / React.Children.count(children))}`
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};
```

### IMPL_01_01_04-004: クリーンアーキテクチャ実装
**対応目標**: GOAL_01_01_04-004
**対応タスク**: TASK_01_01_04-004
**対応アーキテクチャ**: ARCH_01_01_04-004
**対応構造**: STRUCT_01_01_04-004
**対応挙動**: BEHAV_01_01_04-004

**コア実装**:
```typescript
// src/domain/entities/student-record.entity.ts
export class StudentRecord {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly emotionScore: EmotionScore,
    public readonly content: string,
    public readonly timestamp: Date,
    public readonly metadata: RecordMetadata
  ) {}
  
  static create(props: CreateStudentRecordProps): StudentRecord {
    const id = generateId();
    const timestamp = new Date();
    
    return new StudentRecord(
      id,
      props.studentId,
      props.emotionScore,
      props.content,
      timestamp,
      props.metadata || {}
    );
  }
  
  updateEmotionScore(newScore: EmotionScore): StudentRecord {
    return new StudentRecord(
      this.id,
      this.studentId,
      newScore,
      this.content,
      this.timestamp,
      {
        ...this.metadata,
        lastUpdated: new Date(),
        updateCount: (this.metadata.updateCount || 0) + 1
      }
    );
  }
  
  isValid(): boolean {
    return (
      this.id.length > 0 &&
      this.studentId.length > 0 &&
      this.emotionScore.isValid() &&
      this.content.length > 0 &&
      this.timestamp instanceof Date
    );
  }
}

export class EmotionScore {
  constructor(
    public readonly overall: number,
    public readonly dimensions: EmotionDimensions
  ) {}
  
  static create(props: CreateEmotionScoreProps): EmotionScore {
    const { overall, dimensions } = props;
    
    // バリデーション
    if (overall < 0 || overall > 100) {
      throw new Error('Overall score must be between 0 and 100');
    }
    
    Object.values(dimensions).forEach(value => {
      if (value < 0 || value > 100) {
        throw new Error('Dimension scores must be between 0 and 100');
      }
    });
    
    return new EmotionScore(overall, dimensions);
  }
  
  isValid(): boolean {
    return (
      this.overall >= 0 && this.overall <= 100 &&
      Object.values(this.dimensions).every(value => value >= 0 && value <= 100)
    );
  }
  
  calculateTrend(previousScore: EmotionScore): EmotionTrend {
    const overallDiff = this.overall - previousScore.overall;
    const dimensionDiffs = Object.keys(this.dimensions).reduce((acc, key) => {
      acc[key as keyof EmotionDimensions] = 
        this.dimensions[key as keyof EmotionDimensions] - 
        previousScore.dimensions[key as keyof EmotionDimensions];
      return acc;
    }, {} as Record<keyof EmotionDimensions, number>);
    
    return {
      overall: overallDiff,
      dimensions: dimensionDiffs,
      direction: overallDiff > 0 ? 'improving' : overallDiff < 0 ? 'declining' : 'stable'
    };
  }
}

// src/application/usecases/create-record.usecase.ts
export class CreateRecordUseCase {
  constructor(
    private readonly studentRepository: StudentRepository,
    private readonly emotionAnalyzer: EmotionAnalyzer,
    private readonly eventDispatcher: EventDispatcher
  ) {}
  
  async execute(request: CreateRecordRequest): Promise<CreateRecordResponse> {
    try {
      // 1. 感情分析
      const emotionScore = await this.emotionAnalyzer.analyze(request.content);
      
      // 2. レコード作成
      const record = StudentRecord.create({
        studentId: request.studentId,
        emotionScore,
        content: request.content,
        metadata: request.metadata
      });
      
      // 3. バリデーション
      if (!record.isValid()) {
        throw new ValidationError('Invalid record data');
      }
      
      // 4. 保存
      await this.studentRepository.save(record);
      
      // 5. イベント発行
      await this.eventDispatcher.dispatch(new RecordCreatedEvent(record));
      
      return {
        success: true,
        record: record.toDTO()
      };
      
    } catch (error) {
      if (error instanceof ValidationError) {
        return {
          success: false,
          error: error.message,
          code: 'VALIDATION_ERROR'
        };
      }
      
      return {
        success: false,
        error: 'Failed to create record',
        code: 'INTERNAL_ERROR'
      };
    }
  }
}

// src/infrastructure/repositories/prisma-student-repository.ts
export class PrismaStudentRepository implements StudentRepository {
  constructor(private readonly prisma: PrismaClient) {}
  
  async findById(id: string): Promise<StudentRecord | null> {
    const data = await this.prisma.studentRecord.findUnique({
      where: { id }
    });
    
    return data ? this.mapToEntity(data) : null;
  }
  
  async save(record: StudentRecord): Promise<void> {
    const data = this.mapToPersistence(record);
    
    await this.prisma.studentRecord.upsert({
      where: { id: record.id },
      update: data,
      create: data
    });
  }
  
  async findByStudentId(studentId: string): Promise<StudentRecord[]> {
    const records = await this.prisma.studentRecord.findMany({
      where: { studentId },
      orderBy: { timestamp: 'desc' }
    });
    
    return records.map(record => this.mapToEntity(record));
  }
  
  async findByDateRange(start: Date, end: Date): Promise<StudentRecord[]> {
    const records = await this.prisma.studentRecord.findMany({
      where: {
        timestamp: {
          gte: start,
          lte: end
        }
      },
      orderBy: { timestamp: 'desc' }
    });
    
    return records.map(record => this.mapToEntity(record));
  }
  
  private mapToEntity(data: PrismaStudentRecord): StudentRecord {
    return new StudentRecord(
      data.id,
      data.studentId,
      EmotionScore.create({
        overall: data.overallScore,
        dimensions: JSON.parse(data.dimensions as string)
      }),
      data.content,
      data.timestamp,
      JSON.parse(data.metadata as string)
    );
  }
  
  private mapToPersistence(record: StudentRecord): PrismaStudentRecordCreateInput {
    return {
      id: record.id,
      studentId: record.studentId,
      overallScore: record.emotionScore.overall,
      dimensions: JSON.stringify(record.emotionScore.dimensions),
      content: record.content,
      timestamp: record.timestamp,
      metadata: JSON.stringify(record.metadata)
    };
  }
}
```

### IMPL_01_01_05-005: テスト実装
**対応目標**: GOAL_01_01_05-005
**対応タスク**: TASK_01_01_05-005
**対応アーキテクチャ**: ARCH_01_01_05-005
**対応構造**: STRUCT_01_01_05-005
**対応挙動**: BEHAV_01_01_05-005

**コア実装**:
```typescript
// src/test/fixtures/student-record.fixture.ts
export class StudentRecordFixture {
  static create(overrides?: Partial<CreateStudentRecordProps>): StudentRecord {
    const defaultProps: CreateStudentRecordProps = {
      studentId: 'test-student-001',
      emotionScore: EmotionScore.create({
        overall: 75,
        dimensions: {
          happiness: 80,
          engagement: 70,
          stress: 30,
          confidence: 85
        }
      }),
      content: '今日の授業はとても楽しかったです。',
      metadata: {
        source: 'manual',
        validated: true
      }
    };
    
    return StudentRecord.create({ ...defaultProps, ...overrides });
  }
  
  static createMany(count: number, overrides?: Partial<CreateStudentRecordProps>): StudentRecord[] {
    return Array.from({ length: count }, (_, index) => 
      this.create({
        ...overrides,
        studentId: `test-student-${String(index + 1).padStart(3, '0')}`,
        content: `テストコンテンツ ${index + 1}`
      })
    );
  }
  
  static withEmotionTrend(startScore: number, endScore: number, count: number): StudentRecord[] {
    const step = (endScore - startScore) / (count - 1);
    
    return Array.from({ length: count }, (_, index) => {
      const overall = startScore + (step * index);
      
      return this.create({
        emotionScore: EmotionScore.create({
          overall,
          dimensions: {
            happiness: overall + 5,
            engagement: overall - 5,
            stress: Math.max(0, 100 - overall),
            confidence: overall
          }
        }),
        timestamp: new Date(Date.now() - (count - index) * 24 * 60 * 60 * 1000)
      });
    });
  }
}

// src/test/mocks/student-repository.mock.ts
export class MockStudentRepository implements StudentRepository {
  private records: Map<string, StudentRecord> = new Map();
  
  async findById(id: string): Promise<StudentRecord | null> {
    return this.records.get(id) || null;
  }
  
  async save(record: StudentRecord): Promise<void> {
    this.records.set(record.id, record);
  }
  
  async findByStudentId(studentId: string): Promise<StudentRecord[]> {
    return Array.from(this.records.values())
      .filter(record => record.studentId === studentId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  async findByDateRange(start: Date, end: Date): Promise<StudentRecord[]> {
    return Array.from(this.records.values())
      .filter(record => 
        record.timestamp >= start && record.timestamp <= end
      )
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  // テスト用ヘルパーメソッド
  clear(): void {
    this.records.clear();
  }
  
  setRecords(records: StudentRecord[]): void {
    this.records.clear();
    records.forEach(record => this.records.set(record.id, record));
  }
  
  getRecordCount(): number {
    return this.records.size;
  }
}

// src/test/utils/test-helpers.ts
export class TestHelpers {
  static async waitFor<T>(
    condition: () => T | Promise<T>,
    options: { timeout?: number; interval?: number } = {}
  ): Promise<T> {
    const { timeout = 5000, interval = 100 } = options;
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const result = await condition();
        if (result) return result;
      } catch (error) {
        // 条件評価中のエラーは無視
      }
      
      await new Promise(resolve => setTimeout(resolve, interval));
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }
  
  static createMockEventDispatcher(): jest.Mocked<EventDispatcher> {
    return {
      dispatch: jest.fn().mockResolvedValue(undefined),
      subscribe: jest.fn().mockReturnValue(() => {}),
      unsubscribe: jest.fn()
    };
  }
  
  static createMockEmotionAnalyzer(): jest.Mocked<EmotionAnalyzer> {
    return {
      analyze: jest.fn().mockResolvedValue(
        EmotionScore.create({
          overall: 75,
          dimensions: {
            happiness: 80,
            engagement: 70,
            stress: 30,
            confidence: 85
          }
        })
      )
    };
  }
  
  static setupTestDatabase(): Promise<void> {
    // テスト用データベースのセットアップ
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
    
    return new Promise((resolve) => {
      // データベース接続の初期化をシミュレート
      setTimeout(resolve, 100);
    });
  }
  
  static cleanupTestDatabase(): Promise<void> {
    // テスト用データベースのクリーンアップ
    return new Promise((resolve) => {
      // データベース接続のクリーンアップをシミュレート
      setTimeout(resolve, 100);
    });
  }
}

// src/test/e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });
  
  test('should display dashboard with generated data', async ({ page }) => {
    // データ生成ボタンをクリック
    await page.click('[data-testid="generate-data-button"]');
    
    // 生成完了を待機
    await expect(page.locator('[data-testid="generation-success"]')).toBeVisible();
    
    // グラフが表示されることを確認
    await expect(page.locator('[data-testid="emotion-chart"]')).toBeVisible();
    
    // データポイントが表示されることを確認
    const dataPoints = await page.locator('[data-testid="data-point"]').count();
    expect(dataPoints).toBeGreaterThan(0);
  });
  
  test('should handle chart interactions correctly', async ({ page }) => {
    // データを生成
    await page.click('[data-testid="generate-data-button"]');
    await page.waitForSelector('[data-testid="emotion-chart"]');
    
    // データポイントにホバー
    const dataPoint = page.locator('[data-testid="data-point"]').first();
    await dataPoint.hover();
    
    // ツールチップが表示されることを確認
    await expect(page.locator('[data-testid="chart-tooltip"]')).toBeVisible();
    
    // データポイントをクリック
    await dataPoint.click();
    
    // 詳細パネルが表示されることを確認
    await expect(page.locator('[data-testid="detail-panel"]')).toBeVisible();
  });
  
  test('should be responsive across different screen sizes', async ({ page }) => {
    // データを生成
    await page.click('[data-testid="generate-data-button"]');
    await page.waitForSelector('[data-testid="emotion-chart"]');
    
    // モバイルサイズでテスト
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="mobile-layout"]')).toBeVisible();
    
    // タブレットサイズでテスト
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="tablet-layout"]')).toBeVisible();
    
    // デスクトップサイズでテスト
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('[data-testid="desktop-layout"]')).toBeVisible();
  });
  
  test('should handle errors gracefully', async ({ page }) => {
    // ネットワークをオフラインに設定
    await page.context().setOffline(true);
    
    // データ生成を試行
    await page.click('[data-testid="generate-data-button"]');
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('ネットワーク接続');
    
    // リトライボタンが表示されることを確認
    await expect(page.locator('[data-testid="retry-button"]')).toBeVisible();
  });
});
```

### IMPL_01_01_06-006: AI処理実装
**対応目標**: GOAL_01_01_06-006
**対応タスク**: TASK_01_01_06-006
**対応アーキテクチャ**: ARCH_01_01_06-006
**対応構造**: STRUCT_01_01_06-006
**対応挙動**: BEHAV_01_01_06-006

**コア実装**:
```typescript
// src/infrastructure/ai/tensorflow/emotion-model.service.ts
export class TensorFlowEmotionModel implements EmotionAnalyzer {
  private model: tf.LayersModel | null = null;
  private tokenizer: Tokenizer | null = null;
  private readonly maxSequenceLength = 128;
  private readonly vocabularySize = 10000;
  
  async initialize(): Promise<void> {
    try {
      // モデルの読み込み
      this.model = await tf.loadLayersModel('/models/emotion/model.json');
      
      // トークナイザーの初期化
      this.tokenizer = new Tokenizer({
        vocabularySize: this.vocabularySize,
        maxSequenceLength: this.maxSequenceLength
      });
      
      // モデルのウォームアップ
      await this.warmupModel();
      
    } catch (error) {
      throw new Error(`Failed to initialize emotion model: ${error.message}`);
    }
  }
  
  async analyze(text: string): Promise<EmotionScore> {
    if (!this.model || !this.tokenizer) {
      throw new Error('Model not initialized');
    }
    
    try {
      // 1. テキスト前処理
      const preprocessed = this.preprocessText(text);
      
      // 2. トークン化
      const tokens = this.tokenizer.encode(preprocessed);
      
      // 3. パディング
      const paddedTokens = this.padSequence(tokens);
      
      // 4. テンソル変換
      const inputTensor = tf.tensor2d([paddedTokens]);
      
      // 5. 予測実行
      const prediction = await this.model.predict(inputTensor) as tf.Tensor;
      
      // 6. 結果の後処理
      const scores = await prediction.data();
      const emotionScores = this.extractEmotionScores(Array.from(scores));
      
      // 7. メモリクリーンアップ
      inputTensor.dispose();
      prediction.dispose();
      
      return EmotionScore.create(emotionScores);
      
    } catch (error) {
      throw new Error(`Failed to analyze emotion: ${error.message}`);
    }
  }
  
  private preprocessText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // 特殊文字を除去
      .replace(/\s+/g, ' ') // 余分な空白を削除
      .trim();
  }
  
  private padSequence(tokens: number[]): number[] {
    const padded = new Array(this.maxSequenceLength).fill(0);
    
    for (let i = 0; i < Math.min(tokens.length, this.maxSequenceLength); i++) {
      padded[i] = tokens[i];
    }
    
    return padded;
  }
  
  private extractEmotionScores(rawScores: number[]): CreateEmotionScoreProps {
    // モデルの出力を感情スコアにマッピング
    const [happiness, engagement, stress, confidence] = rawScores;
    
    // スコアの正規化（0-100の範囲に）
    const normalize = (value: number) => Math.max(0, Math.min(100, value * 100));
    
    return {
      overall: normalize((happiness + engagement + confidence - stress) / 3),
      dimensions: {
        happiness: normalize(happiness),
        engagement: normalize(engagement),
        stress: normalize(stress),
        confidence: normalize(confidence)
      }
    };
  }
  
  private async warmupModel(): Promise<void> {
    const dummyInput = tf.zeros([1, this.maxSequenceLength]);
    await this.model!.predict(dummyInput);
    dummyInput.dispose();
  }
  
  async dispose(): Promise<void> {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
  }
}

// src/infrastructure/ai/processors/text-preprocessor.service.ts
export class TextPreprocessor {
  private readonly stopWords = new Set([
    'の', 'に', 'は', 'を', 'た', 'が', 'で', 'て', 'と', 'し', 'れ', 'さ',
    'ある', 'いる', 'する', 'です', 'ます', 'だ', 'である'
  ]);
  
  preprocess(text: string): PreprocessedText {
    return {
      original: text,
      cleaned: this.cleanText(text),
      tokens: this.tokenize(text),
      features: this.extractFeatures(text)
    };
  }
  
  private cleanText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\w\s]/g, '') // 日本語文字と英数字のみ
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  private tokenize(text: string): string[] {
    const cleaned = this.cleanText(text);
    const tokens = cleaned.split(' ')
      .filter(token => token.length > 0)
      .filter(token => !this.stopWords.has(token));
    
    return tokens;
  }
  
  private extractFeatures(text: string): TextFeatures {
    const tokens = this.tokenize(text);
    
    return {
      length: text.length,
      wordCount: tokens.length,
      averageWordLength: tokens.reduce((sum, token) => sum + token.length, 0) / tokens.length,
      punctuationCount: (text.match(/[。！？、]/g) || []).length,
      exclamationCount: (text.match(/[！]/g) || []).length,
      questionCount: (text.match(/[？]/g) || []).length,
      hasPositiveWords: this.containsPositiveWords(tokens),
      hasNegativeWords: this.containsNegativeWords(tokens)
    };
  }
  
  private containsPositiveWords(tokens: string[]): boolean {
    const positiveWords = ['楽しい', '嬉しい', '良い', '素晴らしい', '好き', '幸せ'];
    return tokens.some(token => positiveWords.some(word => token.includes(word)));
  }
  
  private containsNegativeWords(tokens: string[]): boolean {
    const negativeWords = ['辛い', '悲しい', '嫌い', '悪い', '苦しい', '不安'];
    return tokens.some(token => negativeWords.some(word => token.includes(word)));
  }
}

// src/infrastructure/ai/workers/emotion-analysis.worker.ts
class EmotionAnalysisWorker {
  private model: TensorFlowEmotionModel | null = null;
  
  async initialize(): Promise<void> {
    this.model = new TensorFlowEmotionModel();
    await this.model.initialize();
  }
  
  async analyzeText(text: string): Promise<EmotionScore> {
    if (!this.model) {
      throw new Error('Worker not initialized');
    }
    
    return await this.model.analyze(text);
  }
}

// Worker entry point
const worker = new EmotionAnalysisWorker();

self.onmessage = async (event: MessageEvent<EmotionAnalysisRequest>) => {
  try {
    const { id, text } = event.data;
    
    // 初期化
    if (!worker.model) {
      await worker.initialize();
    }
    
    // 分析実行
    const result = await worker.analyzeText(text);
    
    self.postMessage({
      id,
      success: true,
      result: result.toDTO(),
      timestamp: Date.now()
    });
    
  } catch (error) {
    self.postMessage({
      id: event.data.id,
      success: false,
      error: error.message,
      timestamp: Date.now()
    });
  }
};
```

### IMPL_01_01_07-007: ユーザビリティ実装
**対応目標**: GOAL_01_01_07-007
**対応タスク**: TASK_01_01_07-007
**対応アーキテクチャ**: ARCH_01_01_07-007
**対応構造**: STRUCT_01_01_07-007
**対応挙動**: BEHAV_01_01_07-007

**コア実装**:
```typescript
// src/infrastructure/localization/i18n/i18n.service.ts
export class I18nService {
  private static instance: I18nService;
  private i18n: i18n;
  private currentLanguage: string = 'ja';
  
  private constructor() {
    this.initializeI18n();
  }
  
  static getInstance(): I18nService {
    if (!I18nService.instance) {
      I18nService.instance = new I18nService();
    }
    return I18nService.instance;
  }
  
  private initializeI18n(): void {
    this.i18n = i18n.createInstance({
      lng: this.currentLanguage,
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
      },
      
      react: {
        useSuspense: false
      }
    });
  }
  
  async changeLanguage(language: string): Promise<void> {
    try {
      await this.i18n.changeLanguage(language);
      this.currentLanguage = language;
      
      // HTML lang属性を更新
      document.documentElement.lang = language;
      
      // ローカルストレージに保存
      localStorage.setItem('preferred-language', language);
      
    } catch (error) {
      throw new Error(`Failed to change language to ${language}: ${error.message}`);
    }
  }
  
  t(key: string, options?: any): string {
    return this.i18n.t(key, options);
  }
  
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }
  
  getSupportedLanguages(): LanguageInfo[] {
    return [
      { code: 'ja', name: '日本語', flag: '🇯🇵' },
      { code: 'en', name: 'English', flag: '🇺🇸' }
    ];
  }
}

// src/infrastructure/accessibility/screen-reader.service.ts
export class ScreenReaderService {
  private liveRegion: HTMLElement | null = null;
  
  initialize(): void {
    this.createLiveRegion();
    this.setupKeyboardNavigation();
    this.setupFocusManagement();
  }
  
  private createLiveRegion(): void {
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.className = 'sr-only';
    document.body.appendChild(this.liveRegion);
  }
  
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.liveRegion) return;
    
    // 優先度に応じてリージョンを切り替え
    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;
    
    // メッセージをクリアして再利用可能に
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = '';
      }
    }, 1000);
  }
  
  private setupKeyboardNavigation(): void {
    document.addEventListener('keydown', (event) => {
      // Tabキーのナビゲーションを強化
      if (event.key === 'Tab') {
        this.handleTabNavigation(event);
      }
      
      // Escapeキーでモーダルを閉じる
      if (event.key === 'Escape') {
        this.handleEscapeKey(event);
      }
      
      // Enter/Spaceでアクティブな要素をアクティブ化
      if (event.key === 'Enter' || event.key === ' ') {
        this.handleActivationKey(event);
      }
    });
  }
  
  private handleTabNavigation(event: KeyboardEvent): void {
    const focusableElements = this.getFocusableElements();
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (focusableElements.length === 0) return;
    
    if (event.shiftKey) {
      // Shift + Tab: 前の要素にフォーカス
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: 次の要素にフォーカス
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }
  
  private handleEscapeKey(event: KeyboardEvent): void {
    const modal = document.querySelector('[role="dialog"]');
    if (modal && modal.contains(document.activeElement)) {
      event.preventDefault();
      
      // モーダルを閉じる処理
      const closeButton = modal.querySelector('[data-testid="close-button"]') as HTMLElement;
      if (closeButton) {
        closeButton.click();
      }
    }
  }
  
  private handleActivationKey(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    
    // Enterキーはフォーム要素ではデフォルト動作を維持
    if (event.key === 'Enter' && !this.isFormElement(target)) {
      event.preventDefault();
      target.click();
    }
    
    // Spaceキーはボタンとリンクでクリックをシミュレート
    if (event.key === ' ' && (target.tagName === 'BUTTON' || target.tagName === 'A')) {
      event.preventDefault();
      target.click();
    }
  }
  
  private getFocusableElements(): HTMLElement[] {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');
    
    return Array.from(document.querySelectorAll(selector)) as HTMLElement[];
  }
  
  private isFormElement(element: HTMLElement): boolean {
    const formTags = ['INPUT', 'TEXTAREA', 'SELECT'];
    return formTags.includes(element.tagName);
  }
  
  private setupFocusManagement(): void {
    // フォーカスが画面外に出ないように監視
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      const rect = target.getBoundingClientRect();
      
      // 要素が画面外にある場合
      if (rect.top < 0 || rect.left < 0 || 
          rect.bottom > window.innerHeight || 
          rect.right > window.innerWidth) {
        
        // 要素を画面内にスクロール
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      }
    }, true);
  }
}

// src/presentation/components/accessibility/AccessibilityMenu.tsx
export const AccessibilityMenu = () => {
  const { config, updateConfig } = useAccessibility();
  const { t } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleFontSizeChange = (size: AccessibilityConfig['fontSize']) => {
    updateConfig({ fontSize: size });
    ScreenReaderService.getInstance().announce(t('accessibility.fontSizeChanged', { size }));
  };
  
  const handleHighContrastToggle = (enabled: boolean) => {
    updateConfig({ highContrast: enabled });
    ScreenReaderService.getInstance().announce(
      enabled ? t('accessibility.highContrastEnabled') : t('accessibility.highContrastDisabled')
    );
  };
  
  const handleScreenReaderToggle = (enabled: boolean) => {
    updateConfig({ screenReader: enabled });
    ScreenReaderService.getInstance().announce(
      enabled ? t('accessibility.screenReaderEnabled') : t('accessibility.screenReaderDisabled')
    );
  };
  
  return (
    <div className="accessibility-menu">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('accessibility.menu')}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <Accessibility className="h-4 w-4" />
        {t('accessibility.menu')}
      </Button>
      
      {isOpen && (
        <div 
          className="accessibility-dropdown"
          role="menu"
          aria-labelledby="accessibility-menu-button"
        >
          <div className="menu-section" role="group" aria-labelledby="font-size-label">
            <h3 id="font-size-label" className="menu-title">
              {t('accessibility.fontSize')}
            </h3>
            <div className="menu-options">
              {(['small', 'medium', 'large'] as const).map(size => (
                <button
                  key={size}
                  className={cn(
                    'menu-option',
                    config.fontSize === size && 'active'
                  )}
                  onClick={() => handleFontSizeChange(size)}
                  role="menuitemradio"
                  aria-checked={config.fontSize === size}
                >
                  {t(`accessibility.fontSizes.${size}`)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="menu-section" role="group" aria-labelledby="visual-label">
            <h3 id="visual-label" className="menu-title">
              {t('accessibility.visual')}
            </h3>
            <div className="menu-options">
              <label className="menu-option">
                <input
                  type="checkbox"
                  checked={config.highContrast}
                  onChange={(e) => handleHighContrastToggle(e.target.checked)}
                  aria-describedby="high-contrast-desc"
                />
                <span>{t('accessibility.highContrast')}</span>
              </label>
              <span id="high-contrast-desc" className="sr-only">
                {t('accessibility.highContrastDescription')}
              </span>
            </div>
          </div>
          
          <div className="menu-section" role="group" aria-labelledby="screen-reader-label">
            <h3 id="screen-reader-label" className="menu-title">
              {t('accessibility.screenReader')}
            </h3>
            <div className="menu-options">
              <label className="menu-option">
                <input
                  type="checkbox"
                  checked={config.screenReader}
                  onChange={(e) => handleScreenReaderToggle(e.target.checked)}
                  aria-describedby="screen-reader-desc"
                />
                <span>{t('accessibility.enableScreenReader')}</span>
              </label>
              <span id="screen-reader-desc" className="sr-only">
                {t('accessibility.screenReaderDescription')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
```

### IMPL_01_01_08-008: 運用実装
**対応目標**: GOAL_01_01_08-008
**対応タスク**: TASK_01_01_08-008
**対応アーキテクチャ**: ARCH_01_01_08-008
**対応構造**: STRUCT_01_01_08-008
**対応挙動**: BEHAV_01_01_08-008

**コア実装**:
```yaml
# deployment/kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ikiiki-record-frontend
  labels:
    app: ikiiki-record
    component: frontend
    version: v1
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: ikiiki-record
      component: frontend
  template:
    metadata:
      labels:
        app: ikiiki-record
        component: frontend
        version: v1
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3000"
        prometheus.io/path: "/metrics"
    spec:
      containers:
      - name: frontend
        image: ikiiki-record/frontend:latest
        imagePullPolicy: Always
        ports:
        - name: http
          containerPort: 3000
          protocol: TCP
        env:
        - name: NODE_ENV
          value: "production"
        - name: API_URL
          valueFrom:
            configMapKeyRef:
              name: ikiiki-config
              key: API_URL
        - name: SENTRY_DSN
          valueFrom:
            secretKeyRef:
              name: ikiiki-secrets
              key: SENTRY_DSN
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
            port: http
            scheme: HTTP
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
          successThreshold: 1
        readinessProbe:
          httpGet:
            path: /ready
            port: http
            scheme: HTTP
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
          successThreshold: 1
        startupProbe:
          httpGet:
            path: /health
            port: http
            scheme: HTTP
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 30
          successThreshold: 1
        volumeMounts:
        - name: config
          mountPath: /app/config
          readOnly: true
        - name: cache
          mountPath: /app/cache
      volumes:
      - name: config
        configMap:
          name: ikiiki-config
      - name: cache
        emptyDir:
          sizeLimit: 100Mi
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
          drop:
          - ALL
      terminationGracePeriodSeconds: 30

---
apiVersion: v1
kind: Service
metadata:
  name: ikiiki-record-frontend-service
  labels:
    app: ikiiki-record
    component: frontend
spec:
  type: ClusterIP
  ports:
  - name: http
    port: 80
    targetPort: http
    protocol: TCP
  selector:
    app: ikiiki-record
    component: frontend

---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: ikiiki-record-frontend-hpa
  labels:
    app: ikiiki-record
    component: frontend
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: ikiiki-record-frontend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
```

```bash
#!/bin/bash
# scripts/deploy/deploy.sh

set -euo pipefail

# 設定
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
VERSION="${VERSION:-$(git rev-parse --short HEAD)}"
ENVIRONMENT="${ENVIRONMENT:-staging}"

# ログ関数
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $*"
}

error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $*" >&2
    exit 1
}

# ヘルスチェック関数
health_check() {
    local url="$1"
    local max_attempts="${2:-30}"
    local attempt=1
    
    log "Performing health check on $url"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url/health" > /dev/null; then
            log "Health check passed (attempt $attempt)"
            return 0
        fi
        
        log "Health check failed (attempt $attempt/$max_attempts), retrying in 10 seconds..."
        sleep 10
        ((attempt++))
    done
    
    error "Health check failed after $max_attempts attempts"
}

# Dockerイメージのビルドとプッシュ
build_and_push() {
    log "Building Docker image..."
    cd "$PROJECT_ROOT"
    
    docker build \
        --build-arg NODE_ENV=production \
        --build-arg VERSION="$VERSION" \
        -t "ikiiki-record/frontend:$VERSION" \
        -t "ikiiki-record/frontend:latest" \
        .
    
    log "Pushing Docker image..."
    docker push "ikiiki-record/frontend:$VERSION"
    docker push "ikiiki-record/frontend:latest"
}

# Kubernetesデプロイ
deploy_to_kubernetes() {
    log "Deploying to Kubernetes ($ENVIRONMENT)..."
    
    # 設定ファイルの適用
    kubectl apply -f "$PROJECT_ROOT/deployment/kubernetes/configmap.yaml"
    kubectl apply -f "$PROJECT_ROOT/deployment/kubernetes/secret.yaml"
    
    # デプロイメントの更新
    kubectl set image \
        deployment/ikiiki-record-frontend \
        frontend="ikiiki-record/frontend:$VERSION" \
        --namespace="$ENVIRONMENT"
    
    # ロールアウトの待機
    log "Waiting for rollout to complete..."
    kubectl rollout status \
        deployment/ikiiki-record-frontend \
        --namespace="$ENVIRONMENT" \
        --timeout=600s
    
    # 新しいPodの取得
    local new_pod
    new_pod=$(kubectl get pods \
        --namespace="$ENVIRONMENT" \
        --selector=app=ikiiki-record,component=frontend \
        --field-selector=status.phase=Running \
        -o jsonpath='{.items[0].metadata.name}')
    
    # PodのURLを取得
    local pod_url
    pod_url="http://$new_pod:3000"
    
    # ヘルスチェック
    health_check "$pod_url"
    
    log "Deployment completed successfully!"
}

# ロールバック関数
rollback() {
    log "Initiating rollback..."
    
    kubectl rollout undo \
        deployment/ikiiki-record-frontend \
        --namespace="$ENVIRONMENT"
    
    kubectl rollout status \
        deployment/ikiiki-record-frontend \
        --namespace="$ENVIRONMENT" \
        --timeout=300s
    
    log "Rollback completed!"
}

# メイン処理
main() {
    log "Starting deployment process..."
    log "Version: $VERSION"
    log "Environment: $ENVIRONMENT"
    
    # 前処理
    build_and_push
    
    # デプロイ実行
    if ! deploy_to_kubernetes; then
        error "Deployment failed"
    fi
    
    # 事後処理
    log "Cleaning up old Docker images..."
    docker image prune -f
    
    log "Deployment process completed successfully!"
}

# トラップハンドラ
trap 'error "Deployment interrupted"' INT TERM

# 引数処理
case "${1:-deploy}" in
    deploy)
        main
        ;;
    rollback)
        rollback
        ;;
    health-check)
        health_check "${2:-http://localhost:3000}"
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|health-check [url]}"
        exit 1
        ;;
esac
```

```typescript
// src/infrastructure/monitoring/health-check.service.ts
export class HealthCheckService {
  private checks: Map<string, HealthCheck> = new Map();
  private lastResults: Map<string, HealthCheckResult> = new Map();
  
  registerCheck(name: string, check: HealthCheck): void {
    this.checks.set(name, check);
  }
  
  async runAllChecks(): Promise<OverallHealthStatus> {
    const results = new Map<string, HealthCheckResult>();
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    
    for (const [name, check] of this.checks) {
      try {
        const startTime = Date.now();
        const result = await this.runCheck(name, check);
        const duration = Date.now() - startTime;
        
        results.set(name, {
          ...result,
          duration,
          timestamp: new Date()
        });
        
        if (result.status === 'unhealthy') {
          overallStatus = 'unhealthy';
        } else if (result.status === 'degraded' && overallStatus === 'healthy') {
          overallStatus = 'degraded';
        }
        
      } catch (error) {
        results.set(name, {
          status: 'unhealthy',
          message: error.message,
          timestamp: new Date()
        });
        overallStatus = 'unhealthy';
      }
    }
    
    this.lastResults = results;
    
    return {
      status: overallStatus,
      checks: Object.fromEntries(results),
      timestamp: new Date()
    };
  }
  
  private async runCheck(name: string, check: HealthCheck): Promise<HealthCheckResult> {
    const timeout = check.timeout || 5000;
    
    return Promise.race([
      check.execute(),
      new Promise<HealthCheckResult>((_, reject) =>
        setTimeout(() => reject(new Error('Health check timeout')), timeout)
      )
    ]);
  }
  
  getLastResults(): Map<string, HealthCheckResult> {
    return this.lastResults;
  }
}

// src/infrastructure/monitoring/metrics.service.ts
export class MetricsService {
  private metrics: Map<string, Metric> = new Map();
  
  registerCounter(name: string, labels?: string[]): Counter {
    const counter = new Counter(name, labels);
    this.metrics.set(name, counter);
    return counter;
  }
  
  registerGauge(name: string, labels?: string[]): Gauge {
    const gauge = new Gauge(name, labels);
    this.metrics.set(name, gauge);
    return gauge;
  }
  
  registerHistogram(name: string, buckets?: number[], labels?: string[]): Histogram {
    const histogram = new Histogram(name, buckets, labels);
    this.metrics.set(name, histogram);
    return histogram;
  }
  
  getMetrics(): string {
    const lines: string[] = [];
    
    for (const metric of this.metrics.values()) {
      lines.push(...metric.getPrometheusFormat());
    }
    
    return lines.join('\n');
  }
}

class Counter {
  constructor(
    private name: string,
    private labels?: string[],
    private value: number = 0
  ) {}
  
  inc(labelValues?: string[]): void {
    this.value++;
    this.record(labelValues);
  }
  
  incBy(amount: number, labelValues?: string[]): void {
    this.value += amount;
    this.record(labelValues);
  }
  
  private record(labelValues?: string[]): void {
    // メトリクス記録ロジック
  }
  
  getPrometheusFormat(): string[] {
    const lines: string[] = [];
    
    if (this.labels) {
      lines.push(`# HELP ${this.name} Counter metric`);
      lines.push(`# TYPE ${this.name} counter`);
      lines.push(`${this.name} ${this.value}`);
    } else {
      lines.push(`# HELP ${this.name} Counter metric`);
      lines.push(`# TYPE ${this.name} counter`);
      lines.push(`${this.name} ${this.value}`);
    }
    
    return lines;
  }
}
```

## 実装原則

### 1. コード品質
- TypeScript strict modeの適用
- ESLint + Prettierによるコード整形
- コードレビューの必須化
- 自動化テストの実装

### 2. パフォーマンス最適化
- レンダリングの最適化
- メモリリークの防止
- 非同期処理の適切な実装
- キャッシュ戦略の適用

### 3. セキュリティ
- 入力値の検証とサニタイズ
- XSS対策の実装
- HTTPSの強制
- セキュアなヘッダーの設定

### 4. 保守性
- モジュール化の推進
- ドキュメンテーションの整備
- バージョン管理の徹底
- 技術的負債の管理

---

**更新履歴**:
- 2024-01-01: 初版作成
- 2024-01-15: AI実装追加
- 2024-02-01: 運用実装拡充