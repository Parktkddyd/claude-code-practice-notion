# Shrimp 작업 관리 규칙 (Project Rules)

**최종 업데이트**: 2026-06-28  
**기반 문서**: CLAUDE.md, docs/PRD.md, docs/ROADMAP.md  
**프로젝트 상태**: Phase 1 개발팀 완료, Phase 2~4 진행 예정

---

## 프로젝트 개요

**프로젝트명**: Notion DB 기반 개인 포트폴리오 웹 애플리케이션  
**기술 스택**: Next.js 16 + React 19 + TypeScript + Tailwind CSS + shadcn/ui  
**데이터 소스**: Notion API (@notionhq/client v5.22.0)  
**배포 전략**: ISR (Incremental Static Regeneration, 1시간 주기)  
**전체 예상 기간**: ~27시간 (Phase 1~4 누적)

### 현재 상태 (2026-06-28)

- ✅ **Phase 1 (개발팀)**: 완료
  - ✅ `@notionhq/client` 설치
  - ✅ `lib/env.ts` Zod 검증 스키마
  - ✅ **`lib/notion.ts` 완성** (6개 함수: getProjects, getProjectBySlug, getCareers, getSkills, getProjectNeighbors, getProjectCount)
  - ✅ `.env.local.example` 템플릿
  - ✅ `components/portfolio/` 디렉토리 생성
  - ✅ `app/layout.tsx` + `components/layout/header.tsx` 정합성 확인

- ✅ **Phase 1 (사용자)**: 완료
  - ✅ Notion DB 3개 생성 + 프로퍼티 설정
  - ✅ Notion Integration 생성 + API 키 획득
  - ✅ `.env.local` 파일 작성 및 값 입력
  - ✅ `npm run dev` 확인 (정상 구동)

- 🔄 **Phase 2~4**: Shrimp 9개 Pending 작업 진행 예정 (Task 2 완료)

---

## Shrimp 작업 구조

### 전체 작업 목록 (10개 Pending)

```
Phase 1 (완료) ───────────────────────────────
  ✅ lib/notion.ts (6개 함수)
  ✅ lib/env.ts
  ✅ .env.local.example
  ✅ components/portfolio/ 디렉토리
  ✅ app/layout.tsx + components/layout/header.tsx 정합성
  ✅ 사용자: Notion DB 생성 + .env.local 작성

Phase 2 (컴포넌트) ────────────────────────────
  📌 Task 1️⃣ : next.config.ts 이미지 도메인 등록
  ✅ Task 2️⃣ : lib/notion.ts 완료 (6개 함수)
  📌 Task 3️⃣ : TechStackBadges, SkillBadge (기초)
  📌 Task 4️⃣ : ProjectCard, CareerItem (카드)
  📌 Task 5️⃣ : SkillCategory, SkillsGrid, CareerTimeline (그룹)
  📌 Task 6️⃣ : ProjectDetail, ProjectNavigation (상세)

Phase 3 (페이지) ──────────────────────────────
  📌 Task 7️⃣ : app/projects/page.tsx + app/projects/[slug]/page.tsx
  📌 Task 8️⃣ : app/career/page.tsx
  📌 Task 9️⃣ : app/page.tsx 수정 (Featured + Skills)

Phase 4 (검증) ────────────────────────────────
  📌 Task 🔟 : 빌드/린트 검증 + 사용자 안내
```

---

## Shrimp 작업별 실행 규칙

### 📌 Task 1️⃣: next.config.ts 이미지 도메인 등록 및 헤더 정합성 확인

**작업 ID**: 722fdccd-d18c-466f-8047-6354279697d0  
**상태**: ⬜ 대기 (바로 시작 가능 - 선행 작업 없음)  
**예상 시간**: 1시간  
**의존성**: 없음 (선행 작업 아님)

#### 실행 단계

1. **next.config.ts 수정** — Notion 파일 CDN 도메인 추가:
   ```typescript
   // next.config.ts
   import type { NextConfig } from 'next'
   
   const nextConfig: NextConfig = {
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
     },
   }
   
   export default nextConfig
   ```

2. **components/layout/header.tsx 확인** — NAV_ITEMS 정합성:
   ```typescript
   const NAV_ITEMS = [
     { href: "/", label: "홈" },           // ✅ 확인됨
     { href: "/projects", label: "프로젝트" },  // ✅ 확인됨
     { href: "/career", label: "경력" },   // ✅ 확인됨
   ]
   ```
   ➜ Phase 3에서 생성될 라우트와 일치 확인 → 수정 불필요

#### 완료 기준

