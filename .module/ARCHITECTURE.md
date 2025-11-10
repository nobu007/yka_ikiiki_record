# ARCHITECTURE.md - イキイキレコード アーキテクチャ定義

## アーキテクチャ概要

イキイキレコードのアーキテクチャは、クリーンアーキテクチャ原則に基づき、スケーラビリティ、保守性、テスト容易性を最大化するように設計されています。4層分離アーキテクチャとマイクロサービスパターンを組み合わせることで、関心の分離と独立したデプロイを可能にします。

## アーキテクチャ定義

### ARCH_01_01_01-001: データ生成アーキテクチャ
**対応目標**: GOAL_01_01_01-001
**対応タスク**: TASK_01_01_01-001
**対応構造**: STRUCT_01_01_01-001
**対応挙動**: BEHAV_01_01_01-001
**対応実装**: IMPL_01_01_01-001
**対応テスト**: TEST_01_01_01-001
**対応デプロイ**: DEPLOY_01_01_01-001

**アーキテクチャパターン**:
```typescript
// ドメイン層 - ビジネスロジックの純粋性
export interface DataGenerator {
  generate(request: DataGenerationRequest): Promise<GeneratedData>;
}

export interface DataValidator {
  validate(request: DataGenerationRequest): ValidationResult;
}

export interface PatternGenerator {
  generate(pattern: DataPattern): Promise<number[]>;
}

// アプリケーション層 - ユースケースの調整
export class DataGenerationUseCase {
  constructor(
    private generator: DataGenerator,
    private repository: DataRepository,
    private eventDispatcher: EventDispatcher
  ) {}
  
  async execute(request: DataGenerationRequest): Promise<DataGenerationResponse> {
    const data = await this.generator.generate(request);
    await this.repository.save(data);
    await this.eventDispatcher.dispatch(new DataGeneratedEvent(data));
    return { success: true, data };
  }
}

// インフラ層 - 外部システムとの連携
export class WorkerPoolDataGenerator implements DataGenerator {
  private workerPool: WorkerPoolService;
  
  async generate(request: DataGenerationRequest): Promise<GeneratedData> {
    const tasks = this.createTasks(request);
    const results = await this.workerPool.executeBatch(tasks);
    return this.aggregateResults(results);
  }
}

// プレゼンテーション層 - UIとの連携
export const DataGeneratorComponent = () => {
  const { generate, isLoading, error } = useDataGeneration();
  
  return (
    <DataGeneratorForm onSubmit={generate}>
      <PatternSelector />
      <ParameterControls />
      <GenerateButton loading={isLoading} />
    </DataGeneratorForm>
  );
};
```

**依存関係の方向**:
```
Presentation → Application → Domain ← Infrastructure
```

### ARCH_01_01_02-002: 可視化アーキテクチャ
**対応目標**: GOAL_01_01_02-002
**対応タスク**: TASK_01_01_02-002
**対応構造**: STRUCT_01_01_02-002
**対応挙動**: BEHAV_01_01_02-002
**対応実装**: IMPL_01_01_02-002
**対応テスト**: TEST_01_01_02-002
**対応デプロイ**: DEPLOY_01_01_02-002

**アーキテクチャパターン**:
```typescript
// ドメイン層 - チャート抽象化
export interface ChartRenderer {
  render(container: HTMLElement, config: ChartConfig): Promise<ChartView>;
  updateData(data: ChartData): void;
  destroy(): void;
}

export interface ChartInteractionHandler {
  onHover?(dataPoint: DataPoint): void;
  onClick?(dataPoint: DataPoint): void;
  onSelection?(range: DataRange): void;
}

// アプリケーション層 - チャート管理
export class ChartManagementUseCase {
  constructor(
    private renderer: ChartRenderer,
    private dataSource: ChartDataSource,
    private eventBus: EventBus
  ) {}
  
  async createChart(request: CreateChartRequest): Promise<ChartView> {
    const data = await this.dataSource.fetchData(request.query);
    const config = this.buildChartConfig(request, data);
    const chart = await this.renderer.render(request.container, config);
    
    this.setupInteractions(chart, request.interactions);
    return chart;
  }
  
  private setupInteractions(chart: ChartView, handlers: ChartInteractionHandler): void {
    chart.on('hover', handlers.onHover);
    chart.on('click', handlers.onClick);
    chart.on('selection', handlers.onSelection);
  }
}

// インフラ層 - 具体的なレンダラー実装
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
}

// プレゼンテーション層 - リアクティブチャートコンポーネント
export const InteractiveChart = ({ data, config, onInteraction }: Props) => {
  const chartRef = useRef<ChartView | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!containerRef.current || !data) return;
    
    const renderer = new ApexChartsRenderer();
    renderer.render(containerRef.current, { ...config, data })
      .then(chart => {
        chartRef.current = chart;
        setupChartEvents(chart, onInteraction);
      });
    
    return () => {
      chartRef.current?.destroy();
    };
  }, [data, config, onInteraction]);
  
  return <div ref={containerRef} className="chart-container" />;
};
```

### ARCH_01_01_03-003: レスポンシブアーキテクチャ
**対応目標**: GOAL_01_01_03-003
**対応タスク**: TASK_01_01_03-003
**対応構造**: STRUCT_01_01_03-003
**対応挙動**: BEHAV_01_01_03-003
**対応実装**: IMPL_01_01_03-003
**対応テスト**: TEST_01_01_03-003
**対応デプロイ**: DEPLOY_01_01_03-003

