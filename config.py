"""
config.py — Seedance Local Studio 전역 설정 및 상수 정의
모든 매직 넘버와 설정값은 이 파일에서 관리한다.
"""

# ──────────────────────────────────────────────
# Atlas Cloud API 설정
# ──────────────────────────────────────────────

# API 기본 URL (Atlas Cloud v1)
API_BASE_URL: str = "https://api.atlascloud.ai/api/v1"

# 공개(Billing) API 기본 URL
API_PUBLIC_BASE_URL: str = "https://api.atlascloud.ai/public/v1"

# 영상 생성 요청 엔드포인트
ENDPOINT_GENERATE: str = "/model/generateVideo"

# 파일 업로드 엔드포인트 (참조 파일을 URL로 변환할 때 사용)
ENDPOINT_UPLOAD: str = "/model/uploadMedia"

# 상태 조회 엔드포인트 (prediction_id를 치환하여 사용)
ENDPOINT_PREDICTION: str = "/model/prediction/{prediction_id}"

# 잔액 조회 엔드포인트
ENDPOINT_BALANCE: str = "/balance"

# ──────────────────────────────────────────────
# 모델 설정
# ──────────────────────────────────────────────

# Seedance 2.0 이미지→영상 변환 모델 식별자
MODEL_ID: str = "bytedance/seedance-2.0/image-to-video"

# ──────────────────────────────────────────────
# 폴링 설정
# ──────────────────────────────────────────────

# 상태 폴링 간격 (초)
POLL_INTERVAL_SEC: int = 3

# 최대 폴링 횟수 (3초 × 100회 = 최대 5분 대기)
MAX_POLL_ATTEMPTS: int = 100

# ──────────────────────────────────────────────
# 영상 길이별 예상 생성 소요 시간 (초) — 진행률 표시 기준
# ──────────────────────────────────────────────
ESTIMATED_TIME_BY_DURATION: dict[int, int] = {
    -1: 60,   # 자동
    4:  45,
    5:  50,
    6:  65,
    7:  70,
    8:  80,
    10: 95,
    12: 110,
    15: 130,
}
ESTIMATED_TIME_DEFAULT: int = 60

# ──────────────────────────────────────────────
# 지원 옵션 값 목록
# ──────────────────────────────────────────────

# 지원 해상도 옵션 (표시 레이블 → API 파라미터 값)
RESOLUTION_OPTIONS: dict[str, str] = {
    "480p": "480p",
    "720p (기본)": "720p",
    "720p-SR (업스케일)": "720p-SR",
    "1080p": "1080p",
    "1080p-SR (업스케일)": "1080p-SR",
    "1440p-SR (업스케일)": "1440p-SR",
    "4K": "4k",
}

# 지원 화면 비율 옵션 (표시 레이블 → API 파라미터 값)
RATIO_OPTIONS: dict[str, str] = {
    "자동 (adaptive)": "adaptive",
    "16:9 (가로)": "16:9",
    "9:16 (세로/모바일)": "9:16",
    "1:1 (정방형)": "1:1",
    "4:3": "4:3",
    "3:4": "3:4",
    "21:9 (와이드)": "21:9",
}

# 지원 영상 길이 옵션 (초)
DURATION_OPTIONS: dict[str, int] = {
    "자동 (-1)": -1,
    "4초": 4,
    "5초 (기본)": 5,
    "6초": 6,
    "7초": 7,
    "8초": 8,
    "10초": 10,
    "12초": 12,
    "15초": 15,
}

# 비트레이트 모드 옵션
BITRATE_OPTIONS: dict[str, str] = {
    "표준 (Standard)": "standard",
    "고화질 (High)": "high",
}

# ──────────────────────────────────────────────
# 파일 업로드 제한
# ──────────────────────────────────────────────

# 참조 이미지 최대 파일 크기 (바이트, 30MB)
MAX_IMAGE_SIZE_BYTES: int = 30 * 1024 * 1024

# 허용 이미지 포맷 (MIME 타입)
ALLOWED_IMAGE_TYPES: list[str] = ["image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff", "image/gif"]

# Streamlit 업로드 허용 확장자
ALLOWED_IMAGE_EXTENSIONS: list[str] = ["jpg", "jpeg", "png", "webp", "bmp", "tiff", "gif"]
ALLOWED_VIDEO_EXTENSIONS: list[str] = ["mp4", "mov", "avi", "webm"]
ALLOWED_AUDIO_EXTENSIONS: list[str] = ["mp3", "wav", "aac", "m4a"]

# ──────────────────────────────────────────────
# 로컬 저장 경로
# ──────────────────────────────────────────────

# 생성된 영상 저장 폴더
OUTPUTS_DIR: str = "outputs"

# SQLite 데이터베이스 파일 경로
DB_PATH: str = "history.db"

# ──────────────────────────────────────────────
# HTTP 요청 설정
# ──────────────────────────────────────────────

# API 요청 타임아웃 (초)
REQUEST_TIMEOUT_SEC: int = 30

# ──────────────────────────────────────────────
# 상태값 상수 (API 응답 status 필드)
# ──────────────────────────────────────────────

STATUS_PROCESSING: str = "processing"
STATUS_COMPLETED: str = "completed"
STATUS_SUCCEEDED: str = "succeeded"
STATUS_FAILED: str = "failed"
STATUS_TIMEOUT: str = "timeout"

# 완료로 간주할 상태값 집합
TERMINAL_SUCCESS_STATUSES: set[str] = {STATUS_COMPLETED, STATUS_SUCCEEDED}
TERMINAL_FAILURE_STATUSES: set[str] = {STATUS_FAILED, STATUS_TIMEOUT}
