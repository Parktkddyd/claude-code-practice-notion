# Claude Code 커스텀 커맨드

프로젝트의 진행 상태를 효율적으로 관리하기 위한 커스텀 커맨드들입니다.

## 📋 사용 가능한 커맨드

### 1. `/docs:update-roadmap` - ROADMAP 진행 상태 확인

**목적**: 현재 ROADMAP.md의 진행 상황을 한눈에 파악합니다.

#### 기본 사용법

```bash
# 전체 진행 상태 확인
/docs:update-roadmap

# 특정 Phase만 확인
/docs:update-roadmap 1    # Phase 1
/docs:update-roadmap 2    # Phase 2
/docs:update-roadmap 3    # Phase 3
/docs:update-roadmap 4    # Phase 4
```

#### 옵션

| 옵션 | 설명 | 예시 |
|------|------|------|
| `--summary` | 전체 진행률 요약만 표시 | `/docs:update-roadmap --summary` |
| `--list` | 모든 작업을 리스트 형식으로 표시 | `/docs:update-roadmap --list` |
| `--list` + Phase | 특정 Phase의 작업 리스트 | `/docs:update-roadmap 2 --list` |

#### 출력 예시

```
╔════════════════════════════════════════════════════╗
║    ROADMAP 진행 상태 (업데이트: 2026-06-28)        ║
╚════════════════════════════════════════════════════╝

📊 Phase 1: 프로젝트 초기 설정
✅ 개발팀 완료: 7/7
⬜ 사용자 액션 필요: 0/5
완료도: 7/12 (58%)

📌 Phase 2: 공통 모듈 개발 (Shrimp 작업)
✅ Task 2️⃣ (877e558d): lib/notion.ts 데이터 레이어 - 완료
⬜ Task 1️⃣ (722fdccd): next.config.ts 이미지 도메인 - 대기
⬜ Task 3️⃣ (885a975c): TechStackBadges, SkillBadge - 대기
...
```

## 💡 활용 팁

### 1. 매일 아침 진행 상황 확인
```bash
/docs:update-roadmap --summary
```

### 2. Phase 2 작업 진행 시
```bash
/docs:update-roadmap 2
```

### 3. 모든 펴딩 작업 리스트 보기
```bash
/docs:update-roadmap --list
```

### 4. 완료된 Task 확인
```bash
/docs:update-roadmap 2 --list
# "✅" 표시로 완료된 작업 확인
```

## 📊 현재 진행 상황 (2026-06-28)

| Phase | 완료도 | 상태 |
|-------|-------|------|
| Phase 1 (개발팀) | 7/7 ✅ | 완료 |
| Phase 1 (사용자) | 0/5 ⬜ | 대기 |
| Phase 2 | 1/6 (17%) | 진행중 |
| Phase 3 | 0/3 (0%) | 예정 |
| Phase 4 | 0/1 (0%) | 예정 |
| **전체** | **8/22 (36%)** | **🔄 진행중** |

## 🔗 관련 문서

- [ROADMAP.md](../../docs/ROADMAP.md) - 전체 개발 일정 및 세부 사항
- [PRD.md](../../docs/PRD.md) - 제품 요구사항 명세
- [CLAUDE.md](../../CLAUDE.md) - 프로젝트 개발 가이드

## 🚀 커맨드 구조

```
.claude/
├── commands/
│   ├── update-roadmap.sh          # 커맨드 구현 (Bash)
│   └── docs/
│       └── update-roadmap.md       # 커맨드 문서
└── README.md                       # 이 파일
```

## 📝 사용 예시

### 예시 1: 일일 스탠드업
```bash
$ /docs:update-roadmap --summary

📈 전체 진행 요약
Phase 1: 7/12 (58%)
Phase 2: 1/6 (17%)
Phase 3: 0/3 (0%)
Phase 4: 0/1 (0%)

전체 진행률: 8/22 (36%)
```

### 예시 2: Phase 2 작업 시작
```bash
$ /docs:update-roadmap 2

📌 Phase 2: 공통 모듈 개발 (Shrimp 작업)
✅ Task 2️⃣ (877e558d): lib/notion.ts 데이터 레이어 - 완료
⬜ Task 1️⃣ (722fdccd): next.config.ts 이미지 도메인 - 대기
⬜ Task 3️⃣ (885a975c): TechStackBadges, SkillBadge - 대기
...
```

### 예시 3: 모든 작업 체크리스트 보기
```bash
$ /docs:update-roadmap --list

📋 전체 작업 리스트

Phase 1: 프로젝트 초기 설정
✅ @notionhq/client 설치
✅ lib/env.ts 작성
✅ lib/notion.ts 완성 (6개 함수)
...
```

---

**마지막 업데이트**: 2026-06-28  
**담당**: Claude Code
