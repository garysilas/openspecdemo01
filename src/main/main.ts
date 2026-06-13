import dotenv from "dotenv";
import path from "node:path";
import electron from "electron";
import { createRecorderWindow, toggleWindow } from "./window.js";
import { createTray } from "./tray.js";
import { dbPath } from "./constants.js";
import { openDatabase } from "./storage/database.js";
import { runMigrations } from "./storage/migrations.js";
import { schemaSql } from "./storage/schema.js";
import { SessionRepository } from "./storage/session-repository.js";
import { createRuntimeProviders } from "./domain/provider-factory.js";
import { SessionJobService } from "./services/session-job-service.js";
import { RecordingService } from "./services/recording-service.js";
import { registerIpc } from "./ipc.js";
import { formatProviderDebugInfo, loadSettings, resolveProviderConfig, validateProviderConfig } from "./settings.js";

const { app, globalShortcut } = electron;

// Load env vars from project root first, then optional src/.env fallback.
dotenv.config({ path: path.join(process.cwd(), ".env") });
dotenv.config({ path: path.join(process.cwd(), "src", ".env") });

let shortcut = "";

function registerGlobalHotkey(accelerator: string, onToggle: () => void): void {
  if (shortcut) {
    globalShortcut.unregister(shortcut);
  }
  const ok = globalShortcut.register(accelerator, onToggle);
  if (!ok) {
    throw new Error(`Could not register global hotkey: ${accelerator}`);
  }
  shortcut = accelerator;
}

async function bootstrap(): Promise<void> {
  const settings = loadSettings();
  const providerConfig = resolveProviderConfig(settings);
  console.log(`[provider-config] ${formatProviderDebugInfo(providerConfig)}`);
  validateProviderConfig(providerConfig);

  const dbHandle = openDatabase(dbPath());
  runMigrations(dbHandle.db.exec.bind(dbHandle.db), schemaSql);

  const repository = new SessionRepository(dbHandle.db);
  const recording = new RecordingService();
  const window = createRecorderWindow();
  const onToggle = (): void => toggleWindow(window);
  createTray(onToggle);
  const providers = createRuntimeProviders(providerConfig);

  const jobs = new SessionJobService({
    repository,
    stt: providers.stt,
    cleanup: providers.cleanup,
    tts: providers.tts,
    emitStatus: (event, payload) => {
      if (!window.isDestroyed()) {
        window.webContents.send(event, payload);
      }
    }
  });

  registerIpc({
    window,
    recording,
    repository,
    jobs,
    onHotkeyUpdated: (nextHotkey) => registerGlobalHotkey(nextHotkey, onToggle)
  });
  registerGlobalHotkey(settings.hotkey, onToggle);

  app.on("will-quit", () => {
    globalShortcut.unregisterAll();
    dbHandle.close();
  });
}

app.whenReady().then(() => {
  void bootstrap();
});
