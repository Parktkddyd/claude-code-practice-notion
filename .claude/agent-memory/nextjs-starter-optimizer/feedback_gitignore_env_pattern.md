---
name: feedback-gitignore-env-pattern
description: 이 프로젝트 .gitignore의 .env* 패턴은 .env.local.example도 함께 무시함 — 커밋 대상 example 파일은 느낌표 예외 규칙 필요
metadata:
  type: feedback
---

`.gitignore`에 `.env*` 한 줄로 모든 env 파일을 막아두는 구성이 흔한데, 이 프로젝트는 `.env.local.example`을 "팀원/배포 참고용으로 버전 컨트롤에 커밋"하는 정책(PRD 명시)을 갖고 있었다.

**Why:** `.env*` 글롭은 `.env.local.example`도 매치해서 `git status`에 안 뜨고 영구히 untracked 상태로 남는다 — 사용자가 커밋하려 해도 `git add`가 무시당하는 것을 알아채기 전까지는 "왜 안 올라가지" 헷갈리는 상황이 생김.

**How to apply:** `.env*`로 시작하는 `.gitignore`가 있는 프로젝트에서 `*.example` 파일을 커밋 대상으로 두려면 반드시 `!.env.local.example` 같은 예외 줄을 그 아래에 추가하고 `git check-ignore -v <file>`로 실제로 추적되는지 확인할 것. 이번엔 `.gitignore:34:.env*\t.env.local.example`로 걸리는 걸 확인 후 예외 규칙 추가로 해결.