**アーキテクチャパターン**:
```typescript
// ドメイン層 - デバイス抽象化
export interface DeviceDetector {
  detect(): DeviceInfo;
  subscribe(callback: (deviceInfo: DeviceInfo) => void): () => void;
}

export interface LayoutAdapter {
  adaptLayout(deviceInfo: DeviceInfo): LayoutConfig;
  applyLayout(config: LayoutConfig): void;
}

export interface BreakpointManager {
  getCurrentBreakpoint(): Breakpoint;
  onBreakpointChange(callback: (breakpoint: Breakpoint) => void): () => void;
}

// アプリケーション層 - レスポンシブ管理
export class ResponsiveManagementUseCase {
  constructor(
    private deviceDetector: DeviceDetector,
    private layoutAdapter: LayoutAdapter,
    private breakpointManager: BreakpointManager
  ) {}
  
  initializeResponsiveSystem(): ResponsiveSystem {
    const deviceInfo = this.deviceDetector.detect();
    const layoutConfig = this.layoutAdapter.adaptLayout(deviceInfo);
    const currentBreakpoint = this.breakpointManager.getCurrentBreakpoint();
    
    return {
      deviceInfo,
      layoutConfig,
      currentBreakpoint,
      subscribe: this.createSubscriptionHandler()
    };
  }
  
  private createSubscriptionHandler() {
    return (callback: (state: ResponsiveState) => void) => {
      const unsubscribeDevice = this.deviceDetector.subscribe(deviceInfo => {
        const layoutConfig = this.layoutAdapter.adaptLayout(deviceInfo);
        callback({ deviceInfo, layoutConfig });
      });
      
      const unsubscribeBreakpoint = this.breakpointManager.subscribe(breakpoint => {
        callback({ currentBreakpoint: breakpoint });
      });
      
      return () => {
        unsubscribeDevice();
        unsubscribeBreakpoint();
      };
    };
  }
}

// インフラ層 - ブラウザAPI実装
export class BrowserDeviceDetector implements DeviceDetector {
  private observers: Set<(deviceInfo: DeviceInfo) => void> = new Set();
  
  detect(): DeviceInfo {
    return {
      type: this.getDeviceType(),
      screenSize: this.getScreenSize(),
      orientation: this.getOrientation(),
      capabilities: this.getCapabilities()
    };
  }
  
  subscribe(callback: (deviceInfo: DeviceInfo) => void): () => void {
    this.observers.add(callback);
    
    const handleResize = debounce(() => {
      callback(this.detect());
    }, 100);
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      this.observers.delete(callback);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }
}

// プレゼンテーション層 - レスポンシブコンポーネント
export const ResponsiveLayout = ({ children }: Props) => {
  const { responsiveState, updateState } = useResponsive();
  
  useEffect(() => {
    const responsiveSystem = new ResponsiveManagementUseCase(
      new BrowserDeviceDetector(),
      new CSSLayoutAdapter(),
      new MediaQueryBreakpointManager()
    );
    
    const unsubscribe = responsiveSystem.initializeResponsiveSystem()
      .subscribe(updateState);
    
    return unsubscribe;
  }, []);
  
  return (
    <LayoutProvider config={responsiveState.layoutConfig}>
      <ResponsiveGrid breakpoint={responsiveState.currentBreakpoint}>
        {children}
      </ResponsiveGrid>
    </LayoutProvider>
  );
};
```

### ARCH_01_01_04-004: クリーンアーキテクチャ
**対応目標**: GOAL_01_01_04-004
**対応タスク**: TASK_01_01_04-004
**対応構造**: STRUCT_01_01_04-004
**対応挙動**: BEHAV_01_01_04-004
**対応実装**: IMPL_01_01_04-004
**対応テスト**: TEST_01_01_04-004
**対応デプロイ**: DEPLOY_01_01_04-004

