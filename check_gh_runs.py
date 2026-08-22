import urllib.request
import json

url = 'https://api.github.com/repos/atharveeee-netizen/KYZER/actions/runs?per_page=3'
req = urllib.request.Request(url, headers={'User-Agent': 'KYZER-Audit'})

try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        for run in data.get('workflow_runs', []):
            print('Run ID:', run.get('id'), 'Status:', run.get('status'), 'Conclusion:', run.get('conclusion'))
            print('Commit:', run.get('head_commit', {}).get('id', '')[:7], run.get('head_commit', {}).get('message', ''))
            jobs_url = run.get('jobs_url')
            if jobs_url:
                jobs_req = urllib.request.Request(jobs_url, headers={'User-Agent': 'KYZER-Audit'})
                with urllib.request.urlopen(jobs_req) as jresp:
                    jdata = json.loads(jresp.read().decode('utf-8'))
                    for job in jdata.get('jobs', []):
                        print('  Job:', job.get('name'), 'Conclusion:', job.get('conclusion'))
                        for step in job.get('steps', []):
                            print('    Step:', step.get('name'), '-->', step.get('conclusion'))
except Exception as e:
    print('Error:', e)
