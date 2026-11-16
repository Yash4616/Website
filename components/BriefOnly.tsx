"use client";

import { useLayoutEffect } from "react";
import { getView, setView, subscribeView } from "@/lib/view";

/**
 * For a page that only exists in the Brief (not found, error). In the Field
 * view the Brief is hidden, so without this the page would be invisible and
 * the visitor would see the plot at a wrong address. It shows the Brief while
 * mounted, without touching the remembered choice, and hands the Field back
 * when the visitor leaves, unless they switched views themselves meanwhile.
 */
export function BriefOnly() {
  useLayoutEffect(() => {
    if (getView() !== "field") return;
    setView("brief", false);
    let switched = false;
    const off = subscribeView(() => {
      switched = true;
    });
    return () => {
      off();
      if (!switched) setView("field", false);
    };
  }, []);
  return null;
}
