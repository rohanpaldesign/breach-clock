"""Builds data/flows.json from the EuRepoC dyadic dataset.

Standard library only. Run from the repo root: python scripts/build_flows.py
Source: European Repository of Cyber Incidents (EuRepoC), Global Dataset of Cyber Incidents
v1.3.2, doi:10.5281/zenodo.14965395, CC BY-NC 4.0. Country positions: world-countries (ODbL).
"""
import collections
import csv
import io
import json
import urllib.request

EUREPOC = 'https://zenodo.org/records/14965395/files/eurepoc_dyadic_dataset_0_1.csv?download=1'
COUNTRIES = 'https://cdn.jsdelivr.net/npm/world-countries@5.1.0/countries.json'
NO_ONE = {'', 'Not attributed', 'Unknown', 'Not available'}
TYPES = {
    'Data theft': 'theft',
    'Ransomware & data theft extortion': 'ransomware',
    'DDoS/Defacement': 'ddos',
    'Hack and leak': 'leak',
    'Prolonged system outage (e.g., wiper)': 'wiper',
    'Hijacking with Misuse': 'hijack',
    'Hijacking without Misuse': 'hijack',
}
STATE = {'State', 'State affiliated actor'}


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'breach-clock-build/1.0'})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read().decode('utf-8')


def main():
    world = {c['cca2']: c for c in json.loads(get(COUNTRIES))}
    rows = list(csv.DictReader(io.StringIO(get(EUREPOC))))

    seen = set()
    pairs = {}
    unattr = collections.defaultdict(list)
    incidents = set()
    used = set()
    for r in rows:
        src = r['initiator_alpha_2'].strip()
        dst = r['receiver_country_alpha_2_code'].strip()
        if dst not in world:
            continue  # regions like ASIA or BALKANS, or no target country
        year = r['start_date'][:4] if r['start_date'][:4].isdigit() else 'unknown'
        incidents.add(r['incident_id'])
        if r['initiator_country'] in NO_ONE or src not in world:
            key = (r['incident_id'], dst)
            if key in seen:
                continue
            seen.add(key)
            unattr[dst].append([year, TYPES.get(r['operation_type'], 'other')])
            used.add(dst)
            continue
        key = (r['incident_id'], src, dst)
        if key in seen:
            continue
        seen.add(key)
        p = pairs.setdefault((src, dst), {'from': src, 'to': dst, 'n': 0, 'ev': [], 'examples': []})
        p['n'] += 1
        # one entry per incident: [year, type, 1 if a state or state-linked actor]
        p['ev'].append([year, TYPES.get(r['operation_type'], 'other'), 1 if r['initiator_category'] in STATE else 0])
        if len(p['examples']) < 2:
            p['examples'].append([r['name'][:160], r['start_date'][:10]])
        used.update([src, dst])

    countries = {c: {'name': world[c]['name']['common'], 'num': world[c]['ccn3'], 'lat': world[c]['latlng'][0], 'lon': world[c]['latlng'][1]} for c in sorted(used)}
    out_pairs = sorted(pairs.values(), key=lambda p: -p['n'])
    total_named = sum(p['n'] for p in out_pairs)
    total_unattr = sum(len(v) for v in unattr.values())
    out = {
        'source': 'EuRepoC Global Dataset of Cyber Incidents v1.3.2 (doi:10.5281/zenodo.14965395), CC BY-NC 4.0',
        'totals': {
            'incidents': len(incidents),
            'namedPairs': total_named,
            'domestic': sum(p['n'] for p in out_pairs if p['from'] == p['to']),
            'unattributedTargets': total_unattr,
            'attackerCountries': len({p['from'] for p in out_pairs}),
            'targetCountries': len({p['to'] for p in out_pairs} | set(unattr)),
        },
        'countries': countries,
        'pairs': out_pairs,
        'unattributed': dict(unattr),
    }
    with open('data/flows.json', 'w', encoding='utf-8') as f:
        json.dump(out, f, separators=(',', ':'), ensure_ascii=False)
    print(json.dumps(out['totals']))
    for p in out_pairs[:8]:
        print(p['n'], p['from'], '->', p['to'])


if __name__ == '__main__':
    main()
