async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(typeof err.detail === "string" ? err.detail : `Request failed (${res.status})`);
  }
  return res.json();
}

export function sendChat({ message, sessionId, filters }) {
  // -> { session_id, answer, products }
  return postJson("/api/chat", { message, session_id: sessionId, filters });
}

export function placeOrder(items) {
  // items: [{ product_id, quantity }] -> { id, status, total }
  return postJson("/api/orders", { items });
}
