import secrets

from pymongo import ASCENDING, MongoClient

from config import Config

# Unambiguous alphabet (no 0/O/1/I) for shareable project codes.
_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

_client = None
_db = None


def get_db():
    global _client, _db
    if _db is None:
        _client = MongoClient(Config.MONGO_URI)
        _db = _client[Config.MONGO_DB]
    return _db


def get_collections():
    db = get_db()
    return db["projects"], db["responses"], db["esapItems"]


def ensure_indexes():
    _, responses, esap = get_collections()
    responses.create_index(
        [("projectId", ASCENDING), ("indicatorId", ASCENDING)], unique=True
    )
    responses.create_index([("projectId", ASCENDING)])
    esap.create_index([("projectId", ASCENDING)])


def generate_project_id(length=8):
    projects, _, _ = get_collections()
    for _ in range(10):
        pid = "".join(secrets.choice(_ALPHABET) for _ in range(length))
        if projects.find_one({"_id": pid}, {"_id": 1}) is None:
            return pid
    raise RuntimeError("Could not generate a unique project id")
