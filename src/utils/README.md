# Utils Directory

This directory contains utility functions and helpers that are used throughout the application.

## Files

### statsCalculator.ts

Contains utility functions for calculating statistics related to emotion data.

#### Functions

- `calculateAverage(values: number[]): number` - Calculates the average of an array of numbers
- `calculateMonthlyStats(emotions: Array<{date: Date; emotion: number}>): MonthlyStats[]` - Calculates monthly statistics
- `calculateDayOfWeekStats(emotions: Array<{date: Date; emotion: number}>): DayOfWeekStats[]` - Calculates day of week statistics
- `calculateTimeOfDayStats(emotions: Array<{hour: number; emotion: number}>): TimeOfDayStats` - Calculates time of day statistics
- `calculateEmotionDistribution(emotions: Array<{emotion: number}>): number[]` - Calculates emotion distribution
- `calculateStudentStats(emotions: Array<{student: number; emotion: number; date: Date}>): StudentStats[]` - Calculates student-specific statistics
- `calculateTrendline(emotions: number[]): number[]` - Calculates a trendline from the last 7 emotion values
- `getRandomHour(): number` - Generates a random hour between 5-23

### emotionCalculator.ts

Contains utility functions for generating and calculating emotion values.

#### Functions

- `generateNormalRandom(): number` - Generates a random number from a standard normal distribution
- `generateBaseEmotion(pattern: EmotionDistributionPattern, random?: number): number` - Generates a base emotion value based on distribution pattern
- `calculateSeasonalEffect(date: Date): number` - Calculates seasonal effect on emotion
- `calculateEventEffect(date: Date, events: EventEffect[]): number` - Calculates event effects on emotion
- `clampEmotionValue(emotion: number): number` - Clamps emotion value to valid range

## Usage

These utilities are used by the domain services to perform calculations and generate data. They are designed to be pure functions that don't have side effects, making them easy to test and reuse.