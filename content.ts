export type Company = {
  id: string;
  group: string;
  category: string;
  name: string;
  place: string;
  text: string;
  href: string;
  logo: string;
};

export type Shot = {
  src: string;
  alt: string;
  caption: string;
  wide?: boolean;
};

export type Faq = { title: string; text: string };
export type Step = { n: string; title: string; text: string };

export type SiteContent = {
  profile: {
    firstName: string;
    lastName: string;
    role: string;
    employer: string;
    intro: string;
    email: string;
    mobile: string;
    desk: string;
    address: string;
    city: string;
    site: string;
    group: string;
    hours: string;
    portrait: string;
  };
  about: {
    title: string;
    lead: string;
    paragraphs: string[];
    missions: string[];
  };
  steps: Step[];
  companies: Company[];
  gallery: Shot[];
  faqs: Faq[];
  marquee: string[];
};

const media = (file: string, width = 1400) =>
  `https://images.weserv.nl/?url=${encodeURIComponent(
    `recyclaide.my.canva.site/verzeri-mederic/_assets/media/${file}`,
  )}&w=${width}&q=80&output=jpg`;

export const defaultContent: SiteContent = {
  profile: {
    firstName: "Médéric",
    lastName: "Verzeri",
    role: "Encadrant technique d’insertion en économie circulaire",
    employer: "Déchèt'Lab",
    intro:
      "Encadrant technique d’insertion en économie circulaire chez Déchèt'Lab, la déchèterie professionnelle du Beauvaisis portée par la Maison d’Économie Solidaire.",
    email: "m.verzeri@eco-solidaire.fr",
    mobile: "06 10 50 87 83",
    desk: "03 75 15 04 76",
    address: "17 rue Joseph Cugnot",
    city: "60000 Beauvais",
    site: "https://eco-solidaire.fr/dechetlab",
    group: "https://eco-solidaire.fr",
    hours: "Lundi et jeudi · 8h00–12h30 et 13h30–17h30",
    portrait: media("62414ef3627b5635834d71bc45cf81ff.png", 700),
  },
  about: {
    title: "Encadrant technique au Déchèt'Lab",
    lead: "Management de proximité, transmission et organisation d’une déchèterie qui sert à la fois l’emploi et le réemploi.",
    paragraphs: [
      "Mon rôle est d’assurer l’encadrement et l’accompagnement des salariés en insertion dans leur parcours professionnel, tout en garantissant le bon fonctionnement de la déchèterie professionnelle.",
      "J’allie management de proximité, transmission des savoir-faire et organisation des activités afin de concilier performance opérationnelle, ainsi que la sécurité.",
    ],
    missions: [
      "Encadrer, former et accompagner les salariés en insertion dans le développement de leurs compétences.",
      "Organiser et coordonner les activités de la déchèterie professionnelle.",
      "Accueillir et accompagner les professionnels du bâtiment.",
      "Veiller au respect des consignes de sécurité, des procédures et de la qualité du tri.",
      "Sensibiliser les usagers aux enjeux du réemploi, du recyclage et de l’économie circulaire.",
    ],
  },
  steps: [
    {
      n: "01",
      title: "S’inscrire",
      text: "L’accès des professionnels se fait après inscription auprès de Déchèt'Lab.",
    },
    {
      n: "02",
      title: "Déclarer le dépôt",
      text: "Le passage est préparé dans Valodépôt, avant d’arriver sur site.",
    },
    {
      n: "03",
      title: "Déposer, trié",
      text: "Les apports se font les jours d’ouverture. L’équipe oriente, sécurise et qualifie le tri.",
    },
  ],
  companies: [
    {
      id: "mes",
      group: "Siège",
      category: "Le siège social",
      name: "La Maison d’Économie Solidaire",
      place: "Pays de Bray · Oise",
      text: "Société coopérative d’intérêt collectif. Elle rassemble les structures d’insertion et porte les projets d’économie solidaire du territoire.",
      href: "https://eco-solidaire.fr",
      logo: "https://framerusercontent.com/images/EEAte3AxaVpk85g8Dwe1oKzSiHc.png?width=1475&height=1271",
    },
    {
      id: "pbs",
      group: "Services",
      category: "Service d’aide à la personne",
      name: "Pays de Bray Services",
      place: "Oise & Seine-Maritime",
      text: "Mise à disposition de personnel qualifié pour accompagner les personnes en perte d’autonomie, à domicile.",
      href: "https://eco-solidaire.fr/groupe-mes/paysdebrayservice",
      logo: "https://framerusercontent.com/images/lDj1tB9ZFRxWkSQHRqrznuJP3h0.png?width=987&height=1231",
    },
    {
      id: "alicias",
      group: "Formation",
      category: "Formations et accompagnement",
      name: "Alicias",
      place: "Organisme de formation",
      text: "Formations qualifiantes, professionnalisantes et accompagnement socioprofessionnel des demandeurs d’emploi, des jeunes et des salariés.",
      href: "https://eco-solidaire.fr/groupe-mes/alicias",
      logo: "https://framerusercontent.com/images/TUGEAFZ9xQzI8bRfYITmxlMtlI.png?width=896&height=721",
    },
    {
      id: "recyclerie-60",
      group: "Réemploi",
      category: "Boutique et réemploi",
      name: "La Recyclerie",
      place: "Lachapelle-aux-Pots",
      text: "Collecte, valorisation et vente solidaire, au sein du tiers-lieu Solidarium, 4 rue de la Prairie.",
      href: "https://eco-solidaire.fr/groupe-mes/la-recyclerie-du-pays-de-bray",
      logo: "https://framerusercontent.com/images/kexghhWsfgkQcWeMOSTC7iOTVdw.png?width=1324&height=1017",
    },
    {
      id: "recyclerie-76",
      group: "Réemploi",
      category: "Boutique et réemploi",
      name: "La Recyclerie",
      place: "Gournay-en-Bray",
      text: "Essaimage de la recyclerie à l’ESSpace 150, pôle de services de proximité, 150 route de Paris.",
      href: "https://eco-solidaire.fr/groupe-mes/nos-lieux/esspace150",
      logo: "https://framerusercontent.com/images/jeX0S55hWWxXIv4Llwr8Pi6M.png?width=1757&height=1771",
    },
    {
      id: "lsdb",
      group: "Matériaux",
      category: "Constructeurs de solutions",
      name: "Les Sens du Bray",
      place: "Éco-construction",
      text: "Bureau d’études et maîtrise d’œuvre pour la construction neuve, la réhabilitation et la rénovation énergétique.",
      href: "https://eco-solidaire.fr/groupe-mes/sensdubray",
      logo: "https://framerusercontent.com/images/P3NeiGDlmS2kwRqOXRAnFH2Juf4.png?width=500&height=500",
    },
    {
      id: "materiosol",
      group: "Matériaux",
      category: "L’économie circulaire des matériaux",
      name: "Matériosol",
      place: "Beauvaisis",
      text: "Filière locale de réemploi des matériaux de construction, adossée à la déchèterie professionnelle Déchèt'Lab.",
      href: "https://eco-solidaire.fr/materiosol",
      logo: "https://framerusercontent.com/images/2ZwlDHGFHa0XdV0sEgV1p00EVA.png?width=889&height=866",
    },
    {
      id: "recyclaide",
      group: "Réemploi",
      category: "Le réemploi des aides techniques",
      name: "Recycl'Aide Oise",
      place: "Aides techniques médicales",
      text: "Collecte, remise en état d’usage et vente à prix solidaire de fauteuils, déambulateurs et équipements de seconde main.",
      href: "https://recyclaide.fr",
      logo: "https://framerusercontent.com/images/3e34q9jiYcE1QYEWP20kE3i01Y0.png?width=800&height=800",
    },
    {
      id: "solitex",
      group: "Réemploi",
      category: "Le réemploi du textile",
      name: "Solitex'Oise",
      place: "Textiles, linge, chaussures",
      text: "Plateforme de collecte, tri et revalorisation textile dans l’Oise, en convention avec l’éco-organisme Refashion.",
      href: "https://eco-solidaire.fr/ptce-poledecoop",
      logo: "https://framerusercontent.com/images/ZBZxwwLJ1xBLjfbpvWUEl6Q4Ic.jpg?width=1755&height=1405",
    },
  ],
  gallery: [
    {
      src: media("468e7b70d1a701296d5da3cfad9d1f00.jpg", 1600),
      alt: "Visuel de la galerie Déchèt'Lab",
      caption: "Déchèt'Lab — déchèterie professionnelle",
      wide: true,
    },
    {
      src: media("eff694173c78095d7258e3073f104868.jpg", 1000),
      alt: "Visuel de la galerie",
      caption: "Dépose préservante",
    },
    {
      src: media("49f9c185918cef650e0900106db6ccb0.jpg", 1000),
      alt: "Visuel de la galerie",
      caption: "Galerie",
    },
    {
      src: media("77c639b4c0a15f94967ab36c5ffff862.jpg", 1600),
      alt: "Visuel large de la présentation",
      caption: "Économie circulaire des matériaux",
      wide: true,
    },
    {
      src: media("af664998db300d52df57c30dd68c7e33.jpg", 1000),
      alt: "Visuel de la galerie",
      caption: "Galerie",
    },
    {
      src: media("f4891a6416110c10180e2dc5e18d6a0a.jpg", 1000),
      alt: "Visuel de la galerie",
      caption: "Galerie",
    },
    {
      src: media("4e0fa9198377abef16c2ce50fa7f277b.png", 1400),
      alt: "Visuel de la galerie Déchèt'Lab",
      caption: "Déchèt'Lab",
    },
    {
      src: media("59af670f85cbe3bb1fb1b3acf4c34e45.png", 1400),
      alt: "Visuel de la galerie Déchèt'Lab",
      caption: "Dépose préservante",
    },
    {
      src: media("f184726d58311ea89655434d0a402c96.png", 1400),
      alt: "Visuel de la galerie Déchèt'Lab",
      caption: "Galerie",
      wide: true,
    },
  ],
  faqs: [
    {
      title: "Déchets acceptés",
      text: "Déchèt'Lab est pensé pour les artisans et entreprises du BTP. On y dépose des déchets et matériaux de chantier destinés au tri et au réemploi : bois, plâtre, isolants, carrelage, menuiseries, entre autres. Le tout-venant (DIB) n’entre pas dans la gratuité. La liste à jour est confirmée à l’inscription.",
    },
    {
      title: "Inscription & compte",
      text: "L’accès des professionnels se fait après inscription. Le dépôt est ensuite déclaré dans Valodépôt avant le passage. La démarche complète est sur la page Déchèt'Lab de la Maison d’Économie Solidaire.",
    },
    {
      title: "Modalités de dépôt",
      text: "Les apports se font les jours d’ouverture, de préférence déjà triés. L’équipe accueille, oriente le déchargement et veille à la sécurité comme à la qualité du tri.",
    },
    {
      title: "Horaires & fonctionnement",
      text: "Lundi et jeudi, de 8h00 à 12h30 et de 13h30 à 17h30. Adresse : 17 rue Joseph Cugnot, 60000 Beauvais. En dehors de ces créneaux, un message ou un e-mail suffit pour préparer la venue.",
    },
    {
      title: "Tarifs",
      text: "Le dépôt est gratuit pour les professionnels du BTP, hors déchets industriels banals (tout-venant). Les conditions tarifaires précises sont confirmées au moment de l’inscription.",
    },
    {
      title: "Réemploi",
      text: "Les matériaux encore utilisables sont triés, nettoyés et préparés par Matériosol, puis proposés à prix solidaires. Déchèt'Lab et Matériosol forment une boucle locale : de la dépose à la seconde vie.",
    },
    {
      title: "Autre question",
      text: "Professionnels, partenaires, prescripteurs ou personnes en parcours : écrivez ou appelez. Médéric répond aux questions d’accès, de tri, de réemploi et d’insertion.",
    },
  ],
  marquee: [
    "Réemploi",
    "Insertion",
    "Tri à la source",
    "Sécurité",
    "Transmission",
    "Économie circulaire",
    "Beauvaisis",
    "Matériaux",
    "Seconde vie",
  ],
};

