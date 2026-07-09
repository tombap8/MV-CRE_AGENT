# Seedance Local Studio — 프로젝트 생성 프롬프트

이 문서는 Antigravity 에이전트에게 **최초 실행 프롬프트**로 그대로 붙여넣어 사용하는
총괄 지시서다. 아래 세 규칙 파일을 항상 함께 참조한다.

- `@.agent/rules/persona-developer.md` — 구현 방식/코드 품질 판단 기준
- `@.agent/rules/persona-designer.md` — UI/UX 흐름 판단 기준
- `@.agent/rules/generation-rules.md` — 기술 스택, 파일 구조, 진행 방식 공통 규칙

---

## 프로젝트 개요

**이름**: Seedance Local Studio
**목적**: 개인이 로컬 PC에서 혼자 사용하는 AI 영상 생성 도구.
Atlas Cloud API(Seedance 2.0)를 통해 이미지/영상/오디오 참조 파일과 프롬프트를 입력하면
영상을 생성하고, 미리보기와 다운로드를 제공한다.

**사용자**: 개발자인 나 혼자 사용 (배포/공유는 향후 계획이며 현재 범위 아님)

**핵심 사용 흐름**:
1. 사이드바에서 API 키 상태 확인 (`.env`에서 로드, 화면에 노출하지 않음)
2. 메인 화면에서 이미지/영상/오디오 참조 파일을 선택적으로 업로드
3. 프롬프트 텍스트 입력 + 해상도/모드(Fast/Standard) 선택
4. "영상 생성" 버튼 클릭 → 비동기 job 제출 → 상태 폴링 → 진행 표시
5. 완료되면 결과 영상 미리보기(`st.video`) + 다운로드 버튼
6. 생성 이력(프롬프트, 일시, 결과 URL, 로컬 저장 경로)을 SQLite에 기록
7. 사이드바 또는 별도 탭에서 과거 생성 이력 조회 가능

## 요청사항 (Antigravity에게)

1. 위 `@generation-rules.md`의 프로젝트 구조를 그대로 따라 파일을 생성할 것
2. 먼저 **Implementation Plan**을 작성해서 나에게 보여줄 것 (파일별 역할, 함수 목록,
   Atlas Cloud API 호출 스펙을 어떻게 처리할지 포함)
3. 계획에 대해 내가 승인하면 그때 실제 코드를 생성할 것
4. Atlas Cloud API의 정확한 엔드포인트/파라미터명은 내가 문서 링크나 예시 응답을
   제공하기 전까지 임의로 확정하지 말고, 플레이스홀더로 남겨두고 물어볼 것
5. `.env.example`, `requirements.txt`, `.gitignore`를 반드시 함께 생성할 것
6. 완성 후 실행 방법과 사전 준비사항(Atlas Cloud API 키 발급 방법 등)을 안내할 것

## 확인이 필요한 정보 (에이전트가 먼저 나에게 질문해야 할 것)

- Atlas Cloud API의 정확한 base URL, 인증 헤더 형식, 생성 요청/상태 조회/결과 다운로드
  각각의 엔드포인트와 요청/응답 JSON 스키마
- 지원되는 해상도/duration/모드(Fast, Standard) 옵션 값
- 참조 파일(이미지/영상/오디오)을 요청 본문에 어떻게 포함하는지 (base64 vs URL 업로드 vs multipart)

---

## 파일 맵

| 파일 | 역할 |
|---|---|
| `.agent/rules/persona-developer.md` | 코드 구현 시 적용할 개발자 관점 규칙 |
| `.agent/rules/persona-designer.md` | UI/UX 설계 시 적용할 디자이너 관점 규칙 |
| `.agent/rules/generation-rules.md` | 기술 스택, 폴더 구조, 언어/보안/진행 방식 공통 규칙 |
| `README.md` (이 파일) | 전체 총괄 — 최초 프롬프트로 사용 |

---

## 사용 방법

1. 이 폴더 전체(`README.md` + `.agent/rules/`)를 Antigravity 워크스페이스 루트에 둔다
2. Antigravity 에이전트 패널에서 이 `README.md` 내용을 그대로 붙여넣고 실행한다
   (Antigravity는 `.agent/rules/` 폴더를 워크스페이스 규칙으로 자동 인식하므로,
   README에서 `@` 로 명시적으로 언급하면 확실하게 컨텍스트에 포함된다)
3. Implementation Plan을 검토하고 승인 여부를 답한다
4. 이후 진행은 단계별로 확인하며 진행한다