- [ ] `next.config.ts`의 images.remotePatterns 설정 완료
- [ ] `npm run build` 성공 (이미지 도메인 검증)
- [ ] `npm run dev` → 콘솔 에러 없음
- [ ] 스타일 가이드 준수 (두 줄 이상의 설정은 주석 추가)

#### 체크사항

- 변경 파일: `next.config.ts`만 수정
- 헤더: 수정 불필요 (확인만)
- 커밋 메시지: "config: next.config.ts Notion 파일 CDN remotePatterns 등록"

---

### ✅ Task 2️⃣: lib/notion.ts 데이터 레이어 구현 (완료)

**작업 ID**: 877e558d-9165-4ea7-a69a-27ef9dec72cd  
**상태**: ✅ 완료  
**완료일**: 2026-06-28  
**소요 시간**: ~3-4시간

#### 완료 내용

- ✅ 6개 export 함수 완성
  - `getProjects(options?)`: 프로젝트 배열 조회 (필터: status, featured / 정렬: Order, CreatedAt)
  - `getProjectBySlug(slug)`: 단일 프로젝트 조회 또는 null
  - `getProjectNeighbors(slug)`: 이전/다음 프로젝트 조회 (상세 페이지 네비게이션용)
  - `getCareers(options?)`: 경력 배열 조회 (정렬: StartDate, Order)
  - `getSkills(options?)`: 스킬 배열 조회 (필터: category, minProficiency / 정렬: Category, Proficiency, Order)
  - `getProjectCount(options?)`: 프로젝트 총 개수 (페이지네이션용)

- ✅ Zod 스키마 + 타입 정의
  - ProjectSchema, CareerSchema, SkillSchema
  - `type Project = z.infer<typeof ProjectSchema>` 등으로 타입 추출

- ✅ Notion Client 캐싱 (싱글톤 패턴)
  - 한 번만 초기화, 재사용

- ✅ 필터/정렬 빌더
  - `buildProjectFilter()`, `buildCareerFilter()`, `buildSkillFilter()`, `buildSorts()`
  - Notion API 형식에 맞춰 변환

- ✅ 프로퍼티 접근 헬퍼
  - getTitle(), getRichText(), getSelect(), getMultiSelect(), getCheckbox(), getNumber(), getUrl(), getFileUrl(), getDate()

- ✅ 페이지 매핑 함수
  - mapPageToProject(), mapPageToCareer(), mapPageToSkill()
  - Zod safeParse 검증 + logger.warn 연동

- ✅ 에러 처리
  - 실패 시 logger.error() + 빈 배열/null 반환 (사이트 다운 방지)

---

### 📌 Task 3️⃣: TechStackBadges, SkillBadge 기초 컴포넌트

**작업 ID**: 885a975c-8a36-434f-b9e4-1cbf635c757b  
**상태**: ⬜ 대기 (Task 1 완료 후 시작)  
**예상 시간**: 1시간  
**의존성**: Task 1 완료 필요

#### 생성 파일

- `components/portfolio/TechStackBadges.tsx`
- `components/portfolio/SkillBadge.tsx`

#### 의존성
- Task 1 완료: `next.config.ts` 이미지 도메인 설정 (필수는 아니지만 권장)
- Task 2: ✅ 이미 완료 (lib/notion.ts - Skill 타입 임포트용)

#### 구현 요구사항

**TechStackBadges**:
```typescript
import { Badge } from '@/components/ui/badge'

interface TechStackBadgesProps {
  techStack: string[]
}

/**
 * 기술 스택 문자열 배열을 뱃지로 표시
 */
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
```

**SkillBadge**:
```typescript
import type { Skill } from '@/lib/notion'
import { Badge } from '@/components/ui/badge'

interface SkillBadgeProps {
  skill: Skill
}

/**
 * 단일 스킬 항목 (이름 + 숙련도 시각화)
 */
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

#### 완료 기준

- [ ] 두 파일 모두 TypeScript strict mode 통과
- [ ] Props 인터페이스 명시
- [ ] `@/lib/notion`에서 Skill 타입 임포트 (SkillBadge만)
- [ ] `@/components/ui/badge` 재사용
- [ ] `npm run lint` 통과

#### 체크사항

- 파일 생성: 2개 (components/portfolio/)
- 파일명: PascalCase
- 임포트 경로: 경로 alias (@/) 사용
- 카테고리는 이 컴포넌트에서 표시 안 함 (Task 4에서 SkillCategory)

---

### 📌 Task 4️⃣: ProjectCard, CareerItem 카드 컴포넌트

**작업 ID**: 419fa247-2dab-4289-9d43-01ec2b53bedd  
**상태**: ⬜ 대기 (Task 3 완료 후)  
**예상 시간**: 2시간  
**의존성**: Task 3 (TechStackBadges) 완료 필요

#### 생성 파일

- `components/portfolio/ProjectCard.tsx`
- `components/portfolio/CareerItem.tsx`

#### 구현 요구사항

**ProjectCard**:
```typescript
'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Project } from '@/lib/notion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TechStackBadges } from './TechStackBadges'

