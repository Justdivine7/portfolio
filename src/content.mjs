// Single source of truth for every fact on the site.
// Everything here comes from the previous version of the portfolio — keep it verifiable.
// Edit this file, then run `node scripts/build.mjs`.

export const site = {
  url: 'https://divine-ajayi.vercel.app',
  name: 'Divine Ajayi',
  fullName: 'Ajayi Divine Iretomiwa',
  role: 'Mobile Engineer — Flutter & Dart',
  title: 'Divine Ajayi — Mobile Engineer, Flutter & Dart',
  description:
    'Divine Ajayi is a Flutter and Dart mobile engineer who takes production apps from architecture to the App Store and Google Play — payments, real-time features, offline-ready data layers and release engineering.',
  location: 'Akure, Nigeria',
  timezone: 'Africa/Lagos',
  availability: 'Open to international roles',
  email: 'divineajayi179@gmail.com',
  phone: { display: '+234 701 768 8976', href: 'tel:+2347017688976' },
  resume: 'https://docs.google.com/document/d/1QVKqj-YDmwgxXMshzW5mJi7K81aaL-JzmLRAoFA1aPk/edit?tab=t.0',
  links: [
    { label: 'LinkedIn', handle: 'ajayi-divine', href: 'https://linkedin.com/in/ajayi-divine' },
    { label: 'GitHub', handle: 'Justdivine7', href: 'https://github.com/Justdivine7' },
  ],
  facts: [
    { k: 'Shipping', v: '5+ apps in production' },
    { k: 'Platforms', v: 'iOS & Android' },
    { k: 'Based in', v: 'Akure, Nigeria · Remote' },
  ],
};

const S = (dir, file, alt, caption) => ({ src: `assets/${dir}/${file}.webp`, alt, caption });

