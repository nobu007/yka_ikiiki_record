import {
  DataGenerationConfig,
  EmotionDistributionPattern,
  EventEffect,
  EMOTION_CONSTANTS
} from '../entities/DataGeneration';

export class EmotionGenerator {
  /**
   * 基本の感情値を生成（分布パターンに基づく）
   */
  private generateBaseEmotion(pattern: EmotionDistributionPattern, random = Math.random()): number {
    const { MIN_EMOTION, MAX_EMOTION, DEFAULT_STDDEV } = EMOTION_CONSTANTS;

    switch (pattern) {
      case 'normal':
        // 正規分布（ボックス・ミュラー法）
        const u1 = random;
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        const emotion = 3.0 + DEFAULT_STDDEV * z;
        return Math.max(MIN_EMOTION, Math.min(MAX_EMOTION, emotion));

      case 'bimodal':
        // 二峰性分布（2つの正規分布の組み合わせ）
        if (random < 0.5) {
          return 2.0 + DEFAULT_STDDEV * this.normalRandom();
        } else {
          return 4.0 + DEFAULT_STDDEV * this.normalRandom();
        }

      case 'stress':
        // ストレス型（左寄りの歪んだ分布）
        const stressEmotion = 2.5 + DEFAULT_STDDEV * this.normalRandom();
        return Math.max(MIN_EMOTION, Math.min(MAX_EMOTION, stressEmotion));

      case 'happy':
        // ハッピー型（右寄りの歪んだ分布）
        const happyEmotion = 3.5 + DEFAULT_STDDEV * this.normalRandom();
        return Math.max(MIN_EMOTION, Math.min(MAX_EMOTION, happyEmotion));

      default:
        return 3.0;
    }
  }

  /**
   * 季節変動の影響を計算
   */
  private calculateSeasonalEffect(date: Date): number {
    const month = date.getMonth();
    const { SEASONAL_IMPACT } = EMOTION_CONSTANTS;

    // 季節ごとの基本的な影響度
    const seasonalFactors = [
      0.2,  // 1月（冬）
      0.1,  // 2月（冬）
      0.3,  // 3月（春）
      0.4,  // 4月（春）
      0.5,  // 5月（春）
      0.3,  // 6月（夏）
      0.2,  // 7月（夏）
      0.1,  // 8月（夏）
      0.3,  // 9月（秋）
      0.4,  // 10月（秋）
      0.3,  // 11月（秋）
      0.1   // 12月（冬）
    ];

    return (seasonalFactors[month] - 0.3) * SEASONAL_IMPACT;
  }

  /**
   * イベントの影響を計算
   */
  private calculateEventEffect(date: Date, events: EventEffect[]): number {
    const { MAX_EVENT_IMPACT } = EMOTION_CONSTANTS;
    let totalEffect = 0;

    events.forEach(event => {
      if (date >= event.startDate && date <= event.endDate) {
        // イベント期間中は影響度を徐々に変化させる
        const progress = (date.getTime() - event.startDate.getTime()) /
                        (event.endDate.getTime() - event.startDate.getTime());
        const intensity = Math.sin(progress * Math.PI); // 山型の影響度
        totalEffect += event.impact * intensity * MAX_EVENT_IMPACT;
      }
    });

    return totalEffect;
  }

  /**
   * 指定された設定に基づいて感情値を生成
   */
  generateEmotion(config: DataGenerationConfig, date: Date, studentIndex: number): number {
    // 基本感情値の生成
    const baseEmotion = this.generateBaseEmotion(config.distributionPattern);

    // 各種影響の計算
    let emotion = baseEmotion;

    // クラス特性の反映
    emotion = emotion * (1 + (config.classCharacteristics.volatility - 0.5) * 0.4);
    emotion += (config.classCharacteristics.baselineEmotion - 3.0) * 0.5;

    // 季節変動の反映
    if (config.seasonalEffects) {
      emotion += this.calculateSeasonalEffect(date);
    }

    // イベントの影響を反映
    emotion += this.calculateEventEffect(date, config.eventEffects);

    // 値の範囲を制限
    return Math.max(
      EMOTION_CONSTANTS.MIN_EMOTION,
      Math.min(EMOTION_CONSTANTS.MAX_EMOTION, emotion)
    );
  }

  /**
   * 標準正規分布の乱数を生成
   */
  private normalRandom(): number {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }
}