interface ProjectCardProps {
  project: Project
}

/**
 * 프로젝트 목록용 카드 컴포넌트
 * 썸네일, 제목, 설명, 기술 스택을 표시하고 상세 페이지로 링크
 */
export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.slug}`}>
      <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        {project.thumbnailUrl && (
          <div className="relative w-full h-48 overflow-hidden rounded-t-lg bg-muted">
            <Image
              src={project.thumbnailUrl}
              alt={project.name}
              fill
              className="object-cover"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="line-clamp-2">{project.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
            {project.description}
          </p>
          <TechStackBadges techStack={project.techStack} />
        </CardContent>
      </Card>
    </Link>
  )
}
```

**CareerItem**:
```typescript
import type { Career } from '@/lib/notion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CareerItemProps {
  career: Career
}

/**
 * 경력 항목 (회사, 직급, 기간, 설명)
 */
export function CareerItem({ career }: CareerItemProps) {
  const startDate = career.startDate.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
  })
  
  const endDate = career.endDate
    ? career.endDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit' })
    : '현재'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{career.company}</CardTitle>
        <p className="text-sm text-muted-foreground">{career.role}</p>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-2">
          {startDate} ~ {endDate}
        </p>
        <p className="text-sm whitespace-pre-wrap">{career.description}</p>
      </CardContent>
    </Card>
  )
}
```

#### 완료 기준

- [ ] ProjectCard: `'use client'` 명시 (Link 사용)
- [ ] ProjectCard: next/image remotePatterns 활용 (next.config.ts 설정 완료 필수)
- [ ] ProjectCard: TechStackBadges 임포트 및 렌더링
- [ ] CareerItem: 날짜 포맷 (YYYY.MM)
- [ ] CareerItem: endDate === null일 때 "현재" 표시
- [ ] 두 컴포넌트 모두 Props 타입 명시
- [ ] `npm run lint` 통과

#### 체크사항

- 의존성: Task 3 (TechStackBadges) 완료 필수
- ProjectCard는 클라이언트 컴포넌트 ("use client")
- CareerItem은 서버 컴포넌트 가능 (상호작용 없음)
- 이미지 로드 설정: next.config.ts Task 1 완료 필수
- 호버 효과: ProjectCard만 (링크 동작)

---

### 📌 Task 5️⃣: 그룹 컴포넌트 (SkillCategory, SkillsGrid, CareerTimeline)

**작업 ID**: 6ba097e4-29eb-4a31-a83d-c9df2e8b1e47  
**상태**: ⬜ 대기 (Task 3, 4 완료 후)  
**예상 시간**: 2시간  
**의존성**: Task 3 (SkillBadge), Task 4 (CareerItem) 완료 필수

#### 생성 파일

- `components/portfolio/SkillCategory.tsx`
- `components/portfolio/SkillsGrid.tsx`
- `components/portfolio/CareerTimeline.tsx`

#### 구현 요구사항

**SkillCategory** (한 카테고리의 스킬 그룹):
```typescript
import type { Skill } from '@/lib/notion'
import { SkillBadge } from './SkillBadge'

interface SkillCategoryProps {
  category: string
  skills: Skill[]
}

/**
 * 한 카테고리에 속한 스킬들을 뱃지로 표시
 */
export function SkillCategory({ category, skills }: SkillCategoryProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3">{category}</h3>
      <div className="flex flex-wrap gap-2">
        {skills.map(skill => (
          <SkillBadge key={skill.id} skill={skill} />
        ))}
      </div>
    </div>
  )
}
```

**SkillsGrid** (카테고리별 그리드):
```typescript
import type { Skill } from '@/lib/notion'
import { SkillCategory } from './SkillCategory'

interface SkillsGridProps {
  skills: Skill[]
}

/**
 * 스킬을 category로 그룹화하여 그리드로 표시
 */
export function SkillsGrid({ skills }: SkillsGridProps) {
  // category로 그룹화
  const grouped = skills.reduce<Record<string, Skill[]>>((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = []
    }
    acc[skill.category].push(skill)
    return acc
  }, {})

  // 카테고리 정렬 (ABC 순)
  const sortedCategories = Object.keys(grouped).sort()

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {sortedCategories.map(category => (
        <SkillCategory
          key={category}
          category={category}
          skills={grouped[category]}
        />
      ))}
    </div>
  )
}
```

