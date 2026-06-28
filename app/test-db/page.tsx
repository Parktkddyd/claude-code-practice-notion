import { getProjects, getCareers, getSkills } from '@/lib/notion'
import { logger } from '@/lib/logger'

export const revalidate = 0 // 매번 새로 페칭

export default async function TestDBPage() {
  try {
    const [projects, careers, skills] = await Promise.all([
      getProjects({ limit: 3 }),
      getCareers({ limit: 3 }),
      getSkills({ limit: 5 })
    ])

    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-8 text-4xl font-bold">🧪 DB 연동 테스트</h1>

        {/* Projects */}
        <section className="mb-8 rounded-lg border border-green-300 bg-green-50 p-4">
          <h2 className="mb-4 text-2xl font-bold text-green-800">✅ Projects DB</h2>
          {projects.length > 0 ? (
            <ul className="space-y-2">
              {projects.map(p => (
                <li key={p.id} className="text-sm">
                  <strong>{p.name}</strong> (slug: <code className="bg-white px-1">{p.slug}</code>) | Featured: {p.featured ? '✅' : '❌'}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700">❌ 프로젝트 데이터 없음</p>
          )}
          <p className="mt-2 text-xs text-gray-600">총 {projects.length}개</p>
        </section>

        {/* Careers */}
        <section className="mb-8 rounded-lg border border-blue-300 bg-blue-50 p-4">
          <h2 className="mb-4 text-2xl font-bold text-blue-800">✅ Career DB</h2>
          {careers.length > 0 ? (
            <ul className="space-y-2">
              {careers.map(c => (
                <li key={c.id} className="text-sm">
                  <strong>{c.company}</strong> - {c.role} ({new Date(c.startDate).getFullYear()}~{c.endDate ? new Date(c.endDate).getFullYear() : '현재'})
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700">❌ 경력 데이터 없음</p>
          )}
          <p className="mt-2 text-xs text-gray-600">총 {careers.length}개</p>
        </section>

        {/* Skills */}
        <section className="rounded-lg border border-purple-300 bg-purple-50 p-4">
          <h2 className="mb-4 text-2xl font-bold text-purple-800">✅ Skills DB</h2>
          {skills.length > 0 ? (
            <ul className="space-y-2">
              {skills.map(s => (
                <li key={s.id} className="text-sm">
                  <strong>{s.name}</strong> ({s.category}) - 숙련도: {'⭐'.repeat(s.proficiency)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700">❌ 스킬 데이터 없음</p>
          )}
          <p className="mt-2 text-xs text-gray-600">총 {skills.length}개</p>
        </section>

        <p className="mt-12 text-center text-xs text-gray-500">
          이 페이지는 임시 테스트 페이지입니다. Phase 2 구현 후 삭제 예정입니다.
        </p>
      </main>
    )
  } catch (error) {
    logger.error('Test DB page error', error)
    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="mb-4 text-2xl font-bold text-red-600">❌ DB 연동 실패</h1>
        <p className="text-gray-700">환경변수 또는 Notion DB 설정을 확인하세요.</p>
        <pre className="mt-4 rounded bg-gray-100 p-4 text-sm">{String(error)}</pre>
      </main>
    )
  }
}
