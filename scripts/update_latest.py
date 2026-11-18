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
# Only what matters. A breach makes the cut if it is recent, real, and either big or sensitive.
BREACH_BIG = 1_000_000
BREACH_SENSITIVE_MIN = 250_000
BREACH_ADDED_DAYS = 180
BREACH_HAPPENED_YEARS = 2
SENSITIVE = {
    'Passwords': 'passwords', 'Government issued IDs': 'government IDs', 'Passport numbers': 'passport numbers',
    'Social security numbers': 'Social Security numbers', 'National identity numbers': 'national ID numbers',
    'Bank account numbers': 'bank account numbers', 'Bank card numbers': 'card numbers', 'Credit cards': 'card numbers',
    'Partial credit card data': 'partial card numbers', 'Health insurance information': 'health insurance details',
    'Medical records': 'medical records', 'Health records': 'health records', 'Tax file numbers': 'tax numbers',
    "Driver's licenses": "driver's licences", 'Biometric data': 'biometric data',
}
# A flaw makes the cut if ransomware gangs use it, or it is in software most people or offices run.
FLAW_DAYS = 30
COMMON_VENDORS = ('microsoft', 'apple', 'google', 'android', 'chrome', 'mozilla', 'cisco', 'fortinet', 'ivanti',
                  'citrix', 'vmware', 'broadcom', 'palo alto', 'atlassian', 'adobe', 'oracle', 'sap', 'samsung',
                  'linux', 'zoom', 'sonicwall', 'juniper', 'check point', 'wordpress', 'qualcomm', 'apache')
KEEP = 6

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
    for b in get(HIBP):
        if (not b.get('IsVerified') or b.get('IsFabricated') or b.get('IsSpamList') or b.get('IsRetired')
                or b.get('IsStealerLog') or b.get('IsMalware') or b.get('IsSensitive')):
            continue
        added = dt.date.fromisoformat(b['AddedDate'][:10])
        try:
            happened = dt.date.fromisoformat(b['BreachDate'])
        except ValueError:
            continue
        if (today - added).days > BREACH_ADDED_DAYS or (today - happened).days > BREACH_HAPPENED_YEARS * 365:
            continue
        n = b['PwnCount']
        sens = []
        for c in b['DataClasses']:
            if c in SENSITIVE and SENSITIVE[c] not in sens:
                sens.append(SENSITIVE[c])
        if n < BREACH_BIG and not (sens and n >= BREACH_SENSITIVE_MIN):
            continue
        size = f"{n / 1e6:.1f}M" if n >= 1e6 else f"{round(n / 1e3)}K"
        why = f"{size} accounts" + (f" · {', '.join(sens[:3])} exposed" if sens else '')
        breaches.append({
            'name': b['Title'],
            'domain': b.get('Domain') or '',
            'happened': b['BreachDate'],
            'added': b['AddedDate'][:10],
            'accounts': n,
            'data': b['DataClasses'][:6],
            'about': text(b['Description']),
            'why': why,
            'url': f"https://haveibeenpwned.com/Breach/{b['Name']}",
        })
    breaches.sort(key=lambda x: (x['added'], x['accounts']), reverse=True)

    kev = get(KEV)
    flaws = []
    for v in kev['vulnerabilities']:
        added = dt.date.fromisoformat(v['dateAdded'])
        if (today - added).days > FLAW_DAYS:
            continue
        ransomware = v.get('knownRansomwareCampaignUse') == 'Known'
        vendor = v['vendorProject']
        common = any(k in f"{vendor} {v['product']}".lower() for k in COMMON_VENDORS)
        if not (ransomware or common):
            continue
        title = v['product'] if v['product'].lower().startswith(vendor.lower()) else f"{vendor} {v['product']}"
        title = title.replace('Multiple Products', 'products').replace('Chromium', 'Chrome and Chromium browsers')
        flaws.append({
            'cve': v['cveID'],
            'title': title,
            'vendor': vendor,
            'product': v['product'],
            'name': v['vulnerabilityName'],
            'added': v['dateAdded'],
            'about': text(v['shortDescription']),
            'fix': text(v['requiredAction'], 220),
            'ransomware': ransomware,
            'who': 'Used in ransomware attacks' if ransomware else f'Affects anyone using {title}',
            'url': f"https://nvd.nist.gov/vuln/detail/{v['cveID']}",
        })
    flaws.sort(key=lambda x: (x['added'], x['ransomware']), reverse=True)

    out = {
        'checked': now.strftime('%Y-%m-%dT%H:%MZ'),
        'counts': {'breaches': len(breaches), 'accounts': sum(x['accounts'] for x in breaches), 'flaws': len(flaws)},
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
    print(f"breaches {len(out['breaches'])}, flaws {len(out['flaws'])}, counts {out['counts']}")


if __name__ == '__main__':
    main()