**CareerTimeline** (경력 타임라인):
```typescript
import type { Career } from '@/lib/notion'
import { CareerItem } from './CareerItem'

interface CareerTimelineProps {
  careers: Career[]
}

/**
 * 경력 배열을 타임라인으로 렌더링
 * 입력은 이미 정렬되어 있다고 가정 (lib/notion.ts에서 정렬)
 */
export function CareerTimeline({ careers }: CareerTimelineProps) {
  return (
    <div className="space-y-6">
      {careers.map(career => (
        <CareerItem key={career.id} career={career} />
      ))}
    </div>
  )
}
```

#### 완료 기준

- [ ] SkillCategory: category 문자열과 Skill[] 렌더링
- [ ] SkillsGrid: category로 그룹화 + ABC 순 정렬
- [ ] SkillsGrid: 반응형 그리드 (2열)
- [ ] CareerTimeline: 배열 그대로 렌더링 (정렬은 lib/notion.ts에서)
- [ ] 세 컴포넌트 모두 Props 타입 명시
- [ ] `npm run lint` 통과

#### 체크사항

- 정렬 로직: lib/notion.ts의 getCareers에서 담당 (컴포넌트는 렌더링만)
- 그룹화: SkillsGrid에서만 수행
- 의존성: Task 3 (SkillBadge), Task 4 (CareerItem)
- 타임라인 시각 요소 (선, 점): 선택사항 (필수 아님)

---

### 📌 Task 6️⃣: 상세 컴포넌트 (ProjectDetail, ProjectNavigation)

**작업 ID**: 6e8711c5-1d77-48a6-bb0a-07e9fad9347c  
**상태**: ⬜ 대기 (Task 4 완료 후)  
**예상 시간**: 1.5시간  
**의존성**: Task 4 (ProjectCard) 완료 필수

#### 생성 파일

- `components/portfolio/ProjectDetail.tsx`
- `components/portfolio/ProjectNavigation.tsx`

#### 구현 요구사항

**ProjectDetail** (프로젝트 상세 정보):
```typescript
import Image from 'next/image'
import type { Project } from '@/lib/notion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { TechStackBadges } from './TechStackBadges'

interface ProjectDetailProps {
  project: Project
}

/**
 * 프로젝트 상세 정보 표시 (큰 썸네일, 설명, 기술 스택, 링크)
 */
export function ProjectDetail({ project }: ProjectDetailProps) {
  return (
    <div className="space-y-6">
      {project.thumbnailUrl && (
        <div className="relative w-full h-96 rounded-lg overflow-hidden bg-muted">
          <Image
            src={project.thumbnailUrl}
            alt={project.name}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      <div>
        <h1 className="text-4xl font-bold mb-4">{project.name}</h1>
        <p className="text-lg text-muted-foreground whitespace-pre-wrap mb-6">
          {project.description}
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">기술 스택</h3>
              <TechStackBadges techStack={project.techStack} />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>생성일: {project.createdAt.toLocaleDateString('ko-KR')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {(project.githubUrl || project.demoUrl) && (
        <div className="flex gap-3">
          {project.githubUrl && (
            <Button asChild>
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </Button>
          )}
          {project.demoUrl && (
            <Button asChild variant="outline">
              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                Demo
              </a>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
```

**ProjectNavigation** (이전/다음 링크):
```typescript
import Link from 'next/link'
import type { Project } from '@/lib/notion'
import { Button } from '@/components/ui/button'

interface ProjectNavigationProps {
  prev: Project | null
  next: Project | null
}

/**
 * 프로젝트 상세 페이지의 네비게이션
 * "모든 프로젝트로" + 이전/다음 링크
 */
export function ProjectNavigation({ prev, next }: ProjectNavigationProps) {
  return (
    <div className="mt-12 border-t pt-8 space-y-4">
      <div>
        <Button asChild variant="outline">
          <Link href="/projects">← 모든 프로젝트로</Link>
        </Button>
      </div>

      <div className="flex gap-4 justify-between">
        {prev ? (
          <Button asChild variant="ghost">
            <Link href={`/projects/${prev.slug}`}>
              ← Previous: {prev.name}
            </Link>
          </Button>
        ) : (
          <div />
        )}

        {next ? (
          <Button asChild variant="ghost">
            <Link href={`/projects/${next.slug}`}>
              Next: {next.name} →
            </Link>
          </Button>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}
```

