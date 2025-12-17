export async function fetchJson<T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(input, init);

  if (res.ok) return res.json();

  // intentar leer error del backend
  let msg = `Error (${res.status})`;
  try {
    const data = await res.json();
    if (data?.error) msg = String(data.error);
  } catch {
    // ignore
  }

  throw new Error(msg);
}
