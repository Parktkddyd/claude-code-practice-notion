import { Client, isFullPage } from '@notionhq/client'
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { z } from 'zod'
import { getEnv } from '@/lib/env'
import { logger } from '@/lib/logger'

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

// ===== Client 캐싱 =====

let client: Client | null = null
const dataSourceIdCache = new Map<string, string>()

function getClient(): Client {
  if (!client) {
    const env = getEnv()
    client = new Client({ auth: env.NOTION_API_KEY })
  }
  return client
}

async function resolveDataSourceId(databaseId: string): Promise<string> {
  if (dataSourceIdCache.has(databaseId)) {
    return dataSourceIdCache.get(databaseId)!
  }

  const notionClient = getClient()
  const response = await notionClient.databases.retrieve({ database_id: databaseId })

  // DatabaseObjectResponse의 data_sources 필드에서 첫 번째 data_source의 id 추출
  if ('data_sources' in response && response.data_sources.length > 0) {
    const dataSourceId = response.data_sources[0].id
    dataSourceIdCache.set(databaseId, dataSourceId)
    return dataSourceId
  }

  throw new Error(`No data sources found for database ${databaseId}`)
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

function getTitle(page: PageObjectResponse, propertyName: string): string {
  const prop = page.properties[propertyName]
  if (prop && 'title' in prop && Array.isArray(prop.title)) {
    return prop.title[0]?.plain_text ?? ''
  }
  return ''
}

function getRichText(page: PageObjectResponse, propertyName: string): string {
  const prop = page.properties[propertyName]
  if (prop && 'rich_text' in prop && Array.isArray(prop.rich_text)) {
    return prop.rich_text.map((t) => t.plain_text).join('')
  }
  return ''
}

function getSelect(page: PageObjectResponse, propertyName: string): string | null {
  const prop = page.properties[propertyName]
  if (prop && 'select' in prop && prop.select) {
    return prop.select.name ?? null
  }
  return null
}

function getMultiSelect(page: PageObjectResponse, propertyName: string): string[] {
  const prop = page.properties[propertyName]
  if (prop && 'multi_select' in prop && Array.isArray(prop.multi_select)) {
    return prop.multi_select.map((s) => s.name)
  }
  return []
}

function getCheckbox(page: PageObjectResponse, propertyName: string): boolean {
  const prop = page.properties[propertyName]
  if (prop && 'checkbox' in prop) {
    return prop.checkbox ?? false
  }
  return false
}

function getNumber(page: PageObjectResponse, propertyName: string): number {
  const prop = page.properties[propertyName]
  if (prop && 'number' in prop) {
    return prop.number ?? 0
  }
  return 0
}

function getUrl(page: PageObjectResponse, propertyName: string): string | null {
  const prop = page.properties[propertyName]
  if (prop && 'url' in prop) {
    return prop.url ?? null
  }
  return null
}

function getFileUrl(page: PageObjectResponse, propertyName: string): string | null {
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

function getDate(page: PageObjectResponse, propertyName: string): Date | null {
  const prop = page.properties[propertyName]
  if (prop && 'date' in prop && prop.date?.start) {
    return new Date(prop.date.start)
  }
  return null
}

// ===== 페이지 매핑 =====

function mapPageToProject(page: PageObjectResponse): Project | null {
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

function mapPageToCareer(page: PageObjectResponse): Career | null {
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

function mapPageToSkill(page: PageObjectResponse): Skill | null {
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

    const client = getClient()
    const env = getEnv()
    const dataSourceId = await resolveDataSourceId(env.NOTION_PROJECTS_DB_ID)

    const response = await client.dataSources.query({
      data_source_id: dataSourceId,
      filter: buildProjectFilter(options),
      sorts: buildSorts(options?.orderBy, options?.ascending),
      page_size: options?.limit ?? 100,
    })

    const projects = response.results
      .filter(isFullPage)
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

    const client = getClient()
    const env = getEnv()
    const dataSourceId = await resolveDataSourceId(env.NOTION_PROJECTS_DB_ID)

    const response = await client.dataSources.query({
      data_source_id: dataSourceId,
      filter: {
        property: 'Slug',
        rich_text: { equals: slug },
      },
      page_size: 1,
    })

    const fullPages = response.results.filter(isFullPage)
    if (fullPages.length === 0) {
      return null
    }

    const project = mapPageToProject(fullPages[0])
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

    const client = getClient()
    const env = getEnv()
    const dataSourceId = await resolveDataSourceId(env.NOTION_CAREER_DB_ID)

    const response = await client.dataSources.query({
      data_source_id: dataSourceId,
      filter: buildCareerFilter(),
      sorts: buildSorts(options?.orderBy, options?.ascending),
      page_size: options?.limit ?? 100,
    })

    const careers = response.results
      .filter(isFullPage)
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

    const client = getClient()
    const env = getEnv()
    const dataSourceId = await resolveDataSourceId(env.NOTION_SKILLS_DB_ID)

    const response = await client.dataSources.query({
      data_source_id: dataSourceId,
      filter: buildSkillFilter(options),
      sorts: buildSorts(options?.orderBy, options?.ascending),
      page_size: options?.limit ?? 100,
    })

    const skills = response.results
      .filter(isFullPage)
      .map(mapPageToSkill)
      .filter((s): s is Skill => s !== null)

    logger.info('Notion: 스킬 조회 완료', { count: skills.length })
    return skills
  } catch (error) {
    logger.error('Notion: 스킬 조회 실패', error)
    return []
  }
}
