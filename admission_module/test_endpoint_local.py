import sys
import subprocess
import time
import requests

def main():
    print("Starting uvicorn...", flush=True)
    server = subprocess.Popen(
        ["venv\\Scripts\\uvicorn.exe", "app.main:app", "--port", "8002"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )
    
    time.sleep(3)
    
    try:
        print("Sending GET request to /api/admin/applications...", flush=True)
        response = requests.get("http://127.0.0.1:8002/api/admin/applications")
        print(f"Status: {response.status_code}")
        print(response.text)
    except Exception as e:
        print(f"Request failed: {e}")
    finally:
        print("Stopping uvicorn...", flush=True)
        server.terminate()
        try:
            outs, errs = server.communicate(timeout=2)
            print("Server output:")
            print(outs)
        except subprocess.TimeoutExpired:
            server.kill()
            outs, errs = server.communicate()
            print("Server output (killed):")
            print(outs)

if __name__ == "__main__":
    main()
