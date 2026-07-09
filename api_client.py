"""
api_client.py — Atlas Cloud API 통신 계층
UI 로직과 완전히 분리된 순수 API 클라이언트.
submit → poll → download 흐름을 담당한다.
"""

import base64
import logging
import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

from config import (
    API_BASE_URL,
    API_PUBLIC_BASE_URL,
    ENDPOINT_BALANCE,
    ENDPOINT_GENERATE,
    ENDPOINT_PREDICTION,
    ENDPOINT_UPLOAD,
    MAX_IMAGE_SIZE_BYTES,
    MAX_POLL_ATTEMPTS,
    MODEL_ID,
    OUTPUTS_DIR,
    POLL_INTERVAL_SEC,
    REQUEST_TIMEOUT_SEC,
    TERMINAL_FAILURE_STATUSES,
    TERMINAL_SUCCESS_STATUSES,
)

# 환경변수 로드 (.env 파일에서 API 키를 읽는다)
load_dotenv()

# 로거 설정 (개인 로컬 도구이므로 간단하게)
logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────
# 커스텀 예외 클래스
# ──────────────────────────────────────────────


class AtlasAPIError(Exception):
    """
    Atlas Cloud API 관련 오류를 모두 감싸는 커스텀 예외.
    사용자에게 표시할 한국어 메시지를 message 속성에 담는다.
    """

    def __init__(self, message: str, status_code: int | None = None):
        """
        Args:
            message: 사용자에게 표시할 한국어 오류 메시지
            status_code: HTTP 상태 코드 (해당 없으면 None)
        """
        super().__init__(message)
        self.message = message
        self.status_code = status_code


# ──────────────────────────────────────────────
# 내부 유틸 함수
# ──────────────────────────────────────────────


def _get_api_key() -> str:
    """
    .env 파일에서 ATLAS_API_KEY를 읽어 반환한다.

    Returns:
        API 키 문자열

    Raises:
        AtlasAPIError: API 키가 설정되지 않은 경우
    """
    api_key = os.getenv("ATLAS_API_KEY", "").strip()
    if not api_key:
        raise AtlasAPIError(
            "API 키가 설정되지 않았습니다. 프로젝트 루트의 .env 파일에 "
            "ATLAS_API_KEY=your_key_here 를 추가해주세요."
        )
    return api_key


def _build_headers() -> dict[str, str]:
    """
    Atlas Cloud API 인증 헤더를 생성한다.

    Returns:
        Authorization Bearer 토큰이 포함된 헤더 딕셔너리
    """
    return {
        "Authorization": f"Bearer {_get_api_key()}",
        "Content-Type": "application/json",
    }


def _handle_http_error(response: requests.Response) -> None:
    """
    HTTP 오류 응답을 한국어 사용자 메시지로 변환하여 예외를 발생시킨다.

    Args:
        response: requests 응답 객체

    Raises:
        AtlasAPIError: 오류 상태 코드에 따라 적절한 메시지와 함께 발생
    """
    code = response.status_code

    # 응답 본문에서 에러 메시지 추출 시도
    try:
        error_detail = response.json().get("message", "")
    except Exception:
        error_detail = response.text[:200] if response.text else ""

    if code in (401, 403):
        raise AtlasAPIError(
            "API 키가 유효하지 않습니다. .env 파일의 ATLAS_API_KEY를 확인해주세요.",
            status_code=code,
        )
    elif code == 429:
        raise AtlasAPIError(
            "크레딧 잔액이 부족합니다. Atlas Cloud 콘솔에서 크레딧을 충전해주세요.\n"
            "https://www.atlascloud.ai/billing",
            status_code=code,
        )
    elif code == 422:
        raise AtlasAPIError(
            f"요청 파라미터가 올바르지 않습니다. 입력값을 확인해주세요.\n상세: {error_detail}",
            status_code=code,
        )
    elif 400 <= code < 500:
        raise AtlasAPIError(
            f"요청 오류가 발생했습니다. (코드: {code})\n상세: {error_detail}",
            status_code=code,
        )
    elif code >= 500:
        raise AtlasAPIError(
            f"Atlas Cloud 서버 오류가 발생했습니다. (코드: {code})\n"
            "잠시 후 다시 시도해주세요.",
            status_code=code,
        )


# ──────────────────────────────────────────────
# 공개 API 함수
# ──────────────────────────────────────────────


