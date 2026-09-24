const MAX_PAYLOAD_SIZE = 1024 * 1024; // real payloads are ~2 KB

export function parsePayload(jsonString) {
  if (typeof jsonString !== 'string') return null;
  if (jsonString.length > MAX_PAYLOAD_SIZE) return null;

  try {
    const parsed = JSON.parse(jsonString);
    if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) return null;
    return parsed;
  } catch (err) {
    return null;
  }
}
