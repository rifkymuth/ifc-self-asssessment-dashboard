from datetime import datetime, timezone

from flask import Blueprint, abort, jsonify, request

from db import generate_project_id, get_collections
from defaults import default_meta

bp = Blueprint("projects", __name__, url_prefix="/api/projects")


def _now():
    return datetime.now(timezone.utc)


def _iso(dt):
    return dt.isoformat() if dt else None


def responses_map(pid):
    _, responses, _ = get_collections()
    out = {}
    for doc in responses.find({"projectId": pid}):
        out[doc["indicatorId"]] = {
            "score": doc.get("score"),
            "notes": doc.get("notes", ""),
            "evidence": doc.get("evidence", ""),
        }
    return out


def esap_list(pid):
    _, _, esap = get_collections()
    items = []
    for doc in esap.find({"projectId": pid}):
        doc = dict(doc)
        doc["id"] = doc.pop("_id")
        doc.pop("projectId", None)
        doc.pop("updatedAt", None)
        items.append(doc)
    return items


def _merge_meta(body_meta):
    meta = default_meta()
    if isinstance(body_meta, dict):
        for k, v in body_meta.items():
            if k == "companyProfile":
                continue
            meta[k] = v
        cp = body_meta.get("companyProfile")
        if isinstance(cp, dict):
            meta["companyProfile"].update(cp)
    return meta


@bp.post("")
def create_project():
    projects, _, _ = get_collections()
    body = request.get_json(silent=True) or {}
    meta = _merge_meta(body.get("meta"))
    pid = generate_project_id()
    now = _now()
    projects.insert_one({"_id": pid, "createdAt": now, "updatedAt": now, "meta": meta})
    return (
        jsonify(
            {
                "projectId": pid,
                "createdAt": _iso(now),
                "meta": meta,
                "responses": {},
                "esapItems": [],
            }
        ),
        201,
    )


@bp.get("/<pid>")
def get_project(pid):
    projects, _, _ = get_collections()
    doc = projects.find_one({"_id": pid})
    if not doc:
        abort(404, description="Project not found")
    return jsonify(
        {
            "projectId": pid,
            "createdAt": _iso(doc.get("createdAt")),
            "meta": doc.get("meta", default_meta()),
            "responses": responses_map(pid),
            "esapItems": esap_list(pid),
        }
    )


@bp.get("/<pid>/exists")
def project_exists(pid):
    projects, _, _ = get_collections()
    found = projects.find_one({"_id": pid}, {"_id": 1}) is not None
    return jsonify({"exists": found})


@bp.delete("/<pid>")
def delete_project(pid):
    projects, responses, esap = get_collections()
    projects.delete_one({"_id": pid})
    responses.delete_many({"projectId": pid})
    esap.delete_many({"projectId": pid})
    return jsonify({"deleted": True})


@bp.put("/<pid>/meta")
def put_meta(pid):
    projects, _, _ = get_collections()
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        abort(400, description="Expected a meta object")
    res = projects.update_one(
        {"_id": pid}, {"$set": {"meta": body, "updatedAt": _now()}}
    )
    if res.matched_count == 0:
        abort(404, description="Project not found")
    return jsonify({"meta": body})
