---
name: project-portfolio-notion-init
description: portfolio 프로젝트를 Notion DB 기반 개인 포트폴리오로 전환하는 다단계 작업의 Phase 1 완료 상태와 향후 단계 참고사항
metadata:
  type: project
---

`/home/psy/Desktop/workspace/course/portfolio`는 Next.js 16 + React 19 스타터킷을 Notion을 단일 사용자 CMS로 쓰는 개인 포트폴리오 사이트로 전환 중. 근거 문서: `docs/PRD.md` (7-phase 로드맵, F001~F007 기능 명세, Notion DB 스키마 3종: Projects/Career/Skills).

Phase 1(초기화/클린업) 완료 — 2026-06-21:
- `app/examples/*`, `app/register/` 삭제. `app/page.tsx`를 포트폴리오 Hero 뼈대로, `components/layout/header.tsx` 네비게이션을 `/`, `/projects`, `/career`로 교체.
- `@notionhq/client` 설치. `lib/env.ts` 신규 생성 (Zod 스키마이지만 모듈 로드 시 즉시 parse하지 않고 `getEnv()` 함수로 지연 — `.env.local` 값이 비어있는 초기 단계에서 빌드가 깨지는 것을 방지).
- `.env.local`(빈 템플릿, git-ignored), `.env.local.example`(커밋 대상) 생성.
- `components/portfolio/.gitkeep`으로 Phase 3 컴포넌트 디렉토리 미리 생성.

**Why:** PRD가 7 phase로 솔로 개발자 기준 2~3주 로드맵을 정의했고, 이 작업은 그중 Phase 1(패키지/환경변수/디렉토리 정리)만 범위. Phase 2(`lib/notion.ts` 데이터 레이어), Phase 3(`components/portfolio/*` 컴포넌트), Phase 4~6(프로젝트/홈/경력 페이지)은 후속 작업으로 남아있음.

**How to apply:** 이후 대화에서 "포트폴리오 프로젝트 이어서 진행" 같은 요청이 오면 PRD의 Phase 번호를 기준으로 어디까지 했는지 먼저 git log/현재 파일 상태로 재확인할 것 — 이 메모리는 스냅샷이며 실제 진행 상태는 코드가 우선.

관련: [[feedback-base-ui-not-shadcn]], [[feedback-gitignore-env-pattern]]