**アーキテクチャパターン**:
```typescript
// ドメイン層 - エンティティとビジネスルール
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
    return new StudentRecord(
      generateId(),
      props.studentId,
      props.emotionScore,
      props.content,
      new Date(),
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
    return this.validateIdentity() && this.validateEmotionScore() && this.validateContent();
  }
  
  private validateIdentity(): boolean {
    return this.id.length > 0 && this.studentId.length > 0;
  }
  
  private validateEmotionScore(): boolean {
    return this.emotionScore.isValid();
  }
  
  private validateContent(): boolean {
    return this.content.length > 0 && this.content.length <= 1000;
  }
}

// ドメイン層 - リポジトリインターフェース
export interface StudentRepository {
  findById(id: string): Promise<StudentRecord | null>;
  save(record: StudentRecord): Promise<void>;
  findByStudentId(studentId: string): Promise<StudentRecord[]>;
  findByDateRange(start: Date, end: Date): Promise<StudentRecord[]>;
  delete(id: string): Promise<void>;
}

// ドメイン層 - サービスインターフェース
export interface EmotionAnalyzer {
  analyze(text: string): Promise<EmotionScore>;
}

export interface InsightGenerator {
  generateInsights(records: StudentRecord[]): Promise<Insight[]>;
}

// アプリケーション層 - ユースケース
export class CreateStudentRecordUseCase {
  constructor(
    private studentRepository: StudentRepository,
    private emotionAnalyzer: EmotionAnalyzer,
    private eventDispatcher: EventDispatcher
  ) {}
  
  async execute(request: CreateStudentRecordRequest): Promise<CreateStudentRecordResponse> {
    // ビジネスルールの適用
    const emotionScore = await this.emotionAnalyzer.analyze(request.content);
    const record = StudentRecord.create({
      studentId: request.studentId,
      emotionScore,
      content: request.content,
      metadata: request.metadata
    });
    
    // ドメイン invariant の検証
    if (!record.isValid()) {
      throw new ValidationError('Invalid student record data');
    }
    
    // 永続化
    await this.studentRepository.save(record);
    
    // ドメインイベントの発行
    await this.eventDispatcher.dispatch(new StudentRecordCreatedEvent(record));
    
    return {
      success: true,
      record: record.toDTO()
    };
  }
}

// インフラ層 - リポジトリ実装
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

// プレゼンテーション層 - Reactコンポーネント
export const StudentRecordForm = ({ onSubmit, loading }: Props) => {
  const [formData, setFormData] = useState<CreateStudentRecordRequest>({
    studentId: '',
    content: ''
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onSubmit(formData);
      setFormData({ studentId: '', content: '' });
    } catch (error) {
      // エラーハンドリング
      console.error('Failed to create student record:', error);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="student-record-form">
      <FormField
        label="学生ID"
        value={formData.studentId}
        onChange={(studentId) => setFormData(prev => ({ ...prev, studentId }))}
        required
      />
      <TextAreaField
        label="内容"
        value={formData.content}
        onChange={(content) => setFormData(prev => ({ ...prev, content }))}
        required
        maxLength={1000}
      />
      <Button type="submit" disabled={loading}>
        {loading ? '保存中...' : '保存'}
      </Button>
    </form>
  );
};
```

### ARCH_01_01_05-005: テストアーキテクチャ
**対応目標**: GOAL_01_01_05-005
**対応タスク**: TASK_01_01_05-005
**対応構造**: STRUCT_01_01_05-005
**対応挙動**: BEHAV_01_01_05-005
**対応実装**: IMPL_01_01_05-005
**対応テスト**: TEST_01_01_05-005
**対応デプロイ**: DEPLOY_01_01_05-005

**アーキテクチャパターン**:
```typescript
// テストアーキテクチャ - テストピラミッド
export interface TestArchitecture {
  unitTests: UnitTestSuite;
  integrationTests: IntegrationTestSuite;
  e2eTests: E2ETestSuite;
  testUtilities: TestUtilities;
}

// ユニットテストアーキテクチャ
export class UnitTestSuite {
  constructor(
    private testRunner: TestRunner,
    private mocks: MockFactory,
    private assertions: AssertionLibrary
  ) {}
  
  async runTests(): Promise<TestResult> {
    const testFiles = this.discoverTestFiles('**/*.unit.test.ts');
    const results = await Promise.all(
      testFiles.map(file => this.runSingleTest(file))
    );
    
    return this.aggregateResults(results);
  }
  
  private async runSingleTest(testFile: string): Promise<SingleTestResult> {
    const mocks = this.mocks.createForTest(testFile);
    const testModule = await import(testFile);
    
    try {
      await testModule.run(mocks);
      return { file: testFile, status: 'passed' };
    } catch (error) {
      return { file: testFile, status: 'failed', error: error.message };
    } finally {
      mocks.restore();
    }
  }
}

// 統合テストアーキテクチャ
export class IntegrationTestSuite {
  constructor(
    private testContainer: TestContainer,
    private database: TestDatabase,
    private externalServices: MockExternalServices
  ) {}
  
  async setup(): Promise<void> {
    await this.testContainer.start();
    await this.database.migrate();
    await this.externalServices.start();
  }
  
  async teardown(): Promise<void> {
    await this.externalServices.stop();
    await this.database.cleanup();
    await this.testContainer.stop();
  }
  
  async runTests(): Promise<TestResult> {
    await this.setup();
    
    try {
      const testFiles = this.discoverTestFiles('**/*.integration.test.ts');
      const results = await Promise.all(
        testFiles.map(file => this.runIntegrationTest(file))
      );
      
      return this.aggregateResults(results);
    } finally {
      await this.teardown();
    }
  }
  
  private async runIntegrationTest(testFile: string): Promise<SingleTestResult> {
    const testModule = await import(testFile);
    
    try {
      await testModule.run(this.testContainer);
      return { file: testFile, status: 'passed' };
    } catch (error) {
      return { file: testFile, status: 'failed', error: error.message };
    }
  }
}

// E2Eテストアーキテクチャ
export class E2ETestSuite {
  constructor(
    private browser: BrowserLauncher,
    private pageFactory: PageFactory,
    private testData: TestDataGenerator
  ) {}
  
  async runTests(): Promise<TestResult> {
    const browser = await this.browser.launch();
    const context = await browser.newContext();
    
    try {
      const testFiles = this.discoverTestFiles('**/*.e2e.test.ts');
      const results = await Promise.all(
        testFiles.map(file => this.runE2ETest(file, context))
      );
      
      return this.aggregateResults(results);
    } finally {
      await context.close();
      await browser.close();
    }
  }
  
  private async runE2ETest(testFile: string, context: BrowserContext): Promise<SingleTestResult> {
    const page = await context.newPage();
    const testModule = await import(testFile);
    
    try {
      await testModule.run(page, this.pageFactory, this.testData);
      return { file: testFile, status: 'passed' };
    } catch (error) {
      return { file: testFile, status: 'failed', error: error.message };
    } finally {
      await page.close();
    }
  }
}

// テストユーティリティアーキテクチャ
export class TestUtilities {
  constructor(
    private fixtures: FixtureFactory,
    private assertions: CustomAssertions,
    private helpers: TestHelpers
  ) {}
  
  createStudentRecord(overrides?: Partial<StudentRecord>): StudentRecord {
    return this.fixtures.createStudentRecord(overrides);
  }
  
  assertEmotionScore(actual: EmotionScore, expected: EmotionScore): void {
    this.assertions.assertEmotionScore(actual, expected);
  }
  
  async waitForCondition(
    condition: () => Promise<boolean>,
    timeout: number = 5000
  ): Promise<void> {
    return this.helpers.waitForCondition(condition, timeout);
  }
}
```

