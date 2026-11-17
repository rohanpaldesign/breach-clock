// Every number on the page comes from this file. Each entry names its source and its type:
//   measured  - counted by the publisher (reports, complaints, notices, on-chain payments)
//   reported  - second-hand: from coverage of a report, not the report's own summary page
//   claimed   - the attacker's own number, not confirmed by the victim
//   compiled  - a pile of older leaks re-packaged, not a single new breach
// Refresh once a year. See CLAUDE.md for when each report comes out.

export const ACCESSED = '16 November 2026';

export const SOURCES = {
  cfReport: {
    publisher: 'Cloudflare',
    title: 'DDoS threat report for 2026 H1',
    date: '11 August 2026',
    url: 'https://blog.cloudflare.com/ddos-threat-report-2026-h1/',
  },
  cfRadar: {
    publisher: 'Cloudflare Radar',
    title: 'Application layer DDoS attacks, share by source and target location, last 7 days (CC BY-NC 4.0)',
    date: 'read 16 November 2026',
    url: 'https://radar.cloudflare.com/security/application-layer?dateRange=7d',
  },
  ic3: {
    publisher: 'FBI Internet Crime Complaint Center',
    title: '2025 IC3 Annual Report',
    date: 'April 2026',
    url: 'https://www.ic3.gov/AnnualReport/Reports/2025_IC3Report.pdf',
  },
  apwg: {
    publisher: 'Anti-Phishing Working Group',
    title: 'Phishing Activity Trends Report, Q2 2026',
    date: 'August 2026',
    url: 'https://docs.apwg.org/reports/apwg_trends_report_q2_2026.pdf',
  },
  itrc: {
    publisher: 'Identity Theft Resource Center',
    title: '2025 Annual Data Breach Report',
    date: 'January 2026',
    url: 'https://www.idtheftcenter.org/post/2025-annual-data-breach-report/',
  },
  chainalysis: {
    publisher: 'Chainalysis',
    title: '2026 Crypto Crime Report: ransomware',
    date: '26 February 2026',
    url: 'https://www.chainalysis.com/blog/crypto-ransomware-2026/',
  },
  dbir: {
    publisher: 'Verizon',
    title: '2026 Data Breach Investigations Report',
    date: 'May 2026 (incidents from Nov 2024 to Oct 2025)',
    url: 'https://www.verizon.com/business/resources/reports/dbir/',
  },
  tenable: {
    publisher: 'Tenable (coverage of the Verizon DBIR)',
    title: 'Key findings from the Verizon DBIR 2026',
    date: 'May 2026',
    url: 'https://tenable.com/blog/key-findings-from-the-verizon-dbir-2026',
  },
  cpo: {
    publisher: 'CPO Magazine (coverage of the Verizon DBIR)',
    title: 'Verizon 2026 DBIR: vulnerability exploitation leaps ahead of stolen credentials',
    date: 'May 2026',
    url: 'https://www.cpomagazine.com/cyber-security/verizon-2026-dbir-vulnerability-exploitation-leaps-ahead-of-stolen-credentials-as-1-initial-breach-cause/',
  },
  ibm: {
    publisher: 'IBM',
    title: 'Cost of a Data Breach Report 2026',
    date: 'July 2026',
    url: 'https://www.ibm.com/reports/data-breach',
  },
  techcrunch26: {
    publisher: 'TechCrunch',
    title: 'The worst hacks and breaches of 2026 (so far)',
    date: 'Updated through 2026',
    url: 'https://techcrunch.com/2026/06/03/the-worst-hacks-and-breaches-of-2026-so-far',
  },
  eurepoc: {
    publisher: 'European Repository of Cyber Incidents (EuRepoC)',
    title: 'Global Dataset of Cyber Incidents v1.3.2 (dyadic dataset), CC BY-NC 4.0, doi:10.5281/zenodo.14965395',
    date: 'March 2025, covering 2000 to February 2025',
    url: 'https://zenodo.org/records/14965395',
  },
  worldCountries: {
    publisher: 'mledoze/countries (world-countries 5.1.0)',
    title: 'Country codes and centre points, ODbL',
    date: '',
    url: 'https://github.com/mledoze/countries',
  },
  worldAtlas: {
    publisher: 'Natural Earth via world-atlas 2.0.2',
    title: 'Country shapes at 1:110m',
    date: '',
    url: 'https://github.com/topojson/world-atlas',
  },
  wikiYahoo: { publisher: 'Wikipedia', title: 'Yahoo data breaches', date: '', url: 'https://en.wikipedia.org/wiki/Yahoo_data_breaches' },
  wikiEquifax: { publisher: 'Wikipedia', title: '2017 Equifax data breach', date: '', url: 'https://en.wikipedia.org/wiki/2017_Equifax_data_breach' },
  wikiAnthem: { publisher: 'Wikipedia', title: 'Anthem medical data breach', date: '', url: 'https://en.wikipedia.org/wiki/Anthem_medical_data_breach' },
  wikiMoveit: { publisher: 'Wikipedia', title: '2023 MOVEit data breach', date: '', url: 'https://en.wikipedia.org/wiki/2023_MOVEit_data_breach' },
  wiki23: { publisher: 'Wikipedia', title: '23andMe data leak', date: '', url: 'https://en.wikipedia.org/wiki/23andMe_data_leak' },
  wikiOptus: { publisher: 'Wikipedia', title: '2022 Optus data breach', date: '', url: 'https://en.wikipedia.org/wiki/2022_Optus_data_breach' },
  wikiOpm: { publisher: 'Wikipedia', title: 'Office of Personnel Management data breach', date: '', url: 'https://en.wikipedia.org/wiki/Office_of_Personnel_Management_data_breach' },
  wikiTarget: { publisher: 'Wikipedia', title: '2013 Target data breach', date: '', url: 'https://en.wikipedia.org/wiki/2013_Target_data_breach' },
  wikiMarriott: { publisher: 'Wikipedia', title: 'Marriott International (data breach)', date: '', url: 'https://en.wikipedia.org/wiki/Marriott_International' },
  wikiSnowflake: { publisher: 'Wikipedia', title: 'Snowflake data breach', date: '', url: 'https://en.wikipedia.org/wiki/Snowflake_data_breach' },
  wikiNpd: { publisher: 'Wikipedia', title: 'National Public Data', date: '', url: 'https://en.wikipedia.org/wiki/National_Public_Data' },
  wikiColl1: { publisher: 'Wikipedia', title: 'Collection No. 1', date: '', url: 'https://en.wikipedia.org/wiki/Collection_No._1' },
  wikiQantas: { publisher: 'Wikipedia', title: 'Qantas (2025 data breach)', date: '', url: 'https://en.wikipedia.org/wiki/Qantas' },
  krebsFirstAm: {
    publisher: 'KrebsOnSecurity',
    title: 'First American Financial Corp. leaked hundreds of millions of title insurance records',
    date: 'May 2019',
    url: 'https://krebsonsecurity.com/2019/05/first-american-financial-corp-leaked-hundreds-of-millions-of-title-insurance-records/',
  },
  biFacebook: {
    publisher: 'Business Insider',
    title: 'Stolen data of 533 million Facebook users leaked online',
    date: 'April 2021',
    url: 'https://www.businessinsider.com/stolen-data-of-533-million-facebook-users-leaked-online-2021-4',
  },
  hipaaChange: {
    publisher: 'HIPAA Journal',
    title: 'Change Healthcare cyberattack (estimate updated 6 August 2025)',
    date: 'August 2025',
    url: 'https://www.hipaajournal.com/change-healthcare-responding-to-cyberattack/',
  },
  tcPowerSchool: {
    publisher: 'TechCrunch',
    title: 'What PowerSchool isn’t saying about its massive student data breach',
    date: 'February 2025',
    url: 'https://techcrunch.com/2025/02/03/what-powerschool-isnt-saying-about-its-massive-student-data-breach',
  },
  bcSalesforce: {
    publisher: 'BleepingComputer',
    title: 'ShinyHunters claims 1.5 billion Salesforce records stolen in Drift hacks',
    date: 'September 2025',
    url: 'https://www.bleepingcomputer.com/news/security/shinyhunters-claims-15-billion-salesforce-records-stolen-in-drift-hacks/',
  },
  bc16b: {
    publisher: 'BleepingComputer',
    title: 'No, the 16 billion credentials leak is not a new data breach',
    date: 'June 2025',
    url: 'https://bleepingcomputer.com/news/security/no-the-16-billion-credentials-leak-is-not-a-new-data-breach/',
  },
};

