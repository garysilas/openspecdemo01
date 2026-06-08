import electron from "electron";
import { createRecorderWindow, toggleWindow } from "./window.js";
import { createTray } from "./tray.js";
import { dbPath } from "./constants.js";
import { openDatabase } from "./storage/database.js";
import { runMigrations } from "./storage/migrations.js";
import { schemaSql } from "./storage/schema.js";
import { SessionRepository } from "./storage/session-repository.js";
import { MockCleanupProvider, MockSpeechToTextProvider, MockTextToSpeechProvider } from "./domain/mock-providers.js";
import { SessionJobService } from "./services/session-job-service.js";
import { RecordingService } from "./services/recording-service.js";
import { registerIpc } from "./ipc.js";
import { loadSettings } from "./settings.js";

const { app, globalShortcut } = electron;

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
  const dbHandle = openDatabase(dbPath());
  runMigrations(dbHandle.db.exec.bind(dbHandle.db), schemaSql);

  const repository = new SessionRepository(dbHandle.db);
  const recording = new RecordingService();
  const window = createRecorderWindow();
  const onToggle = (): void => toggleWindow(window);
  createTray(onToggle);

  const jobs = new SessionJobService({
    repository,
    stt: new MockSpeechToTextProvider(),
    cleanup: new MockCleanupProvider(),
    tts: new MockTextToSpeechProvider(),
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
  registerGlobalHotkey(loadSettings().hotkey, onToggle);

  app.on("will-quit", () => {
    globalShortcut.unregisterAll();
    dbHandle.close();
  });
}

app.whenReady().then(() => {
  void bootstrap();
});
