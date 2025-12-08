// Utility functions for interacting with the backend API. The API and WebSocket
// base URLs are provided via environment variables at build time. See the
// Render docs for configuring environment variables for static sites.

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';
const WS_URL = import.meta.env.VITE_WS_URL?.replace(/\/$/, '') || '';

export async function listInstances() {
  const res = await fetch(`${API_URL}/api/instances`);
  if (!res.ok) {
    throw new Error('Failed to list instances');
  }
  return res.json();
}

export async function startInstance(name) {
  const res = await fetch(`${API_URL}/api/instances`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to start instance: ${text}`);
  }
  return res.json();
}

export async function deleteInstance(id) {
  const res = await fetch(`${API_URL}/api/instances/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error('Failed to delete instance');
  }
  return res.json();
}

/**
 * Open a WebSocket to receive QR codes and status updates for an instance.
 * The callback receives parsed messages of the form { type, data }.
 *
 * @param {string} instanceId
 * @param {(msg: { type: string, data: any }) => void} onMessage
 * @returns {WebSocket}
 */
export function connectSocket(instanceId, onMessage) {
  const ws = new WebSocket(`${WS_URL}/ws/${instanceId}`);
  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      onMessage(message);
    } catch {
      // ignore malformed messages
    }
  };
  return ws;
}

export async function getInstanceDetails(id) {
  const res = await fetch(`${API_URL}/api/instances/${id}`);
  if (!res.ok) {
    throw new Error('Failed to get instance details');
  }
  return res.json();
}

export async function updateInstanceName(id, name) {
  const res = await fetch(`${API_URL}/api/instances/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instance_name: name }),
  });
  if (!res.ok) {
    throw new Error('Failed to update instance name');
  }
  return res.json();
}

export async function disconnectInstance(id) {
  const res = await fetch(`${API_URL}/api/instances/${id}/disconnect`, {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error('Failed to disconnect instance');
  }
  return res.json();
}

export async function reconnectInstance(id) {
  const res = await fetch(`${API_URL}/api/instances/${id}/reconnect`, {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error('Failed to reconnect instance');
  }
  return res.json();
}

export async function getStats() {
  const res = await fetch(`${API_URL}/api/stats`);
  if (!res.ok) {
    throw new Error('Failed to get stats');
  }
  return res.json();
}