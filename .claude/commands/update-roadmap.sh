#!/bin/bash

# update-roadmap.sh - ROADMAP.md 진행 상태 체크 커맨드

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ROADMAP_FILE="$PROJECT_ROOT/docs/ROADMAP.md"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

# 옵션 파싱
PHASE_FILTER=""
SHOW_LIST=false
SHOW_SUMMARY=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --list)
      SHOW_LIST=true
      shift
      ;;
    --summary)
      SHOW_SUMMARY=true
      shift
      ;;
    [1-4])
      PHASE_FILTER="$1"
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# ROADMAP 파일 확인
if [ ! -f "$ROADMAP_FILE" ]; then
  echo -e "${RED}❌ ROADMAP.md를 찾을 수 없습니다: $ROADMAP_FILE${NC}"
  exit 1
fi

# Phase 1 진행 상태
print_phase1() {
  echo -e "\n${BLUE}📊 Phase 1: 프로젝트 초기 설정${NC}"
  echo -e "${GREEN}✅ 개발팀 완료: 7/7${NC}"
  echo -e "${YELLOW}⬜ 사용자 액션 필요: 0/5${NC}"
  echo -e "${GRAY}   ├─ Notion DB 3개 생성 + 프로퍼티 설정${NC}"
  echo -e "${GRAY}   ├─ Notion Integration 생성 + API 키 획득${NC}"
  echo -e "${GRAY}   ├─ .env.local 파일 작성 및 값 입력${NC}"
  echo -e "${GRAY}   ├─ Integration에 3개 DB 공유 권한 설정${NC}"
  echo -e "${GRAY}   └─ npm run dev 실행 후 정상 구동 확인${NC}"
  echo -e "\n${GREEN}완료도: 7/12 (58%)${NC}"
}

# Phase 2 진행 상태
print_phase2() {
  echo -e "\n${BLUE}📌 Phase 2: 공통 모듈 개발 (Shrimp 작업)${NC}"
  echo -e "${GREEN}✅ Task 2️⃣ (877e558d): lib/notion.ts 데이터 레이어 - 완료${NC}"
  echo -e "${YELLOW}⬜ Task 1️⃣ (722fdccd): next.config.ts 이미지 도메인 - 대기${NC}"
  echo -e "${YELLOW}⬜ Task 3️⃣ (885a975c): TechStackBadges, SkillBadge - 대기${NC}"
  echo -e "${YELLOW}⬜ Task 4️⃣ (419fa247): ProjectCard, CareerItem - 대기${NC}"
  echo -e "${YELLOW}⬜ Task 5️⃣ (6ba097e4): SkillCategory, SkillsGrid, CareerTimeline - 대기${NC}"
  echo -e "${YELLOW}⬜ Task 6️⃣ (6e8711c5): ProjectDetail, ProjectNavigation - 대기${NC}"
  echo -e "\n${YELLOW}완료도: 1/6 (17%)${NC}"
  echo -e "${GRAY}예상 소요 시간: ~9시간${NC}"
}

# Phase 3 진행 상태
print_phase3() {
  echo -e "\n${BLUE}📌 Phase 3: 핵심 기능 페이지 개발${NC}"
  echo -e "${YELLOW}⬜ Task 7️⃣ (3ed85412): app/projects + app/projects/[slug] - 대기${NC}"
  echo -e "${YELLOW}⬜ Task 8️⃣ (58ef3847): app/career/page.tsx - 대기${NC}"
  echo -e "${YELLOW}⬜ Task 9️⃣ (f108f06f): app/page.tsx 수정 - 대기${NC}"
  echo -e "\n${YELLOW}완료도: 0/3 (0%)${NC}"
  echo -e "${GRAY}예상 소요 시간: ~6시간${NC}"
}

# Phase 4 진행 상태
print_phase4() {
  echo -e "\n${BLUE}📌 Phase 4: 최적화 및 배포 검증${NC}"
  echo -e "${YELLOW}⬜ Task 🔟 (94737d79): 빌드/린트 검증 + 사용자 안내 - 대기${NC}"
  echo -e "\n${YELLOW}완료도: 0/1 (0%)${NC}"
  echo -e "${GRAY}예상 소요 시간: ~1시간${NC}"
}

