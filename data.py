from os import path
from time import time
from random import randrange
from json import loads, dumps, decoder

root_dir = path.dirname(__file__)
storage_path = path.join(root_dir, "data.json")

def get_data(data_id) -> str | None:
    try:
        with open(storage_path, "r") as f:
            c = loads(f.read())
        return c[data_id]["data"]
    except (FileNotFoundError, decoder.JSONDecodeError, KeyError):
        return None

def register_data(data: str) -> str:
    try:
        with open(storage_path, "r") as f:
            storage = loads(f.read())
    except (FileNotFoundError, decoder.JSONDecodeError):
        open(storage_path, "w").close()
        storage = {}

    with open(storage_path, "w") as f:
        data_id = "".join([chr(randrange(97, 123)) for i in range(50)])
        registry = {
            "data" : data,
            "time" : time()
        }
        storage[data_id] = registry
        f.write(dumps(storage, indent=2))
    
    return data_id

def purge_old_data(elapsed_time: int = 3600):
    old_data_ids = []
    try:
        with open(storage_path, "r") as f:
            c = loads(f.read())
        for i in c.keys():
            a = c[i]
            if time() - a["time"] > elapsed_time:
                old_data_ids.append(i)
        
        with open(storage_path, "w") as f:
            for id in old_data_ids:
                del c[id]
            f.write(dumps(c, indent=2))    

    except (FileNotFoundError, decoder.JSONDecodeError, KeyError):
        return None
