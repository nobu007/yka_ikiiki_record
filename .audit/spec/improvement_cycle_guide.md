# SPEC Integrity Improvement Cycle Guide

**Audit Date**: 2026-03-30
**Current Score**: 54/100 (FAIL)
**Target Score**: 80/100 (PASS)
**Iterations Available**: 3

---

## Overview

This guide provides step-by-step instructions for executing the improvement cycle to bring the SPEC integrity audit from FAIL (54 points) to PASS (80+ points).

---

## Improvement Cycle Strategy

### Cycle 1: Critical Gaps (Target: +20 points)

**Focus**: Address the largest gaps with highest impact
**Duration**: 14-18 hours
**Expected Score**: 74/100

#### Step 1: Fix S-005 Test-SPEC Mapping (+10 points)
**Time**: 12-15 hours

Create `test_matrix.yml` for all 137 existing SPECs:

```yaml
# Example test_matrix.yml structure
symbol_name: useStats
spec_file: useStats_spec.md
test_files:
  - src/presentation/hooks/useStats.test.ts
  - src/hooks/useStats.ts

test_coverage:
  boundary_cases:
    - id: BV-001
      test_file: src/presentation/hooks/useStats.test.ts
      test_name: "should return initial state on first call"
      status: implemented

    - id: BV-002
      test_file: src/presentation/hooks/useStats.test.ts
      test_name: "should handle empty data"
      status: implemented

  error_scenarios:
    - id: ES-001
      test_file: src/presentation/hooks/useStats.test.ts
      test_name: "should handle API errors"
      status: implemented

gaps:
  - "Missing test for network timeout scenario"
  - "Missing test for malformed data response"
```

**Automated Approach**:
```bash
# Script to generate test_matrix.yml templates
for spec_dir in .spec-workflow/specs/*/; do
  spec_name=$(basename "$spec_dir")
  # Find test files matching spec name
  test_files=$(find src test -name "*${spec_name}*.test.*" 2>/dev/null)
  # Generate test_matrix.yml
  # (implementation details in scripts/generate_test_matrix.py)
done
```

#### Step 2: Fix S-001 Domain Layer SPECs (+3 points)
**Time**: 2-3 hours

Create SPECs for 10 missing domain layer symbols:

1. **AuditLog Entity** (3 SPECs)
   - `createAuditLogForCreate_spec.md`
   - `createAuditLogForUpdate_spec.md`
   - `createAuditLogForDelete_spec.md`

2. **AuditLog Types** (2 SPECs)
   - `AuditOperation_spec.md`
   - `AuditLog_spec.md`

3. **AuditLog Repository** (3 SPECs)
   - `AuditLogQuery_spec.md`
   - `AuditLogQueryResult_spec.md`
   - `AuditLogRepository_spec.md`

4. **Constants** (2 SPECs)
   - `EMOTION_CONSTANTS_spec.md`
   - `DATA_GENERATION_BOUNDS_spec.md`

**Template for Domain SPECs**:
```markdown
# SPEC: domain.entities.AuditLog.createAuditLogForCreate

**Version**: 1.0.0
**Last Updated**: 2026-03-30
**Source**: src/domain/entities/AuditLog.ts:74
**Type**: function

## 1. 概要

Create operationの監査ログエントリを生成する関数。

## 2. 入力仕様

| パラメータ | 型 | 必須 | 制約 | デフォルト値 | 説明 |
|-----------|------|------|------|--------------|------|
| entityName | string | Yes | 非空文字列 | - | 監査対象エンティティ名 |
| entityId | string | Yes | UUID形式 | - | 監査対象エンティティID |
| operation | string | Yes | "CREATE"固定 | - | 操作種別 |
| metadata | Record<string, unknown> | No | 1000文字以下 | {} | 追加メタデータ |

## 3. 出力仕様

| 戻り値 | 型 | 制約 | 説明 |
|--------|------|------|------|
| result | AuditLog | - | 生成された監査ログエントリ |

## 4. 前提条件（Preconditions）

- `entityName`が空文字列でないこと
- `entityId`が有効なUUID形式であること

## 5. 事後条件（Postconditions）

- 返されるAuditLogの全フィールドが正しく設定されていること
- timestampが現在時刻であること

## 6. 不変条件（Invariants）

- operationは常に"CREATE"であること
- timestampは設定不可（自動生成）であること

## 7. 境界値テストケース

See boundary_values.yml

## 8. エラーシナリオ

See error_scenarios.yml
```

