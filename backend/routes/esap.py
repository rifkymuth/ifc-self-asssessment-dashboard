from datetime import datetime, timezone

from flask import Blueprint, abort, jsonify, request

from db import get_collections

bp = Blueprint("esap", __name__, url_prefix="/api/projects/<pid>/esap")


def _now():
    return datetime.now(timezone.utc)


def _project_exists(pid):
    projects, _, _ = get_collections()
    return projects.find_one({"_id": pid}, {"_id": 1}) is not None


def _serialize(doc):
    doc = dict(doc)
    doc["id"] = doc.pop("_id")
    doc.pop("projectId", None)
    doc.pop("updatedAt", None)
    return doc


def _to_doc(pid, item):
    doc = {k: v for k, v in item.items() if k != "id"}
    doc["_id"] = item["id"]
    doc["projectId"] = pid
    doc["updatedAt"] = _now()
    return doc


@bp.get("")
def list_esap(pid):
    _, _, esap = get_collections()
    return jsonify([_serialize(d) for d in esap.find({"projectId": pid})])


@bp.post("")
def create_esap(pid):
    if not _project_exists(pid):
        abort(404, description="Project not found")
    item = request.get_json(silent=True)
    if not isinstance(item, dict) or not item.get("id"):
        abort(400, description="Expected an esap item with an id")
    _, _, esap = get_collections()
    esap.replace_one({"_id": item["id"]}, _to_doc(pid, item), upsert=True)
    return jsonify(item), 201


@bp.post("/bulk")
def bulk_create_esap(pid):
    if not _project_exists(pid):
        abort(404, description="Project not found")
    items = request.get_json(silent=True)
    if not isinstance(items, list):
        abort(400, description="Expected an array of esap items")
    _, _, esap = get_collections()
    saved = []
    for item in items:
        if isinstance(item, dict) and item.get("id"):
            esap.replace_one({"_id": item["id"]}, _to_doc(pid, item), upsert=True)
            saved.append(item)
    return jsonify(saved), 201


@bp.put("/<item_id>")
def update_esap(pid, item_id):
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        abort(400, description="Expected an esap item patch")
    _, _, esap = get_collections()
    patch = {k: v for k, v in body.items() if k != "id"}
    patch["updatedAt"] = _now()
    res = esap.update_one({"_id": item_id, "projectId": pid}, {"$set": patch})
    if res.matched_count == 0:
        abort(404, description="Esap item not found")
    return jsonify(_serialize(esap.find_one({"_id": item_id})))


@bp.delete("/<item_id>")
def delete_esap(pid, item_id):
    _, _, esap = get_collections()
    esap.delete_one({"_id": item_id, "projectId": pid})
    return jsonify({"deleted": True})


@bp.delete("")
def clear_esap(pid):
    _, _, esap = get_collections()
    res = esap.delete_many({"projectId": pid})
    return jsonify({"deleted": res.deleted_count})
