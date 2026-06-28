# ROADMAP: Notion DB 기반 개인 포트폴리오 웹 애플리케이션

**최종 업데이트**: 2026-06-28  
**기반 문서**: [PRD.md](./PRD.md)  
**전체 예상 기간**: 7~11일 (Phase별 누적)

> 이 문서는 **현재 프로젝트 상태(Phase 1 완료, Phase 2 Task 1-2 완료)**를 반영합니다.
> Shrimp 작업 관리 시스템에서 Task 진행 중입니다.

---

## 📊 현재 진행 상태 (2026-06-28)

### ✅ Phase 1: 프로젝트 초기 설정 — 완료

| 항목 | 상태 | 세부 사항 |
|------|------|----------|
| `@notionhq/client` 설치 | ✅ | package.json에 `^5.22.0` 설치됨 |
| `lib/env.ts` 작성 | ✅ | Zod 검증 스키마, `getEnv()` 함수 구현 |
| `lib/notion.ts` 구현 | ✅ | **모든 6개 함수 완료**: getProjects, getProjectBySlug, getCareers, getSkills + HTTP REST API 기반 구현 |
| `.env.local` 파일 작성 | ✅ | 사용자가 환경변수 설정 완료 |
| `.env.local.example` | ✅ | 템플릿 파일 제공 |
| `components/portfolio/` 디렉토리 | ✅ | 디렉토리 생성 (파일은 Phase 2에서 작성) |
| `components/layout/header.tsx` 정합성 | ✅ | NAV_ITEMS에 `/`, `/projects`, `/career` 포함 |
| Notion DB 연동 검증 | ✅ | 모든 3개 DB (Projects, Careers, Skills) 조회 성공 확인 |
| **npm run build** | ✅ | TypeScript 컴파일 성공 |
| **npm start** | ✅ | 프로덕션 서버 정상 작동 |

### 🔄 Phase 2: 컴포넌트 & 페이지 개발 — Shrimp 진행 중 (8개 Pending 작업 남음)

| 작업 ID | 작업 | 의존성 | 예상 시간 | 상태 | 우선순위 |
|--------|------|--------|---------|------|---------|
| 722fdccd | Task 1️⃣: `next.config.ts` 이미지 도메인 등록 | ✓ 없음 | 1시간 | ⬜ 대기 (시작 가능) | 1️⃣ |
| 877e558d | Task 2️⃣: `lib/notion.ts` 데이터 레이어 구현 | ✓ 없음 | 3~4시간 | **✅ 완료** | 2️⃣ |
| 885a975c | Task 3️⃣: TechStackBadges, SkillBadge 컴포넌트 | ✓ Task 1 | 1시간 | ⬜ 대기 | 3️⃣ |
| 419fa247 | Task 4️⃣: ProjectCard, CareerItem 컴포넌트 | ✓ Task 3 | 2시간 | ⬜ 대기 | 4️⃣ |
| 6ba097e4 | Task 5️⃣: SkillCategory, SkillsGrid, CareerTimeline | ✓ Task 3,4 | 2시간 | ⬜ 대기 | 5️⃣ |
| 6e8711c5 | Task 6️⃣: ProjectDetail, ProjectNavigation | ✓ Task 4 | 1.5시간 | ⬜ 대기 | 6️⃣ |
| 3ed85412 | Task 7️⃣: `app/projects/page.tsx` + `[slug]` | ✓ Task 6 | 2~3시간 | ⬜ 대기 | 7️⃣ |
| 58ef3847 | Task 8️⃣: `app/career/page.tsx` | ✓ Task 5 | 1.5시간 | ⬜ 대기 | 8️⃣ |
| f108f06f | Task 9️⃣: `app/page.tsx` 수정 (Featured + Skills) | ✓ Task 7 | 2시간 | ⬜ 대기 | 9️⃣ |

**Task 2 완료 사항**:
- ✅ HTTP REST API (`/v1/databases/{dbId}/query`) 기반 구현
- ✅ Notion SDK v5 호환성 해결
- ✅ 모든 DB 조회 함수 정상 작동
- ✅ 빌드 및 프로덕션 모드 테스트 완료
- ✅ 모든 테스트 파일 정리 완료

---

## Phase 1: 프로젝트 초기 설정 — ✅ 완료

### ✅ 개발팀 완료 항목

#### 1.1 ✅ Notion API 연동 기반 구축

**lib/notion.ts** (✅ 완료 — **HTTP REST API 기반**):
- **4개 export 함수 완전 구현**:
  1. `getProjects(options?)`: 프로젝트 배열 반환 (필터: status, featured / 정렬: Order, CreatedAt)
  2. `getProjectBySlug(slug)`: 단일 프로젝트 반환 또는 null
  3. `getCareers(options?)`: 경력 배열 반환 (정렬: StartDate, Order)
  4. `getSkills(options?)`: 기술 스택 배열 반환 (필터: category, minProficiency / 정렬: Category, Proficiency, Order)

