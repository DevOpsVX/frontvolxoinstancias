
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:10000'
export async function listInstances(){ const r = await fetch(`${API_URL}/api/instances`); return r.json() }
export async function startInstance(instance_name){ const r = await fetch(`${API_URL}/api/instances`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ instance_name }) }); return r.json() }
export async function deleteInstance(id){ const r = await fetch(`${API_URL}/api/instances/${id}`, { method:'DELETE' }); return r.json() }
export function buildGhlAuthUrlFromBackend(_id, authUrl){ return authUrl }
