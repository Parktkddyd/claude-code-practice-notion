import { Button } from "@/components/ui/button"
import Link from "next/link"

/**
 * 홈페이지 - 자기소개(Hero) 섹션
 * @note Featured 프로젝트 / 기술 스택 섹션은 lib/notion.ts 데이터 레이어 구현(Phase 2) 이후
 *       components/portfolio/ProjectCard, SkillsGrid 등을 추가하여 채웁니다.
 */
export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-20 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        안녕하세요 👋
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Notion을 CMS로 활용한 개인 포트폴리오 사이트입니다.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/projects" className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-all">
          프로젝트 보기
        </Link>
        <Link href="/career" className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted hover:text-foreground transition-all">
          경력 보기
        </Link>
      </div>
    </div>
  )
}
