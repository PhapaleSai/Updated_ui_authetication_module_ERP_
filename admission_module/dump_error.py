import urllib.request
import urllib.error

try:
    with urllib.request.urlopen("http://127.0.0.1:8000/api/v1/admin/applications") as response:
        html = response.read()
        with open("out_error.txt", "w") as f:
            f.write(html.decode())
except urllib.error.HTTPError as e:
    with open("out_error.txt", "w") as f:
        f.write(e.read().decode())