// Live counters. `value` happened over `periodDays`; the page spreads it evenly over time.
// `dot` is what one dot stands for in the event streams.
export const COUNTERS = [
  {
    id: 'losses',
    label: 'lost to internet crime reported to the FBI',
    short: 'Reported losses',
    value: 20_877_000_000,
    unit: 'usd',
    periodDays: 365,
    period: '2025',
    source: 'ic3',
    kind: 'measured',
    note: 'Only what victims reported to the FBI, mostly from the US. The real total is higher.',
    dot: { per: 1000, label: '1 dot = $1,000 lost', color: 'alert' },
  },
  {
    id: 'crypto',
    label: 'of it lost in scams involving crypto',
    short: 'Crypto-linked fraud',
    value: 11_366_669_732,
    unit: 'usd',
    periodDays: 365,
    period: '2025',
    source: 'ic3',
    kind: 'measured',
    note: 'Part of the reported losses above, not added to them. A record year for crypto fraud.',
  },
  {
    id: 'notices',
    label: 'people in the US told their data was exposed',
    short: 'Breach notices',
    value: 278_827_933,
    unit: 'count',
    periodDays: 365,
    period: '2025',
    source: 'itrc',
    kind: 'measured',
    note: 'Victim notices from 3,322 publicly reported US data compromises. One person can get several notices.',
    dot: { per: 1, label: '1 dot = 1 person notified', color: 'signal' },
  },
  {
    id: 'phish',
    label: 'new phishing websites found',
    short: 'Phishing sites',
    value: 971_181 + 1_069_681,
    unit: 'count',
    periodDays: 181,
    period: 'January to June 2026',
    source: 'apwg',
    kind: 'measured',
    note: '971,181 in Q1 and 1,069,681 in Q2 2026. These are unique sites reported to APWG, not emails sent.',
    dot: { per: 1, label: '1 dot = 1 phishing site', color: 'ink' },
  },
  {
    id: 'bec',
    label: 'lost to business email scams',
    short: 'Business email compromise',
    value: 3_046_598_558,
    unit: 'usd',
    periodDays: 365,
    period: '2025',
    source: 'ic3',
    kind: 'measured',
    note: 'A fake invoice or a "new bank details" email from a boss or supplier. Part of the reported losses.',
  },
  {
    id: 'ransom',
    label: 'paid to ransomware gangs in crypto',
    short: 'Ransom paid',
    value: 820_000_000,
    unit: 'usd',
    periodDays: 365,
    period: '2025',
    source: 'chainalysis',
    kind: 'measured',
    note: 'On-chain payments Chainalysis could trace, down 8% from $892 million in 2024. Chainalysis expects the 2025 total to approach $900 million as more payments are found.',
    dot: { per: 100, label: '1 dot = $100 paid in ransom', color: 'alert' },
  },
  {
    id: 'complaints',
    label: 'cybercrime complaints filed with the FBI',
    short: 'FBI complaints',
    value: 1_008_597,
    unit: 'count',
    periodDays: 365,
    period: '2025',
    source: 'ic3',
    kind: 'measured',
    note: 'The first year over one million. The FBI says it now averages almost 3,000 a day.',
    dot: { per: 1, label: '1 dot = 1 complaint to the FBI', color: 'ink' },
  },
];