#### Step 3: Quick Wins (+7 points)
**Time**: Remaining cycle time

- Enhance boundary_values.yml for top 20 SPECs (+3 points)
- Create error_scenarios.yml for top 20 SPECs (+3 points)
- Update SPEC freshness for stale SPECs (+1 point)

---

### Cycle 2: High Priority (Target: +10 points)

**Focus**: Complete high-priority axes
**Duration**: 12-16 hours
**Expected Score**: 84/100 (PASS ✓)

#### Step 1: Complete S-003 Boundary Analysis (+5 points)
**Time**: 6-8 hours

For each SPEC without specific boundary_values.yml:

1. **Analyze function signature**
   ```typescript
   function clamp(value: number, min: number, max: number): number
   ```

2. **Identify boundaries**
   - value: Number.MIN_SAFE_INTEGER to Number.MAX_SAFE_INTEGER
   - min: must be ≤ max
   - max: must be ≥ min
   - Return value: must be within [min, max]

3. **Create boundary_values.yml**
   ```yaml
   boundary_cases:
     - id: BV-001
       category: "正常系"
       input:
         value: 50
         min: 0
         max: 100
       expected_output: 50
       rationale: "標準入力（範囲内）"

     - id: BV-002
       category: "最小境界"
       input:
         value: 0
         min: 0
         max: 100
       expected_output: 0
       rationale: "最小境界値"

     - id: BV-003
       category: "最大境界"
       input:
         value: 100
         min: 0
         max: 100
       expected_output: 100
       rationale: "最大境界値"

     - id: BV-004
       category: "境界超過（下）"
       input:
         value: -10
         min: 0
         max: 100
       expected_output: 0
       rationale: "最小値未満は最小値にclamp"

     - id: BV-005
       category: "境界超過（上）"
       input:
         value: 110
         min: 0
         max: 100
       expected_output: 100
       rationale: "最大値超過は最大値にclamp"
   ```

#### Step 2: Complete S-004 Error Coverage (+5 points)
**Time**: 6-8 hours

For each SPEC without specific error_scenarios.yml:

1. **Analyze error types thrown**
   ```typescript
   // From implementation
   if (min > max) {
     throw new ValidationError('min must be <= max');
   }
   if (typeof value !== 'number') {
     throw new ValidationError('value must be a number');
   }
   ```

2. **Create error_scenarios.yml**
   ```yaml
   error_scenarios:
     - id: ES-001
       scenario: "min > max（無効な範囲）"
       input_example:
         value: 50
         min: 100
         max: 0
       expected_behavior:
         throws: ValidationError
         message: "min must be <= max"
       exception_type: ValidationError

     - id: ES-002
       scenario: "valueが数値でない"
       input_example:
         value: "not a number"
         min: 0
         max: 100
       expected_behavior:
         throws: ValidationError
         message: "value must be a number"
       exception_type: ValidationError
   ```

#### Step 3: Remaining S-001 SPECs (+2 points)
**Time**: 2-3 hours

Create SPECs for application/infrastructure layer symbols.

---

### Cycle 3: Polish (Target: +6 points)

**Focus**: Achieve perfect scores on passing axes
**Duration**: 8-12 hours
**Expected Score**: 90/100

#### Step 1: Perfect S-002 I/O Strictness (+1 point)
**Time**: 1 hour

Review all SPECs and enhance generic preconditions/postconditions.

**Before**:
```markdown
## 4. 前提条件（Preconditions）

- 入力パラメータが適切に型チェックされていること
```

**After**:
```markdown
## 4. 前提条件（Preconditions）

- `value`が数値型であること
- `min`が数値型であること
- `max`が数値型であること
- `min <= max`であること
```

#### Step 2: Perfect S-007 Regression Design (+1 point)
**Time**: 1-2 hours

Ensure all SPECs follow semantic versioning.