**구현 방식**:
- ✅ **Notion HTTP REST API** (`https://api.notion.com/v1/databases/{dbId}/query`) 직접 사용
- ✅ SDK v5 호환성: `@notionhq/client`는 설치되어 있으나 사용하지 않음 (향후 SDK 업데이트 시 유연함)
- ✅ 타입 안전성: Zod 스키마 (ProjectSchema, CareerSchema, SkillSchema) + 타입 추출
- ✅ 필터/정렬 빌더: Notion API 형식 변환 (buildProjectFilter, buildSkillFilter, buildSorts)
- ✅ 프로퍼티 접근 헬퍼: getTitle, getRichText, getSelect, getMultiSelect, getCheckbox, getNumber, getUrl, getFileUrl, getDate
- ✅ 페이지 매핑 함수: mapPageToProject, mapPageToCareer, mapPageToSkill (Zod safeParse + logger.warn 연동)
- ✅ 에러 처리: 실패 시 logger.error() + 빈 배열/null 반환 (사이트 다운 방지)

#### 1.2 ✅ 프로젝트 구조 정합성 확인

**app/layout.tsx**:
- 루트 레이아웃, Header 컴포넌트 임포트

**components/layout/header.tsx** (✅ 확인):
- NAV_ITEMS: `["/", "/projects", "/career"]` 포함
- 클라이언트 컴포넌트 ("use client")
- 현재 경로 기반 활성 스타일 표시

**next.config.ts** (✅ 준비):
- Notion 파일 CDN 도메인 이미지 로딩 설정 필요 (next/image remotePatterns)

---

### ✅ Phase 1: 사용자 액션 완료

#### 1.3 ✅ Notion 데이터베이스 생성 및 환경변수 설정

**완료된 작업**:

