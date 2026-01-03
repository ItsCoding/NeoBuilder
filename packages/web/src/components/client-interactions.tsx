"use client";

import { useEffect } from "react";

function enhanceModals() {
  document.querySelectorAll<HTMLElement>('[data-block="modal"]').forEach((wrapper) => {
    const trigger = wrapper.querySelector("button");
    const body = wrapper.querySelector<HTMLElement>('[data-modal-body]');
    if (!trigger || !body) return;
    const toggle = () => {
      const isOpen = body.style.display === "block";
      body.style.display = isOpen ? "none" : "block";
    };
    trigger.addEventListener("click", toggle);
  });
}

export default function ClientInteractions({ blocks }: { blocks: string[] }) {
  useEffect(() => {
    if (blocks.includes("ModalBlock")) enhanceModals();
    // Native <details> handles accordions; carousels rely on native scroll snap.
  }, [blocks]);
  return null;
}
