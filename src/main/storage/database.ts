import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

export interface DatabaseHandle {
  db: Database.Database;
  close: () => void;
}

export function openDatabase(dbFile: string): DatabaseHandle {
  fs.mkdirSync(path.dirname(dbFile), { recursive: true });
  const db = new Database(dbFile);
  db.pragma("foreign_keys = ON");
  return {
    db,
    close: () => db.close()
  };
}