// ---------------------------------------------------------------------------
// Case-study projects (ordered as they appear in Selected Work)
// ---------------------------------------------------------------------------
export const projects = [
  {
    slug: 'midddleman',
    name: 'Midddleman',
    category: 'Fintech · Procurement · Marketplace',
    tagline: 'China sourcing for Nigerian importers.',
    summary:
      'Importers fund a naira wallet, buy RMB to pay suppliers on Alipay and WeChat, browse 1688 in local currency and hire procurement agents in China — in one app.',
    layout: 'posters',
    kind: 'poster',
    theme: { bg: '#0F2419', fg: '#EEF2E6', muted: '#A9B8A4', accent: '#B9E35C', panel: '#183527' },
    status: 'Live',
    statusNote: '10k+ installs on Google Play',
    role: 'Lead Mobile Developer',
    context: 'Midddleman Technologies · team-built product',
    timeline: 'Sep 2026 — Present',
    platforms: 'iOS & Android',
    links: [
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.app.midddleman' },
      { label: 'App Store', href: 'https://apps.apple.com/us/app/midddleman/id6744252874' },
    ],
    owned: [
      'Connectivity and offline layer, so the app stays usable on unreliable networks',
      'Session-timeout handling',
      'iOS push notifications and app-icon badging',
      'Release configuration for the App Store and Play Store',
    ],
    stack: ['Flutter', 'Dart', 'Offline handling', 'Session management', 'iOS push', 'Shorebird OTA'],
    overview: [
      'Midddleman brings the moving parts of importing from China into one app. Importers fund a naira wallet, buy RMB at the day’s rate, pay suppliers on Alipay and WeChat, browse products from 1688 priced in local currency, and hire procurement agents on the ground in China.',
    ],
    problem:
      'Paying a supplier in China, finding products and getting someone to source them usually means juggling several services. Midddleman puts the wallet, the currency purchase, the marketplace and the agent network in one place — which means the app has to be dependable, because it sits on top of people’s money and orders.',
    team:
      'Midddleman is built by a team. I lead mobile development of the customer and agent apps on iOS and Android, with responsibility for technical direction and delivery, and I work with the QA team to validate builds before release. The work listed here is the part I personally own.',
    challenges: [
      {
        title: 'Staying usable on unreliable networks',
        body: 'Importers rely on the app when the connection doesn’t. I built the connectivity and offline layer that keeps the app usable on unreliable networks instead of failing on every dropped request.',
      },
      {
        title: 'Sessions that respect money',
        body: 'A wallet app has to be deliberate about how long a session stays open. I implemented the session-timeout handling in the customer app.',
      },
      {
        title: 'Reaching people outside the app',
        body: 'I implemented iOS push notifications and app-icon badging, so updates reach users when the app isn’t open.',
      },
      {
        title: 'Owning the release pipeline',
        body: 'I own release configuration and the end-to-end pipeline across App Store Connect, TestFlight, Google Play Console and Shorebird OTA patching.',
      },
    ],
    architecture: [
      { k: 'Client', v: 'Flutter & Dart, shipped to iOS and Android' },
      { k: 'Resilience', v: 'Connectivity monitoring and offline handling' },
      { k: 'Security', v: 'Session-timeout handling' },
      { k: 'Messaging', v: 'iOS push notifications and badging' },
      { k: 'Delivery', v: 'App Store Connect, TestFlight, Play Console, Shorebird OTA' },
    ],
    screens: [
      {
        title: 'Wallet & payments',
        items: [
          S('midddleman', '01-home-wallet', 'Midddleman home with wallet balance, Fund Wallet and Buy RMB', 'Wallet home'),
          S('midddleman', '02-buy-rmb', 'Buy RMB screen with today’s exchange rate and naira amount', 'Buy RMB'),
          S('midddleman', '05-activity-feed', 'Activity feed of RMB purchases, wallet funding and withdrawals with statuses', 'Activity'),
        ],
      },
      {
        title: 'Sourcing & agents',
        items: [
          S('midddleman', '03-1688-marketplace', 'Marketplace for browsing 1688 products in local currency', '1688 marketplace'),
          S('midddleman', '04-ai-assistant', 'Midddleman AI answering a shipping cost question', 'AI assistant'),
          S('midddleman', '06-hire-agents', 'Procurement orders list with agent quotes', 'Hire agents'),
        ],
      },
    ],
    outcome: ['Live on the App Store and Google Play.', '10k+ installs on Google Play.'],
  },

  {
    slug: 'midddleman-agent',
    name: 'Midddleman Agent',
    category: 'Procurement · Business operations',
    tagline: 'The other side of the marketplace.',
    summary:
      'The companion app for procurement agents in China who fulfil Midddleman orders: accept or decline requests, follow each order through quoting, payment and sourcing, and withdraw earnings.',
    layout: 'companion',
    kind: 'poster',
    theme: { bg: '#E4EBD2', fg: '#13241A', muted: '#4D5E4F', accent: '#2F6B3E', panel: '#D5E1BC' },
    status: 'Live',
    statusNote: 'On the App Store and Google Play',
    role: 'Lead Mobile Developer',
    context: 'Midddleman Technologies · team-built product',
    timeline: 'Sep 2026 — Present',
    platforms: 'iOS & Android',
    links: [
      { label: 'Google Play', href: 'https://play.google.com/store/apps/details?id=com.midddleman.procurement' },
      { label: 'App Store', href: 'https://apps.apple.com/us/app/midddleman-agent/id6756414848' },
    ],
    owned: [
      'Procurement chat',
      'Survey system',
      'Offline, session-security and caching layers',
      'Release engineering across the App Store and Play Store',
    ],
    stack: ['Flutter', 'Dart', 'Chat', 'Offline-first', 'Caching', 'Session security'],
    overview: [
      'Every Midddleman procurement order is fulfilled by an agent in China. The Agent app is where they work: accept or decline incoming requests, move each order through quoting, awaiting payment and sourcing, chat about each order, and withdraw what they earn to a bank account or Alipay.',
    ],
    problem:
      'Agents are running a business from their phone. They need to see what’s pending, respond quickly, keep a conversation going around each order, and trust that their earnings and account are secure — wherever they are and whatever the connection.',
    team:
      'Like the customer app, the Agent app is a team product. As Lead Mobile Developer I set direction for both apps; the features below are the ones I own in the Agent app.',
    challenges: [
      {
        title: 'Conversations around every order',
        body: 'I built the procurement chat, so the conversation about an order lives alongside the order itself.',
      },
      {
        title: 'Hearing from agents',
        body: 'I built the in-app survey system.',
      },
      {
        title: 'Offline, caching and session security',
        body: 'I own the offline, session-security and caching layers — the parts that decide what the app does when the network drops, what it remembers, and how long a signed-in session is trusted.',
      },
      {
        title: 'Release engineering',
        body: 'I ship the app to both stores, owning the pipeline across App Store Connect, TestFlight, Google Play Console and Shorebird OTA patching.',
      },
    ],
    architecture: [
      { k: 'Client', v: 'Flutter & Dart, shipped to iOS and Android' },
      { k: 'Data', v: 'Caching layer with offline-first behaviour' },
      { k: 'Security', v: 'Session-security layer' },
      { k: 'Features', v: 'Procurement chat, survey system' },
      { k: 'Delivery', v: 'App Store Connect, TestFlight, Play Console, Shorebird OTA' },
    ],
    screens: [
      {
        title: 'Orders',
        items: [
          S('midddleman-agent', '01-earnings-dashboard', 'Agent home with total procurement value and order shortcuts', 'Agent home'),
          S('midddleman-agent', '02-accept-or-decline-order', 'Confirm procurement screen with Accept order and Decline order buttons', 'Accept or decline'),
          S('midddleman-agent', '03-order-tracking', 'Procurement orders filtered by stage: Pending, Quoting, Awaiting Payment', 'Order stages'),
        ],
      },
      {
        title: 'Earnings',
        items: [
          S('midddleman-agent', '04-earnings-and-kyc', 'Settings with total earnings, withdraw funds and KYC', 'Earnings & KYC'),
          S('midddleman-agent', '05-withdrawal-accounts', 'Withdrawal accounts for bank and Alipay', 'Withdrawal accounts'),
        ],
      },
    ],
    outcome: ['Live on the App Store and Google Play.'],
  },

  {
    slug: 'pawshauz',
    name: 'Pawshauz',
    category: 'Pet services marketplace',
    tagline: 'Three apps, one pet-care marketplace.',
    summary:
      'A multi-sided marketplace — customer, merchant and vet apps, all in production. Built solo as the sole mobile engineer at Jamforte Technologies.',
    layout: 'triptych',
    kind: 'device',
    theme: { bg: '#F2E6D6', fg: '#1E1712', muted: '#6C5D50', accent: '#D9581E', panel: '#E8D7C2' },
    status: 'Live',
    statusNote: 'On Google Play and the App Store',
    role: 'Flutter Mobile Engineer — sole mobile engineer',
    context: 'Jamforte Technologies · Abuja, Nigeria',
    timeline: 'Jul 2025 — Jul 2026',
    platforms: 'iOS & Android',
    links: [
      { label: 'Google Play · Customer', href: 'https://play.google.com/store/apps/details?id=com.pawshauz.app' },
      { label: 'App Store · Customer', href: 'https://apps.apple.com/ng/app/pawshauz/id6768559120' },
      { label: 'Google Play · Merchant', href: 'https://play.google.com/store/apps/details?id=com.pawshauz.business' },
      { label: 'App Store · Merchant', href: 'https://apps.apple.com/ng/app/pawshauz-business/id6768560243' },
    ],
    owned: [
      'PawsAI — an in-app AI pet-care assistant with streaming responses and session persistence',
      'Merchant dashboard with earnings chart, inventory management with TTL caching, and the full order pipeline',
      'Vet app with consultation requests, emergency alerts and multi-clinic switching',
      'Real-time chat with optimistic UI, multi-image bubbles and date separators',
      'The full iOS and Android release pipeline',
    ],
    stack: ['Flutter', 'BLoC', 'Flutterwave', 'Google Places SDK', 'OneSignal', 'Shorebird', 'App Store Connect', 'Play Console'],
    overview: [
      'Pawshauz connects pet owners with the businesses and vets that look after their pets. It is three products: a customer app for shopping, finding vets and asking PawsAI for advice; a merchant app for running a pet business; and a vet app for handling consultations.',
      'I was the sole mobile engineer at Jamforte Technologies, so the mobile side — architecture, features and releases — was mine end to end.',
    ],
    problem:
      'A multi-sided marketplace has to work for every side at once. Customers need to find help and products quickly; merchants need to see earnings, keep inventory accurate and move orders along; vets need to respond to consultations and emergencies — potentially across more than one clinic.',
    team:
      'I built the Pawshauz mobile apps solo as the sole mobile engineer at Jamforte Technologies, working against the company’s backend.',
    challenges: [
      {
        title: 'An AI assistant that behaves like a product feature',
        body: 'PawsAI streams responses as they’re generated, persists the session so conversations survive, and handles users leaving mid-response cleanly.',
      },
      {
        title: 'Inventory that stays fresh without hammering the API',
        body: 'The merchant dashboard combines an earnings chart, inventory management backed by TTL caching, and the full order pipeline.',
      },
      {
        title: 'Vets who work across clinics',
        body: 'The vet experience covers consultation requests and emergency alerts, with switching between multiple clinics.',
      },
      {
        title: 'Chat that feels instant',
        body: 'In-app chat uses optimistic UI so messages appear immediately, with multi-image bubbles and date separators.',
      },
      {
        title: 'Payments and releases',
        body: 'Flutterwave flows cover subscription checkout, wallet top-up and in-app withdrawal. I ran the full release pipeline: provisioning, code signing, TestFlight and the Play Store.',
      },
    ],
    architecture: [
      { k: 'State', v: 'BLoC' },
      { k: 'Payments', v: 'Flutterwave — subscriptions, wallet top-up, withdrawal' },
      { k: 'Location', v: 'Google Places SDK' },
      { k: 'Notifications', v: 'OneSignal' },
      { k: 'AI', v: 'PawsAI with streaming responses and session persistence' },
      { k: 'Delivery', v: 'Shorebird, App Store Connect, Google Play Console' },
    ],
    screens: [
      {
        title: 'Customer app',
        items: [
          S('pawshauz', 'customer-01-home', 'Pawshauz customer home', 'Home'),
          S('pawshauz', 'customer-02-shop', 'Pawshauz shop', 'Shop'),
          S('pawshauz', 'customer-03-vets', 'Pawshauz vets near you', 'Vets'),
          S('pawshauz', 'customer-04-pawsai', 'PawsAI chat answering a pet-care question', 'PawsAI'),
        ],
      },
      {
        title: 'Merchant app',
        items: [
          S('pawshauz', 'merchant-01-home', 'Merchant dashboard with products, orders and earnings chart', 'Dashboard'),
          S('pawshauz', 'merchant-02-inventory', 'Merchant inventory', 'Inventory'),
          S('pawshauz', 'merchant-03-orders', 'Merchant orders', 'Orders'),
        ],
      },
      {
        title: 'Vet app',
        items: [
          S('pawshauz', 'vet-01-dashboard', 'Vet dashboard', 'Dashboard'),
          S('pawshauz', 'vet-02-clinics', 'Vet clinic switching', 'Clinics'),
        ],
      },
    ],
    outcome: [
      'Customer and merchant apps live on Google Play and the App Store.',
      'Customer, merchant and vet experiences all in production.',
    ],
  },

  {
    slug: 'shmood',
    name: 'Shmood',
    category: 'AI · Music discovery',
    tagline: 'Describe your mood. Get a queue built for it.',
    summary:
      'You describe what’s actually going on with you — by text or voice — and Shmood builds a queue that fits the feeling instead of just tagging a genre.',
    layout: 'spotlight',
    kind: 'device',
    theme: { bg: '#0A0E18', fg: '#E8EAF2', muted: '#9298AE', accent: '#9DB0FF', panel: '#131A2B' },
    status: 'In development',
    statusNote: 'Android APK available',
    role: 'Sole engineer',
    context: 'Personal project, built alongside full-time work',
    timeline: 'Ongoing',
    platforms: 'iOS & Android',
    links: [{ label: 'Download APK', href: 'https://drive.google.com/file/d/1fVji1VodpwjVkbkJnxmXP4C5mXJMI1pf/view?usp=drive_link' }],
    owned: [
      'Mood elicitation through quick-select chips, free text, or live voice over WebRTC via OpenAI’s Realtime API',
      'A music resolver that catches hallucinated song recommendations before they reach the queue',
      '“Moments” — revisit and replay mixes generated from earlier check-ins',
      'Fixed an AVAudioSession / ReplayKit conflict during an audio-layer swap',
    ],
    stack: ['Flutter', 'BLoC', 'Clean Architecture', 'OpenAI Realtime API', 'WebRTC', 'iTunes Search API'],
    overview: [
      'Shmood is mood-based music discovery. Instead of picking a genre or a playlist, you tell it what’s actually going on with you — tap a chip, type a sentence, or just talk — and it builds a queue around that feeling.',
      'It’s a personal portfolio project, built alongside full-time engineering work, and the place where I push on AI-native interaction.',
    ],
    problem:
      'Most music apps ask you to translate a feeling into a genre, artist or playlist. Shmood takes the feeling directly. The hard part is that language models will confidently recommend songs that don’t exist — so every suggestion has to be checked before it plays.',
    team: 'Shmood is a personal portfolio project that I build on my own, alongside full-time engineering work.',
    challenges: [
      {
        title: 'Talking to the app, live',
        body: 'Mood input works three ways: quick-select chips, free text, or live voice streamed over WebRTC through OpenAI’s Realtime API.',
      },
      {
        title: 'Never queue a song that doesn’t exist',
        body: 'The music resolver uses normalized containment matching with edit-distance-1 fuzzy tolerance, gated by an iTunes Search verification check, so hallucinated recommendations are caught before they hit the queue.',
      },
      {
        title: 'Architecture that paid for itself',
        body: 'Swapping the audio layer surfaced an AVAudioSession / ReplayKit conflict. Because of the Clean Architecture boundaries, the problem was isolated to one layer and fixed there.',
      },
      {
        title: 'Moments',
        body: 'Every check-in becomes a Moment you can revisit, replaying the mix generated for how you felt then.',
      },
    ],
    architecture: [
      { k: 'Structure', v: 'Clean Architecture with BLoC' },
      { k: 'Voice', v: 'OpenAI Realtime API over WebRTC' },
      { k: 'Verification', v: 'iTunes Search API' },
      { k: 'Matching', v: 'Normalized containment, edit-distance-1 tolerance' },
      { k: 'Playback', v: 'Now playing with synced lyrics and offset control' },
    ],
    screens: [
      {
        title: 'Mood input',
        items: [
          S('shmood', '01-tap-in', 'Shmood prompt to tap in and describe your mood', 'Tap in'),
          S('shmood', '02-mood-input', 'Shmood mood chips and free text input', 'Chips & text'),
          S('shmood', '03-voice', 'Shmood voice listening state', 'Voice'),
        ],
      },
      {
        title: 'Discovery',
        items: [
          S('shmood', '04-for-you', 'Shmood For You mood-based mix', 'For You'),
          S('shmood', '05-for-you-more', 'Shmood For You, second row of mixes', 'More mixes'),
          S('shmood', '06-moments', 'Shmood Moments — past mood check-ins', 'Moments'),
        ],
      },
      {
        title: 'Now playing',
        items: [
          S('shmood', '07-now-playing', 'Shmood now playing screen', 'Now playing'),
          S('shmood', '08-lyrics', 'Shmood synced lyrics with offset control', 'Synced lyrics'),
        ],
      },
    ],
    outcome: ['In development, with an Android build available to download.'],
  },

  {
    slug: 'sanah',
    name: 'Sanah',
    category: 'AI · Nutrition',
    tagline: 'Snap a plate. Understand it.',
    summary:
      'Photo in, nutrition out: snap a plate, confirm what the AI detected, and get a deterministic health score with a personalized explanation of why — not just a calorie count.',
    layout: 'pipeline',
    kind: 'device',
    theme: { bg: '#EDE0CF', fg: '#23170F', muted: '#6E5A49', accent: '#C2501F', panel: '#E2D0BA' },
    status: 'In development',
    statusNote: 'Android APK available',
    role: 'Sole engineer',
    context: 'Personal project',
    timeline: 'Ongoing',
    platforms: 'iOS & Android',
    links: [{ label: 'Download APK', href: 'https://drive.google.com/file/d/1p7HHtEEyHIUmA6oTO6kjm90uzz_F2qFX/view?usp=drive_link' }],
    pipeline: [
      { k: 'See', v: 'Vision extracts what’s on the plate.' },
      { k: 'Resolve', v: 'A tiered resolver checks a Nigerian dish library, then USDA, then AI estimation.' },
      { k: 'Score', v: 'A deterministic scorer computes the health score.' },
      { k: 'Explain', v: 'A final stage writes the personalized explanation.' },
    ],
    owned: [
      'A four-stage AI pipeline: vision, tiered nutrition resolution, deterministic scoring, personalized explanation',
      'Tiered nutrition lookup — West African Food Composition Table first, USDA underneath',
      'Daily calorie and macro targets via Mifflin-St Jeor BMR/TDEE, tailored to the user’s goal',
      'Real-time Firestore listeners for the calorie ring and recent meals',
    ],
    stack: ['Flutter', 'BLoC', 'Clean Architecture', 'Firebase Cloud Functions', 'Firestore', 'Anthropic API'],
    overview: [
      'Sanah is a food and nutrition tracker. You photograph a meal, confirm or edit what the AI detected, and get a health score with a personalized explanation of why it scored that way.',
      'It resolves nutrition against a dedicated Nigerian dish library first and falls back to USDA’s global database — accurate for Nigerian meals without being locked to them.',
    ],
    problem:
      'Nutrition data is often built around Western foods, which leaves Nigerian dishes poorly covered. And a calorie number on its own doesn’t tell you whether a meal was good for you or what to change.',
    team: 'Sanah is a personal portfolio project that I build on my own.',
    challenges: [
      {
        title: 'A pipeline, not a single prompt',
        body: 'Four stages, each with one job: vision extracts what’s on the plate; a tiered resolver matches it against a Nigerian dish library, falling back to USDA and then AI estimation; a deterministic scorer computes the health score; a final stage writes the explanation.',
      },
      {
        title: 'Data that works beyond one region',
        body: 'The West African Food Composition Table covers Nigerian dishes specifically, with USDA’s global database underneath for everything else — a tiered design rather than a single-market dataset with a fallback bolted on.',
      },
      {
        title: 'Scores you can trust',
        body: 'The health score is computed deterministically, so the same meal scores the same way every time. The model explains the score; it doesn’t invent it.',
      },
      {
        title: 'Personal targets, live',
        body: 'Onboarding computes daily calorie and macro targets with the Mifflin-St Jeor BMR/TDEE formula for the user’s goal, and Firestore listeners keep the calorie ring and recent meals in sync as entries are added or edited.',
      },
    ],
    architecture: [
      { k: 'Structure', v: 'Clean Architecture with BLoC' },
      { k: 'Backend', v: 'Firebase Cloud Functions, Firestore' },
      { k: 'AI', v: 'Anthropic API' },
      { k: 'Nutrition data', v: 'West African Food Composition Table → USDA → AI estimate' },
      { k: 'Targets', v: 'Mifflin-St Jeor BMR / TDEE' },
    ],
    screens: [
      {
        title: 'Nutrition score',
        items: [
          S('sanah', '01-health-score', 'Sanah AI health score and personalized explanation', 'Health score'),
          S('sanah', '02-meal-breakdown', 'Sanah meal breakdown with verified nutrition badge', 'Meal breakdown'),
        ],
      },
      {
        title: 'Scan & confirm',
        items: [
          S('sanah', '03-launch', 'Sanah launch screen', 'Launch'),
          S('sanah', '04-detected-meal', 'Sanah AI-detected meal from photo', 'Detected meal'),
          S('sanah', '05-confirm', 'Sanah editable ingredient confirmation screen', 'Confirm ingredients'),
        ],
      },
      {
        title: 'Home & profile',
        items: [
          S('sanah', '06-home', 'Sanah home dashboard with daily calorie ring', 'Home'),
          S('sanah', '07-profile', 'Sanah profile with daily macro plan', 'Profile'),
        ],
      },
    ],
    outcome: ['In development, with an Android build available to download.'],
  },

  {
    slug: 'ofxpress',
    name: 'Ofast / Ofxpress',
    shortName: 'Ofxpress',
    category: 'Food · Logistics',
    tagline: 'One basket, many restaurants.',
    summary:
      'A multi-category delivery platform — food, groceries, pharmacy and logistics. I built the customer app from scratch and overhauled the rider app to production standard.',
    layout: 'strip',
    kind: 'device',
    theme: { bg: '#ECE6F2', fg: '#1C1524', muted: '#62566F', accent: '#6D3FB0', panel: '#E0D7EA' },
    status: 'Live',
    statusNote: 'Food, groceries, pharmacy, logistics',
    role: 'Contract Flutter Mobile Engineer',
    context: 'Ofast · Remote contract',
    timeline: 'Sep 2025 — Present',
    platforms: 'iOS & Android',
    links: [],
    owned: [
      'Customer app built from scratch',
      'Rider app architecture, state management and UI overhauled',
      'Multi-vendor cart — order from multiple restaurants in a single checkout',
      'Real-time rider order notifications over WebSockets',
      'Paystack integration with success, failure and cancellation handled',
    ],
    stack: ['Flutter', 'BLoC', 'Paystack', 'WebSockets', 'Dio'],
    overview: [
      'Ofxpress is a delivery platform spanning food, groceries, pharmacy and logistics. Customers browse every category from one home screen and can order from several restaurants in one basket; riders receive orders in real time.',
    ],
    problem:
      'A multi-category, multi-vendor platform puts a lot on one screen and a lot into one checkout. The home screen has to stay fast while many vendor sections load, the cart has to handle more than one restaurant, and riders need to hear about orders the moment they arrive.',
    team:
      'I joined Ofast on contract. I built the customer app from scratch, and took over the existing rider app — overhauling its architecture, state management and UI.',
    challenges: [
      {
        title: 'A home screen that loads in pieces',
        body: 'The multi-category homepage resolves every section from a single endpoint, with each vendor section loading independently and lazily.',
      },
      {
        title: 'Multiple restaurants, one checkout',
        body: 'The multi-vendor cart lets customers order from multiple restaurants in a single checkout flow.',
      },
      {
        title: 'Riders in real time',
        body: 'Rider order notifications arrive over WebSockets.',
      },
      {
        title: 'Every payment state',
        body: 'Paystack is integrated with complete handling for success, failure and cancellation.',
      },
    ],
    architecture: [
      { k: 'State', v: 'BLoC' },
      { k: 'Networking', v: 'Dio, single-endpoint lazy section loading' },
      { k: 'Real-time', v: 'WebSockets for rider notifications' },
      { k: 'Payments', v: 'Paystack' },
    ],
    screens: [
      {
        title: 'Customer app',
        items: [
          S('ofxpress', 'customer-01-home', 'Ofxpress multi-category home', 'Multi-category home'),
          S('ofxpress', 'customer-02-restaurant', 'Ofxpress restaurant page', 'Restaurant'),
          S('ofxpress', 'customer-03-basket', 'Ofxpress multi-vendor basket', 'Multi-vendor basket'),
          S('ofxpress', 'customer-04-profile', 'Ofxpress profile', 'Profile'),
        ],
      },
      {
        title: 'Rider app',
        items: [S('ofxpress', 'rider-01-orders', 'Ofxpress rider orders', 'Live orders')],
      },
    ],
    outcome: ['Live.', 'Customer app built from scratch; rider app overhauled to production standard.'],
  },
];