// Single figures used in cards and walk-throughs.
export const FACTS = {
  exploitShare: { label: 'Breaches that started with an exploited software flaw', value: '31%', period: 'Nov 2024 to Oct 2025', source: 'dbir', kind: 'measured', note: 'Now the most common way in, ahead of stolen passwords for the first time.' },
  ransomShare: { label: 'Breaches that involved ransomware', value: '48%', period: 'Nov 2024 to Oct 2025', source: 'dbir', kind: 'measured' },
  patchDays: { label: 'Median time for organizations to patch', value: '43 days', period: 'DBIR 2026 (32 days the year before)', source: 'tenable', kind: 'reported', note: 'From coverage of the DBIR; not on Verizon’s summary page.' },
  credShare: { label: 'Breaches that started with stolen or abused logins', value: '13%', period: 'DBIR 2026', source: 'cpo', kind: 'reported', note: 'From coverage of the DBIR; not on Verizon’s summary page.' },
  payRate: { label: 'Ransomware victims who paid', value: '28%', period: '2025', source: 'chainalysis', kind: 'measured', note: 'Possibly an all-time low.' },
  medianRansom: { label: 'Median ransom payment', value: '$59,556', period: '2025 (up from $12,738 in 2024)', source: 'chainalysis', kind: 'measured' },
  breachCost: { label: 'Average cost of a data breach to a company', value: '$4.99 million', period: '2026 report, up 12%', source: 'ibm', kind: 'measured', note: 'A record high, worldwide average.' },
  becWire: { label: 'Average wire transfer asked for in email scams', value: '$61,732', period: 'Q2 2026 (up 45% on Q1)', source: 'apwg', kind: 'measured', note: 'Fortra data, published in the APWG report.' },
  phishQ2: { label: 'Phishing websites found in one quarter', value: '1,069,681', period: 'Q2 2026', source: 'apwg', kind: 'measured' },
  compromises: { label: 'Publicly reported US data compromises', value: '3,322', period: '2025, a record', source: 'itrc', kind: 'measured' },
  becLoss: { label: 'Lost to business email compromise', value: '$3.05 billion', period: '2025', source: 'ic3', kind: 'measured' },
  noticesYear: { label: 'People in the US sent a data breach notice', value: '278.8 million', period: '2025', source: 'itrc', kind: 'measured', note: 'Notices, not unique people.' },
  elderLoss: { label: 'Lost by people aged 60 and over', value: '$7.7 billion', period: '2025, from 201,266 complaints', source: 'ic3', kind: 'measured' },
  aiFraud: { label: 'Losses in complaints that involved AI', value: '$893 million', period: '2025, first year tracked', source: 'ic3', kind: 'measured' },
};