### ARCH_01_01_06-006: AI処理アーキテクチャ
**対応目標**: GOAL_01_01_06-006
**対応タスク**: TASK_01_01_06-006
**対応構造**: STRUCT_01_01_06-006
**対応挙動**: BEHAV_01_01_06-006
**対応実装**: IMPL_01_01_06-006
**対応テスト**: TEST_01_01_06-006
**対応デプロイ**: DEPLOY_01_01_06-006

**アーキテクチャパターン**:
```typescript
// ドメイン層 - AI処理抽象化
export interface AIModel<TInput, TOutput> {
  predict(input: TInput): Promise<TOutput>;
  validate(input: TInput): boolean;
  getVersion(): string;
}

export interface ModelRegistry {
  register<TInput, TOutput>(name: string, model: AIModel<TInput, TOutput>): void;
  get<TInput, TOutput>(name: string): AIModel<TInput, TOutput> | null;
  listModels(): string[];
}

export interface ModelTrainer {
  train(trainingData: TrainingData): Promise<TrainingResult>;
  evaluate(model: AIModel<any, any>, testData: TestData): Promise<EvaluationResult>;
  save(model: AIModel<any, any>, path: string): Promise<void>;
  load(path: string): Promise<AIModel<any, any>>;
}

// アプリケーション層 - AI処理ユースケース
export class EmotionAnalysisUseCase {
  constructor(
    private modelRegistry: ModelRegistry,
    private preprocessor: TextPreprocessor,
    private postprocessor: ResultPostprocessor
  ) {}
  
  async analyzeEmotion(text: string): Promise<EmotionAnalysisResult> {
    // 前処理
    const preprocessed = await this.preprocessor.process(text);
    
    // モデル取得
    const model = this.modelRegistry.get<EmotionInput, EmotionOutput>('emotion-analysis');
    if (!model) {
      throw new Error('Emotion analysis model not found');
    }
    
    // 予測実行
    const rawOutput = await model.predict(preprocessed);
    
    // 後処理
    const result = await this.postprocessor.process(rawOutput);
    
    return {
      text,
      emotionScore: result.emotionScore,
      confidence: result.confidence,
      modelVersion: model.getVersion(),
      processedAt: new Date()
    };
  }
}

export class ModelManagementUseCase {
  constructor(
    private modelRegistry: ModelRegistry,
    private modelTrainer: ModelTrainer,
    private modelRepository: ModelRepository
  ) {}
  
  async deployModel(modelName: string, modelPath: string): Promise<DeploymentResult> {
    // モデル読み込み
    const model = await this.modelTrainer.load(modelPath);
    
    // モデル検証
    const validationResult = await this.validateModel(model);
    if (!validationResult.isValid) {
      throw new Error(`Model validation failed: ${validationResult.errors.join(', ')}`);
    }
    
    // レジストリに登録
    this.modelRegistry.register(modelName, model);
    
    // 永続化
    await this.modelRepository.save(modelName, model);
    
    return {
      modelName,
      version: model.getVersion(),
      deployedAt: new Date(),
      status: 'deployed'
    };
  }
  
  private async validateModel(model: AIModel<any, any>): Promise<ValidationResult> {
    // モデルの基本検証
    const testInput = this.createTestInput();
    const isValid = model.validate(testInput);
    
    if (!isValid) {
      return { isValid: false, errors: ['Model validation failed'] };
    }
    
    // パフォーマンス検証
    const startTime = Date.now();
    await model.predict(testInput);
    const inferenceTime = Date.now() - startTime;
    
    if (inferenceTime > 1000) {
      return { isValid: false, errors: ['Model inference too slow'] };
    }
    
    return { isValid: true, errors: [] };
  }
}

// インフラ層 - TensorFlowモデル実装
export class TensorFlowEmotionModel implements AIModel<EmotionInput, EmotionOutput> {
  private model: tf.LayersModel | null = null;
  private readonly version: string;
  
  constructor(
    private modelPath: string,
    version: string
  ) {
    this.version = version;
  }
  
  async initialize(): Promise<void> {
    this.model = await tf.loadLayersModel(this.modelPath);
  }
  
  async predict(input: EmotionInput): Promise<EmotionOutput> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }
    
    const tensor = this.preprocessInput(input);
    const prediction = await this.model.predict(tensor) as tf.Tensor;
    const output = await this.extractOutput(prediction);
    
    tensor.dispose();
    prediction.dispose();
    
    return output;
  }
  
  validate(input: EmotionInput): boolean {
    return input.text.length > 0 && input.text.length <= 1000;
  }
  
  getVersion(): string {
    return this.version;
  }
  
  private preprocessInput(input: EmotionInput): tf.Tensor {
    // テキストのテンソル化
    const tokens = this.tokenize(input.text);
    const padded = this.padTokens(tokens);
    return tf.tensor2d([padded]);
  }
  
  private extractOutput(prediction: tf.Tensor): EmotionOutput {
    // テンソルから感情スコアを抽出
    const data = prediction.dataSync();
    return {
      happiness: data[0],
      engagement: data[1],
      stress: data[2],
      confidence: data[3]
    };
  }
}

// プレゼンテーション層 - AIコンポーネント
export const EmotionAnalysisComponent = ({ text, onAnalysis }: Props) => {
  const [analysis, setAnalysis] = useState<EmotionAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const analyzeEmotion = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const useCase = new EmotionAnalysisUseCase(
        getModelRegistry(),
        new TextPreprocessor(),
        new ResultPostprocessor()
      );
      
      const result = await useCase.analyzeEmotion(text);
      setAnalysis(result);
      onAnalysis?.(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, [text, onAnalysis]);
  
  return (
    <div className="emotion-analysis">
      <div className="input-section">
        <TextArea
          value={text}
          onChange={setText}
          placeholder="分析するテキストを入力してください"
          rows={4}
        />
        <Button onClick={analyzeEmotion} disabled={loading || !text.trim()}>
          {loading ? '分析中...' : '感情分析'}
        </Button>
      </div>
      
      {error && (
        <Alert variant="error" message={error} />
      )}
      
      {analysis && (
        <EmotionScoreDisplay
          scores={analysis.emotionScore}
          confidence={analysis.confidence}
          modelVersion={analysis.modelVersion}
        />
      )}
    </div>
  );
};
```

