# SPEC Revision Recommendations
**Generated**: 2026-03-30T10:30:00Z
**Audit Score**: 35/100 (FAIL)
**Audit ID**: 19_spec_integrity_auditor

---

## Executive Summary

The SPEC integrity audit revealed significant gaps in the current SPEC documentation quality. While SPEC files exist for most components (180+ SPEC directories), the quality and completeness vary significantly.

### Overall Issues by Priority

| Priority | Axis | Current | Required | Gap | Impact |
|----------|------|---------|----------|-----|--------|
| P0 | S-001 SPEC Existence | 6/15 | 12 | -6 | Cannot validate coverage |
| P0 | S-003 Boundary Analysis | 5/15 | 12 | -7 | Missing edge case testing |
| P0 | S-004 Error Coverage | 5/15 | 12 | -7 | Incomplete error handling |
| P1 | S-002 I/O Strictness | 2/15 | 12 | -10 | Ambiguous contracts |
| P1 | S-005 Test-SPEC Mapping | 1/15 | 12 | -11 | No traceability |
| P1 | S-007 Regression Testing | 3/5 | 4 | -1 | Missing impact analysis |
| P1 | S-008 SPEC Freshness | 4/10 | 8 | -4 | Stale documentation |

---

## REV-S-001: SPEC Existence & Coverage

**Status**: ❌ FAIL (6/15)
**Gap**: -6 points
**Priority**: P0

### Issues Identified

1. **S-001-3 Public Symbol Coverage: 0/9**
   - Root cause: Audit script written for Python, not TypeScript
   - Cannot verify if all exported TypeScript symbols have SPECs
   - Coverage map exists but not validated against actual exports

### Required Actions

1. **Create TypeScript AST Scanner**
   - Parse `.ts` and `.tsx` files for exported symbols:
     - `export class`, `export function`, `export interface`
     - `export type`, `export enum`
   - Generate qualified names (e.g., `src.domain.entities.Record`)

2. **Validate Coverage Map**
   - Cross-reference coverage_map.yml with actual exports
   - Identify missing SPECs for newly added symbols
   - Flag orphaned SPECs (SPEC exists but code removed)

3. **Generate Missing SPECs**
   - For any uncovered public symbols, bootstrap SPEC templates
   - Use existing SPEC format (Japanese, with sections)

### Estimated Effort
- TypeScript AST scanner: 4 hours
- Validation script: 2 hours
- Missing SPEC generation: Variable (depends on gap)

---

## REV-S-002: Input/Output Definition Strictness

**Status**: ❌ FAIL (2/15)
**Gap**: -10 points
**Priority**: P1

### Issues Identified

1. **S-002-1 Input Type Definitions: 0/4**
   - Many SPECs have incomplete type information
   - Missing generic parameters (e.g., `T`, `K`)

2. **S-002-2 Input Constraints: 0/4**
   - Constraints not consistently documented
   - Missing validation rules (e.g., "must be positive integer")

3. **S-002-3 Output Type/Constraints: 0/4**
   - Return types often omitted or vague
   - No constraints on return values

4. **S-002-4 Pre/Post Conditions: 2/3**
   - Only 67% of SPECs have pre/post conditions
   - When present, often incomplete

### Required Actions

1. **Standardize Input Specification Format**
   ```markdown
   ### methodName(paramName: Type): ReturnType
   
   | パラメータ | 型 | 制約 | デフォルト | 説明 |
   |-----------|-----|------|-----------|------|
   | paramName | Type | constraint(s) | value | description |
   ```
   
   Required constraint types:
   - Range: `min ≤ x ≤ max` or `x ∈ {v1, v2, ...}`
   - Format: `matches regex pattern`
   - Reference: `must satisfy predicate()`
   - Nullability: `非null` or `nullable`

2. **Add Output Specifications**
   ```markdown
   ### 戻り値
   | 型 | 制約 | 説明 |
   |-----|------|------|
   | Type | constraint(s) | description |
   
   **事後条件**:
   - 返り値の条件1
   - 返り値の条件2
   ```

3. **Mandate Preconditions Section**
   ```markdown
   ### 前提条件
   - 事前条件1
   - 事前条件2
   ```

### Affected SPECs (Sample - Full List in Appendix)
- All 180+ SPECs need review
- Priority: Application services, domain entities

---

## REV-S-003: Boundary Value Analysis

**Status**: ❌ FAIL (5/15)
**Gap**: -7 points
**Priority**: P0

### Issues Identified

1. **S-003-2 Boundary Coverage: 0/5**
   - SPECs missing systematic boundary cases
   - No rationale for chosen boundary values

2. **S-003-4 Boundary Rationale: 0/3**
   - When boundaries exist, no justification provided

### Required Actions

1. **Add Boundary Value Tables for All Numeric Parameters**
   ```markdown
   ## 境界値テストケース
   
   | ID | パラメータ | 入力値 | 期待出力 | カテゴリ | 根拠 |
   |----|-----------|--------|----------|---------|------|
   | BV-001 | limit | 1 | 最小取得 | 最小境界 | `limit >= 1` の制約 |
   | BV-002 | limit | 0 | ValidationError | 下限超過 | `limit < 1` は無効 |
   | BV-003 | limit | 100 | 最大取得 | 最大境界 | `limit <= 100` の制約 |
   | BV-004 | limit | 101 | ValidationError | 上限超過 | `limit > 100` は無効 |
   ```

