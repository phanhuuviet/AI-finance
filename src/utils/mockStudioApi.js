
// Mock APIs to support Studio/Documents UI per chat session.
// Later you can replace these with real endpoints.

/** @typedef {import('../models/common').Id} Id */
/** @typedef {import('../models/studio').StudioOutput} StudioOutput */
/** @typedef {import('../models/studio').StudioOutputListResponse} StudioOutputListResponse */
/** @typedef {import('../models/studio').AttachDocumentsResponse} AttachDocumentsResponse */

const MOCK_STUDIO_STORAGE_KEY = 'mock_studio_outputs_v1';

function delay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms));
}

/** @returns {Record<string, StudioOutput[]>} */
function readStore() {
  const raw = localStorage.getItem(MOCK_STUDIO_STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

/** @param {Record<string, StudioOutput[]>} data */
function writeStore(data) {
  localStorage.setItem(MOCK_STUDIO_STORAGE_KEY, JSON.stringify(data));
  return data;
}

/**
 * Promote old processing outputs to ready (mock).
 * @param {StudioOutput[]} items
 */
function promote(items) {
  const now = Date.now();
  return items.map((it) => {
    if (it.status !== 'processing') return it;
    const created = Date.parse(String(it.created_at || ''));
    if (!Number.isFinite(created)) return it;
    if (now - created < 1500) return it;

    return {
      ...it,
      status: 'ready',
      result_url:
        it.result_url ||
        `https://example.com/mock/studio/${encodeURIComponent(String(it.id))}`
    };
  });
}

/** @param {Id} sessionId */
function ensureSession(sessionId) {
  const store = readStore();
  const sid = String(sessionId);
  if (!Array.isArray(store[sid])) store[sid] = [];
  writeStore(store);
  return store;
}

/**
 * @param {Id} sessionId
 * @returns {StudioOutput[]}
 */
function getSessionItems(sessionId) {
  const store = ensureSession(sessionId);
  const sid = String(sessionId);
  const items = Array.isArray(store[sid]) ? store[sid] : [];
  const next = promote(items);
  if (JSON.stringify(next) !== JSON.stringify(items)) {
    store[sid] = next;
    writeStore(store);
  }
  return next;
}

/**
 * @param {Id} sessionId
 * @param {StudioOutput[]} items
 */
function setSessionItems(sessionId, items) {
  const store = ensureSession(sessionId);
  store[String(sessionId)] = items;
  writeStore(store);
}

/**
 * Returns a mock list of studio outputs already generated for a session.
 *
 * @param {Id} sessionId
 * @returns {Promise<StudioOutputListResponse>}
 */
export async function listStudioOutputs(sessionId) {
  await delay(250);
  return {
    session_id: sessionId,
    items: getSessionItems(sessionId)
  };
}

/**
 * Generic mock create for any studio output.
 *
 * @param {Id} sessionId
 * @param {string} type
 * @param {unknown} payload
 * @returns {Promise<StudioOutput>}
 */
export async function createStudioOutput(sessionId, type, payload) {
  await delay(550);
  const id = `${String(type)}_${Math.random().toString(16).slice(2)}`;

  /** @type {StudioOutput} */
  const item = {
    id,
    session_id: sessionId,
    type,
    status: 'processing',
    created_at: new Date().toISOString(),
    payload,
    result_url: null,
    title: defaultTitleForType(type)
  };

  const items = getSessionItems(sessionId);
  setSessionItems(sessionId, [item, ...items]);
  return item;
}

/** @param {string} type */
function defaultTitleForType(type) {
  switch (type) {
    case 'video_overview':
      return 'Tổng quan bằng video';
    case 'audio_overview':
      return 'Tổng quan bằng âm thanh';
    case 'mindmap':
      return 'Bản đồ tư duy';
    case 'report':
      return 'Báo cáo';
    case 'quiz':
      return 'Bài kiểm tra';
    case 'data':
      return 'Bảng dữ liệu';
    default:
      return String(type || 'Studio output');
  }
}

/**
 * Mock "create video overview".
 *
 * @param {Id} sessionId
 * @param {unknown} payload
 * @returns {Promise<StudioOutput>}
 */
export async function createVideoOverview(sessionId, payload) {
  return createStudioOutput(sessionId, 'video_overview', payload);
}

/**
 * Rename (title) of an output.
 *
 * @param {Id} outputId
 * @param {string} title
 * @returns {Promise<{ ok: true }>} 
 */
export async function renameStudioOutput(outputId, title) {
  await delay(250);
  const store = readStore();
  const id = String(outputId);
  const next = { ...store };
  for (const sid of Object.keys(next)) {
    const items = Array.isArray(next[sid]) ? next[sid] : [];
    const idx = items.findIndex((it) => String(it.id) === id);
    if (idx >= 0) {
      const updated = { ...items[idx], title };
      next[sid] = [updated, ...items.slice(0, idx), ...items.slice(idx + 1)];
      writeStore(next);
      return { ok: true };
    }
  }
  return { ok: true };
}

/**
 * Delete an output.
 *
 * @param {Id} outputId
 * @returns {Promise<{ ok: true }>} 
 */
export async function deleteStudioOutput(outputId) {
  await delay(250);
  const store = readStore();
  const id = String(outputId);
  const next = { ...store };
  for (const sid of Object.keys(next)) {
    const items = Array.isArray(next[sid]) ? next[sid] : [];
    const filtered = items.filter((it) => String(it.id) !== id);
    if (filtered.length !== items.length) {
      next[sid] = filtered;
      writeStore(next);
      return { ok: true };
    }
  }
  return { ok: true };
}

/**
 * Mock share link.
 *
 * @param {Id} outputId
 * @returns {Promise<{ share_url: string }>} 
 */
export async function shareStudioOutput(outputId) {
  await delay(200);
  return {
    share_url: `https://example.com/mock/share/${encodeURIComponent(String(outputId))}`
  };
}

/**
 * Mock download link.
 *
 * @param {Id} outputId
 * @returns {Promise<{ download_url: string }>} 
 */
export async function downloadStudioOutput(outputId) {
  await delay(200);
  return {
    download_url: `https://example.com/mock/download/${encodeURIComponent(String(outputId))}`
  };
}

/**
 * Mock "attach documents to a session".
 *
 * @param {Id} sessionId
 * @param {Id[]} documentIds
 * @returns {Promise<AttachDocumentsResponse>}
 */
export async function attachDocumentsToSession(sessionId, documentIds) {
  await delay(350);
  return {
    session_id: sessionId,
    document_ids: documentIds,
    attached: true
  };
}
