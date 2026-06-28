# ROADMAP: Notion DB 기반 개인 포트폴리오 웹 애플리케이션

**작성일**: 2026-06-28  
**기반 문서**: [PRD.md](./PRD.md)  
**전체 예상 기간**: 7~11일 (Phase별 누적)

> 이 문서는 PRD.md의 구현 계획을 **일정 기반 4단계**로 재구성한 실행 로드맵입니다.
> 각 Phase마다 예상 소요 시간과 완료 기준(Definition of Done)을 포함합니다.

---

## 📊 현재 진행 상태

| 항목 | 상태 | 비고 |
|------|------|------|
| `@notionhq/client` 설치 | ✅ 완료 | package.json에 `^5.22.0` 설치됨 |
| `lib/env.ts` 작성 | ✅ 완료 | Zod 기반 환경변수 스키마, `getEnv()` 함수 |
| `.env.local.example` | ✅ 완료 | 템플릿 파일 작성됨 |
| `components/portfolio/` 디렉토리 | ⬜ 부분 완료 | 디렉토리만 생성, 파일 없음 |
| `lib/notion.ts` | ⬜ 미작성 | Phase 2에서 작성 예정 |
| Notion DB 3개 생성 | ⬜ 미완료 | 사용자가 직접 생성 필요 (Phase 1) |
| 포트폴리오 페이지 | ⬜ 미작성 | Phase 3에서 작성 예정 |

---

## Phase 1: 프로젝트 초기 설정 (1-2일)

### 목표
견고한 개발 기반을 확보하고, Notion API 연동 환경을 완성합니다.

### 작업 항목

