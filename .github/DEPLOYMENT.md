# Vercel 배포 설정 가이드

이 프로젝트는 GitHub Actions를 통해 Vercel에 자동으로 배포됩니다.

## 사전 준비

### 1. Vercel 프로젝트 생성

1. [Vercel 대시보드](https://vercel.com/dashboard)에 로그인
2. "Add New Project" 클릭
3. GitHub 저장소 선택 또는 연결
4. 프로젝트 이름 설정 및 "Deploy" 클릭
5. **중요**: 첫 배포가 완료되면 프로젝트 설정에서 정보를 확인

### 2. Vercel 토큰 생성

1. Vercel 대시보드에서 [Settings > Tokens](https://vercel.com/account/tokens) 이동
2. "Create Token" 클릭
3. 토큰 이름 입력 (예: `github-actions-deploy`)
4. Scope는 기본값 그대로 (Full Account)
5. 토큰 복사 (한 번만 표시됨)

### 3. GitHub Secrets 설정

GitHub 저장소에서 다음 Secrets를 추가하세요:

1. 저장소 페이지 → Settings → Secrets and variables → Actions
2. "New repository secret" 클릭
3. 다음 Secrets 추가:

   - **Name**: `VERCEL_TOKEN`
   - **Value**: 위에서 생성한 Vercel 토큰

### 4. Vercel 프로젝트 ID 및 Org ID 확인 (선택사항)

더 정확한 배포를 원한다면:

1. Vercel 프로젝트 페이지에서 `.vercel` 폴더 확인
   - 또는 Vercel CLI로: `vercel link` 실행 후 `.vercel/project.json` 확인
2. 다음 정보를 GitHub Secrets에 추가 (선택사항):
   - `VERCEL_ORG_ID`: 조직 ID
   - `VERCEL_PROJECT_ID`: 프로젝트 ID

## 배포 동작

- **main/master 브랜치**에 push하면 자동으로 배포됩니다
- CI 워크플로우가 성공한 후에만 배포됩니다
- PR에서는 배포되지 않습니다 (CI만 실행)

## 수동 배포

필요시 GitHub Actions 페이지에서 수동으로 워크플로우를 실행할 수 있습니다:
1. Actions 탭 → "Deploy to Vercel" 워크플로우 선택
2. "Run workflow" 클릭

## 배포 상태 확인

- GitHub Actions 탭에서 배포 상태 확인
- Vercel 대시보드에서 배포 히스토리 및 로그 확인

