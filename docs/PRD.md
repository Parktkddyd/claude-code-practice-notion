# PRD: Notion DB 기반 개인 포트폴리오 게시 사이트

**버전**: 1.0  
**작성일**: 2026-06-14  
**상태**: 승인됨 (구현 준비 완료)

---

## 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [범위 및 비범위](#범위-및-비범위)
3. [핵심 기능 명세](#핵심-기능-명세)
4. [Notion Database 스키마](#notion-database-스키마)
5. [기술 아키텍처](#기술-아키텍처)
6. [페이지 및 라우팅 구조](#페이지-및-라우팅-구조)
7. [기존 코드 재사용 방안](#기존-코드-재사용-방안)
8. [환경변수 및 설정](#환경변수-및-설정)
9. [ISR(Incremental Static Regeneration) 전략](#isrincremental-static-regeneration-전략)
10. [단계별 구현 로드맵](#단계별-구현-로드맵)
11. [데이터 플로우 및 타입 정의](#데이터-플로우-및-타입-정의)

---

## 프로젝트 개요

### 목표
Notion을 **단일 사용자용 CMS**로 활용하여 개인 포트폴리오 웹사이트를 운영합니다. 모든 포트폴리오 데이터(프로젝트, 경력, 기술 스택)는 Notion Database에서 관리하며, Next.js는 이 데이터를 **ISR 기반으로 정적 렌더링**하여 서빙합니다.

### 핵심 특징
- **No Auth, No Admin Panel**: Notion이 관리 인터페이스 역할 수행
- **Notion DB 속성 기반 렌더링**: Rich Text 블록(page body)은 렌더링하지 않음, DB 프로퍼티만 활용
- **ISR 기반 갱신**: 1시간(3600초) 주기로 데이터 자동 갱신
- **타입 안전성**: TypeScript + Zod 검증으로 데이터 무결성 보장

### 기술 스택 (기존)
- **Framework**: Next.js 16 + React 19
- **Styling**: Tailwind CSS v4 + CSS Variables
- **UI Components**: shadcn/ui
- **Form Validation**: React Hook Form + Zod
- **Logging**: 커스텀 logger (`lib/logger.ts`)

### 신규 추가 기술
- **Notion API**: `@notionhq/client` (데이터 페칭)
- **Data Layer**: `lib/notion.ts` (Notion API 추상화)

---

## 범위 및 비범위

### 포함 범위 (In Scope)

| 기능 ID | 기능 | 설명 |
|--------|------|------|
| F001 | 홈페이지 / 소개 섹션 | 자기소개 + Featured 프로젝트 3~5개 + 핵심 기술 스택 |
| F002 | 프로젝트 목록 페이지 | 모든 활성 프로젝트 그리드/리스트 뷰 |
| F003 | 프로젝트 상세 페이지 | 개별 프로젝트 상세정보 (GitHub, Demo URL 링크) |
| F004 | 경력 타임라인 | 회사 → 직급 → 기간 → 설명 구조의 타임라인 |
| F005 | 기술 스택 표시 | 카테고리별 스킬/기술 뱃지 + Proficiency 레벨 |
| F006 | Notion 데이터 페칭 | 안정적 에러 핸들링, 타입 안전성 확보 |
| F007 | ISR 기반 갱신 | 1시간 주기 자동 revalidate |

### 제외 범위 (Out of Scope)
- ❌ 관리자 대시보드 / 인증 기능
- ❌ Notion Rich Text 블록 렌더링 (page body)
- ❌ 댓글/피드백 기능
- ❌ 방문자 분석 (Analytics)
- ❌ 다국어 지원
- ❌ 다크모드 (필요시 이후 추가)

---

## 핵심 기능 명세

### F001: 홈페이지 / 소개 섹션

**경로**: `/`  
**파일**: `app/page.tsx`

**기능**:
1. 자기소개 텍스트 + 프로필 이미지 (고정 텍스트, Notion 미사용)
2. **Featured 프로젝트 섹션**: `Projects DB`에서 `Featured = true`인 항목 3~5개 카드로 표시
3. **핵심 기술 섹션**: `Skills DB`에서 `Proficiency >= 8` (또는 별도 설정)인 항목을 카테고리별로 뱃지로 표시
4. CTA 버튼: "모든 프로젝트 보기" → `/projects`

**API 호출**:
```typescript
const projects = await getProjects({ featured: true, limit: 5 })
const skills = await getSkills({ minProficiency: 8 })
```

**컴포넌트**:
- `components/portfolio/ProjectCard.tsx` (재사용)
- `components/portfolio/SkillBadge.tsx` (재사용)

---

### F002: 프로젝트 목록 페이지

**경로**: `/projects`  
**파일**: `app/projects/page.tsx`

**기능**:
1. 모든 활성 프로젝트 표시 (`Projects DB`에서 `Status = "Active"`)
2. 그리드 레이아웃 (3열, 반응형)
3. 각 카드에는:
   - 썸네일 이미지 (`Thumbnail` 프로퍼티)
   - 프로젝트명 (`Name`)
   - 짧은 설명 (`Description`, 최대 150자)
   - 기술 스택 뱃지 (`TechStack` multi-select)
   - "상세보기" 링크 → `/projects/[slug]`
4. 필터/정렬 기능 (선택사항):
   - 기술 스택별 필터
   - 최신순 정렬

**API 호출**:
```typescript
const projects = await getProjects({ status: 'Active', orderBy: 'Order' })
```

**컴포넌트**:
- `components/portfolio/ProjectCard.tsx`
- `components/portfolio/TechStackBadges.tsx`

---

### F003: 프로젝트 상세 페이지

**경로**: `/projects/[slug]`  
**파일**: `app/projects/[slug]/page.tsx`

**기능**:
1. URL 파라미터 `slug`로 프로젝트 조회
2. 프로젝트 전체 정보 표시:
   - 큰 썸네일 (`Thumbnail`)
   - 프로젝트명 (`Name`)
   - 완전한 설명 (`Description`)
   - 기술 스택 (`TechStack`)
   - 생성 날짜 (`CreatedAt` - Notion 자동 생성)
3. 액션 버튼:
   - GitHub 링크 (`GithubUrl` if present)
   - Demo URL 링크 (`DemoUrl` if present)
4. 네비게이션:
   - "← 모든 프로젝트로" 링크
   - Previous/Next 프로젝트 링크 (순서 기반)

**API 호출**:
```typescript
const project = await getProjectBySlug(slug)
const allProjects = await getProjects() // Previous/Next 구성용
```

**타입 안전성**:
- 존재하지 않는 slug → 404 페이지 (Next.js 자동)
- Zod 검증으로 응답 데이터 타입 확인

**컴포넌트**:
- `components/portfolio/ProjectDetail.tsx`
- `components/portfolio/ProjectNavigation.tsx`

---

### F004: 경력 타임라인

**경로**: `/career` 또는 홈 페이지 섹션  
**파일**: `app/career/page.tsx` (독립) 또는 `app/page.tsx` 내 통합

**기능**:
1. `Career DB` 데이터를 시간 역순(최신 → 과거)으로 표시
2. 타임라인 UI:
   - 회사명 (`Company`)
   - 직급 (`Role`)
   - 기간 (`StartDate` ~ `EndDate`, format: "YYYY.MM" 또는 "YYYY.MM ~ YYYY.MM")
   - 직무 설명 (`Description`)
3. 현직 표시: `EndDate = null` 일 때 "현재 근무 중" 표시

**API 호출**:
```typescript
const careers = await getCareers({ orderBy: 'StartDate', ascending: false })
```

**컴포넌트**:
- `components/portfolio/CareerTimeline.tsx`
- `components/portfolio/CareerItem.tsx`

---

### F005: 기술 스택 표시

**경로**: 여러 페이지에서 재사용 (홈, 프로젝트 상세)  

**기능**:
1. 스킬을 카테고리(`Category` select)별로 그룹화 표시
2. 각 스킬별로:
   - 스킬명 (`Name`)
   - 숙련도 (`Proficiency`, 1~10 숫자)
   - 시각화: 프로그레스바 또는 별 아이콘 (선택사항)
3. 정렬: 카테고리명(ABC 순) → 숙련도(내림차순)

**API 호출**:
```typescript
const skills = await getSkills({ orderBy: ['Category', 'Proficiency'] })
```

**컴포넌트**:
- `components/portfolio/SkillsGrid.tsx`
- `components/portfolio/SkillBadge.tsx`
- `components/portfolio/SkillCategory.tsx`

---

### F006: Notion 데이터 페칭 레이어

**파일**: `lib/notion.ts` (신규 작성)

**목적**: Notion API와의 통신을 추상화하고, 응답 데이터의 타입 안전성을 보장합니다.

**함수 시그니처**:

```typescript
// ===== 타입 정의 =====
interface Project {
  id: string                      // Notion page ID
  name: string                    // Name 프로퍼티
  description: string             // Description (최대 500자)
  slug: string                    // Slug 프로퍼티 (URL-safe, 고유)
  techStack: string[]             // TechStack multi-select의 선택 항목들
  thumbnailUrl: string | null     // Thumbnail files[0] URL
  githubUrl: string | null        // GithubUrl 프로퍼티
  demoUrl: string | null          // DemoUrl 프로퍼티
  featured: boolean               // Featured checkbox
  status: 'Active' | 'Archived'   // Status select
  order: number                   // Order 숫자 (정렬용)
  createdAt: Date                 // Notion 자동 생성 시간
}

interface Career {
  id: string                      // Notion page ID
  company: string                 // Company 프로퍼티
  role: string                    // Role 프로퍼티
  startDate: Date                 // StartDate 날짜
  endDate: Date | null            // EndDate 날짜 (null = 현직)
  description: string             // Description
  order: number                   // Order 숫자
  createdAt: Date                 // Notion 자동 생성 시간
}

interface Skill {
  id: string                      // Notion page ID
  name: string                    // Name 프로퍼티
  category: string                // Category select (e.g., "Frontend", "Backend")
  proficiency: number             // Proficiency 1~10 숫자
  order: number                   // Order 숫자
  createdAt: Date                 // Notion 자동 생성 시간
}

// ===== 함수 선언 =====

/**
 * 모든 프로젝트 조회
 * @param options - 필터 및 정렬 옵션
 * @returns 필터링된 Project 배열
 */
async function getProjects(options?: {
  status?: 'Active' | 'Archived'
  featured?: boolean
  limit?: number
  orderBy?: 'Order' | 'CreatedAt'
  ascending?: boolean
}): Promise<Project[]>

/**
 * Slug로 특정 프로젝트 조회
 * @param slug - URL-safe 프로젝트 식별자
 * @returns Project 객체 또는 null (미존재 시)
 */
async function getProjectBySlug(slug: string): Promise<Project | null>

/**
 * 모든 경력 정보 조회
 * @param options - 필터 및 정렬 옵션
 * @returns 정렬된 Career 배열
 */
async function getCareers(options?: {
  orderBy?: 'StartDate' | 'Order'
  ascending?: boolean
  limit?: number
}): Promise<Career[]>

/**
 * 모든 스킬 조회
 * @param options - 필터 및 정렬 옵션
 * @returns 정렬된 Skill 배열
 */
async function getSkills(options?: {
  category?: string
  minProficiency?: number
  orderBy?: 'Category' | 'Proficiency' | 'Order'
  ascending?: boolean
  limit?: number
}): Promise<Skill[]>

/**
 * Notion Database에서 전체 페이지 수 조회 (페이지네이션용)
 */
async function getProjectCount(options?: {
  status?: 'Active' | 'Archived'
}): Promise<number>
```

**에러 처리**:
- Notion API 호출 실패 시 `logger.error()` 사용
- 응답 데이터가 스키마와 맞지 않으면 Zod 검증 에러 로깅
- 함수는 항상 `null` 또는 빈 배열을 반환하도록 fallback (사이트 중단 방지)

**로깅 예시**:
```typescript
logger.info('Notion: Fetching projects', {
  databaseId: NOTION_PROJECTS_DB_ID,
  filter: { featured: true },
})
logger.error('Notion API failed', { status, message })
```

---

### F007: ISR 기반 데이터 갱신

**구현 위치**: 각 페이지 파일 최상단

**코드**:
```typescript
export const revalidate = 3600 // 1시간(3600초)
```

**동작**:
1. 페이지가 빌드될 때 Notion에서 데이터 페칭 → HTML 생성
2. 최초 요청: 생성된 정적 HTML 제공
3. 3600초(1시간) 경과 후 요청: 백그라운드에서 데이터 재페칭 → 새 HTML 생성
4. 재페칭 중 기존 HTML 계속 제공 (사용자 영향 없음)

**적용 파일**:
- `app/page.tsx` (홈)
- `app/projects/page.tsx` (프로젝트 목록)
- `app/projects/[slug]/page.tsx` (프로젝트 상세)
- `app/career/page.tsx` (경력)

**주의사항**:
- 개발 환경(`next dev`) 에서는 매번 새로 페칭됨
- 프로덕션 빌드 후 Vercel 등에서 ISR 확인 필요

---

## Notion Database 스키마

### 1. Projects Database

**Notion 데이터베이스명**: "Portfolio Projects"  
**데이터베이스 ID**: 환경변수 `NOTION_PROJECTS_DB_ID`

| 프로퍼티명 | 프로퍼티 타입 | 타입 상세 | 필수 | 설명 |
|-----------|-------------|---------|-----|------|
| Name | Title | 기본 제목 | ✅ | 프로젝트명 |
| Description | Rich Text | 긴 텍스트 | ✅ | 프로젝트 설명 (최대 500자 권장) |
| Slug | Text | 일반 텍스트 | ✅ | URL-safe 고유 식별자 (예: "my-awesome-app", 소문자+하이픈) |
| TechStack | Multi-Select | 여러 선택 | ❌ | 기술 스택 태그 (예: "React", "TypeScript", "Next.js") |
| Thumbnail | Files & media | 파일 | ❌ | 프로젝트 썸네일 이미지 (1개 권장) |
| GithubUrl | URL | URL | ❌ | GitHub 저장소 링크 |
| DemoUrl | URL | URL | ❌ | 라이브 데모 링크 |
| Featured | Checkbox | 체크박스 | ✅ | 홈페이지에 표시할지 여부 |
| Status | Select | 단일 선택 | ✅ | "Active" 또는 "Archived" (정확히 입력) |
| Order | Number | 숫자 | ✅ | 표시 순서 (1부터 시작, 오름차순) |
| CreatedAt | Created time | 자동 생성 | ✅ | Notion 자동 생성 (수정 금지) |

**예시 데이터**:
```
Name: "E-commerce Platform"
Description: "React + Node.js 기반 풀스택 이커머스 플랫폼, GraphQL API, Stripe 결제 연동"
Slug: "ecommerce-platform"
TechStack: ["React", "Node.js", "GraphQL", "MongoDB", "Stripe"]
Thumbnail: [이미지 파일]
GithubUrl: "https://github.com/username/ecommerce-platform"
DemoUrl: "https://ecommerce-demo.example.com"
Featured: true
Status: "Active"
Order: 1
```

### 2. Career Database

**Notion 데이터베이스명**: "Portfolio Career"  
**데이터베이스 ID**: 환경변수 `NOTION_CAREER_DB_ID`

| 프로퍼티명 | 프로퍼티 타입 | 타입 상세 | 필수 | 설명 |
|-----------|-------------|---------|-----|------|
| Company | Title | 기본 제목 | ✅ | 회사명 |
| Role | Text | 일반 텍스트 | ✅ | 직급/직책 |
| StartDate | Date | 날짜 | ✅ | 입사 날짜 (YYYY-MM-DD 형식) |
| EndDate | Date | 날짜 | ❌ | 퇴사 날짜 (빈칸 = 현직) |
| Description | Rich Text | 긴 텍스트 | ✅ | 직무 설명 및 주요 성과 |
| Order | Number | 숫자 | ✅ | 표시 순서 (시간 역순, 최신=1) |
| CreatedAt | Created time | 자동 생성 | ✅ | Notion 자동 생성 |

**예시 데이터**:
```
Company: "ABC Tech Corp"
Role: "Senior Frontend Engineer"
StartDate: 2023-01-15
EndDate: (빈칸)
Description: "React, TypeScript 기반 대규모 웹애플리케이션 개발. 팀 리드로 5명 개발자 관리. 성능 최적화로 Lighthouse Score 95점 달성"
Order: 1
```

### 3. Skills Database

**Notion 데이터베이스명**: "Portfolio Skills"  
**데이터베이스 ID**: 환경변수 `NOTION_SKILLS_DB_ID`

| 프로퍼티명 | 프로퍼티 타입 | 타입 상세 | 필수 | 설명 |
|-----------|-------------|---------|-----|------|
| Name | Title | 기본 제목 | ✅ | 스킬명 (예: "React", "TypeScript") |
| Category | Select | 단일 선택 | ✅ | 분류 (예: "Frontend", "Backend", "DevOps", "Tools") |
| Proficiency | Number | 숫자 | ✅ | 숙련도 1~10 (1=입문자, 10=전문가) |
| Order | Number | 숫자 | ✅ | 카테고리 내 정렬 순서 |
| CreatedAt | Created time | 자동 생성 | ✅ | Notion 자동 생성 |

**Select 옵션 (Category 미리 정의)**:
- Frontend
- Backend
- DevOps
- Tools
- Other

**예시 데이터**:
```
Name: "React"
Category: "Frontend"
Proficiency: 9
Order: 1

Name: "TypeScript"
Category: "Frontend"
Proficiency: 8
Order: 2

Name: "Node.js"
Category: "Backend"
Proficiency: 8
Order: 1
```

---

## 기술 아키텍처

### 아키텍처 다이어그램

```
┌────────────────────────────────────────────────────┐
│  Next.js Pages (App Router)                        │
│  app/page.tsx, app/projects/page.tsx, etc.         │
└────────────────┬─────────────────────────────────┘
                 │ (import & call)
                 ↓
┌────────────────────────────────────────────────────┐
│  lib/notion.ts (Data Layer)                        │
│  - getProjects()                                   │
│  - getProjectBySlug()                              │
│  - getCareers()                                    │
│  - getSkills()                                     │
│  (Zod validation, error handling, logging)         │
└────────────────┬─────────────────────────────────┘
                 │ (API calls)
                 ↓
┌────────────────────────────────────────────────────┐
│  @notionhq/client (Notion SDK)                     │
│  - Client initialization                           │
│  - Database queries (filters, sorting)             │
└────────────────┬─────────────────────────────────┘
                 │ (HTTP)
                 ↓
         ┌───────────────┐
         │  Notion API   │
         │  (notion.so)  │
         └───────────────┘
```

### 데이터 흐름 (ISR 타이밍)

```
빌드 시점 (Build Time)
  ↓
next build → app/page.tsx 실행
  ↓
lib/notion.ts의 getProjects() 호출
  ↓
Notion API로부터 데이터 페칭
  ↓
React 컴포넌트로 렌더링 → HTML 생성 → 캐시 저장

요청 시점 (Request Time)
  ↓
사용자 요청 → 캐시된 HTML 제공 (0초)

재검증 시점 (Revalidation Time, 1시간 경과 후)
  ↓
새로운 요청 발생 → 백그라운드에서 next build 일부 재실행
  ↓
lib/notion.ts 다시 호출 → 최신 데이터 페칭
  ↓
새 HTML 생성 → 캐시 교체
```

### 패키지 의존성

**신규 설치 필요**:
```bash
npm install @notionhq/client
npm install -D @types/node  # 이미 설치됨
```

**기존 패키지 (재사용)**:
- `react-hook-form`: 폼 (필요시)
- `zod`: 데이터 검증
- `clsx` + `tailwind-merge`: cn() 유틸리티
- `lucide-react`: 아이콘

---

## 페이지 및 라우팅 구조

### 라우팅 맵

```
app/
├── layout.tsx                    (루트 레이아웃, 헤더/푸터)
├── page.tsx                      (홈 - F001)
├── projects/
│   ├── page.tsx                  (프로젝트 목록 - F002)
│   └── [slug]/
│       └── page.tsx              (프로젝트 상세 - F003)
├── career/
│   └── page.tsx                  (경력 타임라인 - F004, 선택사항)
├── globals.css                   (글로벌 스타일)
└── examples/                      (기존 예제, 유지 가능)
```

### 각 페이지 상세 설명

#### app/page.tsx (홈)

```typescript
import { getProjects, getSkills } from '@/lib/notion'
import { logger } from '@/lib/logger'

export const revalidate = 3600

export default async function HomePage() {
  try {
    // F001: Featured 프로젝트 + 기술 스택 조회
    const [featuredProjects, topSkills] = await Promise.all([
      getProjects({ featured: true, limit: 5 }),
      getSkills({ minProficiency: 8 })
    ])
    
    return (
      <main>
        {/* 자기소개 섹션 (고정) */}
        <section className="hero">...</section>
        
        {/* Featured 프로젝트 */}
        <section className="featured-projects">
          <ProjectGrid projects={featuredProjects} />
        </section>
        
        {/* 기술 스택 */}
        <section className="skills">
          <SkillsGrid skills={topSkills} />
        </section>
      </main>
    )
  } catch (error) {
    logger.error('Homepage: Failed to fetch data', error)
    // Fallback UI 표시
    return <div>데이터를 불러올 수 없습니다.</div>
  }
}
```

#### app/projects/page.tsx (프로젝트 목록)

```typescript
import { getProjects } from '@/lib/notion'
import { logger } from '@/lib/logger'
import { ProjectCard } from '@/components/portfolio/ProjectCard'

export const revalidate = 3600
export const metadata = {
  title: 'Projects',
  description: 'My portfolio projects'
}

export default async function ProjectsPage() {
  try {
    const projects = await getProjects({
      status: 'Active',
      orderBy: 'Order'
    })
    
    return (
      <main>
        <h1>모든 프로젝트</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </main>
    )
  } catch (error) {
    logger.error('ProjectsPage: Failed to fetch projects', error)
    return <div>프로젝트를 불러올 수 없습니다.</div>
  }
}
```

#### app/projects/[slug]/page.tsx (프로젝트 상세)

```typescript
import { getProjectBySlug, getProjects } from '@/lib/notion'
import { notFound } from 'next/navigation'
import { logger } from '@/lib/logger'

export const revalidate = 3600

export async function generateStaticParams() {
  // 빌드 시 모든 프로젝트 slug에 대한 페이지 pre-render
  const projects = await getProjects()
  return projects.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const project = await getProjectBySlug(params.slug)
  if (!project) return {}
  
  return {
    title: project.name,
    description: project.description
  }
}

export default async function ProjectPage({ params }: { params: { slug: string } }) {
  try {
    const project = await getProjectBySlug(params.slug)
    
    if (!project) {
      notFound() // 404 페이지
    }
    
    return (
      <main>
        <ProjectDetail project={project} />
      </main>
    )
  } catch (error) {
    logger.error(`ProjectPage: Failed to fetch project [${params.slug}]`, error)
    notFound()
  }
}
```

#### app/career/page.tsx (경력 타임라인, 선택사항)

```typescript
import { getCareers } from '@/lib/notion'
import { CareerTimeline } from '@/components/portfolio/CareerTimeline'

export const revalidate = 3600
export const metadata = {
  title: 'Career',
  description: 'My career history'
}

export default async function CareerPage() {
  const careers = await getCareers({
    orderBy: 'StartDate',
    ascending: false // 최신순
  })
  
  return (
    <main>
      <h1>경력</h1>
      <CareerTimeline careers={careers} />
    </main>
  )
}
```

---

## 기존 코드 재사용 방안

### 1. `lib/utils.ts` - `cn()` 함수

**용도**: Tailwind CSS 클래스 조건부 병합

**사용 예시**:
```typescript
// components/portfolio/ProjectCard.tsx
import { cn } from '@/lib/utils'

interface ProjectCardProps {
  project: Project
  featured?: boolean
}

export function ProjectCard({ project, featured }: ProjectCardProps) {
  return (
    <div className={cn(
      'border rounded-lg p-4',
      featured && 'border-blue-500 shadow-lg'
    )}>
      {/* ... */}
    </div>
  )
}
```

### 2. `components/ui/card.tsx` - 카드 컴포넌트

**용도**: 프로젝트 카드, 경력 아이템 래퍼

**사용 예시**:
```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle>{project.name}</CardTitle>
        <CardDescription>{project.description.slice(0, 100)}...</CardDescription>
      </CardHeader>
      <CardContent>
        <TechStackBadges techStack={project.techStack} />
      </CardContent>
    </Card>
  )
}
```

### 3. `components/ui/badge.tsx` - 뱃지 컴포넌트

**용도**: 기술 스택, 카테고리, 상태 표시

**사용 예시**:
```typescript
import { Badge } from '@/components/ui/badge'

export function TechStackBadges({ techStack }: { techStack: string[] }) {
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
```

### 4. `lib/logger.ts` - 로깅 유틸리티

**용도**: Notion API 호출 에러, 데이터 검증 에러 로깅

**사용 예시**:
```typescript
// lib/notion.ts
import { logger } from '@/lib/logger'

async function getProjects(options?: GetProjectsOptions): Promise<Project[]> {
  try {
    logger.info('Notion: Fetching projects', { options })
    
    const response = await client.databases.query({
      database_id: NOTION_PROJECTS_DB_ID,
      filter: buildFilter(options),
      sorts: buildSorts(options)
    })
    
    logger.debug('Notion: Raw response received', { pageCount: response.results.length })
    
    const projects = response.results.map(parseProjectPage)
    logger.info('Notion: Projects fetched successfully', { count: projects.length })
    
    return projects
  } catch (error) {
    logger.error('Notion: Failed to fetch projects', error)
    return [] // fallback
  }
}
```

### 5. React Hook Form + Zod 패턴 (향후)

향후 문의 폼(Contact Form) 추가 시:
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactSchema } from '@/lib/validations'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'

export function ContactForm() {
  const form = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { email: '', message: '' }
  })
  
  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input {...field} placeholder="your@email.com" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </Form>
  )
}
```

---

## 환경변수 및 설정

### .env.local (신규 작성)

프로젝트 루트에 `.env.local` 파일을 생성합니다. `.gitignore`에 이미 `.env*` 포함되어 있으므로 커밋되지 않습니다.

```bash
# Notion API 설정
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_PROJECTS_DB_ID=abcd1234efgh5678ijkl9012mnop3456
NOTION_CAREER_DB_ID=qrst5678uvwx9012yzab3456cdef7890
NOTION_SKILLS_DB_ID=ghij1234klmn5678opqr9012stuv3456

# (선택) Next.js 환경
NODE_ENV=development
```

### .env.local.example (신규 작성, 버전 컨트롤 대상)

`.env.local` 예시 파일로 팀원이나 배포 환경 설정 시 참고:

```bash
# Notion API Configuration
# API 키 발급: https://www.notion.so/my-integrations
# DB ID 확인: Notion DB URL에서 ?v=... 이전의 32자 ID
NOTION_API_KEY=your_notion_api_key_here
NOTION_PROJECTS_DB_ID=your_projects_db_id_here
NOTION_CAREER_DB_ID=your_career_db_id_here
NOTION_SKILLS_DB_ID=your_skills_db_id_here
```

### Notion API 키 및 DB ID 획득 방법

#### 1. Notion Integration 생성 (API 키 획득)

1. [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations) 접속
2. "+ Create new integration" 클릭
3. 이름 입력: "Portfolio Site"
4. 기능 체크:
   - ✅ Read content
   - ✅ Read user information
   - (쓰기 필요 없음)
5. "Submit" → API 키(`secret_xxx...`) 복사 → `.env.local`에 저장

#### 2. Notion Database 생성 및 ID 확인

각 DB를 Notion Workspace에 생성:
- **Portfolio Projects**
- **Portfolio Career**
- **Portfolio Skills**

DB 상세보기 URL:
```
https://www.notion.so/abcd1234efgh5678ijkl9012mnop3456?v=12345678901234567890123456789012
                      ↑                                 ↑ (이 부분이 DB ID)
```

#### 3. Integration에 Database 공유

각 Database:
1. 오른쪽 상단 "+ Add connections"
2. "Portfolio Site" Integration 선택
3. 저장

### 타입스크립트 환경변수 타입 정의

`lib/env.ts` (선택사항, 타입 안전성 강화):

```typescript
import { z } from 'zod'

const envSchema = z.object({
  NOTION_API_KEY: z.string().min(1, 'Missing NOTION_API_KEY'),
  NOTION_PROJECTS_DB_ID: z.string().min(1, 'Missing NOTION_PROJECTS_DB_ID'),
  NOTION_CAREER_DB_ID: z.string().min(1, 'Missing NOTION_CAREER_DB_ID'),
  NOTION_SKILLS_DB_ID: z.string().min(1, 'Missing NOTION_SKILLS_DB_ID'),
})

export const env = envSchema.parse(process.env)
```

사용:
```typescript
// lib/notion.ts
import { env } from '@/lib/env'

const client = new Client({ auth: env.NOTION_API_KEY })
```

---

## ISR(Incremental Static Regeneration) 전략

### 개념 정리

**ISR(증분 정적 재생성)**은 Next.js의 기능으로, 빌드 후에도 선택적으로 정적 페이지를 재생성할 수 있습니다.

| 구분 | SSG (Static) | SSR | ISR |
|------|-------------|-----|-----|
| 렌더링 | 빌드 시 1회 | 요청 시마다 | 빌드 시 + 주기적 |
| 성능 | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐⭐ |
| 데이터 신선도 | ❌ (재빌드 필요) | ✅ (항상 최신) | ✅ (주기적 갱신) |
| 서버 비용 | ❌ (CDN만) | ⭐⭐⭐ (높음) | ⭐ (낮음) |

### 이 프로젝트에서의 ISR 설정

**1시간(3600초) 주기 재검증**

```typescript
// app/page.tsx, app/projects/page.tsx 등
export const revalidate = 3600
```

**동작 흐름**:

```
시간 T=0 (배포 직후)
├─ next build 실행
├─ Notion에서 모든 데이터 페칭
├─ 정적 HTML 생성 (app/page.tsx → public/index.html)
└─ 캐시 저장 (Vercel CDN)

시간 T=0~3600초 (1시간 이내)
├─ 사용자 요청 → 캐시된 HTML 제공 (0ms)
└─ Notion 데이터 변경해도 반영 안 됨

시간 T=3600초 이후 (1시간 후)
├─ 첫 사용자 요청 발생
├─ Vercel: "캐시 만료됨, 재생성 필요" 감지
├─ 백그라운드에서 app/page.tsx 재실행
│  └─ Notion 다시 페칭 → 새 HTML 생성
├─ 재생성 중: 기존 HTML 계속 제공
├─ 재생성 완료: 새 HTML로 교체
└─ 다음 요청부터 새 데이터 제공
```

### 주요 이점

1. **빠른 성능**: 정적 페이지 제공 (TTFB < 100ms)
2. **자동 갱신**: 개발자 개입 없이 1시간마다 자동으로 최신 데이터 확인
3. **저비용**: CDN 제공 (Vercel은 사용량 기반, 정적 > SSR)
4. **안정성**: 페칭 실패 시 기존 HTML 계속 제공 (다운타임 없음)

### 배포 환경별 동작

#### Vercel (권장)

- ISR 자동 지원
- 설정 불필요, `revalidate` 값만 코드에 명시

#### 자체 서버 (Node.js)

- `npm start`로 프로덕션 서버 실행 가능
- ISR 지원함

#### 정적 호스팅 (GitHub Pages, Netlify 정적 등)

- ISR 미지원 ❌
- 대신 `npm run build` 정기 실행 (CI/CD 스케줄)

### 개발 환경에서의 테스트

```bash
npm run build
npm start
```

브라우저에서 http://localhost:3000 접속:
- 페이지 로드됨 (프로덕션 모드)
- Notion 데이터 변경 후 1시간 대기 또는 수동 재배포로 테스트

개발 환경 테스트용 설정 (필요 시):
```typescript
export const revalidate = process.env.NODE_ENV === 'development' ? 0 : 3600
// 개발: 항상 새로 페칭, 프로덕션: 1시간 주기
```

---

## 단계별 구현 로드맵

솔로 개발자 기준 총 **7단계, 약 2~3주 소요** (각 단계 1~2시간 추정):

### Phase 1: Notion 및 패키지 설정 (1일)

#### 1.1 Notion DB 생성 및 설정

**작업**:
1. [notion.so](https://notion.so) 로그인
2. 새 Database 3개 생성:
   - Portfolio Projects
   - Portfolio Career
   - Portfolio Skills
3. 각 DB에 프로퍼티 추가 (위의 "Notion Database 스키마" 참조)
4. 예시 데이터 5~10개 입력 (테스트용)

**결과**: Database ID 3개 확인

#### 1.2 Notion Integration 생성

**작업**:
1. [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations) 접속
2. 새 Integration 생성: "Portfolio Site"
3. API 키 복사

**결과**: `NOTION_API_KEY` 획득

#### 1.3 패키지 설치 및 환경변수 설정

**작업**:
```bash
cd /home/psy/Desktop/workspace/course/portfolio

# 1. @notionhq/client 설치
npm install @notionhq/client

# 2. .env.local 생성
cat > .env.local << 'EOF'
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_PROJECTS_DB_ID=abcd1234efgh5678ijkl9012mnop3456
NOTION_CAREER_DB_ID=qrst5678uvwx9012yzab3456cdef7890
NOTION_SKILLS_DB_ID=ghij1234klmn5678opqr9012stuv3456
EOF

# 3. .env.local.example 생성
cp .env.local.example ...
```

**결과**: 패키지 설치 완료, 환경변수 준비

---

### Phase 2: 데이터 레이어 구현 (3~4시간)

#### 2.1 `lib/notion.ts` 구현

**작업**: 다음 함수들을 구현합니다:
- `getProjects(options?): Promise<Project[]>`
- `getProjectBySlug(slug): Promise<Project | null>`
- `getCareers(options?): Promise<Career[]>`
- `getSkills(options?): Promise<Skill[]>`

**핵심 구현 포인트**:
1. Notion Client 초기화
2. Zod 스키마로 응답 데이터 검증
3. 필터/정렬 로직 (프로퍼티명 정확히 매핑)
4. `logger` 사용
5. 에러 처리 (null/[] 반환)

**파일 경로**: `/home/psy/Desktop/workspace/course/portfolio/lib/notion.ts`

**예시 구조**:
```typescript
import { Client } from '@notionhq/client'
import { z } from 'zod'
import { logger } from '@/lib/logger'

// 1. Zod 스키마 정의
const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  // ...
})

// 2. Notion Client 초기화
const client = new Client({
  auth: process.env.NOTION_API_KEY
})

// 3. 함수 구현
export async function getProjects(options?: GetProjectsOptions): Promise<Project[]> {
  try {
    logger.info('Fetching projects from Notion', { options })
    
    const response = await client.databases.query({
      database_id: process.env.NOTION_PROJECTS_DB_ID!,
      // 필터 구성...
      // 정렬 구성...
    })
    
    // Zod 검증
    const projects = response.results
      .map(parseProjectPage)
      .map(p => ProjectSchema.parse(p))
    
    logger.info('Projects fetched successfully', { count: projects.length })
    return projects
  } catch (error) {
    logger.error('Failed to fetch projects', error)
    return []
  }
}
```

**테스트 방법**:
```bash
# Node.js REPL 또는 간단한 테스트 파일
node -e "import('./lib/notion.ts').then(m => m.getProjects()).then(p => console.log(p))"
```

**결과**: `lib/notion.ts` 완성, 모든 함수 동작 확인

---

### Phase 3: 포트폴리오 컴포넌트 구현 (3~4시간)

#### 3.1 컴포넌트 디렉토리 생성

```bash
mkdir -p /home/psy/Desktop/workspace/course/portfolio/components/portfolio
```

#### 3.2 기본 컴포넌트들 구현

| 파일명 | 용도 | 의존성 |
|--------|------|--------|
| `ProjectCard.tsx` | 프로젝트 카드 (목록용) | `Card`, `Badge`, `cn()` |
| `ProjectDetail.tsx` | 프로젝트 상세 정보 | `Card`, 기본 HTML |
| `TechStackBadges.tsx` | 기술 스택 뱃지 나열 | `Badge` |
| `CareerTimeline.tsx` | 경력 타임라인 래퍼 | `CareerItem` |
| `CareerItem.tsx` | 경력 단일 항목 | `Card` |
| `SkillsGrid.tsx` | 스킬 그리드 (카테고리별) | `SkillCategory`, `SkillBadge` |
| `SkillCategory.tsx` | 스킬 카테고리 섹션 | `SkillBadge` |
| `SkillBadge.tsx` | 스킬 단일 뱃지 (진행도 표시) | `Badge` |

**예시 (`ProjectCard.tsx`)**:
```typescript
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Project } from '@/lib/notion'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.slug}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        {project.thumbnailUrl && (
          <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
            <Image
              src={project.thumbnailUrl}
              alt={project.name}
              fill
              className="object-cover"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-3">
            {project.description.slice(0, 100)}...
          </p>
          <div className="flex flex-wrap gap-2">
            {project.techStack.map(tech => (
              <Badge key={tech} variant="secondary">
                {tech}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
```

**결과**: 모든 포트폴리오 컴포넌트 완성

---

### Phase 4: 프로젝트 페이지 구현 (2~3시간)

#### 4.1 프로젝트 목록 페이지

**파일**: `app/projects/page.tsx`

```typescript
import { getProjects } from '@/lib/notion'
import { ProjectCard } from '@/components/portfolio/ProjectCard'
import { logger } from '@/lib/logger'

export const revalidate = 3600
export const metadata = {
  title: 'Projects',
}

export default async function ProjectsPage() {
  try {
    const projects = await getProjects({ status: 'Active', orderBy: 'Order' })
    
    return (
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">프로젝트</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </main>
    )
  } catch (error) {
    logger.error('Failed to load projects page', error)
    return <div>프로젝트를 불러올 수 없습니다.</div>
  }
}
```

#### 4.2 프로젝트 상세 페이지

**파일**: `app/projects/[slug]/page.tsx`

```typescript
import { getProjectBySlug, getProjects } from '@/lib/notion'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { logger } from '@/lib/logger'
import { Button } from '@/components/ui/button'

export const revalidate = 3600

export async function generateStaticParams() {
  const projects = await getProjects()
  return projects.map(p => ({ slug: p.slug }))
}

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  try {
    const project = await getProjectBySlug(params.slug)
    
    if (!project) {
      notFound()
    }
    
    return (
      <main className="container mx-auto px-4 py-12">
        {project.thumbnailUrl && (
          <div className="relative w-full h-96 mb-8">
            <Image
              src={project.thumbnailUrl}
              alt={project.name}
              fill
              className="object-cover rounded-lg"
            />
          </div>
        )}
        
        <h1 className="text-4xl font-bold mb-4">{project.name}</h1>
        <p className="text-lg text-gray-600 mb-8">{project.description}</p>
        
        <div className="flex gap-4 mb-8">
          {project.githubUrl && (
            <Button asChild>
              <a href={project.githubUrl} target="_blank">GitHub</a>
            </Button>
          )}
          {project.demoUrl && (
            <Button asChild variant="outline">
              <a href={project.demoUrl} target="_blank">Demo</a>
            </Button>
          )}
        </div>
        
        <Link href="/projects">← 모든 프로젝트로</Link>
      </main>
    )
  } catch (error) {
    logger.error(`Failed to load project [${params.slug}]`, error)
    notFound()
  }
}
```

**결과**: 프로젝트 목록/상세 페이지 완성

---

### Phase 5: 홈페이지 통합 (2~3시간)

#### 5.1 홈페이지 (Featured + Skills)

**파일**: `app/page.tsx` (기존 수정)

```typescript
import { getProjects, getSkills } from '@/lib/notion'
import { ProjectCard } from '@/components/portfolio/ProjectCard'
import { SkillsGrid } from '@/components/portfolio/SkillsGrid'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { logger } from '@/lib/logger'

export const revalidate = 3600

export default async function HomePage() {
  try {
    const [projects, skills] = await Promise.all([
      getProjects({ featured: true, limit: 5 }),
      getSkills()
    ])
    
    return (
      <main>
        {/* Hero 섹션 */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-5xl font-bold mb-4">안녕하세요! 👋</h1>
          <p className="text-xl text-gray-600 mb-8">
            풀스택 개발자 입니다. React, Node.js, TypeScript로 
            웹 애플리케이션을 구축합니다.
          </p>
        </section>
        
        {/* Featured 프로젝트 */}
        <section className="container mx-auto px-4 py-20">
          <h2 className="text-3xl font-bold mb-8">주요 프로젝트</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {projects.map(p => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
          <div className="text-center">
            <Button asChild>
              <Link href="/projects">모든 프로젝트 보기 →</Link>
            </Button>
          </div>
        </section>
        
        {/* 기술 스택 */}
        <section className="container mx-auto px-4 py-20 bg-gray-50">
          <h2 className="text-3xl font-bold mb-8">기술 스택</h2>
          <SkillsGrid skills={skills} />
        </section>
      </main>
    )
  } catch (error) {
    logger.error('Failed to load homepage', error)
    return <div>페이지를 불러올 수 없습니다.</div>
  }
}
```

**결과**: 홈페이지 완성

---

### Phase 6: 경력 타임라인 (선택사항, 1~2시간)

#### 6.1 경력 페이지 또는 홈 섹션

**파일**: `app/career/page.tsx` (독립) 또는 `app/page.tsx`에 섹션으로 통합

```typescript
import { getCareers } from '@/lib/notion'
import { CareerTimeline } from '@/components/portfolio/CareerTimeline'

export const revalidate = 3600

export default async function CareerPage() {
  const careers = await getCareers({ orderBy: 'StartDate', ascending: false })
  
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">경력</h1>
      <CareerTimeline careers={careers} />
    </main>
  )
}
```

**결과**: 경력 페이지 완성

---

### Phase 7: 스타일링 정리 및 배포 (1~2시간)

#### 7.1 스타일링 정리

- 컴포넌트별 Tailwind CSS 클래스 최적화
- 다크모드 고려 (선택사항)
- 반응형 디자인 점검

#### 7.2 로컬 테스트

```bash
cd /home/psy/Desktop/workspace/course/portfolio

# 개발 서버 (ISR 자동 갱신 X)
npm run dev

# 프로덕션 시뮬레이션 (ISR 동작 확인)
npm run build
npm start
```

#### 7.3 배포

**Vercel (권장)**:
```bash
# 1. GitHub에 push
git push origin main

# 2. Vercel 대시보드에서 자동 배포
# 또는 Vercel CLI
npm install -g vercel
vercel
```

**환경변수 설정** (Vercel 대시보드):
- Settings → Environment Variables
- `NOTION_API_KEY`, `NOTION_PROJECTS_DB_ID` 등 3개 추가

**배포 후 테스트**:
1. 배포된 사이트 접속
2. Notion에서 데이터 수정
3. 1시간 경과 후 변경사항 반영 확인 (또는 Vercel Redeploy로 즉시 확인)

**결과**: 프로덕션 배포 완료, ISR 동작 확인

---

## 데이터 플로우 및 타입 정의

### 타입 정의 (`lib/notion.ts`)

```typescript
// ===== Project 타입 =====
export interface Project {
  id: string                          // Notion Page ID
  name: string                        // from Title property
  description: string                 // from RichText property
  slug: string                        // from Slug property (URL-safe)
  techStack: string[]                 // from MultiSelect property
  thumbnailUrl: string | null         // from Files property (first file URL)
  githubUrl: string | null            // from URL property
  demoUrl: string | null              // from URL property
  featured: boolean                   // from Checkbox property
  status: 'Active' | 'Archived'       // from Select property
  order: number                       // from Number property
  createdAt: Date                     // from CreatedTime (auto)
}

export interface GetProjectsOptions {
  status?: 'Active' | 'Archived'
  featured?: boolean
  limit?: number
  orderBy?: 'Order' | 'CreatedAt'
  ascending?: boolean
}

// ===== Career 타입 =====
export interface Career {
  id: string                          // Notion Page ID
  company: string                     // from Title property
  role: string                        // from Text property
  startDate: Date                     // from Date property
  endDate: Date | null                // from Date property (nullable)
  description: string                 // from RichText property
  order: number                       // from Number property
  createdAt: Date                     // from CreatedTime (auto)
}

export interface GetCareersOptions {
  orderBy?: 'StartDate' | 'Order'
  ascending?: boolean
  limit?: number
}

// ===== Skill 타입 =====
export interface Skill {
  id: string                          // Notion Page ID
  name: string                        // from Title property
  category: string                    // from Select property
  proficiency: number                 // from Number property (1-10)
  order: number                       // from Number property
  createdAt: Date                     // from CreatedTime (auto)
}

export interface GetSkillsOptions {
  category?: string
  minProficiency?: number
  orderBy?: 'Category' | 'Proficiency' | 'Order'
  ascending?: boolean
  limit?: number
}
```

### Zod 검증 스키마

```typescript
import { z } from 'zod'

const ProjectSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  techStack: z.array(z.string()),
  thumbnailUrl: z.string().url().nullable(),
  githubUrl: z.string().url().nullable(),
  demoUrl: z.string().url().nullable(),
  featured: z.boolean().default(false),
  status: z.enum(['Active', 'Archived']),
  order: z.number().int().positive(),
  createdAt: z.date(),
})

const CareerSchema = z.object({
  id: z.string(),
  company: z.string().min(1),
  role: z.string().min(1),
  startDate: z.date(),
  endDate: z.date().nullable(),
  description: z.string(),
  order: z.number().int().positive(),
  createdAt: z.date(),
})

const SkillSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  category: z.string().min(1),
  proficiency: z.number().int().min(1).max(10),
  order: z.number().int().positive(),
  createdAt: z.date(),
})
```

### Notion API 응답 파싱 예시

Notion API 응답의 복잡한 구조를 타입이 정의된 Project로 변환:

```typescript
function parseProjectPage(page: any): Project {
  const properties = page.properties
  
  return {
    id: page.id,
    name: properties.Name.title[0]?.plain_text ?? '',
    description: properties.Description.rich_text.map((t: any) => t.plain_text).join(''),
    slug: properties.Slug.rich_text[0]?.plain_text ?? '',
    techStack: properties.TechStack.multi_select.map((s: any) => s.name),
    thumbnailUrl: properties.Thumbnail.files[0]?.file?.url ?? null,
    githubUrl: properties.GithubUrl.url,
    demoUrl: properties.DemoUrl.url,
    featured: properties.Featured.checkbox,
    status: properties.Status.select.name,
    order: properties.Order.number,
    createdAt: new Date(page.created_time),
  }
}
```

---

## 개발 및 배포 체크리스트

### 구현 전 체크리스트

- [ ] Notion Account 생성
- [ ] 3개 Database 생성 및 프로퍼티 설정
- [ ] Integration 생성 및 API 키 획득
- [ ] Database에 Integration 공유

### 구현 중 체크리스트 (Phase별)

**Phase 1**:
- [ ] `npm install @notionhq/client`
- [ ] `.env.local`, `.env.local.example` 생성
- [ ] 환경변수 값 확인 (테스트 API 호출)

**Phase 2**:
- [ ] `lib/notion.ts` 구현
- [ ] 모든 함수 로컬 테스트 (Node.js REPL 또는 테스트 파일)
- [ ] Notion 데이터 오류 처리 확인

**Phase 3**:
- [ ] `components/portfolio/` 디렉토리 생성
- [ ] 모든 컴포넌트 구현 및 TypeScript 컴파일 확인

**Phase 4**:
- [ ] `app/projects/page.tsx` 구현 → `npm run dev`로 로드 확인
- [ ] `app/projects/[slug]/page.tsx` 구현 → 상세 페이지 클릭 동작 확인

**Phase 5**:
- [ ] `app/page.tsx` Featured 섹션 추가
- [ ] 홈페이지 로드 및 스타일 확인

**Phase 6** (선택사항):
- [ ] `app/career/page.tsx` 또는 홈 섹션 추가
- [ ] 타임라인 렌더링 확인

**Phase 7**:
- [ ] `npm run build` 성공
- [ ] `npm start` → 프로덕션 환경 테스트
- [ ] Vercel 배포 및 환경변수 설정
- [ ] 배포된 사이트 접속 확인
- [ ] ISR 갱신 주기 로깅 확인

### 배포 후 체크리스트

- [ ] 모든 페이지 접속 확인
- [ ] Notion 데이터 수정 후 ISR 갱신 확인 (1시간 또는 수동 배포)
- [ ] 이미지 로드 확인 (Notion 파일 CDN)
- [ ] 링크 동작 확인 (GitHub, Demo)
- [ ] 모바일 반응형 확인

---

## FAQ & 트러블슈팅

### Q1: "NOTION_API_KEY is not defined" 에러

**원인**: `.env.local` 파일을 생성하지 않았거나, 파일이 올바른 위치에 없음

**해결**:
```bash
# 프로젝트 루트에 .env.local 생성 확인
ls -la /home/psy/Desktop/workspace/course/portfolio/.env.local

# 없으면 생성
cat > .env.local << 'EOF'
NOTION_API_KEY=secret_xxx...
...
EOF

# 개발 서버 재시작
npm run dev
```

### Q2: "Database not found" 또는 "Unauthorized"

**원인**: 
1. Database ID 잘못 입력
2. Integration이 Database에 공유되지 않음

**해결**:
1. [notion.so/my-integrations](https://notion.so/my-integrations)에서 Integration 확인
2. 각 Database 공유 설정 확인 (오른쪽 상단 "Add connections")
3. Database ID 다시 확인 (URL에서)

### Q3: "Notion 데이터 변경이 1시간 후에도 반영 안 됨"

**원인**: 개발 환경(`next dev`)에서는 ISR이 동작하지 않음 (매번 새로 페칭하도록 설계)

**확인**:
```bash
# 프로덕션 모드 시뮬레이션
npm run build
npm start
# http://localhost:3000 접속
# 데이터 변경 후 1시간 대기 또는 재배포 (재빌드)
```

### Q4: 이미지가 로드되지 않음

**원인**: Notion Files CDN URL이 일시적으로 만료되었을 수 있음

**해결**: ISR 재갱신으로 새 URL 생성
```bash
# Vercel 대시보드에서 Manual Redeploy 클릭
# 또는 nextjs에서 `revalidatePath` 사용 (API 라우트 활용)
```

---

## 마무리

이 PRD는 Notion을 CMS로 활용한 **개인 포트폴리오 사이트** 구현의 모든 단계를 다룹니다. 각 단계는 독립적으로 진행 가능하며, 기존 코드베이스의 패턴(cn(), Badge, Card, logger 등)을 최대한 재사용합니다.

**핵심 원칙**:
- ✅ 타입 안전성 (TypeScript + Zod)
- ✅ 에러 처리 (logger 연동, fallback)
- ✅ 성능 (ISR, 정적 렌더링)
- ✅ 유지보수성 (Notion 관리, 코드 간결)

배포 후 1시간마다 자동으로 Notion 데이터를 확인하고 변경사항을 반영합니다.

**문의 및 추가**: 각 단계별로 발생하는 구체적 이슈는 `lib/logger.ts`의 로그 메시지를 통해 진단할 수 있습니다.