def encode_file_b64(file_bytes: bytes) -> str:
    """
    파일 바이트를 Base64 문자열로 인코딩한다.
    Atlas Cloud API에 이미지를 직접 전달할 때 사용한다.

    Args:
        file_bytes: 인코딩할 파일의 바이트 데이터

    Returns:
        Base64 인코딩된 문자열
    """
    return base64.b64encode(file_bytes).decode("utf-8")


def check_api_key_valid() -> bool:
    """
    API 키가 .env에 설정되어 있는지 확인한다.
    실제 API를 호출하지 않고 키 존재 여부만 확인한다.

    Returns:
        API 키가 설정되어 있으면 True, 아니면 False
    """
    api_key = os.getenv("ATLAS_API_KEY", "").strip()
    return bool(api_key)


def get_balance() -> dict:
    """
    Atlas Cloud 계정의 잔액을 조회한다.
    https://api.atlascloud.ai/public/v1/balance

    Returns:
        {
            "value": float,    # 달러 잔액
            "currency": str,   # 통화 ("usd")
        }

    Raises:
        AtlasAPIError: 조회 실패 시
    """
    url = f"{API_PUBLIC_BASE_URL}{ENDPOINT_BALANCE}"
    headers = {
        "Authorization": f"Bearer {_get_api_key()}",
    }

    try:
        response = requests.get(url, headers=headers, timeout=REQUEST_TIMEOUT_SEC)
    except requests.ConnectionError:
        raise AtlasAPIError("네트워크 연결을 확인해주세요.")
    except requests.Timeout:
        raise AtlasAPIError("잔액 조회 시간이 초과되었습니다.")

    if not response.ok:
        _handle_http_error(response)

    try:
        raw = response.json()
        logger.info("잔액 API 응답 원문: %s", raw)

        # 실제 응답 구조:
        # {
        #   "available": {"value": "21.81", "currency": "usd"},
        #   "cash":      {"value": "21.81", "currency": "usd"},
        #   "bonus":     {"value": "0.00",  "currency": "usd"},
        #   ...
        # }
        available = raw.get("available", {})
        cash = raw.get("cash", {})
        bonus = raw.get("bonus", {})

        value_raw = available.get("value")
        if value_raw is None:
            logger.warning("잔액 API 응답에서 'available.value'를 찾지 못했습니다. 응답: %s", raw)
            raise AtlasAPIError("잔액 정보를 가져올 수 없습니다. API 응답 형식을 확인해주세요.")

        return {
            "value":    float(value_raw),
            "currency": available.get("currency", "usd"),
            "cash":     float(cash.get("value", 0)),
            "bonus":    float(bonus.get("value", 0)),
        }
    except AtlasAPIError:
        raise
    except Exception as e:
        logger.error("잔액 조회 응답 파싱 실패: %s | 원문: %s", e, response.text[:300])
        raise AtlasAPIError(f"잔액 정보를 가져올 수 없습니다: {e}")


def upload_file(file_bytes: bytes, filename: str, mime_type: str) -> str:
    """
    파일을 Atlas Cloud에 업로드하고 asset URL을 반환한다.
    참조 파일(이미지/영상/오디오)을 API에 전달하기 위해 먼저 업로드하는 용도.

    Args:
        file_bytes: 업로드할 파일의 바이트 데이터
        filename: 파일명 (확장자 포함)
        mime_type: MIME 타입 (예: "image/png")

    Returns:
        업로드된 파일의 URL 또는 asset 참조 문자열

    Raises:
        AtlasAPIError: 파일 크기 초과, 업로드 실패 등
    """
    # 파일 크기 검증 (이미지의 경우 30MB 제한)
    if len(file_bytes) > MAX_IMAGE_SIZE_BYTES:
        size_mb = len(file_bytes) / (1024 * 1024)
        raise AtlasAPIError(
            f"파일 크기({size_mb:.1f}MB)가 제한(30MB)을 초과합니다. "
            "더 작은 파일을 사용해주세요."
        )

    url = f"{API_BASE_URL}{ENDPOINT_UPLOAD}"
    headers = {
        "Authorization": f"Bearer {_get_api_key()}",
        # Content-Type은 requests가 multipart 전송 시 자동 설정
    }

    try:
        response = requests.post(
            url,
            headers=headers,
            files={"file": (filename, file_bytes, mime_type)},
            timeout=REQUEST_TIMEOUT_SEC,
        )
    except requests.ConnectionError:
        raise AtlasAPIError("네트워크 연결을 확인해주세요. 인터넷에 연결되어 있는지 확인하세요.")
    except requests.Timeout:
        raise AtlasAPIError("파일 업로드 시간이 초과됐습니다. 잠시 후 다시 시도해주세요.")

    if not response.ok:
        _handle_http_error(response)

    try:
        data = response.json()
        # 응답에서 파일 URL 또는 asset ID 추출
        # Atlas Cloud 업로드 응답 구조: {"data": {"url": "..."}} 또는 {"data": {"id": "..."}}
        file_url = (
            data.get("data", {}).get("url")
            or data.get("data", {}).get("file_url")
            or data.get("url")
        )
        if not file_url:
            logger.warning("파일 업로드 응답에서 URL을 찾지 못했습니다: %s", data)
            raise AtlasAPIError("파일 업로드는 성공했지만 URL을 가져오지 못했습니다.")
        return file_url
    except AtlasAPIError:
        raise
    except Exception as e:
        logger.error("파일 업로드 응답 파싱 실패: %s", e)
        raise AtlasAPIError(f"파일 업로드 응답을 처리할 수 없습니다: {e}")