// The biggest breaches. `records` is in millions. `unit` says what was counted.
// cause: hacked | flaw | ransomware | misconfigured | scraped | compiled
export const BREACHES = [
  { id: 'cred16b', name: '“16 billion credentials”', year: 2025, records: 16000, unit: 'logins', cause: 'compiled', sector: 'Many', status: 'compiled', note: '30 old datasets found exposed together, mostly from password-stealing malware and old breaches. Not a new breach.', source: 'bc16b' },
  { id: 'rockyou24', name: 'RockYou2024', year: 2024, records: 9000, unit: 'passwords', cause: 'compiled', sector: 'Many', status: 'compiled', note: 'Over 9 billion passwords collected from earlier leaks and posted on a forum.', source: 'bc16b' },
  { id: 'yahoo13', name: 'Yahoo', year: 2013, records: 3000, unit: 'accounts', cause: 'hacked', sector: 'Tech', status: 'confirmed', note: 'Every Yahoo account at the time. Not disclosed until 2016.', source: 'wikiYahoo' },
  { id: 'npd', name: 'National Public Data', year: 2024, records: 2900, unit: 'rows', cause: 'hacked', sector: 'Data broker', status: 'claimed', note: 'About 2.9 billion rows were claimed; many are duplicates, so far fewer people are affected.', source: 'wikiNpd' },
  { id: 'salesforce', name: 'Salesforce customers (Drift)', year: 2025, records: 1500, unit: 'records', cause: 'hacked', sector: 'Many', status: 'claimed', note: 'Stolen app tokens used to pull data from about 760 companies’ Salesforce accounts. The count is the hackers’ own.', source: 'bcSalesforce' },
  { id: 'firstam', name: 'First American', year: 2019, records: 885, unit: 'records', cause: 'misconfigured', sector: 'Finance', status: 'confirmed', note: 'Mortgage and title documents open to anyone who changed a number in a web link.', source: 'krebsFirstAm' },
  { id: 'coll1', name: 'Collection #1', year: 2019, records: 773, unit: 'emails', cause: 'compiled', sector: 'Many', status: 'compiled', note: '773 million unique emails gathered from over 2,000 earlier breaches.', source: 'wikiColl1' },
  { id: 'ticketmaster', name: 'Ticketmaster', year: 2024, records: 560, unit: 'customers', cause: 'hacked', sector: 'Entertainment', status: 'claimed', note: 'Part of the Snowflake breaches: stolen logins without multi-factor authentication.', source: 'wikiSnowflake' },
  { id: 'facebook', name: 'Facebook', year: 2021, records: 533, unit: 'users', cause: 'scraped', sector: 'Tech', status: 'confirmed', note: 'Phone numbers and profiles scraped through a contact feature, then posted free online.', source: 'biFacebook' },
  { id: 'yahoo14', name: 'Yahoo (second breach)', year: 2014, records: 500, unit: 'accounts', cause: 'hacked', sector: 'Tech', status: 'confirmed', note: 'A separate, state-linked breach a year after the first.', source: 'wikiYahoo' },
  { id: 'marriott', name: 'Marriott (Starwood)', year: 2018, records: 383, unit: 'guest records', cause: 'hacked', sector: 'Hospitality', status: 'confirmed', note: 'Attackers sat inside Starwood’s reservation system for four years.', source: 'wikiMarriott' },
  { id: 'change', name: 'Change Healthcare', year: 2024, records: 192.7, unit: 'people', cause: 'ransomware', sector: 'Healthcare', status: 'confirmed', note: 'The largest US healthcare breach. Entry was a remote-access login with no multi-factor authentication.', source: 'hipaaChange' },
  { id: 'idscan', name: 'IDScan', year: 2026, records: 150, unit: 'drivers', cause: 'hacked', sector: 'Identity', status: 'claimed', note: 'Driver’s licence data from the US and Canada held for ransom. The company confirmed a breach but not the count.', source: 'techcrunch26' },
  { id: 'equifax', name: 'Equifax', year: 2017, records: 147.9, unit: 'people', cause: 'flaw', sector: 'Finance', status: 'confirmed', note: 'A known web software flaw left unpatched for months.', source: 'wikiEquifax' },
  { id: 'target', name: 'Target', year: 2013, records: 110, unit: 'customers', cause: 'hacked', sector: 'Retail', status: 'confirmed', note: 'Attackers got in through a heating and air-conditioning supplier’s login.', source: 'wikiTarget' },
  { id: 'att', name: 'AT&T', year: 2024, records: 110, unit: 'customers', cause: 'hacked', sector: 'Telecom', status: 'confirmed', note: 'Call and text records of nearly all customers, taken from a Snowflake account.', source: 'wikiSnowflake' },
  { id: 'moveit', name: 'MOVEit', year: 2023, records: 93.3, unit: 'people', cause: 'flaw', sector: 'Many', status: 'confirmed', note: 'One flaw in file-transfer software, used against over 2,700 organizations.', source: 'wikiMoveit' },
  { id: 'anthem', name: 'Anthem', year: 2015, records: 78.8, unit: 'people', cause: 'hacked', sector: 'Healthcare', status: 'confirmed', note: 'Health insurer; names, Social Security numbers and addresses.', source: 'wikiAnthem' },
  { id: 'powerschool', name: 'PowerSchool', year: 2024, records: 72, unit: 'students and teachers', cause: 'hacked', sector: 'Education', status: 'claimed', note: 'About 62 million students and 9.5 million teachers, per the hacker. PowerSchool hasn’t confirmed a total.', source: 'tcPowerSchool' },
  { id: 'charter', name: 'Charter', year: 2026, records: 40, unit: 'records', cause: 'hacked', sector: 'Telecom', status: 'reported', note: 'Part of a 2026 extortion campaign by the ShinyHunters gang.', source: 'techcrunch26' },
  { id: 'instructure', name: 'Instructure (Canvas)', year: 2026, records: 30, unit: 'students and staff', cause: 'hacked', sector: 'Education', status: 'reported', note: 'Voice phishing of staff; a ransom was reportedly paid.', source: 'techcrunch26' },
  { id: 'opm', name: 'US Office of Personnel Management', year: 2015, records: 21.5, unit: 'people', cause: 'hacked', sector: 'Government', status: 'confirmed', note: 'Background-check files of federal employees and applicants.', source: 'wikiOpm' },
  { id: 'dentaquest', name: 'DentaQuest', year: 2026, records: 15, unit: 'people', cause: 'hacked', sector: 'Healthcare', status: 'reported', note: 'Dental benefits data.', source: 'techcrunch26' },
  { id: 'optus', name: 'Optus', year: 2022, records: 10, unit: 'customers', cause: 'misconfigured', sector: 'Telecom', status: 'confirmed', note: 'Up to 10 million Australians, a third of the country, through an exposed API.', source: 'wikiOptus' },
  { id: 'aesto', name: 'Aesto Health', year: 2026, records: 9.5, unit: 'patients', cause: 'hacked', sector: 'Healthcare', status: 'confirmed', note: 'Breached in late 2025, confirmed in 2026.', source: 'techcrunch26' },
  { id: '23andme', name: '23andMe', year: 2023, records: 6.9, unit: 'users', cause: 'hacked', sector: 'Health', status: 'confirmed', note: 'Reused passwords opened a few thousand accounts, and a sharing feature exposed millions more.', source: 'wiki23' },
  { id: 'carnival', name: 'Carnival', year: 2026, records: 6, unit: 'customer records', cause: 'hacked', sector: 'Travel', status: 'reported', note: 'At least 6 million, in the ShinyHunters campaign.', source: 'techcrunch26' },
  { id: 'qantas', name: 'Qantas', year: 2025, records: 5.7, unit: 'customers', cause: 'hacked', sector: 'Travel', status: 'confirmed', note: 'A call centre was tricked into giving access.', source: 'wikiQantas' },
  { id: 'carecloud', name: 'CareCloud', year: 2026, records: 3.7, unit: 'patients', cause: 'hacked', sector: 'Healthcare', status: 'confirmed', note: 'Health records software provider.', source: 'techcrunch26' },
];