#### 완료 기준

- [ ] ProjectDetail: 썸네일, 제목, 설명, 기술 스택 표시
- [ ] ProjectDetail: GitHub/Demo 버튼 (있을 경우만)
- [ ] ProjectDetail: 생성일 포맷 (YYYY.MM.DD)
- [ ] ProjectNavigation: "모든 프로젝트로" 버튼
- [ ] ProjectNavigation: 이전/다음 링크 (null일 때 비활성화)
- [ ] 두 컴포넌트 모두 Props 타입 명시
- [ ] `npm run lint` 통과

#### 체크사항

- 이전/다음 계산: lib/notion.ts의 getProjectNeighbors(slug)에서 담당
- 페이지 파일: findIndex 등 계산 로직 금지 (Phase 2/3 책임 분리)
- 외부 링크: target="_blank" + rel="noopener noreferrer" 필수
- 이미지: priority prop 사용 (LCP 최적화)

---

### 📌 Task 7️⃣: 프로젝트 페이지 (app/projects/* 라우트)

**작업 ID**: 3ed85412-5607-4e14-b2f2-da314da71e59  
**상태**: ⬜ 대기 (Task 6 완료 후)  
**예상 시간**: 2~3시간  
**의존성**: Task 6 (ProjectDetail, ProjectNavigation) 완료 필수

#### 생성 파일

- `app/projects/page.tsx` — 프로젝트 목록
- `app/projects/[slug]/page.tsx` — 프로젝트 상세

#### 구현 요구사항

**app/projects/page.tsx**:
```typescript
import { getProjects } from '@/lib/notion'
import { ProjectCard } from '@/components/portfolio/ProjectCard'
import { logger } from '@/lib/logger'

export const revalidate = 3600
export const metadata = {
  title: 'Projects',
  description: 'All my portfolio projects',
}

export default async function ProjectsPage() {
  try {
    const projects = await getProjects({ status: 'Active', orderBy: 'Order' })

    return (
      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-4xl font-bold mb-12">프로젝트</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length > 0 ? (
            projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))
          ) : (
            <p className="col-span-full text-center text-muted-foreground">
              활성 프로젝트가 없습니다.
            </p>
          )}
        </div>
      </main>
    )
  } catch (error) {
    logger.error('Failed to load projects page', error)
    return <div>프로젝트를 불러올 수 없습니다.</div>
  }
}
```

**app/projects/[slug]/page.tsx** (Next.js 16 동적 라우트):
```typescript
import type { Metadata } from 'next'
import { getProjectBySlug, getProjectNeighbors, getProjects } from '@/lib/notion'
import { notFound } from 'next/navigation'
import { logger } from '@/lib/logger'
import { ProjectDetail } from '@/components/portfolio/ProjectDetail'
import { ProjectNavigation } from '@/components/portfolio/ProjectNavigation'

export const revalidate = 3600

export async function generateStaticParams() {
  try {
    const projects = await getProjects()
    return projects.map(p => ({ slug: p.slug }))
  } catch (error) {
    logger.error('Failed to generate static params for projects', error)
    return []
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await getProjectBySlug(slug)

  if (!project) {
    return { title: 'Project Not Found' }
  }

  return {
    title: project.name,
    description: project.description,
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  try {
    const project = await getProjectBySlug(slug)

    if (!project) {
      notFound()
    }

    const neighbors = await getProjectNeighbors(slug)

    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <ProjectDetail project={project} />
        <ProjectNavigation prev={neighbors.prev} next={neighbors.next} />
      </main>
    )
  } catch (error) {
    logger.error(`Failed to load project [${slug}]`, error)
    notFound()
  }
}
```

#### 완료 기준

- [ ] `app/projects/page.tsx` 완성
- [ ] `app/projects/[slug]/page.tsx` 완성
- [ ] `generateStaticParams()` 구현 (모든 프로젝트 slug 사전 렌더링)
- [ ] `generateMetadata()` 구현 (동적 메타데이터)
- [ ] `await params` 사용 (Next.js 16 패턴)
- [ ] `revalidate = 3600` 설정 (ISR)
- [ ] `notFound()` 호출 (404 처리)
- [ ] `npm run build` 성공

#### 체크사항

- 의존성: Task 5 (ProjectDetail, ProjectNavigation) 완료 필수
- params: Promise<{ slug: string }> 타입 명시
- 에러 처리: logger 사용
- 프로젝트 없음: empty state 표시

