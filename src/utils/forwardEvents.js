import { createBubbler } from "svelte/legacy";

const defaultEvents = [
  "focus",
  "blur",
  "focusin",
  "focusout",
  "keydown",
  "keyup",
  "keypress",
  "pointerdown",
  "pointerup",
  "pointermove",
  "pointerenter",
  "pointerleave",
  "pointerover",
  "pointerout",
  "mousedown",
  "mouseup",
  "mouseenter",
  "mouseleave",
  "mousemove",
  "mouseover",
  "mouseout",
  "wheel",
  "click",
  "dblclick",
  "contextmenu",
  "touchstart",
  "touchend",
  "touchmove",
  "touchcancel",
  "drag",
  "dragstart",
  "dragend",
  "dragenter",
  "dragleave",
  "dragover",
  "drop",
  "submit",
  "reset",
  "input",
  "change"
];

export function forwardEventsBuilder(events = defaultEvents) {
  const bubble = createBubbler();
  const eventsToBind = Array.from(new Set(events));

  return (node) => {
    const removers = eventsToBind.map((eventName) => {
      const handler = bubble(eventName);
      node.addEventListener(eventName, handler);
      return () => node.removeEventListener(eventName, handler);
    });

    return {
      destroy() {
        removers.forEach((remove) => remove());
      }
    };
  };
}