// Smaller, shipped projects without full case studies
export const moreWork = [
  {
    slug: 'difamer',
    name: 'Difamer',
    category: 'Agri-tech marketplace',
    where: 'Jamforte Technologies',
    status: 'Live',
    summary:
      'Connects farmers with buyers. Farmers list produce, manage inventory, track orders and receive payments — all from one app.',
    points: [
      'Produce listing with stock management, product images and category tagging',
      'Wallet with earnings tracking, top-up and withdrawal via Flutterwave',
      'Multi-business switcher — manage multiple businesses from one account',
      'Order pipeline across new, in-transit, delivered and completed states',
      'How-to video onboarding for first-time farmers',
    ],
    stack: ['Flutter', 'BLoC', 'Flutterwave', 'Clean Architecture', 'GetIt'],
    screens: [
      S('difamer', '01-home', 'Difamer home with earnings and business switcher', 'Home'),
      S('difamer', '02-produce', 'Difamer produce listings', 'Produce'),
      S('difamer', '03-orders', 'Difamer orders', 'Orders'),
      S('difamer', '04-product', 'Difamer product detail', 'Product'),
    ],
  },
  {
    slug: 'nextkick',
    name: 'NextKick',
    category: 'Sports technology',
    where: 'Freelance',
    status: 'Delivered',
    summary:
      'Two linked apps — player and admin — built independently from scratch for a private client, covering tournament registration with payments and live match updates.',
    points: [
      'Player and admin apps built independently from scratch and delivered to a private client',
      'Tournament registration with Monnify payment processing end to end',
      'Real-time live match score updates over WebSockets',
    ],
    stack: ['Flutter', 'BLoC', 'Monnify', 'WebSockets'],
    screens: [S('nextkick', '01-signup', 'NextKick sign-up choosing Player or Team', 'Sign-up')],
  },
];