### ARCH_01_01_07-007: ユーザビリティアーキテクチャ
**対応目標**: GOAL_01_01_07-007
**対応タスク**: TASK_01_01_07-007
**対応構造**: STRUCT_01_01_07-007
**対応挙動**: BEHAV_01_01_07-007
**対応実装**: IMPL_01_01_07-007
**対応テスト**: TEST_01_01_07-007
**対応デプロイ**: DEPLOY_01_01_07-007

**アーキテクチャパターン**:
```typescript
// ドメイン層 - ユーザビリティ抽象化
export interface AccessibilityManager {
  announce(message: string, priority?: 'polite' | 'assertive'): void;
  setFocus(element: HTMLElement): void;
  trapFocus(container: HTMLElement): () => void;
  enableKeyboardNavigation(): void;
}

export interface LocalizationManager {
  setLanguage(language: string): Promise<void>;
  getLanguage(): string;
  translate(key: string, params?: Record<string, any>): string;
  formatDate(date: Date): string;
  formatNumber(number: number): string;
}

export interface UserGuidanceManager {
  startOnboarding(): Promise<void>;
  showHelp(topic: string): Promise<void>;
  showTooltip(element: HTMLElement, content: string): () => void;
  trackUserAction(action: UserAction): void;
}

// アプリケーション層 - ユーザビリティユースケース
export class AccessibilityUseCase {
  constructor(
    private accessibilityManager: AccessibilityManager,
    private userPreferences: UserPreferencesRepository
  ) {}
  
  async initializeAccessibility(): Promise<void> {
    const preferences = await this.userPreferences.getAccessibilityPreferences();
    
    // スクリーンリーダー対応
    if (preferences.screenReader) {
      this.accessibilityManager.enableScreenReader();
    }
    
    // キーボードナビゲーション
    if (preferences.keyboardNavigation) {
      this.accessibilityManager.enableKeyboardNavigation();
    }
    
    // 高コントラストモード
    if (preferences.highContrast) {
      this.accessibilityManager.enableHighContrast();
    }
    
    // フォントサイズ
    if (preferences.fontSize) {
      this.accessibilityManager.setFontSize(preferences.fontSize);
    }
  }
  
  async updateAccessibilityPreferences(preferences: AccessibilityPreferences): Promise<void> {
    await this.userPreferences.saveAccessibilityPreferences(preferences);
    await this.initializeAccessibility();
    
    // 変更を通知
    this.accessibilityManager.announce(
      'アクセシビリティ設定が更新されました',
      'polite'
    );
  }
}

export class LocalizationUseCase {
  constructor(
    private localizationManager: LocalizationManager,
    private userPreferences: UserPreferencesRepository
  ) {}
  
  async initializeLocalization(): Promise<void> {
    const savedLanguage = await this.userPreferences.getLanguage();
    const browserLanguage = this.getBrowserLanguage();
    const language = savedLanguage || browserLanguage;
    
    await this.localizationManager.setLanguage(language);
  }
  
  async changeLanguage(language: string): Promise<void> {
    await this.localizationManager.setLanguage(language);
    await this.userPreferences.saveLanguage(language);
    
    // 変更を通知
    this.accessibilityManager.announce(
      `言語が${this.getLanguageName(language)}に変更されました`,
      'polite'
    );
  }
  
  private getBrowserLanguage(): string {
    return navigator.language.split('-')[0];
  }
  
  private getLanguageName(language: string): string {
    const names: Record<string, string> = {
      'ja': '日本語',
      'en': 'English',
      'zh': '中文',
      'ko': '한국어'
    };
    return names[language] || language;
  }
}

// インフラ層 - ブラウザ実装
export class BrowserAccessibilityManager implements AccessibilityManager {
  private liveRegion: HTMLElement | null = null;
  private focusTrapStack: HTMLElement[] = [];
  
  constructor() {
    this.createLiveRegion();
    this.setupKeyboardNavigation();
  }
  
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.liveRegion) return;
    
    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;
    
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = '';
      }
    }, 1000);
  }
  
  setFocus(element: HTMLElement): void {
    element.focus();
    this.announce(element.textContent || '', 'polite');
  }
  
  trapFocus(container: HTMLElement): () => void {
    this.focusTrapStack.push(container);
    
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      this.focusTrapStack.pop();
    };
  }
  
  enableKeyboardNavigation(): void {
    // キーボードナビゲーションの有効化処理
    document.addEventListener('keydown', this.handleGlobalKeyEvents);
  }
  
  private createLiveRegion(): void {
    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.className = 'sr-only';
    document.body.appendChild(this.liveRegion);
  }
  
  private setupKeyboardNavigation(): void {
    // グローバルキーボードイベントの設定
    document.addEventListener('keydown', this.handleGlobalKeyEvents);
  }
  
  private handleGlobalKeyEvents = (event: KeyboardEvent): void => {
    // グローバルキーボードイベントの処理
    switch (event.key) {
      case 'Escape':
        this.handleEscapeKey(event);
        break;
      case 'Tab':
        this.handleTabKey(event);
        break;
    }
  };
  
  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');
    
    return Array.from(container.querySelectorAll(selector));
  }
}

// プレゼンテーション層 - ユーザビリティコンポーネント
export const AccessibilityMenu = () => {
  const { preferences, updatePreferences } = useAccessibility();
  const { t } = useLocalization();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleScreenReaderToggle = async (enabled: boolean) => {
    await updatePreferences({ screenReader: enabled });
    announceChange(t('accessibility.screenReaderToggled', { enabled }));
  };
  
  const handleHighContrastToggle = async (enabled: boolean) => {
    await updatePreferences({ highContrast: enabled });
    announceChange(t('accessibility.highContrastToggled', { enabled }));
  };
  
  const handleFontSizeChange = async (size: AccessibilityPreferences['fontSize']) => {
    await updatePreferences({ fontSize: size });
    announceChange(t('accessibility.fontSizeChanged', { size }));
  };
  
  const announceChange = (message: string) => {
    const accessibilityManager = getAccessibilityManager();
    accessibilityManager.announce(message, 'polite');
  };
  
  return (
    <div className="accessibility-menu">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={t('accessibility.menu')}
        aria-expanded={isOpen}
      >
        <Accessibility className="h-4 w-4" />
        {t('accessibility.menu')}
      </Button>
      
      {isOpen && (
        <div className="accessibility-dropdown" role="menu">
          <div className="menu-section">
            <h3>{t('accessibility.screenReader')}</h3>
            <Switch
              checked={preferences.screenReader}
              onCheckedChange={handleScreenReaderToggle}
            />
          </div>
          
          <div className="menu-section">
            <h3>{t('accessibility.highContrast')}</h3>
            <Switch
              checked={preferences.highContrast}
              onCheckedChange={handleHighContrastToggle}
            />
          </div>
          
          <div className="menu-section">
            <h3>{t('accessibility.fontSize')}</h3>
            <Select
              value={preferences.fontSize}
              onValueChange={handleFontSizeChange}
            >
              <SelectItem value="small">{t('accessibility.fontSizes.small')}</SelectItem>
              <SelectItem value="medium">{t('accessibility.fontSizes.medium')}</SelectItem>
              <SelectItem value="large">{t('accessibility.fontSizes.large')}</SelectItem>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};
```