```markdown
**Version**: 1.2.0
**Last Updated**: 2026-03-30
**Changes**:
- 1.2.0: Added error scenario for invalid input type
- 1.1.0: Added boundary case for negative values
- 1.0.0: Initial version
```

#### Step 3: Complete S-006 Constitution (+1 point)
**Time**: 2-3 hours

Add explicit validation documentation to all SPECs.

```markdown
## 9. バリデーション（Validation）

### 入力検証
- `value`の型検証: TypeScriptの型チェックに加え、実行時チェックも実施
- `min <= max`の制約チェック: バリデーションエラーを投げる

### 使用するZodスキーマ
```typescript
const ClampInputSchema = z.object({
  value: z.number(),
  min: z.number(),
  max: z.number()
}).refine(data => data.min <= data.max, {
  message: "min must be <= max"
});
```
```

#### Step 4: Complete S-008 Freshness (+3 points)
**Time**: 4-6 hours

Update all stale SPECs and implement freshness monitoring.

---

## Improvement Cycle Execution Checklist

### Pre-Cycle Preparation
- [ ] Review revision_proposals.json
- [ ] Identify priority targets for current cycle
- [ ] Estimate time commitment
- [ ] Prepare SPEC templates

### During Cycle
- [ ] Create SPECs according to templates
- [ ] Generate boundary_values.yml
- [ ] Generate error_scenarios.yml
- [ ] Create test_matrix.yml
- [ ] Update SPEC timestamps

### Post-Cycle Validation
- [ ] Re-run SPEC integrity audit
- [ ] Verify score improvement
- [ ] Review remaining gaps
- [ ] Plan next cycle

---

## Automated Tools

### Tool 1: SPEC Generator
```bash
# Generate SPEC from source file
node scripts/generate_spec.js --symbol createAuditLogForCreate --source src/domain/entities/AuditLog.ts
```

### Tool 2: Boundary Analyzer
```bash
# Analyze boundaries from TypeScript types
node scripts/analyze_boundaries.js --symbol clamp --source src/utils/math.ts
```

### Tool 3: Test Matrix Generator
```bash
# Generate test matrix from existing tests
node scripts/generate_test_matrix.js --symbol useStats
```

### Tool 4: Freshness Checker
```bash
# Check SPEC freshness
node scripts/check_freshness.js --threshold 30
```

---

## Success Metrics

### Cycle 1 Success Criteria
- [ ] S-005 score ≥ 10 (test matrices created)
- [ ] S-001 score ≥ 10 (domain SPECs created)
- [ ] Total score ≥ 70

### Cycle 2 Success Criteria
- [ ] S-003 score ≥ 12 (boundaries complete)
- [ ] S-004 score ≥ 12 (errors complete)
- [ ] Total score ≥ 80 (PASS ✓)

### Cycle 3 Success Criteria
- [ ] S-002 score = 15 (perfect I/O)
- [ ] S-006 score ≥ 8 (constitution compliant)
- [ ] S-007 score = 5 (perfect regression)
- [ ] S-008 score ≥ 8 (fresh SPECs)
- [ ] Total score ≥ 90

---

## Continuous Improvement

### Weekly Audit Schedule
- **Monday**: Run audit, review results
- **Tuesday-Wednesday**: Execute improvement cycle
- **Thursday**: Re-run audit, measure progress
- **Friday**: Plan next week's targets

### Integration with Development Workflow
1. **Pre-commit**: Verify SPEC exists for new code
2. **Pre-PR**: Check test_matrix.yml exists
3. **Post-merge**: Update SPEC freshness
4. **Weekly**: Automated audit and freshness check

### Monitoring
- Track score progression over time
- Monitor SPEC coverage growth
- Measure test-SPEC mapping improvement
- Alert on stale SPECs

---

## Conclusion

Following this improvement cycle guide will systematically bring the SPEC integrity audit from FAIL (54 points) to PASS (80+ points) over 3 iterations. The key is consistent, focused effort on the highest-impact items first.

**Estimated Time to PASS**: 34-46 hours across 3 cycles
**Recommended Pace**: 1 cycle per week (3 weeks total)

---

**Last Updated**: 2026-03-30
**Next Review**: After Cycle 1 completion