---

### 📌 Task 8️⃣: 경력 타임라인 페이지 (app/career/page.tsx)

**작업 ID**: 58ef3847-863e-4710-95ae-8878f376a260  
**상태**: ⬜ 대기 (Task 5 완료 후)  
**예상 시간**: 1.5시간  
**의존성**: Task 5 (CareerTimeline) 완료 필수

#### 생성 파일

- `app/career/page.tsx`

#### 구현 코드

```typescript
import { getCareers } from '@/lib/notion'
import { CareerTimeline } from '@/components/portfolio/CareerTimeline'
import { logger } from '@/lib/logger'

export const revalidate = 3600
export const metadata = {
  title: 'Career',
  description: 'My career history',
}

export default async function CareerPage() {
  try {
    const careers = await getCareers({
      orderBy: 'StartDate',
      ascending: false, // 최신순
    })

    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-4xl font-bold mb-12">경력</h1>
        {careers.length > 0 ? (
          <CareerTimeline careers={careers} />
        ) : (
          <p className="text-center text-muted-foreground">
            경력 정보가 없습니다.
          </p>
        )}
      </main>
    )
  } catch (error) {
    logger.error('Failed to load career page', error)
    return <div>경력을 불러올 수 없습니다.</div>
  }
}
```

#### 완료 기준

- [ ] `app/career/page.tsx` 완성
- [ ] `revalidate = 3600` 설정 (ISR)
- [ ] `export const metadata` 설정
- [ ] 에러 처리 (logger + fallback UI)
- [ ] 경력 없음: empty state 표시
- [ ] `npm run build` 성공

#### 체크사항

- 의존성: Task 5 (CareerTimeline) 완료 필수
- 정렬: lib/notion.ts getCareers에서 담당 (ascending: false)
- empty state: 선택사항 (있으면 좋음)

---

### 📌 Task 9️⃣: 홈페이지 수정 (app/page.tsx — Featured + Skills)

**작업 ID**: f108f06f-9cc9-47ff-a304-0a7a121f102f  
**상태**: ⬜ 대기 (Task 7 완료 후)  
**예상 시간**: 2시간  
**의존성**: Task 7 (프로젝트 페이지) 완료 필수

#### 수정 파일

- `app/page.tsx` (기존 추가 수정)