### ARCH_01_01_08-008: 運用アーキテクチャ
**対応目標**: GOAL_01_01_08-008
**対応タスク**: TASK_01_01_08-008
**対応構造**: STRUCT_01_01_08-008
**対応挙動**: BEHAV_01_01_08-008
**対応実装**: IMPL_01_01_08-008
**対応テスト**: TEST_01_01_08-008
**対応デプロイ**: DEPLOY_01_01_08-008

**アーキテクチャパターン**:
```typescript
// ドメイン層 - 運用抽象化
export interface HealthChecker {
  checkHealth(): Promise<HealthCheckResult>;
  registerCheck(name: string, check: HealthCheck): void;
  removeCheck(name: string): void;
}

export interface MetricsCollector {
  incrementCounter(name: string, labels?: Record<string, string>): void;
  recordHistogram(name: string, value: number, labels?: Record<string, string>): void;
  setGauge(name: string, value: number, labels?: Record<string, string>): void;
}

export interface AlertManager {
  sendAlert(alert: Alert): Promise<void>;
  resolveAlert(alertId: string): Promise<void>;
  getActiveAlerts(): Promise<Alert[]>;
}

export interface DeploymentManager {
  deploy(version: string): Promise<DeploymentResult>;
  rollback(targetVersion?: string): Promise<RollbackResult>;
  getDeploymentStatus(): Promise<DeploymentStatus>;
}

// アプリケーション層 - 運用ユースケース
export class HealthMonitoringUseCase {
  constructor(
    private healthChecker: HealthChecker,
    private metricsCollector: MetricsCollector,
    private alertManager: AlertManager
  ) {}
  
  async performHealthCheck(): Promise<OverallHealthStatus> {
    const startTime = Date.now();
    
    try {
      const results = await this.healthChecker.checkHealth();
      const duration = Date.now() - startTime;
      
      // メトリクス記録
      this.metricsCollector.recordHistogram('health_check_duration', duration);
      this.metricsCollector.setGauge('health_status', results.overallStatus === 'healthy' ? 1 : 0);
      
      // アラート判定
      if (results.overallStatus !== 'healthy') {
        await this.alertManager.sendAlert({
          type: 'health_check_failed',
          severity: 'critical',
          message: `Health check failed: ${results.overallStatus}`,
          details: results.checkResults
        });
      }
      
      return results;
    } catch (error) {
      this.metricsCollector.incrementCounter('health_check_errors');
      throw error;
    }
  }
}

export class DeploymentUseCase {
  constructor(
    private deploymentManager: DeploymentManager,
    private healthChecker: HealthChecker,
    private alertManager: AlertManager
  ) {}
  
  async deployWithValidation(version: string): Promise<DeploymentResult> {
    try {
      // デプロイ実行
      const deploymentResult = await this.deploymentManager.deploy(version);
      
      // ヘルスチェック
      const healthStatus = await this.performHealthCheckWithRetry();
      
      if (healthStatus.overallStatus !== 'healthy') {
        // 自動ロールバック
        await this.performAutoRollback(version);
        throw new Error('Deployment failed health check, rolled back automatically');
      }
      
      // 成功通知
      await this.alertManager.sendAlert({
        type: 'deployment_success',
        severity: 'info',
        message: `Deployment ${version} completed successfully`,
        details: deploymentResult
      });
      
      return deploymentResult;
      
    } catch (error) {
      // 失敗通知
      await this.alertManager.sendAlert({
        type: 'deployment_failure',
        severity: 'critical',
        message: `Deployment ${version} failed: ${error.message}`,
        details: { error: error.message, version }
      });
      
      throw error;
    }
  }
  
  private async performHealthCheckWithRetry(maxRetries: number = 5): Promise<OverallHealthStatus> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const healthStatus = await this.healthChecker.checkHealth();
        if (healthStatus.overallStatus === 'healthy') {
          return healthStatus;
        }
        
        if (i < maxRetries - 1) {
          await this.sleep(30000); // 30秒待機
        }
      } catch (error) {
        if (i === maxRetries - 1) {
          throw error;
        }
        await this.sleep(30000);
      }
    }
    
    throw new Error('Health check failed after maximum retries');
  }
  
  private async performAutoRollback(failedVersion: string): Promise<void> {
    try {
      const rollbackResult = await this.deploymentManager.rollback();
      
      await this.alertManager.sendAlert({
        type: 'auto_rollback',
        severity: 'warning',
        message: `Auto-rollback initiated for version ${failedVersion}`,
        details: rollbackResult
      });
    } catch (rollbackError) {
      await this.alertManager.sendAlert({
        type: 'rollback_failure',
        severity: 'critical',
        message: `Auto-rollback failed for version ${failedVersion}: ${rollbackError.message}`,
        details: { rollbackError: rollbackError.message, failedVersion }
      });
    }
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// インフラ層 - Kubernetes実装
export class KubernetesDeploymentManager implements DeploymentManager {
  constructor(
    private k8sClient: KubernetesClient,
    private namespace: string
  ) {}
  
  async deploy(version: string): Promise<DeploymentResult> {
    const deploymentName = 'ikiiki-record';
    
    try {
      // 新バージョンのデプロイ
      await this.k8sClient.patchDeployment(
        this.namespace,
        deploymentName,
        {
          spec: {
            template: {
              spec: {
                containers: [{
                  name: 'app',
                  image: `ikiiki-record:${version}`
                }]
              }
            }
          }
        }
      );
      
      // ロールアウト完了待機
      await this.waitForRollout(deploymentName);
      
      return {
        version,
        status: 'deployed',
        deployedAt: new Date(),
        podStatus: await this.getPodStatus()
      };
      
    } catch (error) {
      throw new Error(`Deployment failed: ${error.message}`);
    }
  }
  
  async rollback(targetVersion?: string): Promise<RollbackResult> {
    const deploymentName = 'ikiiki-record';
    
    try {
      // ロールバック実行
      await this.k8sClient.rollbackDeployment(
        this.namespace,
        deploymentName,
        targetVersion
      );
      
      // ロールアウト完了待機
      await this.waitForRollout(deploymentName);
      
      return {
        targetVersion: targetVersion || 'previous',
        status: 'rolled_back',
        rolledBackAt: new Date(),
        podStatus: await this.getPodStatus()
      };
      
    } catch (error) {
      throw new Error(`Rollback failed: ${error.message}`);
    }
  }
  
  async getDeploymentStatus(): Promise<DeploymentStatus> {
    const deployment = await this.k8sClient.getDeployment(
      this.namespace,
      'ikiiki-record'
    );
    
    return {
      replicas: deployment.spec.replicas,
      readyReplicas: deployment.status.readyReplicas || 0,
      updatedReplicas: deployment.status.updatedReplicas || 0,
      availableReplicas: deployment.status.availableReplicas || 0,
      conditions: deployment.status.conditions || []
    };
  }
  
  private async waitForRollout(deploymentName: string): Promise<void> {
    const maxWaitTime = 600000; // 10分
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.getDeploymentStatus();
      
      if (status.readyReplicas === status.replicas) {
        return;
      }
      
      await this.sleep(5000); // 5秒待機
    }
    
    throw new Error('Rollout timeout');
  }
  
  private async getPodStatus(): Promise<PodStatus> {
    const pods = await this.k8sClient.listPods(this.namespace, {
      labelSelector: 'app=ikiiki-record'
    });
    
    const running = pods.items.filter(pod => 
      pod.status.phase === 'Running'
    ).length;
    
    const total = pods.items.length;
    
    return { running, total };
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// プレゼンテーション層 - 運用ダッシュボード
export const OperationsDashboard = () => {
  const [healthStatus, setHealthStatus] = useState<OverallHealthStatus | null>(null);
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  useEffect(() => {
    const healthUseCase = new HealthMonitoringUseCase(
      getHealthChecker(),
      getMetricsCollector(),
      getAlertManager()
    );
    
    const deploymentUseCase = new DeploymentUseCase(
      getDeploymentManager(),
      getHealthChecker(),
      getAlertManager()
    );
    
    // 定期的なヘルスチェック
    const healthInterval = setInterval(async () => {
      try {
        const status = await healthUseCase.performHealthCheck();
        setHealthStatus(status);
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, 30000); // 30秒ごと
    
    // デプロイメントステータスの取得
    const loadDeploymentStatus = async () => {
      try {
        const status = await deploymentUseCase.getDeploymentStatus();
        setDeploymentStatus(status);
      } catch (error) {
        console.error('Failed to load deployment status:', error);
      }
    };
    
    // アラートの取得
    const loadAlerts = async () => {
      try {
        const activeAlerts = await getAlertManager().getActiveAlerts();
        setAlerts(activeAlerts);
      } catch (error) {
        console.error('Failed to load alerts:', error);
      }
    };
    
    loadDeploymentStatus();
    loadAlerts();
    
    const deploymentInterval = setInterval(() => {
      loadDeploymentStatus();
      loadAlerts();
    }, 60000); // 1分ごと
    
    return () => {
      clearInterval(healthInterval);
      clearInterval(deploymentInterval);
    };
  }, []);
  
  return (
    <div className="operations-dashboard">
      <div className="dashboard-header">
        <h1>運用ダッシュボード</h1>
        <div className="timestamp">
          最終更新: {new Date().toLocaleString('ja-JP')}
        </div>
      </div>
      
      <div className="dashboard-grid">
        <HealthStatusCard status={healthStatus} />
        <DeploymentStatusCard status={deploymentStatus} />
        <AlertsPanel alerts={alerts} />
        <MetricsPanel />
      </div>
    </div>
  );
};
```

