"use client";

import { useEffect } from "react";

export default function TabTitleChanger() {
  useEffect(() => {
    const original = document.title;

    const handleVisibilityChange = () => {
      document.title = document.hidden ? "Look at me!!!" : original;
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return null;
}