const CONTENT_KEY = "mv-site-content-v1";
const PIN_KEY = "mv-admin-pin";
const SYNC_KEY = "mv-sync-config-v1";
export const DEFAULT_PIN = "dechetlab60";

/**
 * Identifiant public du "classeur" JSONBin servi à tous les visiteurs.
 * Une fois que Médéric a créé son bin (voir guide), on colle l'ID ici
 * pour que chaque visiteur charge automatiquement la dernière version.
 */
export const PUBLIC_BIN_ID = "";

export type SyncConfig = { binId: string; apiKey: string };

export function getSync(): SyncConfig {
  try {
    const raw = localStorage.getItem(SYNC_KEY);
    if (!raw) return { binId: "", apiKey: "" };
    const parsed = JSON.parse(raw) as Partial<SyncConfig>;
    return { binId: parsed.binId ?? "", apiKey: parsed.apiKey ?? "" };
  } catch {
    return { binId: "", apiKey: "" };
  }
}

export function setSyncConfig(config: SyncConfig) {
  localStorage.setItem(SYNC_KEY, JSON.stringify(config));
}

function normalize(parsed: Partial<SiteContent>): SiteContent {
  return {
    profile: { ...defaultContent.profile, ...(parsed.profile ?? {}) },
    about: { ...defaultContent.about, ...(parsed.about ?? {}) },
    steps: parsed.steps ?? defaultContent.steps,
    companies: parsed.companies ?? defaultContent.companies,
    gallery: parsed.gallery ?? defaultContent.gallery,
    faqs: parsed.faqs ?? defaultContent.faqs,
    marquee: parsed.marquee ?? defaultContent.marquee,
  };
}

