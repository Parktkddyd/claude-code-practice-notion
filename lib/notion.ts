import { z } from 'zod'
import { getEnv } from '@/lib/env'
import { logger } from '@/lib/logger'

// Notion API 응답 타입 (필요한 부분만)
interface NotionPage {
  id: string
  created_time: string
  properties: Record<string, any>
}

// ===== Zod 스키마 =====

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
  createdAt: z.coerce.date(),
})

const CareerSchema = z.object({
  id: z.string(),
  company: z.string().min(1),
  role: z.string().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().nullable(),
  description: z.string(),
  order: z.number().int().positive(),
  createdAt: z.coerce.date(),
})

const SkillSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  category: z.string().min(1),
  proficiency: z.number().int().min(1).max(10),
  order: z.number().int().positive(),
  createdAt: z.coerce.date(),
})

// ===== 타입 추출 =====

export type Project = z.infer<typeof ProjectSchema>
export type Career = z.infer<typeof CareerSchema>
export type Skill = z.infer<typeof SkillSchema>

// ===== 옵션 인자 타입 =====

export interface GetProjectsOptions {
  status?: 'Active' | 'Archived'
  featured?: boolean
  limit?: number
  orderBy?: 'Order' | 'CreatedAt'
  ascending?: boolean
}

export interface GetCareersOptions {
  orderBy?: 'StartDate' | 'Order'
  ascending?: boolean
  limit?: number
}

export interface GetSkillsOptions {
  category?: string
  minProficiency?: number
  orderBy?: 'Category' | 'Proficiency' | 'Order'
  ascending?: boolean
  limit?: number
}

// ===== Notion API 호출 헬퍼 =====

