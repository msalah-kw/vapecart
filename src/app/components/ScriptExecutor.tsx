"use client";

import { useEffect } from "react";

interface ScriptExecutorProps {
  contentHtml: string;
}

export default function ScriptExecutor({ contentHtml }: ScriptExecutorProps) {
  useEffect(() => {
    const container = document.querySelector(".static-page-content");
    if (!container) return;

    const scripts = container.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      try {
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach((attr) =>
          newScript.setAttribute(attr.name, attr.value)
        );
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      } catch (err) {
        console.error("Error executing dynamic script on static page:", err);
      }
    });
  }, [contentHtml]);

  return null;
}