// ---------------------------------------------------------------------------
export const experience = [
  {
    role: 'Lead Mobile Developer',
    company: 'Midddleman Technologies',
    meta: 'Full-time',
    scope: 'Lead',
    start: '2026-09',
    end: null,
    dates: 'Sep 2026 — Present',
    projects: ['midddleman', 'midddleman-agent'],
    points: [
      'Lead mobile development of the Midddleman customer and agent apps on iOS and Android (customer app: 10k+ installs on Google Play), with responsibility for technical direction and delivery',
      'Own the procurement chat, survey system, and offline, session-security and caching layers in the agent app; connectivity, session-timeout, iOS push and badging in the customer app',
      'Own the end-to-end release pipeline across App Store Connect, TestFlight, Google Play Console and Shorebird OTA patching',
      'Work with the QA team to validate builds before release',
    ],
  },
  {
    role: 'Flutter Mobile Engineer',
    company: 'Jamforte Technologies',
    meta: 'Abuja, Nigeria · Full-time',
    scope: 'Full-time',
    start: '2025-07',
    end: '2026-07',
    dates: 'Jul 2025 — Jul 2026',
    projects: ['pawshauz'],
    points: [
      'Architected and shipped 3 production apps (Pawshauz customer, Pawshauz business and Difamer business) across iOS and Android',
      'Integrated AI chat with streaming responses, session persistence and mid-response exit handling',
      'Flutterwave payment flows covering subscription checkout, wallet top-up and in-app withdrawal',
    ],
  },
  {
    role: 'Contract Flutter Mobile Engineer',
    company: 'Ofast',
    meta: 'Remote · Contract',
    scope: 'Contract',
    start: '2025-09',
    end: null,
    dates: 'Sep 2025 — Present',
    projects: ['ofxpress'],
    points: [
      'Built the customer app from scratch; overhauled the rider app architecture, state management and UI',
      'Engineered a multi-category lazy-loading homepage, all sections resolved from a single endpoint',
      'Real-time rider order notifications via WebSockets; Paystack payment integration',
    ],
  },
  {
    role: 'Flutter Mobile Engineer',
    company: 'NextKick',
    meta: 'Remote · Freelance',
    scope: 'Freelance',
    start: '2025-08',
    end: '2025-11',
    dates: 'Aug — Nov 2025',
    projects: [],
    points: [
      'Delivered player and admin apps independently from scratch for a private client',
      'Tournament registration with Monnify payments and real-time live match updates via WebSockets',
    ],
  },
  {
    role: 'Flutter Engineer',
    company: 'HNG Internship',
    meta: 'Remote · Internship',
    scope: 'Internship',
    start: '2025-02',
    end: '2025-04',
    dates: 'Feb — Apr 2025',
    projects: [],
    points: [
      'Built desktop UI for Telex, a team collaboration app, as part of a 35-engineer cross-functional team',
      'Finished as one of 19 finalists from the full cohort',
    ],
  },
];