## アーキテクチャ原則

### 1. クリーンアーキテクチャの厳格適用
- **依存性の方向**: 外側から内側へのみ依存を許可
- **関心の分離**: 各層が単一の責務を持つ
- **ドメイン中心**: ビジネスロジックが技術的関心から独立

### 2. マイクロサービスアーキテクチャ
- **サービス分割**: ビジネスキャパビリティベースの分割
- **独立デプロイ**: 各サービスが独立してデプロイ可能
- **データ分離**: 各サービスが独自のデータストアを持つ

### 3. イベント駆動アーキテクチャ
- **疎結合**: サービス間の非同期通信
- **スケーラビリティ**: イベントベースの水平スケーリング
- **回復性**: イベントの再処理によるエラー回復

### 4. APIファースト設計
- **契約駆動**: API仕様が実装に先行
- **バージョニング**: 後方互換性のあるAPI進化
- **ドキュメンテーション**: 自動生成されたAPIドキュメント

## 技術スタック

### フロントエンド
- **フレームワーク**: Next.js 14 + React 18
- **状態管理**: Zustand + React Query
- **スタイリング**: Tailwind CSS + Headless UI
- **テスト**: Jest + Testing Library + Playwright

### バックエンド
- **ランタイム**: Node.js 18+
- **フレームワーク**: Express.js + TypeScript
- **データベース**: PostgreSQL + Redis
- **AI/ML**: TensorFlow.js + Python

### インフラ
- **コンテナ**: Docker + Kubernetes
- **CI/CD**: GitHub Actions + ArgoCD
- **監視**: Prometheus + Grafana + ELK
- **クラウド**: AWS (EKS, RDS, ElastiCache)

## 品質保証

### コード品質
- **静的解析**: ESLint + Prettier + SonarQube
- **型安全性**: TypeScript strict mode
- **テストカバレッジ**: 95%以上
- **コードレビュー**: 全PRでの必須レビュー

### パフォーマンス
- **レスポンスタイム**: P95 < 200ms
- **可用性**: 99.9%以上
- **スループット**: 1000 RPS以上
- **リソース効率**: CPU < 70%, Memory < 80%

### セキュリティ
- **認証認可**: JWT + OAuth 2.0
- **データ暗号化**: 通信・保存データのAES-256暗号化
- **脆弱性スキャン**: 定期的なセキュリティ診断
- **コンプライアンス**: GDPR + 個人情報保護法

---

**更新履歴**:
- 2024-01-01: 初版作成
- 2024-01-15: AIアーキテクチャ追加
- 2024-02-01: 運用アーキテクチャ拡充
- 2025-01-10: アンカーID対応関係の確立