# 전체 진행률 요약
print_summary() {
  echo -e "\n${BLUE}📈 전체 진행 요약${NC}"

  local total_phase1=12
  local completed_phase1=7
  local total_phase2=6
  local completed_phase2=1
  local total_phase3=3
  local completed_phase3=0
  local total_phase4=1
  local completed_phase4=0

  local total=$((total_phase1 + total_phase2 + total_phase3 + total_phase4))
  local completed=$((completed_phase1 + completed_phase2 + completed_phase3 + completed_phase4))
  local percentage=$((completed * 100 / total))

  echo -e "Phase 1: ${GREEN}$completed_phase1/$total_phase1${NC} (58%)"
  echo -e "Phase 2: ${YELLOW}$completed_phase2/$total_phase2${NC} (17%)"
  echo -e "Phase 3: ${YELLOW}$completed_phase3/$total_phase3${NC} (0%)"
  echo -e "Phase 4: ${YELLOW}$completed_phase4/$total_phase4${NC} (0%)"
  echo -e "\n${BLUE}전체 진행률: $completed/$total ($percentage%)${NC}"

  echo -e "\n${GRAY}예상 전체 소요 시간: ~27시간${NC}"
  echo -e "${GRAY}마지막 업데이트: 2026-06-28${NC}"
}

# 작업 리스트 표시
print_list() {
  echo -e "\n${BLUE}📋 전체 작업 리스트${NC}\n"

  echo -e "${BLUE}Phase 1: 프로젝트 초기 설정${NC}"
  echo -e "${GREEN}✅ @notionhq/client 설치${NC}"
  echo -e "${GREEN}✅ lib/env.ts 작성${NC}"
  echo -e "${GREEN}✅ lib/notion.ts 완성 (6개 함수)${NC}"
  echo -e "${GREEN}✅ .env.local.example 작성${NC}"
  echo -e "${GREEN}✅ components/portfolio/ 디렉토리 생성${NC}"
  echo -e "${GREEN}✅ components/layout/header.tsx NAV_ITEMS 확인${NC}"
  echo -e "${GREEN}✅ next.config.ts 이미지 도메인 준비${NC}"
  echo -e "${YELLOW}⬜ Notion DB 3개 생성 (사용자)${NC}"
  echo -e "${YELLOW}⬜ Notion Integration 생성 (사용자)${NC}"
  echo -e "${YELLOW}⬜ .env.local 파일 작성 (사용자)${NC}"
  echo -e "${YELLOW}⬜ Integration 공유 권한 설정 (사용자)${NC}"
  echo -e "${YELLOW}⬜ npm run dev 확인 (사용자)${NC}"

  echo -e "\n${BLUE}Phase 2: 공통 모듈 개발${NC}"
  echo -e "${YELLOW}⬜ Task 1️⃣ (722fdccd): next.config.ts 이미지 도메인${NC}"
  echo -e "${GREEN}✅ Task 2️⃣ (877e558d): lib/notion.ts 데이터 레이어${NC}"
  echo -e "${YELLOW}⬜ Task 3️⃣ (885a975c): TechStackBadges, SkillBadge${NC}"
  echo -e "${YELLOW}⬜ Task 4️⃣ (419fa247): ProjectCard, CareerItem${NC}"
  echo -e "${YELLOW}⬜ Task 5️⃣ (6ba097e4): SkillCategory, SkillsGrid, CareerTimeline${NC}"
  echo -e "${YELLOW}⬜ Task 6️⃣ (6e8711c5): ProjectDetail, ProjectNavigation${NC}"

  echo -e "\n${BLUE}Phase 3: 핵심 기능 페이지 개발${NC}"
  echo -e "${YELLOW}⬜ Task 7️⃣ (3ed85412): app/projects/page.tsx + [slug]${NC}"
  echo -e "${YELLOW}⬜ Task 8️⃣ (58ef3847): app/career/page.tsx${NC}"
  echo -e "${YELLOW}⬜ Task 9️⃣ (f108f06f): app/page.tsx 수정${NC}"

  echo -e "\n${BLUE}Phase 4: 최적화 및 배포 검증${NC}"
  echo -e "${YELLOW}⬜ Task 🔟 (94737d79): 빌드/린트 검증 + 사용자 안내${NC}"
}

# 메인 로직
if [ "$SHOW_SUMMARY" = true ]; then
  print_summary
elif [ "$SHOW_LIST" = true ]; then
  print_list
else
  echo -e "${BLUE}╔════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║    ROADMAP 진행 상태 (업데이트: 2026-06-28)        ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════╝${NC}"

  if [ -z "$PHASE_FILTER" ] || [ "$PHASE_FILTER" = "1" ]; then
    print_phase1
  fi

  if [ -z "$PHASE_FILTER" ] || [ "$PHASE_FILTER" = "2" ]; then
    print_phase2
  fi

  if [ -z "$PHASE_FILTER" ] || [ "$PHASE_FILTER" = "3" ]; then
    print_phase3
  fi

  if [ -z "$PHASE_FILTER" ] || [ "$PHASE_FILTER" = "4" ]; then
    print_phase4
  fi

  if [ -z "$PHASE_FILTER" ]; then
    print_summary
  fi
fi

echo ""
