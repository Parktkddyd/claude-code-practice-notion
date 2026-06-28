---
name: feedback-base-ui-not-shadcn
description: 이 프로젝트의 components/ui/button.tsx 등은 shadcn/ui의 Radix asChild 패턴이 아니라 @base-ui/react를 감싼 render prop 패턴을 씀 — Link와 합성 시 asChild 쓰면 빌드 타입 에러
metadata:
  type: feedback
---

`components/ui/button.tsx`, `input.tsx`는 `@base-ui/react/button`, `@base-ui/react/input`을 래핑한 컴포넌트이며 `class-variance-authority`로 variant만 추가한 형태. shadcn/ui 표준 템플릿처럼 보이지만 Radix UI의 `asChild` prop이 없다.

**Why:** Base UI는 합성 렌더링을 `asChild`가 아니라 `render` prop으로 처리한다 (`<Button render={<Link href="/x" />}>텍스트</Button>` 형태, children은 render로 전달된 엘리먼트 안에 자동 병합됨). `<Button asChild><Link>...</Link></Button>` 형태로 쓰면 `next build`의 TypeScript 체크에서 "Property 'asChild' does not exist" 에러로 빌드가 실패한다. 이 프로젝트 루트의 `AGENTS.md`에도 "This is NOT the Next.js you know... breaking changes" 경고가 있어 의도된 비표준 구성으로 보인다.

**How to apply:** 이 프로젝트에서 Button/Input 등 `components/ui/*` 컴포넌트를 다른 엘리먼트(Link, a 등)와 합성할 때는 항상 `render` prop 패턴을 쓸 것. 새 shadcn 컴포넌트를 `npx shadcn add`로 추가할 때도 생성된 코드가 `asChild`를 쓰면 이 프로젝트의 base-ui 패턴에 맞게 `render`로 고쳐야 함. `npm run build`로 항상 검증.
