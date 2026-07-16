import json
import os
from datetime import datetime


def ensure_dir(path):
    os.makedirs(path, exist_ok=True)


def save_json(data, filepath):
    ensure_dir(os.path.dirname(filepath))
    with open(filepath, "w") as f:
        json.dump(data, f, indent=2, default=str)


def load_json(filepath):
    if not os.path.exists(filepath):
        return None
    with open(filepath, "r") as f:
        return json.load(f)


def safe_get(d, *keys, default=None):
    for key in keys:
        if isinstance(d, dict):
            d = d.get(key, default)
        else:
            return default
    return d


def format_number(n, decimals=2):
    if n is None:
        return None
    if abs(n) >= 1e9:
        return f"{n/1e9:.{decimals}f}B"
    if abs(n) >= 1e6:
        return f"{n/1e6:.{decimals}f}M"
    if abs(n) >= 1e3:
        return f"{n/1e3:.{decimals}f}K"
    return f"{n:.{decimals}f}"


def clamp(value, min_val=0, max_val=100):
    return max(min_val, min(max_val, value))
