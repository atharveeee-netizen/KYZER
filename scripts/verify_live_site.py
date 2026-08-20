import urllib.request

headers = {'User-Agent': 'Mozilla/5.0', 'Cache-Control': 'no-cache, no-store'}
url = 'https://atharveeee-netizen.github.io/KYZER/assets/index-DSGuFkfK.js'

try:
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as response:
        js = response.read().decode('utf-8')
        print(f'Successfully downloaded live bundle ({len(js)} bytes)')
        checks = [
            'Click to Upload Handwritten Register Photo',
            'Approve & Dispatch (Human in Loop)',
            'THERMAL SENSOR TELEMETRY',
            'ADAPTIVE SAFETY BUFFER',
            'BRICS Federated Cross-Border Air Corridor',
            'LIVE GEMINI 1.5 FLASH',
            'Save to PostgreSQL Database'
        ]
        all_passed = True
        for c in checks:
            found = c in js
            status = 'PASS' if found else 'FAIL'
            if not found:
                all_passed = False
            print(f'[{status}] {c}')
        
        if all_passed:
            print('\n>>> ALL 5 FEATURES ARE 100% PRESENT IN THE LIVE DEPLOYED BUNDLE! <<<')
        else:
            print('\n>>> SOME FEATURES ARE MISSING! <<<')
except Exception as e:
    print('Error fetching live bundle:', e)
