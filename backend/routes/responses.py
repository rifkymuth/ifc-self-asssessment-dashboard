from datetime import datetime, timezone

from flask import Blueprint, abort, jsonify, request

from db import get_collections

bp = Blueprint("responses", __name__, url_prefix="/api/projects/<pid>/responses")


def _now():
    return datetime.now(timezone.utc)


def _project_exists(pid):
    projects, _, _ = get_collections()
    return projects.find_one({"_id": pid}, {"_id": 1}) is not None


@bp.get("")
def list_responses(pid):
    _, responses, _ = get_collections()
    out = {}
    for doc in responses.find({"projectId": pid}):
        out[doc["indicatorId"]] = {
            "score": doc.get("score"),
            "notes": doc.get("notes", ""),
            "evidence": doc.get("evidence", ""),
        }
    return jsonify(out)


@bp.put("/<indicator_id>")
def put_response(pid, indicator_id):
    if not _project_exists(pid):
        abort(404, description="Project not found")
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        abort(400, description="Expected a response object")
    _, responses, _ = get_collections()
    payload = {
        "score": body.get("score"),
        "notes": body.get("notes", ""),
        "evidence": body.get("evidence", ""),
        "updatedAt": _now(),
    }
    responses.update_one(
        {"projectId": pid, "indicatorId": indicator_id},
        {"$set": payload},
        upsert=True,
    )
    return jsonify({k: payload[k] for k in ("score", "notes", "evidence")})


@bp.delete("/<indicator_id>")
def delete_response(pid, indicator_id):
    _, responses, _ = get_collections()
    responses.delete_one({"projectId": pid, "indicatorId": indicator_id})
    return jsonify({"deleted": True})


@bp.put("")
def replace_responses(pid):
    if not _project_exists(pid):
        abort(404, description="Project not found")
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        abort(400, description="Expected a responses object")
    _, responses, _ = get_collections()
    responses.delete_many({"projectId": pid})
    now = _now()
    docs = []
    for indicator_id, val in body.items():
        if not isinstance(val, dict):
            continue
        docs.append(
            {
                "projectId": pid,
                "indicatorId": indicator_id,
                "score": val.get("score"),
                "notes": val.get("notes", ""),
                "evidence": val.get("evidence", ""),
                "updatedAt": now,
            }
        )
    if docs:
        responses.insert_many(docs)
    return jsonify({"count": len(docs)})