2. **Mandatory Categories**
   - 最小境界 - Valid minimum
   - 下限超過 - Below minimum
   - 最大境界 - Valid maximum
   - 上限超過 - Above maximum
   - ゼロ値 - Zero (if applicable)
   - 空入力 - Empty/null (if applicable)

3. **Create `boundary_values.yml` for Each SPEC**
   ```yaml
   - id: BV-001
     parameter: limit
     category: minimum_boundary
     value: 1
     expected: success
     rationale: "limit >= 1 per constraint"
   ```

### Priority Components
- All repository methods with `limit`, `offset` parameters
- All validation schemas (Zod)
- Configuration objects with numeric bounds

---

## REV-S-004: Error Scenario Coverage

**Status**: ❌ FAIL (5/15)
**Gap**: -7 points
**Priority**: P0

### Issues Identified

1. **S-004-2 Exception Types: 0/4**
   - Error scenarios don't specify exception types
   - Missing TypeScript error types

2. **S-004-4 Edge Case Quality: 0/4**
   - No advanced edge cases documented
   - Missing: None handling, concurrent access, resource exhaustion

### Required Actions

1. **Standardize Error Scenario Tables**
   ```markdown
   ## エラーシナリオ
   
   | ID | シナリオ | 入力例 | 期待動作 | 例外型 |
   |----|----------|--------|----------|--------|
   | ERR-001 | null入力 | param: null | throw ValidationError | ValidationError |
   | ERR-002 | 空配列 | items: [] | return [] (or throw) | (None) |
   | ERR-003 | タイムアウト | slow operation | retry 3x then throw | TimeoutError |
   | ERR-004 | 権限なし | user: guest | throw AuthError | AuthError |
   ```

2. **Mandatory Error Categories**
   - **Null/Undefined**: `null`, `undefined` passed
   - **Type Mismatch**: Wrong type (e.g., string for number)
   - **Empty Collections**: `[]`, `""`, `{}`, `new Map()`
   - **Out of Range**: Negative, > max
   - **Invalid Format**: Malformed strings, invalid regex
   - **Resource Issues**: Network timeout, disk full, memory
   - **Permission**: Unauthorized access
   - **Concurrency**: Race conditions, deadlocks
   - **Integration**: External service failures

3. **Create `error_scenarios.yml`**
   ```yaml
   - id: ERR-001
     scenario: "null parameter"
     input: { param: null }
     expected: "throws ValidationError"
     exception_type: "ValidationError"
     error_code: "ERR_NULL_PARAM"
   ```

### Priority Components
- All application services (business logic errors)
- All repository implementations (persistence errors)
- All API endpoints (request validation)

---

## REV-S-005: Test-SPEC Mapping

**Status**: ❌ FAIL (1/15)
**Gap**: -11 points
**Priority**: P1

### Issues Identified

1. **S-005-1 Test-SPEC Correspondence: 0/5**
   - Test functions don't reference SPEC case IDs
   - No traceability from SPEC to tests

2. **S-005-2 Normal Test Coverage: 0/4**
   - Can't verify if TC-xxx cases have tests

3. **S-005-3 Error Test Coverage: 0/4**
   - Can't verify if ERR-xxx cases have tests

4. **S-005-4 test_matrix.yml: 0/2**
   - No test matrix files exist

### Required Actions

1. **Rename Test Functions to Reference SPEC IDs**
   ```typescript
   // Before
   test("sends notification successfully", () => { ... })
   test("throws on null recipient", () => { ... })
   
   // After
   test("TC-001 sends notification with valid params", () => { ... })
   test("ERR-001 throws ValidationError on null recipient", () => { ... })
   ```

2. **Create `test_matrix.yml` for Each SPEC**
   ```yaml
   normal_cases:
     - id: TC-001
       description: "valid notification send"
       test_function: "NotificationService.test_TC-001_sends_notification_with_valid_params"
       spec_file: "NotificationService_spec.md"
       implemented: true
   
   error_cases:
     - id: ERR-001
       description: "null recipient"
       test_function: "NotificationService.test_ERR-001_throws_ValidationError_on_null_recipient"
       spec_file: "NotificationService_spec.md"
       implemented: true
   ```

3. **Add "既存テスト対応" Section to SPECs**
   ```markdown
   ## 既存テスト対応
   
   | テストファイル | テスト関数 | 対応ケース |
   |--------------|-----------|-----------|
   | NotificationService.test.ts | test_TC-001_sends_notification_with_valid_params | TC-001 |
   | NotificationService.test.ts | test_ERR-001_throws_ValidationError_on_null_recipient | ERR-001 |
   ```

### Implementation Strategy
1. Batch rename existing tests using codemod
2. Generate test_matrix.yml from test files
3. Update SPECs with test mappings