#### 1.1 Notion 환경 구축
- ✅ Next.js 프로젝트 구조: 기존 스타터킷 활용
- ✅ `@notionhq/client` 설치: 완료
- ✅ `lib/env.ts` 환경변수 스키마: 완료
- ⬜ Notion DB 3개 생성 (Portfolio Projects, Portfolio Career, Portfolio Skills)
  - 각 DB별 프로퍼티 설정 — [PRD "Notion Database 스키마" 섹션](./PRD.md#notion-database-스키마) 참고
  - Projects DB: Name, Description, Slug, TechStack, Thumbnail, GithubUrl, DemoUrl, Featured, Status, Order, CreatedAt
  - Career DB: Company, Role, StartDate, EndDate, Description, Order, CreatedAt
  - Skills DB: Name, Category, Proficiency, Order, CreatedAt
- ⬜ Notion Integration 생성 및 API 키 획득 — [PRD "환경변수 및 설정" 섹션](./PRD.md#환경변수-및-설정) 절차 인용
- ⬜ `.env.local` 파일 작성: API Key와 3개 DB ID 입력
- ⬜ Integration에 3개 DB 공유 권한 설정

#### 1.2 기본 레이아웃 점검
- 기존 `app/layout.tsx`, `components/layout/header.tsx` 점검
- 필요시 Notion 데이터 페칭 후 헤더 렌더링 테스트

### 예상 소요 시간
**1-2일** (대부분 외부 설정: Notion DB 생성, Integration 연동)

### 완료 기준 (DoD)
- [ ] `.env.local`에 `NOTION_API_KEY`, `NOTION_PROJECTS_DB_ID`, `NOTION_CAREER_DB_ID`, `NOTION_SKILLS_DB_ID` 4개 값 모두 입력됨
- [ ] `npm run dev` 정상 구동, 콘솔에 환경변수 에러 없음
- [ ] Notion Integration이 3개 DB에 "공유됨" 상태 확인
- [ ] 레이아웃 및 헤더 페이지 정상 렌더링 확인

---

## Phase 2: 공통 모듈 개발 (2-3일)

### 목표
모든 기능에서 재사용할 Notion 데이터 레이어와 포트폴리오 컴포넌트를 완성합니다.

### 작업 항목

#### 2.1 Notion 데이터 레이어 구현 (`lib/notion.ts`)

**핵심 함수들** — [PRD "Notion 데이터 페칭 레이어" 섹션](./PRD.md#f006-notion-데이터-페칭-레이어) 참고:

- `getProjects(options?)`: 필터/정렬 옵션으로 Project 배열 반환
  - 옵션: `status`, `featured`, `limit`, `orderBy`, `ascending`
- `getProjectBySlug(slug)`: Slug로 개별 프로젝트 조회
- `getCareers(options?)`: Career 배열 반환 (시간 역순 권장)
- `getSkills(options?)`: Skill 배열 반환 (카테고리/숙련도 정렬)

**구현 세부사항**:
- Notion Client 초기화 (환경변수 검증은 `lib/env.ts` 활용)
- Zod 검증 스키마: `ProjectSchema`, `CareerSchema`, `SkillSchema` — [PRD "데이터 플로우 및 타입 정의" 섹션](./PRD.md#데이터-플로우-및-타입-정의) 스키마 코드 인용
- Notion API 응답 파싱: `parseProjectPage()`, `parseCareerPage()`, `parseSkillPage()` 헬퍼 함수
- 에러 처리: `lib/logger.ts` 연동, 실패 시 빈 배열(`[]`) 또는 `null` 반환
- 로깅 예시 — [PRD F006 "로깅 예시" 코드블록](./PRD.md#f006-notion-데이터-페칭-레이어) 인용

#### 2.2 포트폴리오 컴포넌트 작성 (`components/portfolio/`)

**컴포넌트 목록** — [PRD Phase 3 "컴포넌트 디렉토리" 테이블](./PRD.md#32-기본-컴포넌트들-구현) 참고:

| 파일명 | 용도 | 의존성 |
|--------|------|--------|
| `ProjectCard.tsx` | 프로젝트 카드 (목록용) | `Card`, `Badge`, `cn()` |
| `ProjectDetail.tsx` | 프로젝트 상세 정보 표시 | `Card`, 기본 HTML |
| `TechStackBadges.tsx` | 기술 스택 뱃지 나열 | `Badge` |
| `CareerTimeline.tsx` | 경력 타임라인 래퍼 | `CareerItem` |
| `CareerItem.tsx` | 경력 단일 항목 | `Card` |
| `SkillsGrid.tsx` | 스킬 그리드 (카테고리별) | `SkillCategory`, `SkillBadge` |
| `SkillCategory.tsx` | 스킬 카테고리 섹션 | `SkillBadge` |
| `SkillBadge.tsx` | 스킬 단일 뱃지 (진행도 표시) | `Badge` |
| `ProjectNavigation.tsx` | 프로젝트 이전/다음 링크 | — |

**스타일링 가이드**:
- 기존 `components/ui/card.tsx`, `components/ui/badge.tsx` 재사용 — [PRD "기존 코드 재사용 방안" 섹션](./PRD.md#기존-코드-재사용-방안) 인용
- `lib/utils.ts`의 `cn()` 함수 활용 (Tailwind CSS 클래스 병합)
- Tailwind CSS v4 클래스명 사용 (예: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)

#### 2.3 타입 정의 정리

**TypeScript 인터페이스** — [PRD "데이터 플로우 및 타입 정의" 섹션](./PRD.md#데이터-플로우-및-타입-정의) 인용:

```typescript
export interface Project { /* ... */ }
export interface Career { /* ... */ }
export interface Skill { /* ... */ }
export interface GetProjectsOptions { /* ... */ }
export interface GetCareersOptions { /* ... */ }
export interface GetSkillsOptions { /* ... */ }
```

### 예상 소요 시간
**2-3일** (`lib/notion.ts` 구현 및 테스트: ~1.5일, 컴포넌트 작성: ~1.5일)

### 완료 기준 (DoD)
- [ ] `lib/notion.ts`의 4개 함수(`getProjects`, `getProjectBySlug`, `getCareers`, `getSkills`)가 실제 Notion DB에 대해 정상 동작
  - Node.js REPL 또는 간단한 테스트 스크립트로 검증
  - 필터/정렬 옵션이 의도대로 작동
  - Notion 데이터 부재 시 빈 배열 또는 `null` 반환 확인
- [ ] 모든 포트폴리오 컴포넌트(`ProjectCard`, `CareerTimeline` 등)가 TypeScript 컴파일 에러 없음
- [ ] Zod 검증 실패 시 에러 로깅 + fallback 값 반환 확인
- [ ] 컴포넌트 렌더링 테스트 (Storybook 또는 간단한 페이지에서 각 컴포넌트 시각적 확인)

---

## Phase 3: 핵심 기능 개발 (3-4일)

### 목표
포트폴리오 사이트의 주요 페이지를 Notion 데이터와 함께 완성합니다.

### 작업 항목

#### 3.1 포트폴리오 메인 페이지 (`app/page.tsx`)

**기능** — [PRD F001 "홈페이지 / 소개 섹션"](./PRD.md#f001-홈페이지--소개-섹션) 참고:

- 자기소개 텍스트 + 프로필 이미지 (고정)
- Featured 프로젝트 섹션: `featured = true`인 프로젝트 3~5개 카드로 표시
- 핵심 기술 섹션: `proficiency >= 8`인 스킬을 카테고리별로 뱃지로 표시
- CTA 버튼: "모든 프로젝트 보기" → `/projects`

**구현 코드** — [PRD Phase 5.1 "홈페이지 (Featured + Skills)" 코드블록](./PRD.md#51-홈페이지-featured--skills) 인용

**ISR 설정**:
```typescript
export const revalidate = 3600  // 1시간 주기 재검증
```

#### 3.2 프로젝트 목록 페이지 (`app/projects/page.tsx`)

**기능** — [PRD F002 "프로젝트 목록 페이지"](./PRD.md#f002-프로젝트-목록-페이지) 참고:

- 모든 활성 프로젝트 표시 (`status = "Active"`)
- 그리드 레이아웃 (3열, 반응형): `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- 각 카드에 썸네일, 프로젝트명, 설명(150자 이내), 기술 스택 뱃지 포함
- "상세보기" 링크 → `/projects/[slug]`

**구현 코드** — [PRD Phase 4.1 "프로젝트 목록 페이지" 코드블록](./PRD.md#41-프로젝트-목록-페이지) 인용

#### 3.3 프로젝트 상세 페이지 (`app/projects/[slug]/page.tsx`)

**기능** — [PRD F003 "프로젝트 상세 페이지"](./PRD.md#f003-프로젝트-상세-페이지) 참고:

- URL 파라미터 `slug`로 프로젝트 조회
- 큰 썸네일, 프로젝트명, 완전한 설명, 기술 스택, 생성 날짜 표시
- GitHub/Demo URL 링크 (있을 경우만)
- 네비게이션: "← 모든 프로젝트로", Previous/Next 프로젝트 링크

**구현 세부사항**:
- `generateStaticParams()`: 빌드 시 모든 프로젝트 slug에 대해 페이지 pre-render
- `notFound()`: 존재하지 않는 slug → 404 페이지
- `generateMetadata()`: 동적 메타데이터 (페이지별 title, description)

**구현 코드** — [PRD Phase 4.2 "프로젝트 상세 페이지" 코드블록](./PRD.md#42-프로젝트-상세-페이지) 인용

#### 3.4 경력 타임라인 (선택사항: `app/career/page.tsx`)

**기능** — [PRD F004 "경력 타임라인"](./PRD.md#f004-경력-타임라인) 참고:

- `Career DB` 데이터를 시간 역순(최신 → 과거)으로 표시
- 회사명, 직급, 기간 ("YYYY.MM ~ YYYY.MM"), 직무 설명
- 현직 표시: `endDate = null` 일 때 "현재 근무 중"

**구현 코드** — [PRD Phase 6.1 "경력 페이지 또는 홈 섹션" 코드블록](./PRD.md#61-경력-페이지-또는-홈-섹션) 인용

#### 3.5 ISR 설정

모든 페이지의 상단에 ISR 주기 설정:
```typescript
export const revalidate = 3600  // 1시간
```

**ISR 동작 설명** — [PRD "ISR(Incremental Static Regeneration) 전략" 섹션](./PRD.md#isrincremental-static-regeneration-전략) 참고

### 예상 소요 시간
**3-4일** (페이지 3~4개 × ~1일/페이지)

### 완료 기준 (DoD)
- [ ] `/` (홈) 페이지 접속 → Featured 프로젝트 + 기술 스택 정상 렌더링
- [ ] `/projects` (목록) 페이지 접속 → 활성 프로젝트 그리드 표시
- [ ] `/projects/[slug]` (상세) 페이지 접속 → 개별 프로젝트 정보 + GitHub/Demo 링크 표시
- [ ] 존재하지 않는 slug (예: `/projects/nonexistent`) 접속 → 404 페이지 표시
- [ ] 프로젝트 카드 클릭 → 상세 페이지로 이동 (라우팅 동작 확인)
- [ ] `/career` (경력, 선택사항) 접속 → 타임라인 정상 렌더링
- [ ] 모든 페이지의 메타데이터(title, description) 정상 설정 확인

---

## Phase 4: 최적화 및 배포 (1-2일)

### 목표
프로덕션 환경에서 안정적으로 동작하는 포트폴리오 사이트를 배포합니다.

### 작업 항목

#### 4.1 성능 최적화

**이미지 최적화**:
- `next/image` 컴포넌트 활용 (자동 최적화)
- Notion 파일 CDN URL 캐싱 전략 검토 (필요시 ISR 갱신 주기 조정)

**데이터 레이어 최적화**:
- `lib/notion.ts`의 필터/정렬 로직 최적화
- 불필요한 API 호출 제거 (병렬 요청 활용: `Promise.all()`)

#### 4.2 반응형 디자인 개선

**레이아웃 점검**:
- 그리드 레이아웃 (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)
- 모바일 뷰 (≤640px): 1열, 태블릿 뷰 (641~1024px): 2열, 데스크탑 뷰 (>1024px): 3열
- 폰트 크기, 패딩/마진 모바일 최적화 (Tailwind `sm:`, `md:`, `lg:` 클래스)

**브라우저 호환성**:
- Chrome, Safari, Firefox, Edge 최신 버전에서 렌더링 확인

#### 4.3 프로덕션 빌드 및 로컬 테스트

```bash
# 1. 프로덕션 빌드
npm run build

# 2. 프로덕션 서버 시뮬레이션
npm start

# 3. 로컬 테스트 (http://localhost:3000)
# - 모든 페이지 접속 확인
# - ISR 동작 확인 (1시간 대기 또는 재배포)
```

#### 4.4 Vercel 배포

**배포 절차** — [PRD Phase 7.3 "배포" 섹션](./PRD.md#73-배포) 인용:

1. GitHub에 main 브랜치 push
   ```bash
   git add .
   git commit -m "feat: Notion DB 기반 포트폴리오 사이트 완성"
   git push origin main
   ```

2. Vercel 대시보드에서 프로젝트 연동 (또는 Vercel CLI 사용)
   ```bash
   npm install -g vercel
   vercel
   ```

3. Vercel 대시보드 → Settings → Environment Variables
   - `NOTION_API_KEY` 추가
   - `NOTION_PROJECTS_DB_ID` 추가
   - `NOTION_CAREER_DB_ID` 추가
   - `NOTION_SKILLS_DB_ID` 추가

4. 배포 완료 후 도메인 접속 확인

#### 4.5 ISR 갱신 검증

**배포 후 테스트**:
1. Vercel 배포된 사이트 접속
2. Notion에서 프로젝트 데이터 수정 (예: 프로젝트명 변경)
3. 즉시 사이트 새로고침 → 변경사항 반영 안 됨 (캐시된 HTML 제공)
4. 1시간 대기 후 재접속 → 변경사항 반영 확인
   - 또는 Vercel 대시보드에서 "Manual Redeploy" 클릭으로 즉시 확인

### 예상 소요 시간
**1-2일** (로컬 테스트 1일, Vercel 배포 + 확인 1일)

### 완료 기준 (DoD)
- [ ] `npm run build` 성공 (빌드 에러 없음, 빌드 시간 < 2분)
- [ ] `npm start`로 프로덕션 모드 실행 → 모든 페이지 정상 동작
- [ ] 모바일/태블릿/데스크탑 뷰에서 레이아웃 정상 렌더링
  - 그리드 레이아웃 정렬 확인
  - 폰트/이미지 크기 적절
  - 클릭/탭 가능한 요소들이 명확
- [ ] Vercel 배포 완료
- [ ] 배포된 사이트 모든 페이지 접속 확인
- [ ] 이미지 로드 확인 (Notion 파일 CDN URL이 정상 작동)
- [ ] 링크 동작 확인 (GitHub, Demo URL 클릭)
- [ ] ISR 갱신 확인 (Notion 데이터 변경 → 1시간 후 또는 수동 재배포로 반영)

---

## 📅 일정 요약

| Phase | 작업 내용 | 예상 소요 시간 | 누적 시간 |
|-------|---------|:--------:|:--------:|
| Phase 1 | 프로젝트 초기 설정 | 1-2일 | 1-2일 |
| Phase 2 | 공통 모듈 개발 | 2-3일 | 3-5일 |
| Phase 3 | 핵심 기능 개발 | 3-4일 | 6-9일 |
| Phase 4 | 최적화 및 배포 | 1-2일 | 7-11일 |
| **전체** | | | **7-11일** |

---

## 🔗 PRD와의 매핑

이 ROADMAP.md는 PRD.md의 Phase 1~7(시간 단위)을 **4단계(일 단위)**로 재구성했습니다:

| ROADMAP Phase | PRD Phase | 내용 |
|--|--|--|
| Phase 1 | PRD Phase 1 + 1.2 + 1.3 | 환경 구축 + 패키지 설치 + 환경변수 설정 |
| Phase 2 | PRD Phase 2 + 3 | 데이터 레이어 + 컴포넌트 구현 |
| Phase 3 | PRD Phase 4 + 5 + 6 | 페이지 구현 (프로젝트, 홈, 경력) |
| Phase 4 | PRD Phase 7 | 최적화 + 배포 |

---

## 📚 상세 참고

각 Phase의 **구체적인 코드 예시, Notion DB 스키마, 타입 정의, 트러블슈팅**은 다음을 참고하세요:

- **Notion Database 스키마**: [PRD "Notion Database 스키마" 섹션](./PRD.md#notion-database-스키마)
- **기술 스택 및 기존 코드 재사용**: [PRD "기술 아키텍처" & "기존 코드 재사용 방안" 섹션](./PRD.md#기존-코드-재사용-방안)
- **환경변수 설정 절차**: [PRD "환경변수 및 설정" 섹션](./PRD.md#환경변수-및-설정)
- **ISR 동작 원리**: [PRD "ISR(Incremental Static Regeneration) 전략" 섹션](./PRD.md#isrincremental-static-regeneration-전략)
- **데이터 플로우 및 Zod 검증**: [PRD "데이터 플로우 및 타입 정의" 섹션](./PRD.md#데이터-플로우-및-타입-정의)
- **FAQ & 트러블슈팅**: [PRD "FAQ & 트러블슈팅" 섹션](./PRD.md#faq--트러블슈팅)

---

## ✅ 체크리스트

각 Phase별 완료 기준을 빠르게 확인하려면 위의 **"완료 기준 (DoD)"** 섹션의 체크박스를 사용하세요.

**전체 프로젝트 완료 확인**:
- [ ] Phase 1 완료
- [ ] Phase 2 완료
- [ ] Phase 3 완료
- [ ] Phase 4 완료
- [ ] 배포된 사이트에서 ISR 갱신 동작 확인
- [ ] 프로젝트 전체 배포 완료 🎉