#### 구현 코드

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
    // Promise.all로 병렬 페칭
    const [featuredProjects, skills] = await Promise.all([
      getProjects({ featured: true, limit: 5 }),
      getSkills({ minProficiency: 8 }),
    ])

    return (
      <main>
        {/* Hero 섹션 (기존 유지) */}
        <section className="mx-auto max-w-5xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            안녕하세요 👋
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Notion을 CMS로 활용한 개인 포트폴리오 사이트입니다.
          </p>
        </section>

        {/* Featured 프로젝트 섹션 */}
        <section className="mx-auto max-w-6xl px-4 py-20">
          <h2 className="text-3xl font-bold mb-8">주요 프로젝트</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredProjects.length > 0 ? (
              featuredProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground">
                주요 프로젝트가 없습니다.
              </p>
            )}
          </div>
          <div className="text-center">
            <Button asChild>
              <Link href="/projects">모든 프로젝트 보기 →</Link>
            </Button>
          </div>
        </section>

        {/* 기술 스택 섹션 */}
        <section className="mx-auto max-w-6xl px-4 py-20 bg-muted/50 rounded-lg">
          <h2 className="text-3xl font-bold mb-8">기술 스택</h2>
          {skills.length > 0 ? (
            <SkillsGrid skills={skills} />
          ) : (
            <p className="text-center text-muted-foreground">
              기술 스택 정보가 없습니다.
            </p>
          )}
        </section>
      </main>
    )
  } catch (error) {
    logger.error('Failed to load homepage', error)
    return (
      <main className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h1 className="text-4xl font-bold">안녕하세요 👋</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          데이터를 불러올 수 없습니다.
        </p>
      </main>
    )
  }
}
```

#### 완료 기준

- [ ] `app/page.tsx` 수정 완료
- [ ] Hero 섹션 유지 (기존 코드)
- [ ] Featured 프로젝트 섹션 추가 (featured=true, limit=5)
- [ ] 기술 스택 섹션 추가 (minProficiency >= 8)
- [ ] `Promise.all()` 병렬 페칭으로 성능 최적화
- [ ] `revalidate = 3600` 설정 (ISR)
- [ ] 데이터 없음: empty state 표시
- [ ] `npm run build` 성공

#### 체크사항

- 의존성: Task 7 (프로젝트 페이지) 완료 필수
- 필터: featured=true, minProficiency >= 8
- 성능: Promise.all() 사용
- 에러 처리: logger + fallback UI
- CTA 버튼: "모든 프로젝트 보기"

---

### 📌 Task 🔟: 빌드/린트 검증 및 사용자 액션 안내

**작업 ID**: 94737d79-c788-409d-afac-501d65c8add5  
**상태**: ⬜ 대기 (Task 9 완료 후)  
**예상 시간**: 1시간  
**의존성**: Task 9 (홈페이지) 완료 필수

#### 실행 단계

1. **프로덕션 빌드 검증**:
   ```bash
   npm run build
   # 확인:
   # - 빌드 에러 없음
   # - generateStaticParams 모든 slug 처리
   # - 빌드 시간 < 2분
   ```

2. **린트 검증**:
   ```bash
   npm run lint
   # 확인:
   # - camelCase/PascalCase/snake_case 준수
   # - import 경로 alias 사용
   # - console.log 없음 (logger 사용)
   # - 모든 함수 반환 타입 명시
   ```

3. **프로덕션 모드 테스트**:
   ```bash
   npm start
   # http://localhost:3000에서 각 페이지 테스트:
   ```

4. **기능 검증 체크리스트**:
   - [ ] `/` (홈) → Hero + Featured 프로젝트 + 기술 스택
   - [ ] `/projects` → 활성 프로젝트 그리드 (3열)
   - [ ] `/projects/[slug]` (실제 slug) → 상세 정보 + 이전/다음 네비게이션
   - [ ] `/projects/nonexistent` → 404 페이지
   - [ ] `/career` → 경력 타임라인
   - [ ] 모든 이미지 로드 정상 (Notion 썸네일)
   - [ ] 모든 링크 클릭 정상 (GitHub, Demo, 네비게이션)
   - [ ] 헤더 네비게이션 3개 모두 작동 (/, /projects, /career)

5. **사용자 액션 안내** (문서 또는 주석으로 제공):
   - Vercel 배포 절차
   - 환경변수 설정 (Vercel 대시보드)
   - ISR 갱신 확인 방법
   - 트러블슈팅 (이미지 미로드, 데이터 미표시 등)

#### 완료 기준

- [ ] `npm run build` 성공 (에러 없음, 시간 < 2분)
- [ ] `npm run lint` 통과 (스타일 가이드 준수)
- [ ] `npm start` → 프로덕션 모드 모든 페이지 정상 작동
- [ ] 기능 검증 체크리스트 모두 완료
- [ ] 사용자 배포 안내 문서 작성/제공

#### 체크사항

- 의존성: Task 9 (홈페이지) 완료 필수
- 빌드: 정적 생성 (ISR) 확인
- 테스트: 실제 프로덕션 환경 (npm start)
- 사용자 안내: 명확하고 단계별로 작성

---

## 실행 흐름 (Execution Flow)

### 순차 진행 (Sequential)

```
Phase 1 (완료) ✅
    ↓
Phase 1 사용자 액션 ⬜ (Notion DB 생성 + .env.local 작성)
    ↓
Task 1️⃣ (next.config.ts)
    ↓
Task 2️⃣ (lib/notion.ts) ✅ DONE
    ↓
Task 3️⃣ (TechStackBadges, SkillBadge)
    ↓
Task 4️⃣ (ProjectCard, CareerItem)
    ↓
Task 5️⃣ (그룹 컴포넌트) & Task 6️⃣ (상세 컴포넌트) — 병렬 가능
    ↓
Task 7️⃣ (프로젝트 페이지)
    ↓
Task 8️⃣ (경력 페이지) & Task 9️⃣ (홈페이지) — 병렬 가능
    ↓
Task 🔟 (검증 + 사용자 안내)
    ↓
