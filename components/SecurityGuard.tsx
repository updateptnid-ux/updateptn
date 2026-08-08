"use client";

import { useEffect } from "react";

export default function SecurityGuard() {
  useEffect(() => {
    // 1. Disable Right-Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Disable Key Combinations for DevTools & View Source
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;

      // F12 key
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }

      if (isCtrl) {
        const key = e.key.toLowerCase();
        
        // Ctrl+Shift+I (Inspect), Ctrl+Shift+J (Console), Ctrl+Shift+C (Element picker)
        if (e.shiftKey && (key === "i" || key === "j" || key === "c")) {
          e.preventDefault();
          return false;
        }

        // Ctrl+U (View Source)
        if (key === "u") {
          e.preventDefault();
          return false;
        }

        // Ctrl+S (Save Page)
        if (key === "s") {
          e.preventDefault();
          return false;
        }

        // Ctrl+P (Print Page)
        if (key === "p") {
          e.preventDefault();
          return false;
        }
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
}
