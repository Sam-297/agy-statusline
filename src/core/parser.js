const MAX_PAYLOAD_SIZE = 64 * 1024; // 64KB limit

export function parsePayload(jsonString) {
  if (typeof jsonString !== 'string') return null;
  if (Buffer.byteLength(jsonString, 'utf8') > MAX_PAYLOAD_SIZE) return null;
  
  try {
    return JSON.parse(jsonString);
  } catch (err) {
    return null;
  }
}
