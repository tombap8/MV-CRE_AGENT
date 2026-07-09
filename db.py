"""
db.py — SQLite 생성 이력 관리
sqlite3 표준 라이브러리만 사용한다. ORM은 사용하지 않는다.
"""

import logging
import sqlite3
from datetime import datetime
from pathlib import Path

from config import DB_PATH

logger = logging.getLogger(__name__)


def _get_connection() -> sqlite3.Connection:
    """
    SQLite 연결 객체를 반환한다.
    row_factory를 설정하여 결과를 딕셔너리로 받는다.

    Returns:
        sqlite3 Connection 객체 (row_factory = sqlite3.Row)
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # 컬럼명으로 접근 가능하게 설정
    return conn


def init_db() -> None:
    """
    SQLite DB 파일과 generation_history 테이블을 초기화한다.
    이미 존재하면 아무 것도 하지 않는다 (IF NOT EXISTS).
    앱 시작 시 한 번 호출한다.
    """
    # DB 파일이 위치할 디렉토리 생성 (필요 시)
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)

    conn = _get_connection()
    try:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS generation_history (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at  TEXT    NOT NULL,               -- ISO 8601 형식
                prompt      TEXT    NOT NULL,               -- 사용자 입력 프롬프트
                resolution  TEXT    NOT NULL,               -- 선택한 해상도
                ratio       TEXT    NOT NULL,               -- 화면 비율
                duration    INTEGER NOT NULL,               -- 영상 길이 (초)
                mode        TEXT    NOT NULL,               -- fast / standard
                job_id      TEXT,                           -- Atlas Cloud prediction ID
                status      TEXT    NOT NULL DEFAULT 'processing',  -- processing/succeeded/failed
                result_url  TEXT,                           -- CDN 결과 URL (유효기간 있음)
                local_path  TEXT,                           -- 로컬 저장 경로 (없으면 NULL)
                error_msg   TEXT                            -- 실패 시 오류 메시지
            )
        """)
        conn.commit()
        logger.info("DB 초기화 완료: %s", DB_PATH)
    except sqlite3.Error as e:
        logger.error("DB 초기화 실패: %s", e)
        raise
    finally:
        conn.close()


def save_generation(record: dict) -> int:
    """
    새로운 생성 이력 레코드를 저장하고 삽입된 row id를 반환한다.

    Args:
        record: 저장할 데이터 딕셔너리. 예:
            {
                "prompt": "...",
                "resolution": "720p",
                "ratio": "adaptive",
                "duration": 5,
                "mode": "standard",
                "job_id": "pred_abc123",
                "status": "processing",
                "result_url": None,
                "local_path": None,
                "error_msg": None,
            }

    Returns:
        삽입된 레코드의 id (INTEGER PRIMARY KEY)
    """
    now = datetime.now().isoformat(timespec="seconds")

    conn = _get_connection()
    try:
        cursor = conn.execute(
            """
            INSERT INTO generation_history
                (created_at, prompt, resolution, ratio, duration, mode,
                 job_id, status, result_url, local_path, error_msg)
            VALUES
                (:created_at, :prompt, :resolution, :ratio, :duration, :mode,
                 :job_id, :status, :result_url, :local_path, :error_msg)
            """,
            {
                "created_at": now,
                "prompt": record.get("prompt", ""),
                "resolution": record.get("resolution", ""),
                "ratio": record.get("ratio", ""),
                "duration": record.get("duration", -1),
                "mode": record.get("mode", ""),
                "job_id": record.get("job_id"),
                "status": record.get("status", "processing"),
                "result_url": record.get("result_url"),
                "local_path": record.get("local_path"),
                "error_msg": record.get("error_msg"),
            },
        )
        conn.commit()
        row_id = cursor.lastrowid
        logger.info("이력 저장 완료: id=%d, job_id=%s", row_id, record.get("job_id"))
        return row_id
    except sqlite3.Error as e:
        logger.error("이력 저장 실패: %s", e)
        raise
    finally:
        conn.close()


def update_generation(record_id: int, updates: dict) -> None:
    """
    기존 이력 레코드의 특정 필드를 업데이트한다.
    job 완료 후 status, result_url, local_path를 갱신할 때 사용한다.

    Args:
        record_id: 업데이트할 레코드의 id
        updates: 변경할 필드와 값 딕셔너리. 지원 필드:
            - status: str
            - result_url: str | None
            - local_path: str | None
            - error_msg: str | None
    """
    # 허용된 필드만 업데이트
    allowed_fields = {"status", "result_url", "local_path", "error_msg", "job_id"}
    safe_updates = {k: v for k, v in updates.items() if k in allowed_fields}

    if not safe_updates:
        logger.warning("업데이트할 필드가 없습니다. record_id=%d", record_id)
        return

    set_clause = ", ".join(f"{field} = :{field}" for field in safe_updates)
    safe_updates["id"] = record_id

    conn = _get_connection()
    try:
        conn.execute(
            f"UPDATE generation_history SET {set_clause} WHERE id = :id",
            safe_updates,
        )
        conn.commit()
        logger.info("이력 업데이트 완료: id=%d, fields=%s", record_id, list(safe_updates.keys()))
    except sqlite3.Error as e:
        logger.error("이력 업데이트 실패: %s", e)
        raise
    finally:
        conn.close()


def get_all_history(limit: int = 50) -> list[dict]:
    """
    최근 생성 이력을 생성 일시 역순으로 조회한다.

    Args:
        limit: 반환할 최대 레코드 수 (기본 50)

    Returns:
        이력 딕셔너리 리스트 (최신 순). 각 딕셔너리의 키:
        id, created_at, prompt, resolution, ratio, duration, mode,
        job_id, status, result_url, local_path, error_msg
    """
    conn = _get_connection()
    try:
        cursor = conn.execute(
            """
            SELECT id, created_at, prompt, resolution, ratio, duration, mode,
                   job_id, status, result_url, local_path, error_msg
            FROM generation_history
            ORDER BY created_at DESC
            LIMIT ?
            """,
            (limit,),
        )
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    except sqlite3.Error as e:
        logger.error("이력 조회 실패: %s", e)
        return []
    finally:
        conn.close()


def get_record_by_id(record_id: int) -> dict | None:
    """
    특정 id의 이력 레코드를 조회한다.

    Args:
        record_id: 조회할 레코드의 id

    Returns:
        이력 딕셔너리 또는 None (없을 경우)
    """
    conn = _get_connection()
    try:
        cursor = conn.execute(
            "SELECT * FROM generation_history WHERE id = ?",
            (record_id,),
        )
        row = cursor.fetchone()
        return dict(row) if row else None
    except sqlite3.Error as e:
        logger.error("이력 단건 조회 실패: id=%d, %s", record_id, e)
        return None
    finally:
        conn.close()
