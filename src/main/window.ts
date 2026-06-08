import path from "node:path";
import electron from "electron";
import type { BrowserWindow as BrowserWindowInstance } from "electron";

const { BrowserWindow } = electron;

export function createRecorderWindow(): BrowserWindowInstance {
  const win = new BrowserWindow({
    width: 420,
    height: 520,
    frame: false,
    resizable: false,
    show: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(process.cwd(), "dist/preload/preload/preload.js")
    }
  });

  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    void win.loadURL(devServerUrl);
  } else {
    void win.loadFile(path.join(process.cwd(), "dist/renderer/index.html"));
  }

  return win;
}

export function toggleWindow(win: BrowserWindowInstance): void {
  if (win.isVisible()) {
    win.hide();
  } else {
    win.show();
    win.focus();
  }
}
