import json
import os
import sys

# Ensure app is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.main import app

def export_openapi():
    # Wait for startup events if needed (we just want the schema)
    schema = app.openapi()
    with open("openapi.json", "w") as f:
        json.dump(schema, f, indent=2)
    print("OpenAPI schema exported to openapi.json")

if __name__ == "__main__":
    export_openapi()
