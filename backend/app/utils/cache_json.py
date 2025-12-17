import orjson

def dumps(obj) -> str:
    return orjson.dumps(obj).decode("utf-8")

def loads(s: str | bytes):
    return orjson.loads(s)
