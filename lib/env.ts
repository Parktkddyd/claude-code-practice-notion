import { z } from "zod"

/**
 * Notion 연동에 필요한 환경변수 스키마
 * @note Phase 1에서는 타입 정의만 제공하며, 실제 값 검증(parse)은
 *       lib/notion.ts에서 Notion Client를 초기화하는 시점에 수행합니다.
 *       모듈 로드 시 즉시 parse하면 .env.local 값이 비어있는 초기 설정 단계에서
 *       빌드/개발 서버가 항상 실패하므로 의도적으로 지연시킵니다.
 */
const envSchema = z.object({
  NOTION_API_KEY: z.string().min(1, "Missing NOTION_API_KEY"),
  NOTION_PROJECTS_DB_ID: z.string().min(1, "Missing NOTION_PROJECTS_DB_ID"),
  NOTION_CAREER_DB_ID: z.string().min(1, "Missing NOTION_CAREER_DB_ID"),
  NOTION_SKILLS_DB_ID: z.string().min(1, "Missing NOTION_SKILLS_DB_ID"),
})

export type Env = z.infer<typeof envSchema>

/**
 * process.env에서 Notion 관련 환경변수를 검증 후 반환합니다.
 * 값이 비어있거나 누락된 경우 ZodError를 던집니다.
 * @returns 검증된 환경변수 객체
 */
export function getEnv(): Env {
  return envSchema.parse(process.env)
}
