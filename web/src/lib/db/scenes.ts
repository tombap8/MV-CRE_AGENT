import { DatabaseSync } from "node:sqlite";
import path from "path";
import type { SceneEntry, SceneJobStatus } from "@/lib/atlas/types";

const DB_PATH = path.join(process.cwd(), "..", "scenes.db");

const SEED_SCENES: Array<Pick<SceneEntry, "id" | "sceneName" | "gradientClassName" | "firstFrameImageUrl">> = [
  {
    id: "ruins",
    sceneName: "Scene 1: Ancient Ruins",
    gradientClassName: "bg-gradient-to-br from-amber-200 via-orange-300 to-slate-500",
    firstFrameImageUrl: "/sample-scenes/ancient-ruins.png",
  },
  {
    id: "city",
    sceneName: "Scene 2: Future City",
    gradientClassName: "bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950",
    firstFrameImageUrl: "/sample-scenes/future-city.png",
  },
  {
    id: "rooftop",
    sceneName: "Scene 3: City Rooftop",
    gradientClassName: "bg-gradient-to-br from-slate-600 via-indigo-700 to-slate-900",
    firstFrameImageUrl: "/sample-scenes/city-rooftop.png",
  },
  {
    id: "neon",
    sceneName: "Scene 4: Neon Skyline",
    gradientClassName: "bg-gradient-to-br from-purple-700 via-fuchsia-600 to-orange-400",
    firstFrameImageUrl: "/sample-scenes/neon-skyline.png",
  },
  {
    id: "crowd",
    sceneName: "Scene 5: Concert Crowd",
    gradientClassName: "bg-gradient-to-br from-amber-600 via-slate-700 to-slate-900",
    firstFrameImageUrl: "/sample-scenes/concert-crowd.png",
  },
];

let db: DatabaseSync | null = null;

function getDb(): DatabaseSync {
  if (db) return db;

  db = new DatabaseSync(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS scenes (
      id TEXT PRIMARY KEY,
      scene_name TEXT NOT NULL,
      gradient_class_name TEXT NOT NULL,
      first_frame_image_url TEXT,
      is_standalone INTEGER NOT NULL DEFAULT 0,
      job_status TEXT NOT NULL DEFAULT 'idle',
      result_url TEXT,
      local_path TEXT,
      error_message TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  const { count } = db.prepare("SELECT COUNT(*) as count FROM scenes").get() as { count: number };
  if (count === 0) {
    const now = new Date().toISOString();
    const insert = db.prepare(`
      INSERT INTO scenes (id, scene_name, gradient_class_name, first_frame_image_url, is_standalone, job_status, created_at, updated_at)
      VALUES (?, ?, ?, ?, 0, 'idle', ?, ?)
    `);
    for (const seed of SEED_SCENES) {
      insert.run(seed.id, seed.sceneName, seed.gradientClassName, seed.firstFrameImageUrl, now, now);
    }
  }

  return db;
}

function rowToScene(row: Record<string, unknown>): SceneEntry {
  return {
    id: row.id as string,
    sceneName: row.scene_name as string,
    gradientClassName: row.gradient_class_name as string,
    firstFrameImageUrl: (row.first_frame_image_url as string | null) ?? null,
    isStandalone: Boolean(row.is_standalone),
    jobStatus: row.job_status as SceneJobStatus,
    resultUrl: (row.result_url as string | null) ?? null,
    localPath: (row.local_path as string | null) ?? null,
    errorMessage: (row.error_message as string | null) ?? null,
  };
}

export function listScenes(): SceneEntry[] {
  const rows = getDb().prepare("SELECT * FROM scenes ORDER BY created_at ASC").all();
  return rows.map(rowToScene);
}

export function insertScene(scene: SceneEntry): SceneEntry {
  const now = new Date().toISOString();
  getDb()
    .prepare(
      `INSERT INTO scenes (id, scene_name, gradient_class_name, first_frame_image_url, is_standalone, job_status, result_url, local_path, error_message, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      scene.id,
      scene.sceneName,
      scene.gradientClassName,
      scene.firstFrameImageUrl,
      scene.isStandalone ? 1 : 0,
      scene.jobStatus,
      scene.resultUrl,
      scene.localPath,
      scene.errorMessage,
      now,
      now
    );
  return scene;
}

export function updateScene(id: string, patch: Partial<SceneEntry>): SceneEntry | null {
  const database = getDb();
  const currentRow = database.prepare("SELECT * FROM scenes WHERE id = ?").get(id);
  if (!currentRow) return null;

  const merged = { ...rowToScene(currentRow), ...patch };
  const now = new Date().toISOString();
  database
    .prepare(
      `UPDATE scenes SET
        scene_name = ?, gradient_class_name = ?, first_frame_image_url = ?, is_standalone = ?,
        job_status = ?, result_url = ?, local_path = ?, error_message = ?, updated_at = ?
       WHERE id = ?`
    )
    .run(
      merged.sceneName,
      merged.gradientClassName,
      merged.firstFrameImageUrl,
      merged.isStandalone ? 1 : 0,
      merged.jobStatus,
      merged.resultUrl,
      merged.localPath,
      merged.errorMessage,
      now,
      id
    );
  return merged;
}
