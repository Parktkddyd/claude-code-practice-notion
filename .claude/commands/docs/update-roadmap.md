# update-roadmap 커맨드

현재 ROADMAP.md의 진행 상태를 확인하고, 완료된 작업을 체크합니다.

## 사용법

```bash
/update-roadmap [phase] [--list] [--summary]
```

## 옵션

- `phase`: 특정 Phase만 보기 (예: `1`, `2`, `3`, `4` 또는 생략 시 전체)
- `--list`: 모든 작업을 리스트 형식으로 표시
- `--summary`: 진행률 요약만 표시

## 예시

```bash
# 전체 진행 상태 확인
/update-roadmap

# Phase 2만 확인
/update-roadmap 2

# 작업 리스트 확인
/update-roadmap --list

# 진행률 요약만 확인
/update-roadmap --summary

# Phase 3 리스트 형식으로 보기
/update-roadmap 3 --list
```

## 기능

✅ 각 Phase별 완료/진행 상태 표시
✅ Task별 진행률 계산
✅ 의존성 관계 확인
✅ 예상 소요 시간 표시
✅ 체크리스트 형식으로 표시

## 출력 예시

```
📊 Phase 1: 프로젝트 초기 설정
├─ 개발팀 완료: 7/7 ✅
├─ 사용자 액션: 0/5 ⬜
└─ 완료도: 7/12 (58%)

📌 Phase 2: 공통 모듈 개발
├─ Task 1️⃣: next.config.ts - ⬜ 대기
├─ Task 2️⃣: lib/notion.ts - ✅ 완료
├─ Task 3️⃣: TechStackBadges, SkillBadge - ⬜ 대기
├─ Task 4️⃣: ProjectCard, CareerItem - ⬜ 대기
├─ Task 5️⃣: SkillCategory, SkillsGrid, CareerTimeline - ⬜ 대기
└─ 완료도: 1/5 (20%)
```

---

**마지막 업데이트**: 2026-06-28
**담당**: Claude Code + 사용자
