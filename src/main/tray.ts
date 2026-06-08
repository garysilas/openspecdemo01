import path from "node:path";
import fs from "node:fs";
import electron from "electron";
import type { Tray as TrayInstance } from "electron";

const { Menu, Tray, app, nativeImage } = electron;

export function createTray(onToggle: () => void): TrayInstance {
  const trayIconPath = path.join(process.cwd(), "resources", "trayTemplate.png");
  const icon = fs.existsSync(trayIconPath) ? trayIconPath : nativeImage.createEmpty();
  const tray = new Tray(icon);
  tray.setToolTip("Brain Dump Polisher");
  tray.on("click", onToggle);
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "Show / Hide Recorder", click: onToggle },
      { type: "separator" },
      { label: "Quit", click: () => app.quit() }
    ])
  );
  return tray;
}