def submit_job(
    prompt: str,
    resolution: str,
    ratio: str,
    duration: int,
    bitrate_mode: str,
    generate_audio: bool,
    image_data: str | None = None,
    last_image_data: str | None = None,
    seed: int = -1,
) -> str:
    """
    Atlas Cloud에 영상 생성 job을 제출하고 prediction_id를 반환한다.
    image_data는 Base64 문자열 또는 URL을 모두 허용한다.

    Args:
        prompt: 영상 생성 텍스트 프롬프트
        resolution: 해상도 (예: "720p")
        ratio: 화면 비율 (예: "adaptive")
        duration: 영상 길이 초 (-1은 자동)
        bitrate_mode: 비트레이트 모드 ("standard" 또는 "high")
        generate_audio: 오디오 자동 생성 여부
        image_data: 첫 프레임 참조 이미지 (URL 또는 Base64 문자열, 없으면 None)
        last_image_data: 마지막 프레임 참조 이미지 (URL 또는 Base64 문자열, 없으면 None)
        seed: 랜덤 시드 (-1은 무작위)

    Returns:
        생성된 prediction_id (상태 조회에 사용)

    Raises:
        AtlasAPIError: 제출 실패 시
    """
    # 요청 본문 구성
    payload: dict = {
        "model": MODEL_ID,
        "prompt": prompt,
        "duration": duration,
        "resolution": resolution,
        "ratio": ratio,
        "bitrate_mode": bitrate_mode,
        "generate_audio": generate_audio,
        "seed": seed,
        "watermark": False,
        "return_last_frame": False,
    }

    # 참조 이미지가 있을 때만 포함 (필수 파라미터는 아님)
    if image_data:
        payload["image"] = image_data
    if last_image_data:
        payload["last_image"] = last_image_data

    url = f"{API_BASE_URL}{ENDPOINT_GENERATE}"

    try:
        response = requests.post(
            url,
            headers=_build_headers(),
            json=payload,
            timeout=REQUEST_TIMEOUT_SEC,
        )
    except requests.ConnectionError:
        raise AtlasAPIError("네트워크 연결을 확인해주세요. 인터넷에 연결되어 있는지 확인하세요.")
    except requests.Timeout:
        raise AtlasAPIError("요청 시간이 초과됐습니다. 잠시 후 다시 시도해주세요.")

    if not response.ok:
        _handle_http_error(response)

    try:
        data = response.json()
        prediction_id = data.get("data", {}).get("id")
        if not prediction_id:
            raise AtlasAPIError("서버에서 prediction ID를 받지 못했습니다. 다시 시도해주세요.")
        logger.info("영상 생성 job 제출 완료. prediction_id=%s", prediction_id)
        return prediction_id
    except AtlasAPIError:
        raise
    except Exception as e:
        logger.error("영상 생성 요청 응답 파싱 실패: %s", e)
        raise AtlasAPIError(f"서버 응답을 처리할 수 없습니다: {e}")