/** Lecture publique (bins publics JSONBin, pas de clé nécessaire). */
export async function fetchRemote(binId: string): Promise<SiteContent | null> {
  if (!binId) return null;
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${binId.trim()}/latest?meta=false`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Partial<SiteContent>;
    if (!data || typeof data !== "object" || !data.profile) return null;
    return normalize(data);
  } catch {
    return null;
  }
}

/** Écriture : nécessite la clé privée (X-Master-Key) de votre compte JSONBin. */
export async function pushRemote(
  config: SyncConfig,
  content: SiteContent,
): Promise<{ ok: boolean; message: string }> {
  if (!config.binId || !config.apiKey) {
    return { ok: false, message: "Renseignez l’ID du bin et la clé d’accès." };
  }
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${config.binId.trim()}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": config.apiKey.trim(),
      },
      body: JSON.stringify(content),
    });
    if (res.ok) return { ok: true, message: "Publié en ligne ✓ Visible par tous les visiteurs." };
    if (res.status === 401) return { ok: false, message: "Clé d’accès refusée. Vérifiez la X-Master-Key." };
    if (res.status === 404) return { ok: false, message: "Bin introuvable. Vérifiez l’ID." };
    return { ok: false, message: `Erreur ${res.status} lors de la publication.` };
  } catch {
    return { ok: false, message: "Connexion impossible. Vérifiez votre réseau." };
  }
}

export function loadContent(): SiteContent {
  try {
    const raw = localStorage.getItem(CONTENT_KEY);
    if (!raw) return defaultContent;
    return normalize(JSON.parse(raw) as Partial<SiteContent>);
  } catch {
    return defaultContent;
  }
}

export function saveContent(content: SiteContent) {
  localStorage.setItem(CONTENT_KEY, JSON.stringify(content));
}

export function resetContent() {
  localStorage.removeItem(CONTENT_KEY);
}

export function getPin(): string {
  return localStorage.getItem(PIN_KEY) || DEFAULT_PIN;
}

export function setPin(pin: string) {
  localStorage.setItem(PIN_KEY, pin);
}

export function phoneHref(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("0") && digits.length === 10) return `tel:+33${digits.slice(1)}`;
  return `tel:${digits || value}`;
}

export function buildVcard(profile: SiteContent["profile"]): string {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${profile.lastName};${profile.firstName};;;`,
    `FN:${profile.firstName} ${profile.lastName}`,
    `TITLE:${profile.role}`,
    `ORG:${profile.employer} — Maison d'Économie Solidaire`,
    `TEL;TYPE=CELL:${phoneHref(profile.mobile).replace("tel:", "")}`,
    `TEL;TYPE=WORK:${phoneHref(profile.desk).replace("tel:", "")}`,
    `EMAIL:${profile.email}`,
    `URL:${profile.site}`,
    `ADR;TYPE=WORK:;;${profile.address};${profile.city.replace(/^\d+\s*/, "")};;${
      profile.city.match(/^\d+/)?.[0] ?? ""
    };France`,
    "END:VCARD",
  ].join("\n");
}

export function mapsUrl(profile: SiteContent["profile"]): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${profile.address} ${profile.city}`,
  )}`;
}