export const CAUSES = {
  hacked: 'Hacked',
  flaw: 'Exploited flaw',
  ransomware: 'Ransomware',
  misconfigured: 'Left exposed',
  scraped: 'Scraped',
  compiled: 'Compilation',
};

export const STATUSES = {
  confirmed: 'Confirmed by the company or official filings',
  reported: 'Reported by journalists; no company count yet',
  claimed: 'The attackers’ own number',
  compiled: 'Older leaks re-packaged, not a new breach',
};

export const LIVE = {
  // Attack rate: Cloudflare, H1 2026 average (23.2 million network-layer DDoS attacks in H1).
  perHour: 5343,
  // Share of application-layer DDoS attacks by country, Cloudflare Radar, 7 days to 16 Nov 2026 (top 20 each).
  sources: [["ID", 13.9], ["US", 12.7], ["CN", 8.1], ["DE", 4.0], ["SG", 3.8], ["NL", 3.5], ["VN", 3.3], ["BE", 2.8], ["BR", 2.7], ["PH", 2.4], ["IN", 2.2], ["FR", 2.0], ["MX", 2.0], ["CO", 1.8], ["TH", 1.8], ["BD", 1.6], ["TR", 1.5], ["CM", 1.4], ["HK", 1.3], ["JP", 1.3]],
  targets: [["US", 52.1], ["CA", 12.7], ["IL", 6.5], ["CY", 4.7], ["GB", 4.2], ["CW", 2.8], ["BR", 2.4], ["HK", 1.5], ["RU", 1.3], ["VN", 1.0], ["AE", 0.8], ["CR", 0.8], ["AU", 0.7], ["TR", 0.6], ["AM", 0.5], ["CN", 0.5], ["NP", 0.5], ["NL", 0.5], ["PT", 0.4], ["SG", 0.4]],
  // code: [name, ISO numeric, lat, lon]
  places: {"AE": ["UAE", "784", 24, 54], "AM": ["Armenia", "051", 40, 45], "AU": ["Australia", "036", -27, 133], "BD": ["Bangladesh", "050", 24, 90], "BE": ["Belgium", "056", 50.83333333, 4], "BR": ["Brazil", "076", -10, -55], "CA": ["Canada", "124", 60, -95], "CM": ["Cameroon", "120", 6, 12], "CN": ["China", "156", 35, 105], "CO": ["Colombia", "170", 4, -72], "CR": ["Costa Rica", "188", 10, -84], "CW": ["Curaçao", "531", 12.116667, -68.933333], "CY": ["Cyprus", "196", 35, 33], "DE": ["Germany", "276", 51, 9], "FR": ["France", "250", 46, 2], "GB": ["United Kingdom", "826", 54, -2], "HK": ["Hong Kong", "344", 22.267, 114.188], "ID": ["Indonesia", "360", -5, 120], "IL": ["Israel", "376", 31.47, 35.13], "IN": ["India", "356", 20, 77], "JP": ["Japan", "392", 36, 138], "MX": ["Mexico", "484", 23, -102], "NL": ["Netherlands", "528", 52.5, 5.75], "NP": ["Nepal", "524", 28, 84], "PH": ["Philippines", "608", 13, 122], "PT": ["Portugal", "620", 39.5, -8], "RU": ["Russia", "643", 60, 100], "SG": ["Singapore", "702", 1.36666666, 103.8], "TH": ["Thailand", "764", 15, 100], "TR": ["Türkiye", "792", 39, 35], "US": ["United States", "840", 38, -97], "VN": ["Vietnam", "704", 16.16666666, 107.83333333]},
};
