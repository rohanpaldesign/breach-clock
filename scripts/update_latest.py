"""Builds data/latest.json: notable new breaches and flaws attackers are using right now.

Standard library only. Runs daily from .github/workflows/update.yml.
Sources:
- Have I Been Pwned breach list (CC BY 4.0, haveibeenpwned.com)
- CISA Known Exploited Vulnerabilities catalog (US government, public domain)
Curation rules are the constants below: keep it to notable events only.
"""
import datetime as dt
import html
import json
import re
import urllib.request

HIBP = 'https://haveibeenpwned.com/api/v3/breaches'
KEV = 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json'
UA = 'breach-clock-site/1.0 (+https://github.com/rohanpaldesign/breach-clock)'
BREACH_MIN_ACCOUNTS = 100_000
BREACH_DAYS = 120
FLAW_DAYS = 30
KEEP = 12


def get(url):
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.loads(r.read().decode('utf-8'))


def text(s, limit=320):
    s = html.unescape(re.sub(r'<[^>]+>', '', s or '')).strip()
    s = re.sub(r'\s+', ' ', s)
    if len(s) <= limit:
        return s
    cut = s[:limit].rsplit(' ', 1)[0].rstrip(',;:')
    return cut + '…'


def main():
    now = dt.datetime.now(dt.timezone.utc)
    today = now.date()

    breaches = []
    month_breaches = 0
    month_accounts = 0
    for b in get(HIBP):
        if not b.get('IsVerified') or b.get('IsFabricated') or b.get('IsSpamList') or b.get('IsRetired'):
            continue
        added = dt.date.fromisoformat(b['AddedDate'][:10])
        age = (today - added).days
        if age <= 30:
            month_breaches += 1
            month_accounts += b['PwnCount']
        if age > BREACH_DAYS or b['PwnCount'] < BREACH_MIN_ACCOUNTS or b.get('IsSensitive'):
            continue
        breaches.append({
            'name': b['Title'],
            'domain': b.get('Domain') or '',
            'happened': b['BreachDate'],
            'added': b['AddedDate'][:10],
            'accounts': b['PwnCount'],
            'data': b['DataClasses'][:6],
            'about': text(b['Description']),
            'url': f"https://haveibeenpwned.com/Breach/{b['Name']}",
            'stealer': bool(b.get('IsStealerLog') or b.get('IsMalware')),
        })
    breaches.sort(key=lambda x: (x['added'], x['accounts']), reverse=True)

    kev = get(KEV)
    flaws = []
    month_flaws = 0
    for v in kev['vulnerabilities']:
        added = dt.date.fromisoformat(v['dateAdded'])
        age = (today - added).days
        if age <= 30:
            month_flaws += 1
        if age > FLAW_DAYS:
            continue
        flaws.append({
            'cve': v['cveID'],
            'title': v['product'] if v['product'].lower().startswith(v['vendorProject'].lower()) else f"{v['vendorProject']} {v['product']}",
            'vendor': v['vendorProject'],
            'product': v['product'],
            'name': v['vulnerabilityName'],
            'added': v['dateAdded'],
            'about': text(v['shortDescription']),
            'fix': text(v['requiredAction'], 220),
            'ransomware': v.get('knownRansomwareCampaignUse') == 'Known',
            'url': f"https://nvd.nist.gov/vuln/detail/{v['cveID']}",
        })
    flaws.sort(key=lambda x: (x['added'], x['ransomware']), reverse=True)

    out = {
        'checked': now.strftime('%Y-%m-%dT%H:%MZ'),
        'month': {'breaches': month_breaches, 'accounts': month_accounts, 'flaws': month_flaws},
        'kevTotal': kev.get('count', len(kev['vulnerabilities'])),
        'breaches': breaches[:KEEP],
        'flaws': flaws[:KEEP],
    }
    # Only rewrite when the content changed, so the daily job commits nothing on quiet days.
    path = 'data/latest.json'
    try:
        old = json.load(open(path, encoding='utf-8'))
        old.pop('checked', None)
    except (OSError, ValueError):
        old = None
    cmp = dict(out)
    cmp.pop('checked')
    if old == cmp:
        print('no change')
        return
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f"breaches {len(out['breaches'])}, flaws {len(out['flaws'])}, month {out['month']}")


if __name__ == '__main__':
    main()