---

## REV-S-006: Constitution Compliance

**Status**: ✅ PASS (9/10)
**Gap**: -1 point
**Priority**: P2

### Issues Identified

1. **S-006-3 Tech Stack: 1/2**
   - Constitution doesn't explicitly list allowed technologies
   - Need to document allowed dependencies

### Required Actions

1. **Update SYSTEM_CONSTITUTION.md**
   ```markdown
   ## 許可技術スタック
   
   ### ランタイム
   - **Node.js**: ^20.0.0
   - **TypeScript**: ^5.0.0
   
   ### 主要フレームワーク
   - **React**: ^18.0.0 (UI層のみ)
   - **Hono**: ^3.0.0 (APIサーバー)
   
   ### 禁止ライブラリ
   - ❌ TensorFlow, PyTorch (MLライブラリ)
   - ❌ OpenCV, detectron2 (CVライブラリ)
   ```

---

## REV-S-007: Regression Testing

**Status**: ❌ FAIL (3/5)
**Gap**: -1 point
**Priority**: P1

### Issues Identified

1. **S-007-2 Impact Scope: 1/2**
   - Only 50% of SPECs document impact scope
   - Missing dependency information

### Required Actions

1. **Add "回帰テスト要件" Section**
   ```markdown
   ## 回帰テスト要件
   
   ### 変更時の影響範囲
   - 依存元モジュール:
     - `src/app/api/notifications.ts` (APIエンドポイント)
     - `src/components/NotificationPanel.tsx` (UIコンポーネント)
   - 統合ポイント:
     - `NotificationProvider` (DIコンテナ)
     - `AnomalyDetectionService` (異常検知連携)
   
   ### 回帰テスト項目
   - [ ] 通知送信の基本フロー
   - [ ] 通知履歴の正確性
   - [ ] 異常検知連携
   - [ ] 設定変更の反映
   ```

---

## REV-S-008: SPEC Freshness

**Status**: ❌ FAIL (4/10)
**Gap**: -4 points
**Priority**: P1

### Issues Identified

1. **S-008-1 Freshness: 0/3**
   - Many SPECs not updated in 90+ days
   - Need "Last Updated" timestamps

2. **S-008-2 Signature Match: 1/4**
   - Can't verify (TypeScript scanner not implemented)
   
3. **S-008-3 Version Management: 3/3**
   - ✅ Versioning exists

### Required Actions

1. **Add Last Updated Timestamp**
   ```markdown
   # SPEC: NotificationService
   
   **Version**: 1.2.0
   **Last Updated**: 2026-03-30
   **Source**: src/application/services/NotificationService.ts:1
   **Type**: class
   ```

2. **Implement SPEC Version Bump on Code Changes**
   - When method signature changes → bump minor version
   - When new method added → bump minor version
   - When documentation improved → bump patch version

3. **Run Signature Validation**
   - Compare SPEC input/output with actual TypeScript signatures
   - Flag mismatches as "stale"

---

## Implementation Priority Roadmap

### Phase 1: Foundation (Week 1-2)
1. ✅ Create TypeScript AST scanner (REV-S-001)
2. ✅ Validate coverage map
3. ✅ Add "Last Updated" to all SPECs (REV-S-008)

### Phase 2: Content Quality (Week 3-6)
4. ✅ Standardize input/output format (REV-S-002)
5. ✅ Add boundary value tables (REV-S-003)
6. ✅ Add error scenario tables (REV-S-004)

### Phase 3: Traceability (Week 7-8)
7. ✅ Rename tests to reference SPEC IDs (REV-S-005)
8. ✅ Create test_matrix.yml files
9. ✅ Add test mapping sections to SPECs

### Phase 4: Regression & Freshness (Week 9)
10. ✅ Add regression requirements (REV-S-007)
11. ✅ Implement automated freshness checks

---

## Success Criteria

Audit will PASS when:
- ✅ S-001 ≥ 12: All public TypeScript symbols have SPECs
- ✅ S-002 ≥ 12: All SPECs have complete I/O definitions
- ✅ S-003 ≥ 12: All SPECs have boundary analysis
- ✅ S-004 ≥ 12: All SPECs have error scenarios
- ✅ S-005 ≥ 12: Tests reference SPEC case IDs
- ✅ S-006 ≥ 8: Constitution compliance maintained
- ✅ S-007 ≥ 4: Regression requirements documented
- ✅ S-008 ≥ 8: All SPECs updated within 90 days

**Target Score**: 85+/100 (85%+)

---

## Appendix: Affected SPECs Count

| Category | Count | Priority |
|----------|-------|----------|
| Application Services | 8 | P0 |
| Domain Entities | 15 | P0 |
| Domain Services | 12 | P0 |
| Infrastructure/Repositories | 10 | P1 |
| API Routes | 25 | P1 |
| React Components | 80 | P2 |
| Utility Functions | 30 | P2 |
| **Total** | **180** | - |

---

**Next Steps**:
1. Review and prioritize recommendations
2. Assign implementation tasks
3. Set up weekly re-audit schedule
4. Track progress in streak counter
