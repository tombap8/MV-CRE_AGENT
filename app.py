"""
app.py — Seedance Local Studio Streamlit 메인 엔트리포인트
UI 로직만 담당한다. API 호출은 api_client.py, DB는 db.py에 위임한다.

실행 방법:
    streamlit run app.py
"""

import logging
import os
from datetime import datetime
from pathlib import Path

import streamlit as st
from dotenv import load_dotenv

import api_client
import db
from api_client import AtlasAPIError
from config import (
    ALLOWED_AUDIO_EXTENSIONS,
    ALLOWED_IMAGE_EXTENSIONS,
    ALLOWED_VIDEO_EXTENSIONS,
    BITRATE_OPTIONS,
    DURATION_OPTIONS,
    ESTIMATED_TIME_BY_DURATION,
    ESTIMATED_TIME_DEFAULT,
    OUTPUTS_DIR,
    POLL_INTERVAL_SEC,
    RATIO_OPTIONS,
    RESOLUTION_OPTIONS,
    STATUS_PROCESSING,
    TERMINAL_FAILURE_STATUSES,
    TERMINAL_SUCCESS_STATUSES,
)

# ──────────────────────────────────────────────
# 환경변수 및 로깅 초기화
# ──────────────────────────────────────────────

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────
# Streamlit 페이지 설정 (반드시 최상단에)
# ──────────────────────────────────────────────

