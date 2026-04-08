/**
 * Studio tool icons (inline SVG primitives) used by Studio UI.
 *
 * Notes:
 * - Keep these as data so UI can render them via a single component.
 * - SVG uses `currentColor` so it inherits text color.
 */

/** @typedef {{ x:number, y:number, width:number, height:number, rx?:number }} SvgRect */
/** @typedef {{ cx:number, cy:number, r:number }} SvgCircle */

import { MODAL_TOOL } from '$lib/constants/index.js';

/** @type {Record<string, { paths?: string[]; rects?: SvgRect[]; circles?: SvgCircle[] }>} */
export const STUDIO_TOOL_ICON_DEFS = {
  [MODAL_TOOL.AUDIO_OVERVIEW]: {
    paths: [
      "M11 5.5 7 9.5H4.5v5H7l4 4v-13Z",
      "M15 9a4 4 0 0 1 0 6",
      "M17.5 6.5a7.5 7.5 0 0 1 0 11"
    ]
  },
  [MODAL_TOOL.VIDEO_OVERVIEW]: {
    rects: [{ x: 3.5, y: 6.5, width: 17, height: 11, rx: 2 }],
    paths: ["M11 10v4l4-2-4-2Z"]
  },
  [MODAL_TOOL.MINDMAP]: {
    circles: [
      { cx: 6.5, cy: 12, r: 2 },
      { cx: 17.5, cy: 7.5, r: 2 },
      { cx: 17.5, cy: 16.5, r: 2 }
    ],
    paths: ["M8.4 11.2 15.6 8.3", "M8.4 12.8 15.6 15.7"]
  },
  [MODAL_TOOL.REPORT]: {
    paths: [
      "M8 3.5h7l3 3V20.5H8z",
      "M15 3.5v3h3",
      "M10.5 11h5",
      "M10.5 14h5",
      "M10.5 17h3.5"
    ]
  },
  [MODAL_TOOL.QUIZ]: {
    circles: [{ cx: 12, cy: 12, r: 8.5 }],
    paths: [
      "M10.1 9.7a2.2 2.2 0 0 1 3.9 1.3c0 1.6-1.7 2-2.2 2.7-.2.3-.2.7-.2 1.1",
      "M12 17.2h.01"
    ]
  },
  [MODAL_TOOL.DATA]: {
    rects: [{ x: 4, y: 6, width: 16, height: 12, rx: 2 }],
    paths: ["M4 10h16", "M10 6v12", "M4 14h16"]
  }
};

/**
 * @param {string} key
 */
export function hasStudioToolIcon(key) {
  return Boolean(STUDIO_TOOL_ICON_DEFS[key]);
}
