
// Mock APIs to support Studio/Documents UI per chat session.
// Later you can replace these with real endpoints.

/** @typedef {import('../models/common').Id} Id */
/** @typedef {import('../models/studio').StudioOutput} StudioOutput */
/** @typedef {import('../models/studio').StudioOutputListResponse} StudioOutputListResponse */
/** @typedef {import('../models/studio').AttachDocumentsResponse} AttachDocumentsResponse */

function delay(ms = 400) {
  return new Promise((r) => setTimeout(r, ms));
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
    items: []
  };
}

/**
 * Mock "create video overview".
 *
 * @param {Id} sessionId
 * @param {unknown} payload
 * @returns {Promise<StudioOutput>}
 */
export async function createVideoOverview(sessionId, payload) {
  await delay(600);
  return {
    id: `video_${Math.random().toString(16).slice(2)}`,
    session_id: sessionId,
    type: 'video_overview',
    status: 'processing',
    created_at: new Date().toISOString(),
    payload,
    // Where a real API would provide a URL afterwards
    result_url: null
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