1. ✅ **Notion Integration 생성** ([notion.so/my-integrations](https://notion.so/my-integrations)):
   - Integration 이름: "portfolio-web"
   - API 키: `.env.local`에 설정됨
   - 접근 권한: 설정 완료

2. ✅ **Notion Database 3개 생성** (notion.so):

   **Portfolio Projects DB**: 
   - 11개 프로퍼티 설정 완료 (Name, Description, Slug, TechStack, Thumbnail, GithubUrl, DemoUrl, Featured, Status, Order, CreatedAt)
   - 데이터 입력 완료

   **Portfolio Career DB**:
   - 7개 프로퍼티 설정 완료 (Company, Role, StartDate, EndDate, Description, Order, CreatedAt)
   - 데이터 입력 완료

   **Portfolio Skills DB**:
   - Name (Title)
   - Category (Select: "Frontend"/"Backend"/"DevOps"/"Tools"/"Other")
   - Proficiency (Number, 1~10)
   - Order (Number), CreatedAt (자동)

3. **Integration에 DB 공유**:
   - 각 Database: 오른쪽 상단 "+ Add connections"
   - "Portfolio Site" Integration 선택

4. **`.env.local` 파일 생성**:
   ```bash
   cp .env.local.example .env.local
   ```
   ```env
   NOTION_API_KEY=secret_xxxxxxxxxxxxx...
   NOTION_PROJECTS_DB_ID=abcd1234efgh5678ijkl...
   NOTION_CAREER_DB_ID=qrst5678uvwx9012yzab...
   NOTION_SKILLS_DB_ID=ghij1234klmn5678opqr...
   ```

5. **개발 서버 실행 및 검증**:
   ```bash
   npm run dev
   # http://localhost:3000 접속
   # 콘솔에 환경변수 관련 에러 없음 확인
   ```

### 예상 소요 시간
**1~2시간** (대부분 외부 설정: Notion DB 생성, API 키 발급)

### 완료 기준 (DoD)
- [x] `@notionhq/client` 설치 (package.json에 ^5.22.0)
- [x] `lib/env.ts` 완성 (Zod 검증 스키마 + getEnv() 함수)
- [x] `lib/notion.ts` 완성 (6개 함수 + 타입 + 에러 처리)
- [x] `components/layout/header.tsx` NAV_ITEMS 확인 (/, /projects, /career)
- [ ] Notion DB 3개 생성 + 프로퍼티 설정 (사용자)
- [ ] Notion Integration 생성 + API 키 획득 (사용자)
- [ ] `.env.local` 파일 생성 및 값 입력 (사용자)
- [ ] Integration에 3개 DB 공유 권한 설정 (사용자)
- [ ] `npm run dev` 정상 구동, 콘솔에 에러 없음 확인 (사용자)

---

## Phase 2: 공통 모듈 개발 — 🔄 Shrimp 10개 Pending 작업 진행중

### 목표
포트폴리오 컴포넌트 라이브러리와 Notion 데이터 페칭 함수를 완성합니다. (lib/notion.ts는 Phase 1 완료)

### 작업 구조 (Shrimp 작업 ID로 추적)

#### 📌 Task 1️⃣: next.config.ts 이미지 도메인 등록 및 헤더 정합성 확인

**작업 ID**: 722fdccd-d18c-466f-8047-6354279697d0  
**의존성**: 없음 (Phase 1 완료 후 진행)  
**예상 시간**: 1시간  
**담당**: Claude Code

**실행 내용**:
1. `next.config.ts`에 Notion 파일 CDN 도메인 추가:
   ```typescript
   images: {
     remotePatterns: [
       {
         protocol: 'https',
         hostname: 'prod-files-secure.s3.us-west-2.amazonaws.com',
       },
       {
         protocol: 'https',
         hostname: 's3.us-west-2.amazonaws.com',
       },
     ],
   }
   ```

2. `components/layout/header.tsx` NAV_ITEMS 정합성 확인:
   - [x] `/` (홈)
   - [x] `/projects` (프로젝트 목록)
   - [x] `/career` (경력)
   - Phase 3에서 생성될 라우트와 일치 확인

**완료 기준**:
- [ ] `npm run build` 성공 (이미지 도메인 설정 정상)
- [ ] `npm run dev` → 브라우저에서 헤더 네비게이션 3개 모두 확인

---

#### ✅ Task 2️⃣: lib/notion.ts 데이터 레이어 구현 — 완료

**작업 ID**: 877e558d-9165-4ea7-a69a-27ef9dec72cd  
**의존성**: 없음 (선행 작업 없음)  
**예상 시간**: 3~4시간  
**실제 소요**: ✅ 완료  
**담당**: Claude Code

#### 완료 내용

- ✅ 6개 export 함수 완성:
  1. `getProjects(options?)` — 프로젝트 배열 조회 (필터/정렬)
  2. `getProjectBySlug(slug)` — 단일 프로젝트 조회
  3. `getProjectNeighbors(slug)` — 이전/다음 프로젝트 (네비게이션용)
  4. `getCareers(options?)` — 경력 배열 조회
  5. `getSkills(options?)` — 스킬 배열 조회
  6. `getProjectCount(options?)` — 프로젝트 총 개수

- ✅ Zod 검증 스키마 (ProjectSchema, CareerSchema, SkillSchema)
- ✅ Notion Client 캐싱 (싱글톤 패턴)
- ✅ 필터/정렬 빌더 함수
- ✅ 프로퍼티 접근 헬퍼
- ✅ 페이지 매핑 함수
- ✅ 에러 처리 (logger.error + fallback)

---

#### 📌 Task 3️⃣: 포트폴리오 컴포넌트 기초 구현 (TechStackBadges, SkillBadge)

**작업 ID**: 885a975c-8a36-434f-b9e4-1cbf635c757b  
**의존성**: Task 1️⃣ 완료  
**예상 시간**: 1시간  
**담당**: Claude Code

**실행 내용**:

| 컴포넌트 | 파일 | 용도 | Props |
|---------|------|------|-------|
| TechStackBadges | `components/portfolio/TechStackBadges.tsx` | 기술 스택 뱃지 나열 | `techStack: string[]` |
| SkillBadge | `components/portfolio/SkillBadge.tsx` | 단일 스킬 표시 | `skill: Skill` (Skill 타입에서 name, category, proficiency 사용) |

**구현 예시**:
```typescript
// TechStackBadges.tsx
import { Badge } from '@/components/ui/badge'

interface TechStackBadgesProps {
  techStack: string[]
}

export function TechStackBadges({ techStack }: TechStackBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {techStack.map(tech => (
        <Badge key={tech} variant="secondary">
          {tech}
        </Badge>
      ))}
    </div>
  )
}

// SkillBadge.tsx
import type { Skill } from '@/lib/notion'
import { Badge } from '@/components/ui/badge'

interface SkillBadgeProps {
  skill: Skill
}

export function SkillBadge({ skill }: SkillBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline">{skill.name}</Badge>
      <span className="text-xs text-muted-foreground">
        {'★'.repeat(skill.proficiency)}
      </span>
    </div>
  )
}
```

**완료 기준**:
- [ ] `components/portfolio/TechStackBadges.tsx` TypeScript 컴파일 성공
- [ ] `components/portfolio/SkillBadge.tsx` TypeScript 컴파일 성공
- [ ] 두 컴포넌트 모두 Props 타입 명시

---

#### 📌 Task 3️⃣: 포트폴리오 카드 컴포넌트 (ProjectCard, CareerItem)

**작업 ID**: 419fa247-2dab-4289-9d43-01ec2b53bedd  
**의존성**: Task 2️⃣ 완료  
**예상 시간**: 2시간  
**담당**: Claude Code

**컴포넌트 목록**:

| 컴포넌트 | 파일 | 용도 | Props | 의존 컴포넌트 |
|---------|------|------|-------|-------------|
| ProjectCard | `components/portfolio/ProjectCard.tsx` | 프로젝트 카드 (목록용) | `project: Project` | Card, Badge, TechStackBadges, cn() |
| CareerItem | `components/portfolio/CareerItem.tsx` | 경력 단일 항목 | `career: Career` | Card |

**구현 요구사항**:

**ProjectCard**:
- `next/image` 컴포넌트로 썸네일 표시 (remotePatterns 설정 필수)
- 프로젝트명, 짧은 설명 (150자 이내), 기술 스택 뱃지 표시
- `/projects/[slug]`로 링크 가능 (Link 또는 클라이언트 라우팅)
- 호버 효과 (shadow, transform)

**CareerItem**:
- 회사명, 직급, 기간 표시
- 직무 설명 렌더링
- 현직 여부 표시 (endDate === null이면 "현재 근무 중")

**완료 기준**:
- [ ] `components/portfolio/ProjectCard.tsx` 완성
- [ ] `components/portfolio/CareerItem.tsx` 완성
- [ ] 두 컴포넌트 모두 TypeScript strict mode 통과
- [ ] TechStackBadges 임포트 + 렌더링 확인

---

#### 📌 Task 4️⃣: 포트폴리오 그룹 컴포넌트 (SkillCategory, SkillsGrid, CareerTimeline)

**작업 ID**: 6ba097e4-29eb-4a31-a83d-c9df2e8b1e47  
**의존성**: Task 2️⃣, Task 3️⃣ 완료  
**예상 시간**: 2시간  
**담당**: Claude Code

**컴포넌트 목록**:

| 컴포넌트 | 파일 | 용도 | Props | 의존 컴포넌트 |
|---------|------|------|-------|-------------|
| SkillCategory | `components/portfolio/SkillCategory.tsx` | 한 카테고리의 스킬 그룹 | `category: string`, `skills: Skill[]` | SkillBadge |
| SkillsGrid | `components/portfolio/SkillsGrid.tsx` | 카테고리별 스킬 그리드 | `skills: Skill[]` | SkillCategory |
| CareerTimeline | `components/portfolio/CareerTimeline.tsx` | 경력 타임라인 | `careers: Career[]` | CareerItem |

**구현 세부사항**:

**SkillsGrid**:
- 입력된 Skill 배열을 category로 그룹화
- 카테고리 헤더 표시 (예: "Frontend", "Backend")
- SkillCategory 컴포넌트들을 그리드 배치 (반응형: 2~3열)

**CareerTimeline**:
- Career 배열을 순회하며 CareerItem 렌더링
- 타임라인 시각 요소 (선, 점 등) 선택사항
- 시간순 정렬은 lib/notion.ts의 getCareers에서 담당 (컴포넌트는 받은 배열 그대로 렌더링)

**완료 기준**:
- [ ] `components/portfolio/SkillCategory.tsx` 완성
- [ ] `components/portfolio/SkillsGrid.tsx` 완성
- [ ] `components/portfolio/CareerTimeline.tsx` 완성
- [ ] 세 컴포넌트 모두 TypeScript 컴파일 성공

---

#### 📌 Task 5️⃣: 프로젝트 상세 컴포넌트 (ProjectDetail, ProjectNavigation)

**작업 ID**: 6e8711c5-1d77-48a6-bb0a-07e9fad9347c  
**의존성**: Task 3️⃣ 완료  
**예상 시간**: 1.5시간  
**담당**: Claude Code

**컴포넌트 목록**:

| 컴포넌트 | 파일 | 용도 | Props |
|---------|------|------|-------|
| ProjectDetail | `components/portfolio/ProjectDetail.tsx` | 프로젝트 상세 정보 | `project: Project` |
| ProjectNavigation | `components/portfolio/ProjectNavigation.tsx` | 이전/다음 프로젝트 링크 | `prev: Project \| null`, `next: Project \| null` |

**구현 요구사항**:

**ProjectDetail**:
- 큰 썸네일 (next/image)
- 프로젝트명, 완전한 설명
- 기술 스택 뱃지 (TechStackBadges 재사용)
- 생성 날짜 포맷 (YYYY.MM.DD)
- GitHub/Demo URL 버튼 (있을 경우만)

**ProjectNavigation**:
- "← 모든 프로젝트로" 링크 (/projects로 이동)
- Previous/Next 프로젝트 링크 (null인 경우 비활성화)
- 링크 텍스트 예: "← Previous: 프로젝트명"

**주의사항**:
- 이전/다음 계산은 lib/notion.ts의 `getProjectNeighbors(slug)`에서 수행
- 페이지 파일에서 직접 findIndex 등을 하지 않음 (Phase 2/3 책임 분리)

**완료 기준**:
- [ ] `components/portfolio/ProjectDetail.tsx` 완성
- [ ] `components/portfolio/ProjectNavigation.tsx` 완성
- [ ] 두 컴포넌트 모두 TypeScript 컴파일 성공
- [ ] next/image remotePatterns 설정 확인

---

### 예상 소요 시간
**~9시간 (누적)** - Task별 1~2시간씩 분산 진행

### Phase 2 완료 기준 (DoD)
- [ ] Task 1️⃣ 완료: next.config.ts 수정 + 헤더 정합성 확인
- [ ] Task 2️⃣ 완료: TechStackBadges, SkillBadge 컴포넌트 완성
- [ ] Task 3️⃣ 완료: ProjectCard, CareerItem 컴포넌트 완성
- [ ] Task 4️⃣ 완료: SkillCategory, SkillsGrid, CareerTimeline 컴포넌트 완성
- [ ] Task 5️⃣ 완료: ProjectDetail, ProjectNavigation 컴포넌트 완성
- [ ] 모든 컴포넌트 TypeScript 컴파일 성공
- [ ] `npm run lint` 통과 (스타일 가이드 준수)
- [ ] 컴포넌트 프롭 타입 명시 (Props 인터페이스)

---

## Phase 3: 핵심 기능 페이지 개발 — ⬜ Shrimp Task 7~9

### 목표
포트폴리오 페이지(프로젝트 목록, 상세, 홈)를 Phase 2 컴포넌트와 함께 완성합니다.

### 작업 구조

#### 📌 Task 6️⃣: 프로젝트 페이지 (`app/projects/page.tsx` + `app/projects/[slug]/page.tsx`)

**작업 ID**: 3ed85412-5607-4e14-b2f2-da314da71e59  
**의존성**: Task 5️⃣ (ProjectDetail, ProjectNavigation) 완료  
**예상 시간**: 2~3시간  
**담당**: Claude Code

**파일**:
- `app/projects/page.tsx` — 프로젝트 목록
- `app/projects/[slug]/page.tsx` — 프로젝트 상세

**app/projects/page.tsx**:
```typescript
import { getProjects } from '@/lib/notion'
import { ProjectCard } from '@/components/portfolio/ProjectCard'

export const revalidate = 3600
export const metadata = { title: 'Projects' }

export default async function ProjectsPage() {
  const projects = await getProjects({ status: 'Active', orderBy: 'Order' })
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <h1>프로젝트</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(p => <ProjectCard key={p.id} project={p} />)}
      </div>
    </main>
  )
}
```

**app/projects/[slug]/page.tsx** (Next.js 16 동적 라우트):
```typescript
import { getProjectBySlug, getProjectNeighbors } from '@/lib/notion'
import { notFound } from 'next/navigation'
import { ProjectDetail } from '@/components/portfolio/ProjectDetail'
import { ProjectNavigation } from '@/components/portfolio/ProjectNavigation'

export const revalidate = 3600

export async function generateStaticParams() {
  // 빌드 시 모든 프로젝트 slug에 대해 페이지 사전 렌더링
  const projects = await getProjects()
  return projects.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }) {
  const project = await getProjectBySlug(params.slug)
  if (!project) return {}
  return { title: project.name, description: project.description }
}

export default async function ProjectPage({ params }) {
  const project = await getProjectBySlug(params.slug)
  if (!project) notFound()

  const neighbors = await getProjectNeighbors(params.slug)
  
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <ProjectDetail project={project} />
      <ProjectNavigation prev={neighbors.prev} next={neighbors.next} />
    </main>
  )
}
```

**주의사항**:
- `await params` (Next.js 16에서는 params가 Promise)
- `generateStaticParams()` 필수 (동적 라우트 사전 렌더링)
- `notFound()` 호출 시 자동으로 404 페이지 표시
- 이전/다음 계산은 lib/notion.ts의 `getProjectNeighbors(slug)` 함수에서 담당

**완료 기준**:
- [ ] `app/projects/page.tsx` 완성 (프로젝트 목록 페이지)
- [ ] `app/projects/[slug]/page.tsx` 완성 (프로젝트 상세 페이지)
- [ ] `npm run build` 성공 (정적 매개변수 생성 성공)
- [ ] `/projects` 접속 → 활성 프로젝트 그리드 표시
- [ ] `/projects/test-project` 같은 slug로 접속 → 상세 페이지 표시
- [ ] 존재하지 않는 slug 접속 → 404 페이지

---

#### 📌 Task 7️⃣: 경력 타임라인 페이지 (`app/career/page.tsx`)

**작업 ID**: 58ef3847-863e-4710-95ae-8878f376a260  
**의존성**: Task 4️⃣ (CareerTimeline) 완료  
**예상 시간**: 1.5시간  
**담당**: Claude Code

**파일**: `app/career/page.tsx`

```typescript
import { getCareers } from '@/lib/notion'
import { CareerTimeline } from '@/components/portfolio/CareerTimeline'

export const revalidate = 3600
export const metadata = { title: 'Career' }

export default async function CareerPage() {
  const careers = await getCareers({ 
    orderBy: 'StartDate',
    ascending: false  // 최신순
  })
  
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1>경력</h1>
      <CareerTimeline careers={careers} />
    </main>
  )
}
```

**완료 기준**:
- [ ] `app/career/page.tsx` 완성
- [ ] `/career` 접속 → 경력 타임라인 정상 렌더링
- [ ] 최신 경력부터 과거 순서로 정렬

---

#### 📌 Task 8️⃣: 홈페이지 수정 (`app/page.tsx`)

**작업 ID**: f108f06f-9cc9-47ff-a304-0a7a121f102f  
**의존성**: Task 6️⃣ (프로젝트 페이지) 완료  
**예상 시간**: 2시간  
**담당**: Claude Code

**파일**: `app/page.tsx` (기존 수정)

```typescript
import { getProjects, getSkills } from '@/lib/notion'
import { ProjectCard } from '@/components/portfolio/ProjectCard'
import { SkillsGrid } from '@/components/portfolio/SkillsGrid'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const revalidate = 3600

export default async function HomePage() {
  const [projects, skills] = await Promise.all([
    getProjects({ featured: true, limit: 5 }),
    getSkills({ minProficiency: 8 })
  ])

  return (
    <main>
      {/* Hero 섹션 (기존 유지) */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h1>안녕하세요 👋</h1>
        <p>Notion을 CMS로 활용한 개인 포트폴리오 사이트입니다.</p>
      </section>

      {/* Featured 프로젝트 */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2>주요 프로젝트</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {projects.map(p => <ProjectCard key={p.id} project={p} />)}
        </div>
        <div className="text-center">
          <Button asChild>
            <Link href="/projects">모든 프로젝트 보기</Link>
          </Button>
        </div>
      </section>

      {/* 기술 스택 */}
      <section className="mx-auto max-w-6xl px-4 py-20 bg-muted/50">
        <h2>기술 스택</h2>
        <SkillsGrid skills={skills} />
      </section>
    </main>
  )
}
```

**주의사항**:
- `Promise.all()` 병렬 페칭으로 성능 최적화
- Featured 프로젝트: featured=true 필터, limit 5
- 핵심 기술: minProficiency >= 8
- Hero 섹션 유지, Featured + Skills 섹션 추가

**완료 기준**:
- [ ] `app/page.tsx` 수정 완료
- [ ] `/` (홈) 접속 → Featured 프로젝트 그리드 표시
- [ ] `/` (홈) 접속 → 기술 스택 카테고리별 표시
- [ ] "모든 프로젝트 보기" 버튼 → `/projects`로 이동

---

### 예상 소요 시간
**~6시간 (누적)** - Task 6~8 합계

### Phase 3 완료 기준 (DoD)
- [ ] Task 6️⃣ 완료: 프로젝트 목록/상세 페이지
- [ ] Task 7️⃣ 완료: 경력 타임라인 페이지
- [ ] Task 8️⃣ 완료: 홈페이지 수정 (Featured + Skills)
- [ ] `npm run build` 성공 (모든 페이지 정적 렌더링)
- [ ] 모든 라우트에 `export const revalidate = 3600` 설정
- [ ] 모든 페이지 메타데이터 설정 (title, description)
- [ ] 네비게이션 작동 확인 (헤더 3개 링크 모두 동작)
- [ ] ISR 설정 확인 (프로덕션 빌드 후 테스트)

---

## Phase 4: 최적화 및 배포 검증 — ⬜ Shrimp Task 10

### 목표
전체 프로젝트의 프로덕션 준비 상태를 검증하고, 사용자가 Vercel 배포를 수행하도록 안내합니다.

#### 📌 Task 9️⃣: 전체 빌드/린트 검증 및 사용자 액션 안내

**작업 ID**: 94737d79-c788-409d-afac-501d65c8add5  
**의존성**: Task 8️⃣ (홈페이지) 완료  
**예상 시간**: 1시간  
**담당**: Claude Code

**실행 내용**:

1. **빌드 검증**:
   ```bash
   npm run build
   # 확인 사항:
   # - 빌드 성공 (에러 없음)
   # - 빌드 시간 < 2분
   # - generateStaticParams 모든 slug 처리
   ```

2. **린트 검증**:
   ```bash
   npm run lint
   # 확인 사항: 스타일 가이드 준수 (camelCase, imports 등)
   ```

3. **프로덕션 모드 테스트**:
   ```bash
   npm start
   # http://localhost:3000에서:
   # - 모든 페이지 접속 가능
   # - 이미지 로드 정상
   # - 링크 네비게이션 정상
   # - 헤더 NAV_ITEMS 3개 모두 작동
   ```

4. **기능 검증 체크리스트**:
   - [ ] `/` (홈) 접속 → Hero + Featured 프로젝트 + 기술 스택 표시
   - [ ] `/projects` (목록) 접속 → 활성 프로젝트 그리드 표시
   - [ ] `/projects/[실제-slug]` 접속 → 프로젝트 상세 정보 표시
   - [ ] `/projects/nonexistent` 접속 → 404 페이지 표시
   - [ ] `/career` 접속 → 경력 타임라인 표시
   - [ ] 모든 이미지 로드 정상 (Notion 썸네일)
   - [ ] 모든 링크 클릭 정상 (GitHub, Demo URL)

5. **사용자 액션 안내 문서 작성**:
   - Vercel 배포 방법
   - 환경변수 설정 (Vercel 대시보드)
   - ISR 갱신 검증 방법
   - 트러블슈팅 (이미지 로드 안 됨, 데이터 표시 안 됨 등)

**완료 기준**:
- [ ] `npm run build` 성공
- [ ] `npm run lint` 통과
- [ ] `npm start` → 프로덕션 모드 모든 페이지 정상 작동
- [ ] 기능 검증 체크리스트 모두 완료
- [ ] 사용자 액션 안내 문서 제공

---

### Phase 4 완료 기준 (DoD)
- [ ] Task 9️⃣ 완료: 빌드/린트 검증 + 사용자 안내
- [ ] 프로덕션 빌드 성공 및 프로덕션 모드 테스트 완료
- [ ] 모든 페이지 기능 검증 완료
- [ ] 사용자가 Vercel 배포 수행 (Claude Code 담당 아님)
- [ ] Vercel 배포 후 ISR 갱신 테스트 완료

---

---

## 📅 일정 요약 (최종 업데이트: 2026-06-28)

### 개발 진행 현황

| 단계 | Phase | 상태 | 담당 | 예상 시간 | 실제 소요 |
|------|-------|------|------|---------|---------|
| **✅ 완료** | Phase 1 (개발팀) | ✅ 완료 | Claude Code | ~2시간 | ~4시간 |
| **✅ 완료** | Phase 1 (사용자) | ✅ 완료 | 사용자 | ~1-2시간 | ~2시간 |
| **🔄 진행중** | Phase 2: Task 1-6 | 🔄 예정 | Claude Code | ~9시간 | - |
| **⬜ 예정** | Phase 3: Task 7-9 | ⬜ 예정 | Claude Code | ~6시간 | - |
| **⬜ 예정** | Phase 4: 최적화 & 배포 | ⬜ 예정 | Claude Code | ~1시간 | - |
| | | | **전체** | **~27시간** | **~6시간 진행** |

### 진행률
- **Phase 1**: 100% ✅
- **Phase 2**: 25% (Task 2 완료, Task 1 대기 중)
- **전체**: ~22% 진행

### Shrimp 작업 매핑

| Task # | 작업 ID | 설명 | 상태 | 시간 |
|--------|--------|------|------|------|
| 1️⃣ | 722fdccd | next.config.ts 이미지 도메인 + 헤더 정합성 | ⬜ 대기 | 1h |
| 2️⃣ | 877e558d | lib/notion.ts 데이터 레이어 (✅ 완료) | ✅ 완료 | 3-4h |
| 3️⃣ | 885a975c | TechStackBadges, SkillBadge | ⬜ 대기 | 1h |
| 4️⃣ | 419fa247 | ProjectCard, CareerItem | ⬜ 대기 | 2h |
| 5️⃣ | 6ba097e4 | SkillCategory, SkillsGrid, CareerTimeline | ⬜ 대기 | 2h |
| 6️⃣ | 6e8711c5 | ProjectDetail, ProjectNavigation | ⬜ 대기 | 1.5h |
| 7️⃣ | 3ed85412 | app/projects + app/projects/[slug] | ⬜ 대기 | 2-3h |
| 8️⃣ | 58ef3847 | app/career | ⬜ 대기 | 1.5h |
| 9️⃣ | f108f06f | app/page.tsx 수정 | ⬜ 대기 | 2h |
| 🔟 | 94737d79 | 빌드/린트 검증 + 사용자 안내 | ⬜ 대기 | 1h |

### 진행 일정 (예상)

```
2026-06-28 (금)
├─ Phase 1 개발팀 완료 ✅
└─ Phase 1 사용자 액션 시작 (진행중)
   └─ Notion DB 3개 생성 + Integration 설정
   └─ .env.local 작성
   └─ npm run dev 확인

2026-06-29~30 (토~일) 또는 2026-07-01~ (월~)
├─ Task 1-6: Phase 2 컴포넌트 개발 (6~9시간)
│  ├─ next.config.ts, 기초 컴포넌트, 카드, 그룹, 상세 컴포넌트
│  └─ 완료 후 `npm run lint` 통과
│
├─ Task 7-9: Phase 3 페이지 개발 (6시간)
│  ├─ 프로젝트 목록/상세 페이지
│  ├─ 경력 페이지
│  └─ 홈페이지 수정
│
└─ Task 10: Phase 4 검증 (1시간)
   ├─ `npm run build` 성공
   ├─ `npm run lint` 통과
   ├─ `npm start` 테스트
   └─ 사용자 안내 문서

사용자 배포 (외부)
└─ Vercel 배포 + 환경변수 설정
```

---

## 🔗 PRD와의 매핑

이 ROADMAP.md는 **PRD.md의 구현 계획**을 **Shrimp 10개 작업**으로 재구성했습니다:

| 작업 # | 대응 PRD Phase | 내용 |
|--------|-------|------|
| Phase 1 (개발) | PRD 1~1.3 | 환경 구축: 패키지 설치, lib/notion.ts, lib/env.ts, .env.local.example |
| Phase 1 (사용자) | PRD 1~1.3 | 사용자 액션: Notion DB 생성, API 키, .env.local 작성 |
| Task 1-6 | PRD 2~3 | 공통 모듈: next.config.ts, 포트폴리오 컴포넌트 9개 |
| Task 7-9 | PRD 4~5 | 페이지 구현: 프로젝트, 경력, 홈 페이지 |
| Task 10 | PRD 7 | 최적화 + 배포: 빌드 검증, 사용자 안내 |

---

## 📚 상세 참고

각 작업의 **구체적인 코드 예시, Notion DB 스키마, 타입 정의, 트러블슈팅**은 다음을 참고하세요:

- **Notion Database 스키마**: [PRD "Notion Database 스키마" 섹션](./PRD.md#notion-database-스키마)
- **lib/notion.ts 구현**: [PRD "Notion 데이터 페칭 레이어" 섹션](./PRD.md#f006-notion-데이터-페칭-레이어) — ✅ 이미 완료됨
- **컴포넌트 예시**: [PRD "기존 코드 재사용 방안" 섹션](./PRD.md#기존-코드-재사용-방안)
- **환경변수 설정**: [PRD "환경변수 및 설정" 섹션](./PRD.md#환경변수-및-설정)
- **ISR 전략**: [PRD "ISR(Incremental Static Regeneration) 전략" 섹션](./PRD.md#isrincremental-static-regeneration-전략)
- **FAQ & 트러블슈팅**: [PRD "FAQ & 트러블슈팅" 섹션](./PRD.md#faq--트러블슈팅)

---

## ✅ 전체 프로젝트 체크리스트

### Phase 1: 프로젝트 초기 설정 ✅ 완료
- [x] @notionhq/client 설치
- [x] lib/env.ts 작성
- [x] lib/notion.ts 완성 (HTTP REST API 기반, 4개 함수)
- [x] .env.local.example 작성
- [x] Notion DB 3개 생성 (사용자)
- [x] .env.local 파일 작성 및 값 입력 (사용자)
- [x] npm run build 성공
- [x] npm start 프로덕션 서버 정상 작동
- [x] Notion DB 접근 테스트 성공
- [x] 테스트 파일 정리 완료

### Phase 2: 공통 모듈 개발 🔄 진행 중
- [ ] Task 1: next.config.ts 이미지 도메인 등록
- [x] Task 2: lib/notion.ts 데이터 레이어 완성
- [ ] Task 3: TechStackBadges, SkillBadge 컴포넌트
- [ ] Task 4: ProjectCard, CareerItem 컴포넌트
- [ ] Task 5: SkillCategory, SkillsGrid, CareerTimeline 컴포넌트
- [ ] Task 6: ProjectDetail, ProjectNavigation 컴포넌트
- [ ] 모든 컴포넌트 TypeScript 컴파일 성공

### Phase 3: 핵심 기능 페이지 ⬜ 예정
- [ ] Task 7: app/projects/page.tsx + app/projects/[slug]/page.tsx
- [ ] Task 8: app/career/page.tsx
- [ ] Task 9: app/page.tsx 수정 (Featured + Skills)
- [ ] npm run build 성공
- [ ] 모든 페이지 라우트 정상 작동

### Phase 4: 최적화 및 배포 검증 ⬜ 예정
- [ ] 빌드/린트 검증
- [ ] npm run lint 통과
- [ ] npm start 프로덕션 모드 재테스트
- [ ] 모든 기능 검증 완료
- [ ] 사용자 배포 안내 제공

### 배포 (사용자) ⬜ 예정
- [ ] Vercel 배포 완료
- [ ] 환경변수 설정 완료
- [ ] ISR 갱신 동작 확인
- [ ] 🎉 프로젝트 완료!
