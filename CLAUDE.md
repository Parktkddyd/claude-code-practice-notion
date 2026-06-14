# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Next.js 16 + React 19 기반의 인보이스 웹 애플리케이션 스타터킷입니다. shadcn/ui 컴포넌트와 React Hook Form + Zod를 통한 폼 유효성 검사를 활용합니다.

## 개발 환경 및 명령어

### 개발 서버 실행
```bash
npm run dev
```
[http://localhost:3000](http://localhost:3000)에서 확인 가능

### 빌드 및 배포
```bash
npm run build    # 프로덕션 빌드
npm start        # 프로덕션 서버 실행
```

### 코드 품질
```bash
npm run lint     # ESLint 검사
```

## 프로젝트 구조

### 디렉토리 구성

```
├── app/                          # Next.js App Router
│   ├── page.tsx                 # 홈 페이지 (스타터킷 쇼케이스)
│   ├── layout.tsx               # 루트 레이아웃
│   ├── examples/                # 컴포넌트 예제 페이지들
│   │   ├── button/
│   │   ├── card/
│   │   ├── input/
│   │   ├── badge/
│   │   └── forms/login/
│   ├── register/                # 회원가입 데모 페이지
│   └── globals.css              # 글로벌 스타일 (Tailwind CSS)
│
├── components/                  # React 컴포넌트
│   ├── ui/                      # shadcn/ui 컴포넌트 (기본 UI 블록)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── badge.tsx
│   │   └── form.tsx             # React Hook Form 통합 컴포넌트
│   └── layout/
│       └── header.tsx           # 전역 헤더 + 네비게이션
│
├── lib/                         # 공유 유틸리티 및 설정
│   ├── logger.ts                # 로깅 유틸리티 (개발/프로덕션 분기)
│   ├── validations.ts           # Zod 스키마 정의 (로그인, 회원가입)
│   └── utils.ts                 # cn() 유틸리티 (Tailwind + clsx 병합)
│
├── components.json              # shadcn/ui 설정 파일
├── next.config.ts              # Next.js 설정
├── tailwind.config.ts           # Tailwind CSS 설정
├── tsconfig.json               # TypeScript 설정
└── postcss.config.mjs          # PostCSS 설정
```

### 폴더 규칙

- **`app/`**: Next.js 14+ App Router. 파일 기반 라우팅
  - 라우트 그룹 사용 가능 (예: `app/(auth)/`)
  - 각 페이지 디렉토리마다 `page.tsx` 필수
  - 공유 레이아웃은 `layout.tsx`로 정의

- **`components/ui/`**: shadcn/ui에서 가져온 기본 UI 컴포넌트
  - 독립적으로 재사용 가능
  - 스타일은 CSS variables 활용

- **`lib/`**: 비즈니스 로직, 유틸리티, 검증 스키마

## 기술 스택 및 통합

### 폼 처리 및 유효성 검사

프로젝트는 **React Hook Form + Zod** 조합을 사용합니다:

1. **Zod 스키마** (`lib/validations.ts`):
   - 재사용 가능한 필드 스키마 정의 (email, password, name)
   - 폼 전체 스키마 조합 및 타입 추출
   - 예: `loginSchema`, `registerSchema`

2. **React Hook Form** (`components/ui/form.tsx`):
   - shadcn/ui `form.tsx`는 이미 RHF와 통합됨
   - `useForm()` 훅으로 폼 상태 관리
   - 실시간 유효성 검사 지원

3. **사용 예시** (`app/register/page.tsx`):
   ```typescript
   const form = useForm<RegisterFormValues>({
     resolver: zodResolver(registerSchema),
   })
   ```

### 스타일링

- **Tailwind CSS v4**: 유틸리티 기반 스타일링
- **CSS Variables**: 테마 색상은 `--background`, `--foreground` 등으로 정의
- **`cn()` 유틸리티** (`lib/utils.ts`): Tailwind 클래스 조건부 병합
  ```typescript
  cn("bg-blue-500", condition && "text-white")
  ```

### 컴포넌트 추가

shadcn/cli를 통해 새로운 컴포넌트 추가:
```bash
npx shadcn-ui@latest add [component-name]
```

## 주요 컴포넌트 설명

### Header (`components/layout/header.tsx`)
- Client Component (`"use client"`)
- 현재 경로 기반 네비게이션 활성화 표시
- 모든 페이지 상단에 고정 배치

### 폼 컴포넌트들
- **Button**: 6가지 variant, 4가지 size, disabled 상태 지원
- **Input**: placeholder, disabled, error 상태 처리
- **Card**: 헤더/콘텐츠/푸터 조합 가능
- **Badge**: 라벨/상태 표시용 6가지 variant
- **Form**: RHF와 shadcn/ui 통합 (필드 에러 표시 자동)

## 로깅 및 디버깅

**`lib/logger.ts`**:
- 개발 환경에서만 debug 로그 출력
- 모든 환경에서 info, warn, error 출력
- 프로덕션 통합 준비됨 (Sentry, LogRocket 등 TODO)

사용:
```typescript
import { logger } from "@/lib/logger"

logger.info("사용자 가입 성공", { userId: 123 })
logger.error("API 호출 실패", error)
```

## 코딩 규칙

### 파일 및 컴포넌트
- Next.js App Router 기준: 각 라우트는 `page.tsx`
- 클라이언트 컴포넌트는 `"use client"` 명시
- 재사용 컴포넌트는 `components/` 아래 구성별 폴더에 배치

### 임포트 경로
모든 임포트는 경로 alias 활용:
- `@/components` → `components/`
- `@/lib` → `lib/`
- `@/hooks` → `hooks/` (향후)
- `@/ui` → `components/ui`

### CSS 클래스
- Tailwind CSS v4 기준 클래스명 사용
- 조건부 스타일은 `cn()` 유틸리티 활용
- 컴포넌트 variant는 `class-variance-authority` 패키지 활용 가능

## 향후 개선 사항

- 로깅 서비스 통합 (Sentry/LogRocket)
- API 라우트 추가
- 데이터 페칭 및 상태 관리
- 테스트 설정 (Jest, Testing Library)
- 타입 안전성 확보 위한 추가 유효성 검사

## 참고 자료

- [Next.js 공식 문서](https://nextjs.org/docs)
- [shadcn/ui 컴포넌트](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod 검증](https://zod.dev)
- [Tailwind CSS v4](https://tailwindcss.com)
