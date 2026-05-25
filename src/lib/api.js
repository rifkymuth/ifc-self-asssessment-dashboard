const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function req(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body && body.error) msg = body.error;
    } catch {}
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

const p = (pid) => `/projects/${encodeURIComponent(pid)}`;

export const createProject = (meta) =>
  req("/projects", { method: "POST", body: JSON.stringify(meta ? { meta } : {}) });

export const getProject = (pid) => req(p(pid));

export const projectExists = (pid) => req(`${p(pid)}/exists`);

export const deleteProject = (pid) => req(p(pid), { method: "DELETE" });

export const putMeta = (pid, meta) =>
  req(`${p(pid)}/meta`, { method: "PUT", body: JSON.stringify(meta) });

export const putResponse = (pid, indicatorId, payload) =>
  req(`${p(pid)}/responses/${encodeURIComponent(indicatorId)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const deleteResponse = (pid, indicatorId) =>
  req(`${p(pid)}/responses/${encodeURIComponent(indicatorId)}`, { method: "DELETE" });

export const putResponses = (pid, obj) =>
  req(`${p(pid)}/responses`, { method: "PUT", body: JSON.stringify(obj) });

export const getEsap = (pid) => req(`${p(pid)}/esap`);

export const createEsap = (pid, item) =>
  req(`${p(pid)}/esap`, { method: "POST", body: JSON.stringify(item) });

export const bulkCreateEsap = (pid, items) =>
  req(`${p(pid)}/esap/bulk`, { method: "POST", body: JSON.stringify(items) });

export const updateEsap = (pid, id, patch) =>
  req(`${p(pid)}/esap/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(patch),
  });

export const deleteEsap = (pid, id) =>
  req(`${p(pid)}/esap/${encodeURIComponent(id)}`, { method: "DELETE" });

export const clearEsap = (pid) => req(`${p(pid)}/esap`, { method: "DELETE" });