Vercel 배포 (사용자)
```

### 병렬 진행 가능 조건

- **Task 5 & 6**: Task 3, 4 완료 후 병렬 진행 가능
  - Task 5는 SkillBadge (Task 3) + CareerItem (Task 4) 의존
  - Task 6은 ProjectCard (Task 4) 의존
  - 공통 의존성 없으므로 병렬 진행 가능

- **Task 8 & 9**: Task 7 완료 후 병렬 진행 가능
  - Task 8은 CareerTimeline (Task 5) 의존
  - Task 9는 ProjectCard (Task 4), SkillsGrid (Task 5) 의존
  - 모두 Task 7 이전에 완료되므로 Task 7 완료 후 병렬 가능

---

## 코딩 표준 (Code Standards)

### 파일 명명

- **컴포넌트**: `PascalCase.tsx`
  - ✅ `ProjectCard.tsx`, `TechStackBadges.tsx`
  - ❌ `projectCard.tsx`, `tech-stack-badges.tsx`

- **유틸리티**: `kebab-case.ts`
  - ✅ `notion.ts`, `logger.ts`
  - ❌ `NotionAPI.ts`

- **페이지**: 라우트 구조에 따름
  - ✅ `app/page.tsx`, `app/projects/page.tsx`, `app/projects/[slug]/page.tsx`

### 임포트 경로

- **필수 alias 사용**:
  - ✅ `import { getProjects } from '@/lib/notion'`
  - ✅ `import { ProjectCard } from '@/components/portfolio/ProjectCard'`
  - ❌ `import { getProjects } from '../../lib/notion'`

### 컴포넌트 Props

```typescript
interface ComponentNameProps {
  // props 정의
}

export function ComponentName(props: ComponentNameProps) {
  // 구현
}
```

**필수사항**:
- Props 인터페이스 명시
- 반환 타입 (JSX.Element 또는 명확한 React.ReactNode)
- JSDoc 주석 (간단한 설명 1~2줄)

### 에러 처리

```typescript
try {
  const data = await fetchData()
  return <Component data={data} />
} catch (error) {
  logger.error('Context: Failed to fetch', error)
  return <FallbackUI />
}
```

**필수사항**:
- `logger.error()` 사용 (console.log 금지)
- fallback UI 제공 (빈 배열, null, 에러 메시지)
- 사이트 중단 방지

### Notion API 접근

```typescript
// ✅ 올바른 방법
const projects = await getProjects({ featured: true })

// ❌ 금지
const response = await notionClient.databases.query(...)
// 직접 호출 금지 — lib/notion.ts 함수만 사용
```

---

## 종료 조건 (Exit Criteria)

### Phase 2 완료

```
✅ Task 1 완료: next.config.ts 이미지 도메인 설정
✅ Task 2 완료: lib/notion.ts 데이터 레이어 (6개 함수)
✅ Task 3 완료: TechStackBadges, SkillBadge 컴포넌트
✅ Task 4 완료: ProjectCard, CareerItem 카드 컴포넌트
✅ Task 5 완료: SkillCategory, SkillsGrid, CareerTimeline 그룹 컴포넌트
✅ Task 6 완료: ProjectDetail, ProjectNavigation 상세 컴포넌트
✅ npm run build 성공
✅ npm run lint 통과
✅ 모든 컴포넌트 TypeScript strict mode 통과
✅ 스타일 가이드 준수
```

### Phase 3 완료

```
✅ Task 7 완료: app/projects/page.tsx + app/projects/[slug]/page.tsx
✅ Task 8 완료: app/career/page.tsx
✅ Task 9 완료: app/page.tsx 수정 (Featured + Skills)
✅ npm run build 성공 (정적 매개변수 생성)
✅ 모든 라우트에 revalidate = 3600 설정
✅ 모든 페이지 메타데이터 설정
✅ 네비게이션 작동 확인
```

### Phase 4 완료

```
✅ Task 10 완료: 빌드/린트 검증 + 사용자 안내
✅ npm run build 성공
✅ npm run lint 통과
✅ npm start 프로덕션 모드 테스트 완료
✅ 기능 검증 체크리스트 모두 완료
✅ 사용자 배포 안내 문서 제공
```

### 전체 프로젝트 완료

```
✅ 모든 Phase 완료
✅ Vercel 배포 완료 (사용자)
✅ ISR 갱신 테스트 완료
✅ 🎉 프로젝트 배포 완료
```

---

## 참고 문서

- **CLAUDE.md**: 프로젝트 구조 및 기술 스택
- **docs/PRD.md**: 완전한 제품 요구사항 명세
- **docs/ROADMAP.md**: 구현 로드맵 및 일정
- **lib/notion.ts**: Notion API 데이터 레이어 (✅ 완료)
- **lib/env.ts**: 환경변수 검증 (✅ 완료)
- **lib/logger.ts**: 로깅 유틸리티

---

**마지막 업데이트**: 2026-06-28  
**현재 진행**: Phase 1 개발팀 ✅ 완료 / Phase 1 사용자 액션 ⬜ 대기 중  
**다음 액션**: 
1. 사용자: Phase 1 액션 (Notion DB 생성 + .env.local 작성)
2. 개발팀: Task 1️⃣ (next.config.ts 이미지 도메인) 시작 가능
