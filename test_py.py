import urllib.request
import json

req = urllib.request.Request('http://127.0.0.1:8000/api/analyze', method='POST', headers={'Content-Type': 'application/json'})
data = json.dumps({'resumeText': 'I know Python.', 'jobDescriptionText': 'Looking for Python.'}).encode('utf-8')
try:
    with urllib.request.urlopen(req, data=data) as f:
        print(f.read().decode('utf-8'))
except Exception as e:
    print(e)