st.set_page_config(
    page_title="Seedance Local Studio",
    page_icon="🎬",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ──────────────────────────────────────────────
# 커스텀 CSS — 다크 테마 + 프리미엄 스타일
# ──────────────────────────────────────────────

st.markdown("""
<style>
  /* Google Fonts */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  html, body, [class*="css"] {
    font-family: 'Inter', sans-serif;
  }

  /* 전체 배경 */
  .stApp {
    background: linear-gradient(135deg, #0a0a0f 0%, #0d1117 50%, #0a0e1a 100%);
    min-height: 100vh;
  }

  /* 사이드바 */
  section[data-testid="stSidebar"] {
    background: rgba(13, 17, 27, 0.95) !important;
    border-right: 1px solid rgba(99, 102, 241, 0.2);
  }

  /* 메인 영역 패딩 */
  .main .block-container {
    padding-top: 2rem;
    max-width: 900px;
  }

  /* 카드 스타일 */
  .studio-card {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 20px;
    backdrop-filter: blur(10px);
    transition: border-color 0.3s ease;
  }

  .studio-card:hover {
    border-color: rgba(99, 102, 241, 0.3);
  }

  /* 섹션 헤더 */
  .section-header {
    font-size: 0.8rem;
    font-weight: 600;
    color: rgba(99, 102, 241, 0.9);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 12px;
  }

  /* API 상태 배지 */
  .status-badge-ok {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(16, 185, 129, 0.15);
    color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .status-badge-error {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 20px;
    padding: 4px 12px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  /* 이력 카드 */
  .history-card {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 12px;
    transition: all 0.2s ease;
  }

  .history-card:hover {
    background: rgba(99, 102, 241, 0.05);
    border-color: rgba(99, 102, 241, 0.2);
  }

  /* 상태 배지 */
  .badge-success {
    background: rgba(16, 185, 129, 0.2);
    color: #10b981;
    border-radius: 6px;
    padding: 2px 8px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .badge-processing {
    background: rgba(245, 158, 11, 0.2);
    color: #f59e0b;
    border-radius: 6px;
    padding: 2px 8px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .badge-failed {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    border-radius: 6px;
    padding: 2px 8px;
    font-size: 0.75rem;
    font-weight: 600;
  }

  /* 업로드 영역 */
  .upload-label {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.5);
    margin-top: 4px;
  }

  /* Streamlit 기본 요소 오버라이드 */
  div[data-testid="stFileUploader"] > div {
    border: 1px dashed rgba(99, 102, 241, 0.3) !important;
    border-radius: 10px !important;
    background: rgba(99, 102, 241, 0.03) !important;
    transition: border-color 0.2s;
  }

  div[data-testid="stFileUploader"] > div:hover {
    border-color: rgba(99, 102, 241, 0.6) !important;
  }

  /* 버튼 */
  .stButton > button[kind="primary"] {
    background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
    border: none !important;
    border-radius: 10px !important;
    font-weight: 600 !important;
    letter-spacing: 0.02em !important;
    transition: all 0.2s ease !important;
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3) !important;
  }

  .stButton > button[kind="primary"]:hover {
    transform: translateY(-1px) !important;
    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5) !important;
  }

  /* 텍스트 영역 */
  .stTextArea textarea {
    background: rgba(255, 255, 255, 0.03) !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;
    border-radius: 10px !important;
    color: rgba(255, 255, 255, 0.9) !important;
    font-family: 'Inter', sans-serif !important;
  }

  /* 구분선 */
  hr {
    border-color: rgba(255, 255, 255, 0.06) !important;
  }

  /* 앱 타이틀 */
  .app-title {
    font-size: 1.6rem;
    font-weight: 700;
    background: linear-gradient(135deg, #6366f1, #a78bfa, #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 4px;
  }

  .app-subtitle {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.3);
    margin-bottom: 20px;
  }

  /* 미리보기 영상 반응형 크기 — 세로는 90vh, 가로는 부모 너비 100% */
  .stVideo video,
  [data-testid="stVideo"] video,
  video {
    max-height: 90vh !important;
    width: 100% !important;
    object-fit: contain !important;
    border-radius: 12px !important;
    background: #000 !important;
  }

  /* 잔액 표시 카드 */
  .balance-card {
    background: rgba(99, 102, 241, 0.08);
    border: 1px solid rgba(99, 102, 241, 0.25);
    border-radius: 12px;
    padding: 14px 16px;
    margin-top: 8px;
    margin-bottom: 4px;
  }

  .balance-amount {
    font-size: 1.6rem;
    font-weight: 700;
    color: #a78bfa;
    line-height: 1.2;
  }

  .balance-amount.low {
    color: #f59e0b;
  }

  .balance-amount.critical {
    color: #ef4444;
    animation: pulse-warn 1.5s ease-in-out infinite;
  }

  @keyframes pulse-warn {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
  }

  .balance-label {
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 4px;
  }

  .balance-currency {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.3);
    margin-top: 2px;
  }

  /* 예상 시간 표시 영역 */
  .time-info {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 12px 16px;
    margin: 8px 0;
  }

  .time-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.82rem;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 4px;
  }

  .time-value {
    font-weight: 600;
    color: #a78bfa;
  }
</style>
""", unsafe_allow_html=True)

# ──────────────────────────────────────────────
# DB 초기화 (앱 시작 시 1회)
# ──────────────────────────────────────────────

db.init_db()

# ──────────────────────────────────────────────
# Session State 초기화
# ──────────────────────────────────────────────

defaults = {
    "job_id": None,           # 현재 진행 중인 prediction ID
    "job_status": "idle",     # idle / polling / succeeded / failed
    "result_url": None,       # 완료 후 영상 CDN URL
    "local_path": None,       # 로컬 저장 경로
    "db_record_id": None,     # 현재 세션 DB 레코드 ID
    "error_message": None,    # 사용자에게 표시할 에러 메시지
    "poll_count": 0,          # 현재 폴링 횟수
    "job_start_time": None,   # 폴링 시작 시각 (time.time())
    "job_duration": 5,        # 선택된 영상 길이(초) — 예상 시간 계산 기준
}

for key, value in defaults.items():
    if key not in st.session_state:
        st.session_state[key] = value


# ──────────────────────────────────────────────
# 유틸 함수
# ──────────────────────────────────────────────


def build_save_path(prompt: str) -> str:
    """
    결과 영상 로컬 저장 경로를 생성한다.
    형식: outputs/YYYYMMDD_HHMMSS_프롬프트요약.mp4

    Args:
        prompt: 사용자 입력 프롬프트

    Returns:
        로컬 저장 경로 문자열
    """
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    # 프롬프트 앞 20자를 파일명으로 사용 (특수문자 제거)
    safe_prompt = "".join(c if c.isalnum() or c in " _-" else "_" for c in prompt[:20]).strip()
    safe_prompt = safe_prompt.replace(" ", "_") or "video"
    Path(OUTPUTS_DIR).mkdir(exist_ok=True)
    return f"{OUTPUTS_DIR}/{timestamp}_{safe_prompt}.mp4"


def reset_job_state() -> None:
    """현재 job 관련 session_state를 초기화한다."""
    st.session_state.job_id = None
    st.session_state.job_status = "idle"
    st.session_state.result_url = None
    st.session_state.local_path = None
    st.session_state.db_record_id = None
    st.session_state.error_message = None
    st.session_state.poll_count = 0
    st.session_state.job_start_time = None
    st.session_state.job_duration = 5


def format_status_badge(status: str) -> str:
    """상태값을 HTML 배지로 변환한다."""
    if status in TERMINAL_SUCCESS_STATUSES:
        return '<span class="badge-success">✓ 완료</span>'
    elif status == STATUS_PROCESSING or status == "polling":
        return '<span class="badge-processing">⏳ 생성 중</span>'
    elif status in TERMINAL_FAILURE_STATUSES:
        return '<span class="badge-failed">✗ 실패</span>'
    else:
        return f'<span class="badge-processing">{status}</span>'


# ──────────────────────────────────────────────
# 사이드바 UI
# ──────────────────────────────────────────────

with st.sidebar:
    # 앱 타이틀
    st.markdown('<div class="app-title">🎬 Seedance Studio</div>', unsafe_allow_html=True)
    st.markdown('<div class="app-subtitle">Seedance 2.0 by ByteDance / Atlas Cloud</div>', unsafe_allow_html=True)

    # API 키 상태 표시
    st.markdown("---")
    st.markdown('<div class="section-header">⚙ 시스템 상태</div>', unsafe_allow_html=True)

    if api_client.check_api_key_valid():
        st.markdown(
            '<div class="status-badge-ok">● API 연결됨</div>',
            unsafe_allow_html=True,
        )

        # ── 잔액 표시 ──
        import time as _time
        # 첫 로드 또는 수동 새로고침 시 잔액 가져오기
        if "balance_value" not in st.session_state:
            st.session_state.balance_value = None
            st.session_state.balance_currency = "usd"
            st.session_state.balance_last_fetched = 0.0

        # 5분마다 자동 갱신 (300초)
        now_ts = _time.time()
        needs_refresh = (now_ts - st.session_state.balance_last_fetched) > 300

        col_bal, col_ref = st.columns([3, 1])
        with col_ref:
            if st.button("🔄", key="btn_refresh_balance", help="잔액 새로고침"):
                needs_refresh = True

        if needs_refresh:
            try:
                bal = api_client.get_balance()
                st.session_state.balance_value = bal["value"]
                st.session_state.balance_currency = bal["currency"]
                st.session_state.balance_cash = bal.get("cash", bal["value"])
                st.session_state.balance_bonus = bal.get("bonus", 0.0)
                st.session_state.balance_last_fetched = _time.time()
            except Exception as _e:
                logger.warning("잔액 조회 실패 (UI 유지): %s", _e)

        with col_bal:
            val = st.session_state.balance_value
            if val is not None:
                if val <= 1.0:
                    bal_cls = "critical"
                    bal_icon = "⚠️"
                elif val <= 5.0:
                    bal_cls = "low"
                    bal_icon = "🟡"
                else:
                    bal_cls = ""
                    bal_icon = "💰"
                cash_val  = getattr(st.session_state, "balance_cash",  val)
                bonus_val = getattr(st.session_state, "balance_bonus", 0.0)
                bonus_row = (
                    f'<div style="font-size:0.72rem;color:rgba(255,255,255,0.35);margin-top:4px;">'
                    f'현금 ${cash_val:,.2f} · 보너스 ${bonus_val:,.2f}</div>'
                ) if bonus_val > 0 else (
                    f'<div style="font-size:0.72rem;color:rgba(255,255,255,0.35);margin-top:4px;">'
                    f'현금 ${cash_val:,.2f}</div>'
                )
                st.markdown(
                    f"""
                    <div class="balance-card">
                      <div class="balance-label">{bal_icon} Atlas Cloud 잔액</div>
                      <div class="balance-amount {bal_cls}">${val:,.2f}</div>
                      {bonus_row}
                      <div class="balance-currency">USD · <span style="font-size:0.68rem;color:rgba(255,255,255,0.25);">5분마다 자동 갱신</span></div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )
                if val <= 1.0:
                    st.warning("⚠️ 잔액이 $1 미만입니다. Atlas Cloud에서 크레딧을 충전해주세요.")
            else:
                st.caption("🔄 잔액 로딩 중...")
    else:
        st.markdown(
            '<div class="status-badge-error">● API 키 없음</div>',
            unsafe_allow_html=True,
        )
        st.caption("프로젝트 루트의 `.env` 파일에 `ATLAS_API_KEY=...`를 추가해주세요.")

    st.markdown("---")

    # 생성 옵션 (사이드바에서 설정)
    st.markdown('<div class="section-header">🎛 생성 옵션</div>', unsafe_allow_html=True)

    selected_resolution_label = st.selectbox(
        "해상도",
        options=list(RESOLUTION_OPTIONS.keys()),
        index=1,  # "720p (기본)" 기본 선택
        key="sel_resolution",
    )

    selected_ratio_label = st.selectbox(
        "화면 비율",
        options=list(RATIO_OPTIONS.keys()),
        index=0,  # "자동 (adaptive)" 기본 선택
        key="sel_ratio",
    )

    selected_duration_label = st.selectbox(
        "영상 길이",
        options=list(DURATION_OPTIONS.keys()),
        index=2,  # "5초 (기본)" 기본 선택
        key="sel_duration",
    )

    selected_bitrate_label = st.radio(
        "비트레이트 모드",
        options=list(BITRATE_OPTIONS.keys()),
        index=0,  # "표준" 기본 선택
        key="sel_bitrate",
    )

    generate_audio = st.toggle("🔊 오디오 자동 생성", value=True, key="toggle_audio")

    st.markdown("---")

    # 고급 옵션
    with st.expander("고급 옵션"):
        seed_value = st.number_input(
            "랜덤 시드 (-1 = 무작위)",
            min_value=-1,
            max_value=4294967295,
            value=-1,
            step=1,
            key="seed_input",
        )

    st.markdown("---")
    st.caption("💡 생성된 영상 CDN URL은 일시적으로만 유효합니다. 필요한 영상은 즉시 다운로드하세요.")


# ──────────────────────────────────────────────
# 메인 탭 구성
# ──────────────────────────────────────────────

tab_generate, tab_history = st.tabs(["🎬  영상 생성", "📋  생성 이력"])


# ══════════════════════════════════════════════
# [탭 1] 영상 생성
# ══════════════════════════════════════════════

with tab_generate:

    # ── 섹션 1: 참조 파일 업로드 ──
    st.markdown('<div class="section-header">📁 참조 파일 업로드 (선택 사항)</div>', unsafe_allow_html=True)

    with st.container():
        col1, col2 = st.columns(2)

        with col1:
            ref_image = st.file_uploader(
                "첫 프레임 이미지",
                type=ALLOWED_IMAGE_EXTENSIONS,
                key="upload_image",
                help="영상의 첫 프레임으로 사용할 이미지. 최대 30MB, jpg/png/webp 등 지원.",
            )
            if ref_image:
                size_mb = ref_image.size / (1024 * 1024)
                if size_mb > 30:
                    st.error(f"이미지 크기({size_mb:.1f}MB)가 30MB를 초과합니다.")
                else:
                    st.image(ref_image, caption=f"{ref_image.name} ({size_mb:.1f}MB)", use_container_width=True)

        with col2:
            ref_last_image = st.file_uploader(
                "마지막 프레임 이미지 (선택)",
                type=ALLOWED_IMAGE_EXTENSIONS,
                key="upload_last_image",
                help="영상의 마지막 프레임으로 사용할 이미지. 첫 프레임과 마지막 프레임을 지정하면 그 사이를 채워줍니다.",
            )
            if ref_last_image:
                size_mb = ref_last_image.size / (1024 * 1024)
                st.image(ref_last_image, caption=f"{ref_last_image.name} ({size_mb:.1f}MB)", use_container_width=True)

    st.markdown("---")

    # ── 섹션 2: 프롬프트 입력 ──
    st.markdown('<div class="section-header">✏️ 프롬프트</div>', unsafe_allow_html=True)

    prompt_text = st.text_area(
        label="프롬프트",
        placeholder="예: 광활한 우주 공간에서 서서히 회전하는 파란 행성, 배경에 별들이 반짝이고 있다. 영화적 분위기, 4K, 사실적.",
        height=120,
        key="prompt_input",
        label_visibility="collapsed",
    )
    char_count = len(prompt_text)
    st.caption(f"입력된 프롬프트: {char_count}자 (비워두면 모델이 자동 생성)")

    st.markdown("---")

    # ── 섹션 3: 생성 버튼 ──
    api_key_ok = api_client.check_api_key_valid()
    is_polling = st.session_state.job_status == "polling"

    generate_btn = st.button(
        "🎬  영상 생성 시작",
        type="primary",
        disabled=not api_key_ok or is_polling,
        use_container_width=True,
        key="btn_generate",
    )

    if not api_key_ok:
        st.warning("⚠️ API 키가 설정되지 않았습니다. `.env` 파일에 `ATLAS_API_KEY`를 추가한 뒤 앱을 재시작하세요.")

    # ── 생성 버튼 클릭 처리 ──
    if generate_btn:
        # 이전 결과 초기화
        reset_job_state()

        # 참조 이미지 준비 (Base64 인코딩)
        image_data = None
        last_image_data = None

        if ref_image is not None:
            file_bytes = ref_image.read()
            image_data = api_client.encode_file_b64(file_bytes)

        if ref_last_image is not None:
            file_bytes = ref_last_image.read()
            last_image_data = api_client.encode_file_b64(file_bytes)

        # 옵션값 매핑
        resolution = RESOLUTION_OPTIONS[selected_resolution_label]
        ratio = RATIO_OPTIONS[selected_ratio_label]
        duration = DURATION_OPTIONS[selected_duration_label]
        bitrate_mode = BITRATE_OPTIONS[selected_bitrate_label]

        # DB에 초기 레코드 저장 (processing 상태)
        try:
            record_id = db.save_generation({
                "prompt": prompt_text or "(자동 생성)",
                "resolution": resolution,
                "ratio": ratio,
                "duration": duration,
                "mode": bitrate_mode,
                "job_id": None,
                "status": "processing",
            })
            st.session_state.db_record_id = record_id
        except Exception as e:
            logger.error("초기 DB 저장 실패: %s", e)
            # DB 오류는 영상 생성을 막지 않음

        # API job 제출
        try:
            prediction_id = api_client.submit_job(
                prompt=prompt_text,
                resolution=resolution,
                ratio=ratio,
                duration=duration,
                bitrate_mode=bitrate_mode,
                generate_audio=generate_audio,
                image_data=image_data,
                last_image_data=last_image_data,
                seed=int(st.session_state.seed_input),
            )

            st.session_state.job_id = prediction_id
            st.session_state.job_status = "polling"
            st.session_state.poll_count = 0
            st.session_state.job_start_time = __import__('time').time()
            st.session_state.job_duration = DURATION_OPTIONS[selected_duration_label]

            # DB 레코드에 job_id 업데이트
            if st.session_state.db_record_id:
                db.update_generation(st.session_state.db_record_id, {"job_id": prediction_id})

            st.rerun()

        except AtlasAPIError as e:
            st.session_state.job_status = "failed"
            st.session_state.error_message = e.message
            if st.session_state.db_record_id:
                db.update_generation(st.session_state.db_record_id, {
                    "status": "failed",
                    "error_msg": e.message,
                })

    # ── 섹션 4: 진행 상태 표시 ──
    if st.session_state.job_status == "polling":
        import time
        prediction_id = st.session_state.job_id

        # 예상 소요 시간 계산
        job_duration_val = getattr(st.session_state, "job_duration", 5)
        estimated_total = ESTIMATED_TIME_BY_DURATION.get(job_duration_val, ESTIMATED_TIME_DEFAULT)
        elapsed = 0
        if st.session_state.job_start_time:
            elapsed = int(time.time() - st.session_state.job_start_time)
        remaining = max(0, estimated_total - elapsed)
        progress_ratio = min(elapsed / estimated_total, 0.97)  # 97%에서 멈춴 (완료신호 기다려야하니까)

        with st.status("영상을 생성하고 있어요...", expanded=True) as status_box:
            # 예상 시간 UI
            st.markdown(
                f"""
                <div class="time-info">
                  <div class="time-row">
                    <span>🕒 경과 시간</span>
                    <span class="time-value">{elapsed}초</span>
                  </div>
                  <div class="time-row">
                    <span>⏳ 예상 남은 시간</span>
                    <span class="time-value">{'\uc6d0 완료 예정' if remaining == 0 else f'{remaining}초 남음'}</span>
                  </div>
                  <div class="time-row">
                    <span>📊 기준 예상시간</span>
                    <span class="time-value">~{estimated_total}초 ({job_duration_val if job_duration_val > 0 else '자동'}초 영상)</span>
                  </div>
                </div>
                """,
                unsafe_allow_html=True,
            )
            st.progress(progress_ratio)
            st.caption(f"prediction ID: `{prediction_id}`")

            try:
                status_info = api_client.get_job_status(prediction_id)
                current_status = status_info["status"]
                st.session_state.poll_count += 1

                if current_status in TERMINAL_SUCCESS_STATUSES:
                    result_url = status_info.get("result_url")
                    st.session_state.result_url = result_url
                    st.session_state.job_status = "succeeded"

                    # DB 업데이트
                    if st.session_state.db_record_id:
                        db.update_generation(st.session_state.db_record_id, {
                            "status": "succeeded",
                            "result_url": result_url,
                        })

                    # 생성 완료 즉시 자동으로 로컬에 다운로드 (미리보기를 위해)
                    if result_url and not st.session_state.local_path:
                        st.write("⬇️ 영상을 로컬에 저장 중...")
                        try:
                            save_path = build_save_path(st.session_state.get("prompt_input", "video"))
                            saved_path = api_client.download_video(result_url, save_path)
                            st.session_state.local_path = saved_path
                            if st.session_state.db_record_id:
                                db.update_generation(st.session_state.db_record_id, {
                                    "local_path": saved_path,
                                })
                        except Exception as dl_err:
                            logger.warning("자동 다운로드 실패: %s", dl_err)

                    status_box.update(label="✅ 영상 생성 완료!", state="complete")
                    st.rerun()

                elif current_status in TERMINAL_FAILURE_STATUSES:
                    error_msg = status_info.get("error") or "알 수 없는 오류로 생성에 실패했습니다."
                    st.session_state.job_status = "failed"
                    st.session_state.error_message = error_msg

                    # DB 업데이트
                    if st.session_state.db_record_id:
                        db.update_generation(st.session_state.db_record_id, {
                            "status": "failed",
                            "error_msg": error_msg,
                        })

                    status_box.update(label="❌ 영상 생성 실패", state="error")
                    st.rerun()

                else:
                    # 아직 처리 중 — 잠시 후 다시 polling
                    import time
                    time.sleep(POLL_INTERVAL_SEC)
                    st.rerun()

            except AtlasAPIError as e:
                st.session_state.job_status = "failed"
                st.session_state.error_message = e.message
                status_box.update(label="❌ 오류 발생", state="error")
                st.rerun()

    # ── 에러 메시지 표시 ──
    if st.session_state.job_status == "failed" and st.session_state.error_message:
        st.error(f"❌ {st.session_state.error_message}")

        col_retry, _ = st.columns([1, 3])
        with col_retry:
            if st.button("🔄 다시 시도", key="btn_retry"):
                reset_job_state()
                st.rerun()

    # ── 섹션 5: 결과 미리보기 + 다운로드 ──
    if st.session_state.job_status == "succeeded" and st.session_state.result_url:
        st.markdown("---")
        st.markdown('<div class="section-header">🎥 생성 결과</div>', unsafe_allow_html=True)

        result_url = st.session_state.result_url
        local_path = st.session_state.local_path

        # 영상 미리보기 — 로컬 파일 우선, 없으면 CDN URL 시도
        if local_path and Path(local_path).exists():
            st.video(local_path)
        else:
            try:
                st.video(result_url)
            except Exception:
                st.info(f"영상 미리보기를 불러올 수 없습니다. 아래 URL로 직접 접근하세요:\n{result_url}")

        col_dl, col_new = st.columns([2, 1])

        with col_dl:
            if local_path and Path(local_path).exists():
                # 로컬 파일로 다운로드 버튼 제공
                with open(local_path, "rb") as f:
                    st.download_button(
                        label="⬇️ 영상 다운로드",
                        data=f,
                        file_name=Path(local_path).name,
                        mime="video/mp4",
                        use_container_width=True,
                        key="btn_download_local",
                    )
                st.success(f"로컬 저장 완료: `{local_path}`")
            else:
                # 자동 다운로드 실패한 경우 수동 버튼 제공
                if st.button("⬇️ 로컬에 저장하기", use_container_width=True, key="btn_save_local"):
                    save_path = build_save_path(st.session_state.get("prompt_input", "video"))
                    with st.spinner("다운로드 중..."):
                        try:
                            saved_path = api_client.download_video(result_url, save_path)
                            st.session_state.local_path = saved_path
                            if st.session_state.db_record_id:
                                db.update_generation(st.session_state.db_record_id, {
                                    "local_path": saved_path,
                                })
                            st.rerun()
                        except AtlasAPIError as e:
                            st.error(f"다운로드 실패: {e.message}")

        with col_new:
            if st.button("➕ 새 영상 만들기", use_container_width=True, key="btn_new"):
                reset_job_state()
                st.rerun()


# ══════════════════════════════════════════════
# [탭 2] 생성 이력
# ══════════════════════════════════════════════

with tab_history:
    st.markdown('<div class="section-header">📋 생성 이력 (최근 50건)</div>', unsafe_allow_html=True)

    col_refresh, col_empty = st.columns([1, 4])
    with col_refresh:
        if st.button("🔄 새로고침", key="btn_refresh_history"):
            st.rerun()

    history_records = db.get_all_history(limit=50)

    if not history_records:
        st.info("아직 생성 이력이 없습니다. [영상 생성] 탭에서 첫 번째 영상을 만들어보세요! 🎬")
    else:
        for record in history_records:
            # 프롬프트 미리보기 (50자)
            prompt_preview = record["prompt"][:60] + ("..." if len(record["prompt"]) > 60 else "")
            created_at = record["created_at"]
            status = record["status"]
            badge_html = format_status_badge(status)

            with st.container():
                st.markdown(
                    f"""
                    <div class="history-card">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                            <span style="font-size:0.9rem; color:rgba(255,255,255,0.8); font-weight:500;">{prompt_preview}</span>
                            {badge_html}
                        </div>
                        <div style="font-size:0.75rem; color:rgba(255,255,255,0.3);">
                            {created_at} &nbsp;·&nbsp; {record['resolution']} &nbsp;·&nbsp; {record['ratio']} &nbsp;·&nbsp; {record['duration']}초
                        </div>
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

                # 완료된 경우 재생/다운로드 버튼
                if status in TERMINAL_SUCCESS_STATUSES and record.get("result_url"):
                    with st.expander(f"🎬 결과 보기 (ID: {record['id']})"):
                        result_url = record["result_url"]
                        try:
                            st.video(result_url)
                        except Exception:
                            st.markdown(f"[영상 URL로 바로 접근하기]({result_url})")

                        local_path = record.get("local_path")
                        if local_path and Path(local_path).exists():
                            with open(local_path, "rb") as f:
                                st.download_button(
                                    label="⬇️ 다운로드",
                                    data=f,
                                    file_name=Path(local_path).name,
                                    mime="video/mp4",
                                    key=f"hist_dl_{record['id']}",
                                )
                            st.caption(f"로컬 경로: `{local_path}`")
                        else:
                            if st.button(f"⬇️ 로컬에 저장", key=f"hist_save_{record['id']}"):
                                save_path = build_save_path(record["prompt"])
                                with st.spinner("다운로드 중..."):
                                    try:
                                        saved = api_client.download_video(result_url, save_path)
                                        db.update_generation(record["id"], {"local_path": saved})
                                        st.success(f"저장 완료: `{saved}`")
                                        st.rerun()
                                    except AtlasAPIError as e:
                                        st.error(f"다운로드 실패: {e.message}")

                elif status in TERMINAL_FAILURE_STATUSES:
                    if record.get("error_msg"):
                        st.caption(f"⚠️ 실패 사유: {record['error_msg'][:100]}")

            st.markdown("---")