async function queryNotionDatabase(
  databaseId: string,
  filter?: Record<string, any>,
  sorts?: Record<string, any>[]
): Promise<NotionPage[]> {
  const env = getEnv()
  const url = `https://api.notion.com/v1/databases/${databaseId}/query`

  const body = {
    page_size: 100,
    ...(filter && { filter }),
    ...(sorts && sorts.length > 0 && { sorts }),
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Notion API error: ${error.message}`)
    }

    const data = await response.json()
    return data.results || []
  } catch (error) {
    logger.error('Notion API 호출 실패', error)
    throw error
  }
}

// ===== 필터/정렬 빌더 =====

type NotionFilter = any
type NotionSort = any

function buildProjectFilter(options?: GetProjectsOptions): NotionFilter | undefined {
  const filters: NotionFilter[] = []

  if (options?.status) {
    filters.push({
      property: 'Status',
      select: { equals: options.status },
    })
  }

  if (options?.featured !== undefined) {
    filters.push({
      property: 'Featured',
      checkbox: { equals: options.featured },
    })
  }

  if (filters.length === 0) return undefined
  if (filters.length === 1) return filters[0]

  return {
    and: filters,
  }
}

function buildCareerFilter(): NotionFilter | undefined {
  return undefined
}

function buildSkillFilter(options?: GetSkillsOptions): NotionFilter | undefined {
  const filters: NotionFilter[] = []

  if (options?.category) {
    filters.push({
      property: 'Category',
      select: { equals: options.category },
    })
  }

  if (options?.minProficiency !== undefined) {
    filters.push({
      property: 'Proficiency',
      number: { greater_than_or_equal_to: options.minProficiency },
    })
  }

  if (filters.length === 0) return undefined
  if (filters.length === 1) return filters[0]

  return {
    and: filters,
  }
}

function buildSorts(
  orderBy?: string,
  ascending?: boolean
): NotionSort | undefined {
  const direction = ascending === false ? 'descending' : 'ascending'

  if (orderBy === 'CreatedAt') {
    return [{ timestamp: 'created_time', direction }]
  }

  const sortProperty = orderBy || 'Order'
  return [{ property: sortProperty, direction }]
}

// ===== 프로퍼티 접근 헬퍼 =====

function getTitle(page: NotionPage, propertyName: string): string {
  const prop = page.properties[propertyName]
  if (prop && 'title' in prop && Array.isArray(prop.title)) {
    return (prop.title as Array<{ plain_text: string }>)[0]?.plain_text ?? ''
  }
  return ''
}

function getRichText(page: NotionPage, propertyName: string): string {
  const prop = page.properties[propertyName]
  if (prop && 'rich_text' in prop && Array.isArray(prop.rich_text)) {
    return (prop.rich_text as Array<{ plain_text: string }>).map((t) => t.plain_text).join('')
  }
  return ''
}

function getSelect(page: NotionPage, propertyName: string): string | null {
  const prop = page.properties[propertyName]
  if (prop && 'select' in prop && prop.select) {
    return prop.select.name ?? null
  }
  return null
}

function getMultiSelect(page: NotionPage, propertyName: string): string[] {
  const prop = page.properties[propertyName]
  if (prop && 'multi_select' in prop && Array.isArray(prop.multi_select)) {
    return (prop.multi_select as Array<{ name: string }>).map((s) => s.name)
  }
  return []
}

function getCheckbox(page: NotionPage, propertyName: string): boolean {
  const prop = page.properties[propertyName]
  if (prop && 'checkbox' in prop) {
    return prop.checkbox ?? false
  }
  return false
}

function getNumber(page: NotionPage, propertyName: string): number {
  const prop = page.properties[propertyName]
  if (prop && 'number' in prop) {
    return prop.number ?? 0
  }
  return 0
}

function getUrl(page: NotionPage, propertyName: string): string | null {
  const prop = page.properties[propertyName]
  if (prop && 'url' in prop) {
    return prop.url ?? null
  }
  return null
}

function getFileUrl(page: NotionPage, propertyName: string): string | null {
  const prop = page.properties[propertyName]
  if (prop && 'files' in prop && Array.isArray(prop.files) && prop.files.length > 0) {
    const file = prop.files[0]
    if ('file' in file && file.file?.url) {
      return file.file.url
    }
    if ('external' in file && file.external?.url) {
      return file.external.url
    }
  }
  return null
}

function getDate(page: NotionPage, propertyName: string): Date | null {
  const prop = page.properties[propertyName]
  if (prop && 'date' in prop && prop.date?.start) {
    return new Date(prop.date.start)
  }
  return null
}

// ===== 페이지 매핑 =====

function mapPageToProject(page: NotionPage): Project | null {
  const raw = {
    id: page.id,
    name: getTitle(page, 'Name'),
    description: getRichText(page, 'Description'),
    slug: getRichText(page, 'Slug'),
    techStack: getMultiSelect(page, 'TechStack'),
    thumbnailUrl: getFileUrl(page, 'Thumbnail'),
    githubUrl: getUrl(page, 'GithubUrl'),
    demoUrl: getUrl(page, 'DemoUrl'),
    featured: getCheckbox(page, 'Featured'),
    status: getSelect(page, 'Status'),
    order: getNumber(page, 'Order'),
    createdAt: page.created_time,
  }

  const result = ProjectSchema.safeParse(raw)
  if (!result.success) {
    logger.warn('프로젝트 파싱 실패', {
      pageId: page.id,
      error: result.error.flatten(),
    })
    return null
  }

  return result.data
}

function mapPageToCareer(page: NotionPage): Career | null {
  const raw = {
    id: page.id,
    company: getTitle(page, 'Company'),
    role: getRichText(page, 'Role'),
    startDate: getDate(page, 'StartDate'),
    endDate: getDate(page, 'EndDate'),
    description: getRichText(page, 'Description'),
    order: getNumber(page, 'Order'),
    createdAt: page.created_time,
  }

  const result = CareerSchema.safeParse(raw)
  if (!result.success) {
    logger.warn('경력 파싱 실패', {
      pageId: page.id,
      error: result.error.flatten(),
    })
    return null
  }

  return result.data
}

function mapPageToSkill(page: NotionPage): Skill | null {
  const raw = {
    id: page.id,
    name: getTitle(page, 'Name'),
    category: getSelect(page, 'Category'),
    proficiency: getNumber(page, 'Proficiency'),
    order: getNumber(page, 'Order'),
    createdAt: page.created_time,
  }

  const result = SkillSchema.safeParse(raw)
  if (!result.success) {
    logger.warn('스킬 파싱 실패', {
      pageId: page.id,
      error: result.error.flatten(),
    })
    return null
  }

  return result.data
}

// ===== 공개 함수 =====

export async function getProjects(
  options?: GetProjectsOptions
): Promise<Project[]> {
  try {
    logger.info('Notion: 프로젝트 조회', { options })

    const env = getEnv()

    const pages = await queryNotionDatabase(
      env.NOTION_PROJECTS_DB_ID,
      buildProjectFilter(options),
      buildSorts(options?.orderBy, options?.ascending)
    )

    const projects = pages
      .map(mapPageToProject)
      .filter((p): p is Project => p !== null)

    logger.info('Notion: 프로젝트 조회 완료', { count: projects.length })
    return projects
  } catch (error) {
    logger.error('Notion: 프로젝트 조회 실패', error)
    return []
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  try {
    logger.info('Notion: 프로젝트 상세 조회', { slug })

    const env = getEnv()

    const pages = await queryNotionDatabase(
      env.NOTION_PROJECTS_DB_ID,
      {
        property: 'Slug',
        rich_text: { equals: slug },
      }
    )

    if (pages.length === 0) {
      return null
    }

    const project = mapPageToProject(pages[0])
    if (project) {
      logger.info('Notion: 프로젝트 상세 조회 완료', { slug })
    }
    return project
  } catch (error) {
    logger.error('Notion: 프로젝트 상세 조회 실패', error)
    return null
  }
}

export async function getCareers(
  options?: GetCareersOptions
): Promise<Career[]> {
  try {
    logger.info('Notion: 경력 조회', { options })

    const env = getEnv()

    const pages = await queryNotionDatabase(
      env.NOTION_CAREER_DB_ID,
      buildCareerFilter(),
      buildSorts(options?.orderBy, options?.ascending)
    )

    const careers = pages
      .map(mapPageToCareer)
      .filter((c): c is Career => c !== null)

    logger.info('Notion: 경력 조회 완료', { count: careers.length })
    return careers
  } catch (error) {
    logger.error('Notion: 경력 조회 실패', error)
    return []
  }
}

export async function getSkills(
  options?: GetSkillsOptions
): Promise<Skill[]> {
  try {
    logger.info('Notion: 스킬 조회', { options })

    const env = getEnv()

    const pages = await queryNotionDatabase(
      env.NOTION_SKILLS_DB_ID,
      buildSkillFilter(options),
      buildSorts(options?.orderBy, options?.ascending)
    )

    const skills = pages
      .map(mapPageToSkill)
      .filter((s): s is Skill => s !== null)

    logger.info('Notion: 스킬 조회 완료', { count: skills.length })
    return skills
  } catch (error) {
    logger.error('Notion: 스킬 조회 실패', error)
    return []
  }
}