def get_job_status(prediction_id: str) -> dict:
    """
    prediction_id로 job 상태를 조회하고 상태 정보를 반환한다.

    Args:
        prediction_id: submit_job()에서 반환된 prediction ID

    Returns:
        상태 딕셔너리:
        {
            "status": "processing" | "completed" | "succeeded" | "failed" | "timeout",
            "result_url": str | None,   # 완료 시 결과 영상 URL
            "error": str | None,        # 실패 시 오류 메시지
        }

    Raises:
        AtlasAPIError: 상태 조회 실패 시
    """
    url = f"{API_BASE_URL}{ENDPOINT_PREDICTION.format(prediction_id=prediction_id)}"

    try:
        response = requests.get(
            url,
            headers=_build_headers(),
            timeout=REQUEST_TIMEOUT_SEC,
        )
    except requests.ConnectionError:
        raise AtlasAPIError("네트워크 연결을 확인해주세요.")
    except requests.Timeout:
        raise AtlasAPIError("상태 조회 시간이 초과됐습니다. 잠시 후 다시 시도해주세요.")

    if not response.ok:
        _handle_http_error(response)

    try:
        data = response.json().get("data", {})
        status = data.get("status", "processing")
        outputs = data.get("outputs", [])
        result_url = outputs[0] if outputs else None
        error_msg = data.get("error") or data.get("message")

        return {
            "status": status,
            "result_url": result_url,
            "error": error_msg,
        }
    except Exception as e:
        logger.error("상태 조회 응답 파싱 실패: %s", e)
        raise AtlasAPIError(f"상태 조회 응답을 처리할 수 없습니다: {e}")


def poll_until_complete(
    prediction_id: str,
    progress_callback=None,
) -> str:
    """
    job이 완료될 때까지 주기적으로 상태를 조회하고 결과 URL을 반환한다.
    Streamlit에서 직접 사용하지 않고, 일반 Python 환경(테스트 등)에서 사용.

    Args:
        prediction_id: submit_job()에서 반환된 prediction ID
        progress_callback: 진행 상황을 전달받는 콜백 함수 (status: str 인자)

    Returns:
        완료된 영상의 URL

    Raises:
        AtlasAPIError: 생성 실패 또는 최대 시도 횟수 초과 시
    """
    for attempt in range(MAX_POLL_ATTEMPTS):
        status_info = get_job_status(prediction_id)
        status = status_info["status"]

        if progress_callback:
            progress_callback(status)

        if status in TERMINAL_SUCCESS_STATUSES:
            result_url = status_info.get("result_url")
            if not result_url:
                raise AtlasAPIError("영상 생성은 완료됐지만 결과 URL을 가져오지 못했습니다.")
            return result_url

        if status in TERMINAL_FAILURE_STATUSES:
            error_detail = status_info.get("error") or "알 수 없는 오류"
            raise AtlasAPIError(
                f"영상 생성에 실패했습니다.\n상세: {error_detail}\n"
                "프롬프트나 참조 이미지를 변경한 뒤 다시 시도해주세요."
            )

        logger.debug("폴링 중... attempt=%d, status=%s", attempt + 1, status)
        time.sleep(POLL_INTERVAL_SEC)

    raise AtlasAPIError(
        f"영상 생성이 {MAX_POLL_ATTEMPTS * POLL_INTERVAL_SEC // 60}분 내에 완료되지 않았습니다. "
        "나중에 이력 탭에서 결과를 확인하거나, 다시 시도해주세요."
    )


def download_video(url: str, save_path: str) -> str:
    """
    결과 영상 URL에서 파일을 다운로드하여 로컬에 저장한다.

    Args:
        url: 다운로드할 영상 URL
        save_path: 로컬 저장 경로 (디렉토리 포함, 예: "outputs/20260704_result.mp4")

    Returns:
        저장된 로컬 파일 경로 (save_path와 동일)

    Raises:
        AtlasAPIError: 다운로드 실패 시
    """
    # 저장 디렉토리가 없으면 생성
    Path(save_path).parent.mkdir(parents=True, exist_ok=True)

    try:
        response = requests.get(url, stream=True, timeout=REQUEST_TIMEOUT_SEC * 2)
    except requests.ConnectionError:
        raise AtlasAPIError("영상 다운로드 중 네트워크 오류가 발생했습니다.")
    except requests.Timeout:
        raise AtlasAPIError("영상 다운로드 시간이 초과됐습니다.")

    if not response.ok:
        raise AtlasAPIError(
            f"영상 다운로드에 실패했습니다. (코드: {response.status_code})\n"
            "URL이 만료됐을 수 있습니다. 이력에서 다시 다운로드를 시도해주세요."
        )

    try:
        with open(save_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        logger.info("영상 다운로드 완료: %s", save_path)
        return save_path
    except OSError as e:
        raise AtlasAPIError(f"파일 저장에 실패했습니다: {e}")
