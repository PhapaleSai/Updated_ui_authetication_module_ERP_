import sys
import traceback

with open("out_error.txt", "w") as f:
    try:
        from app.main import app
        f.write("IMPORT SUCCESSFUL")
    except Exception as e:
        f.write("IMPORT FAILED\n")
        f.write(traceback.format_exc())