export const principles = [
  {
    title: 'Boundaries before features',
    body: 'Clean Architecture, BLoC and dependency injection aren’t ceremony. When Shmood’s audio-layer swap surfaced an AVAudioSession conflict, those boundaries kept the fix inside one layer.',
  },
  {
    title: 'Real networks are the main path',
    body: 'Offline handling, caching and session management decide whether an app is usable for people on unreliable connections. I treat them as core features, not edge cases.',
  },
  {
    title: 'Every state gets designed',
    body: 'Payments succeed, fail and get cancelled. Streams get interrupted. I build for all of it — Paystack, Flutterwave and Monnify flows with every outcome handled.',
  },
  {
    title: 'Shipping is part of the job',
    body: 'Signing, provisioning, TestFlight, Play Console and Shorebird OTA patches. An app isn’t finished until it’s in people’s hands — and can be fixed fast once it is.',
  },
];

export const expertise = [
  { group: 'Mobile', items: ['Flutter', 'Dart', 'Kotlin', 'Native Android'], note: 'Flutter is the primary stack across every product here, shipped to iOS and Android.' },
  { group: 'Architecture', items: ['BLoC', 'Riverpod', 'Clean Architecture', 'GetIt'], note: 'Layered apps with clear data, domain and presentation boundaries and injected dependencies.' },
  { group: 'Networking & data', items: ['Dio', 'REST APIs', 'WebSockets', 'Hive', 'Firebase'], note: 'Offline-first behaviour, caching (including TTL caching) and session management.' },
  { group: 'Payments & services', items: ['Paystack', 'Flutterwave', 'Monnify', 'OneSignal', 'Google Places SDK'], note: 'Integrated in production across Ofxpress, Pawshauz, Difamer and NextKick.' },
  { group: 'AI & real-time', items: ['OpenAI APIs', 'OpenAI Realtime', 'Anthropic API', 'WebRTC'], note: 'Streaming assistants, live voice and multi-stage AI pipelines.' },
  { group: 'Delivery', items: ['App Store Connect', 'TestFlight', 'Google Play Console', 'Shorebird OTA', 'CI/CD'], note: 'The full release pipeline, from code signing to over-the-air patches.' },
];
