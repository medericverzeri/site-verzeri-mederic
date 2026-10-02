import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import Admin from "./Admin";
import {
  PUBLIC_BIN_ID,
  buildVcard,
  fetchRemote,
  getSync,
  loadContent,
  mapsUrl,
  phoneHref,
  type SiteContent,
} from "./content";

const nav = [
  { id: "accueil", label: "Accueil" },
  { id: "apropos", label: "À propos de moi" },
  { id: "entreprises", label: "Nos entreprises" },
  { id: "galerie", label: "Galerie" },
  { id: "contact", label: "Contactez-nous" },
];

function isOpenNow(date = new Date()) {
  const paris = new Date(date.toLocaleString("en-US", { timeZone: "Europe/Paris" }));
  const day = paris.getDay();
  const minutes = paris.getHours() * 60 + paris.getMinutes();
  const morning = minutes >= 8 * 60 && minutes < 12 * 60 + 30;
  const afternoon = minutes >= 13 * 60 + 30 && minutes < 17 * 60 + 30;
  return (day === 1 || day === 4) && (morning || afternoon);
}

function LoopMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="16" fill="#1b4336" />
      <path d="M18 34a14 14 0 1 1 4.2 10.2" fill="none" stroke="#e6d5ba" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M18 28.5v6.2h6" fill="none" stroke="#e6d5ba" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="29" y="27" width="16" height="3.2" rx="1" fill="#f4efe6" />
      <rect x="29" y="33.2" width="12" height="3.2" rx="1" fill="#c4a574" />
    </svg>
  );
}

export default function App() {
  const [content, setContent] = useState<SiteContent>(() => loadContent());
  const [savedContent, setSavedContent] = useState<SiteContent>(content);
  const [admin, setAdmin] = useState(() => window.location.hash === "#admin");

  const { profile, about, steps, companies, gallery, faqs, marquee } = content;

  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState("accueil");
  const [group, setGroup] = useState("Toutes");
  const [broken, setBroken] = useState<string[]>([]);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [subject, setSubject] = useState(faqs[0]?.title ?? "");
  const [openFaq, setOpenFaq] = useState(0);
  const [copied, setCopied] = useState("");
  const [sent, setSent] = useState(false);
  const [legal, setLegal] = useState(false);
  const [form, setForm] = useState({ name: "", org: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const open = useMemo(() => isOpenNow(), []);

  const groups = useMemo(
    () => ["Toutes", ...Array.from(new Set(companies.map((c) => c.group).filter(Boolean)))],
    [companies],
  );
  const shots = useMemo(
    () => gallery.filter((shot) => shot.src && !broken.includes(shot.src)),
    [gallery, broken],
  );
  const filtered = companies.filter((company) => group === "Toutes" || company.group === group);
  const maps = mapsUrl(profile);
  const mobileHref = phoneHref(profile.mobile);
  const deskHref = phoneHref(profile.desk);

  useEffect(() => {
    if (!faqs.some((item) => item.title === subject)) setSubject(faqs[0]?.title ?? "");
  }, [faqs, subject]);

  useEffect(() => {
    if (!groups.includes(group)) setGroup("Toutes");
  }, [groups, group]);

  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === "#admin") setAdmin(true);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Au chargement : récupère la dernière version publiée en ligne (JSONBin),
  // pour que tous les visiteurs voient les modifications faites depuis l'admin.
  useEffect(() => {
    const binId = PUBLIC_BIN_ID || getSync().binId;
    if (!binId) return;
    let cancelled = false;
    fetchRemote(binId).then((remote) => {
      if (remote && !cancelled) {
        setContent(remote);
        setSavedContent(remote);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const els = nav.map((item) => document.getElementById(item.id)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-42% 0px -48% 0px", threshold: [0.15, 0.35, 0.6] },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menu || lightbox !== null || legal || admin ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menu, lightbox, legal, admin]);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightbox(null);
      if (event.key === "ArrowRight") setLightbox((i) => (i === null ? i : (i + 1) % shots.length));
      if (event.key === "ArrowLeft")
        setLightbox((i) => (i === null ? i : (i - 1 + shots.length) % shots.length));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, shots.length]);

  function go(id: string) {
    setMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function ask(title: string) {
    const index = faqs.findIndex((item) => item.title === title);
    setSubject(title);
    setOpenFaq(index);
    setSent(false);
    go("contact");
  }

  async function copy(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(""), 1600);
    } catch {
      setCopied("err");
    }
  }

  function downloadCard() {
    const blob = new Blob([buildVcard(profile)], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${profile.firstName.toLowerCase()}-${profile.lastName.toLowerCase()}.vcf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function closeAdmin() {
    setAdmin(false);
    if (window.location.hash === "#admin") {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "Indiquez votre nom.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "E-mail invalide.";
    if (form.message.trim().length < 12) next.message = "Précisez votre demande en quelques lignes.";
    setErrors(next);
    if (Object.keys(next).length) return;

    const body = [
      `Bonjour ${profile.firstName},`,
      ``,
      form.message.trim(),
      ``,
      `— ${form.name.trim()}`,
      form.org.trim() ? `Structure : ${form.org.trim()}` : "",
      `E-mail : ${form.email.trim()}`,
      form.phone.trim() ? `Téléphone : ${form.phone.trim()}` : "",
      `Sujet : ${subject}`,
    ]
      .filter(Boolean)
      .join("\n");

    const href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent(true);
    window.location.href = href;
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-4 focus:py-2"
      >
        Aller au contenu
      </a>

      <header className="fixed inset-x-0 top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between px-4 sm:px-6">
          <button onClick={() => go("accueil")} className="flex items-center gap-3 text-left">
            <LoopMark className="h-9 w-9" />
            <span className="leading-tight">
              <span className="block font-serif text-[1.05rem] tracking-tight">
                {profile.firstName} {profile.lastName}
              </span>
              <span className="block text-[0.68rem] uppercase tracking-[0.16em] text-inksoft">
                {profile.employer} · {profile.city.replace(/^\d+\s*/, "")}
              </span>
            </span>
          </button>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
            {nav.map((item) => (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className={`rounded-full px-3 py-2 text-sm transition ${
                  active === item.id ? "bg-forest text-paper" : "text-inksoft hover:text-ink"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a href={mobileHref} className="hidden rounded-full bg-forest px-4 py-2 text-sm text-paper sm:inline-flex">
              {profile.mobile}
            </a>
            <button
              className="grid h-10 w-10 place-items-center rounded-full border border-line lg:hidden"
              aria-label={menu ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menu}
              onClick={() => setMenu((value) => !value)}
            >
              <span className="flex w-4 flex-col gap-1.5">
                <span className={`h-px bg-ink transition ${menu ? "translate-y-[3.5px] rotate-45" : ""}`} />
                <span className={`h-px bg-ink transition ${menu ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      {menu && (
        <div className="fixed inset-0 z-30 bg-forest text-paper lg:hidden">
          <nav className="flex h-full flex-col justify-end gap-2 px-6 pb-16 pt-24" aria-label="Mobile">
            {nav.map((item, index) => (
              <button
                key={item.id}
                onClick={() => go(item.id)}
                className="border-b border-white/15 py-3 text-left font-serif text-4xl"
              >
                <span className="mr-3 font-sans text-sm tracking-[0.18em] text-brasssoft">0{index + 1}</span>
                {item.label}
              </button>
            ))}
            <a href={mobileHref} className="mt-6 text-lg">
              Appeler {profile.mobile}
            </a>
          </nav>
        </div>
      )}

      <main id="contenu">
        <section id="accueil" className="scroll-mt-20 overflow-hidden pt-24">
          <div className="mx-auto grid max-w-6xl items-end gap-10 px-4 pb-14 pt-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-20 lg:pt-14">
            <div className="reveal">
              <p className="mb-5 text-xs uppercase tracking-[0.22em] text-moss">
                Insertion · Économie circulaire · Oise
              </p>
              <p className="font-serif text-lg italic text-brass sm:text-xl">Encadrant technique</p>
              <h1 className="mt-1 font-serif text-[3.4rem] leading-[0.9] tracking-[-0.03em] sm:text-7xl lg:text-[5.6rem]">
                {profile.firstName}
                <span className="block italic text-forest">{profile.lastName}</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-inksoft sm:text-xl">{profile.intro}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button onClick={() => go("contact")} className="rounded-full bg-forest px-5 py-3 text-sm text-paper">
                  Écrire à {profile.firstName}
                </button>
                <button onClick={() => go("entreprises")} className="rounded-full border border-line bg-white/70 px-5 py-3 text-sm">
                  Nos entreprises
                </button>
                <button
                  onClick={() => go("apropos")}
                  className="rounded-full px-5 py-3 text-sm text-inksoft underline decoration-brasssoft underline-offset-4"
                >
                  À propos de moi
                </button>
              </div>
              <dl className="mt-10 grid max-w-xl grid-cols-2 gap-4 border-t border-line pt-6 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-inksoft">Lieu</dt>
                  <dd className="mt-1">{profile.city.replace(/^\d+\s*/, "")}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-inksoft">Accueil</dt>
                  <dd className="mt-1">Lundi & jeudi</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.16em] text-inksoft">Statut</dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${open ? "bg-moss" : "bg-brass"}`} />
                    {open ? "Ouvert" : "Fermé"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="relative reveal">
              <div className="relative overflow-hidden rounded-[1.7rem] bg-forest shadow-[0_30px_70px_rgba(20,34,28,0.16)]">
                <img
                  src="/images/hero-matiere.jpg"
                  alt="Illustration d’un atelier de matières de réemploi : bois, pierre et terre cuite"
                  className="h-[28rem] w-full object-cover sm:h-[34rem]"
                />
                <p className="absolute bottom-4 right-4 rounded-full bg-ink/70 px-3 py-1 text-[0.68rem] uppercase tracking-[0.16em] text-paper">
                  Illustration
                </p>
              </div>
              <div className="absolute -left-3 bottom-8 hidden max-w-[16rem] rounded-2xl border border-white/40 bg-paper/95 p-4 shadow-xl sm:block">
                <p className="text-xs uppercase tracking-[0.16em] text-moss">Le lieu de travail</p>
                <p className="mt-1 font-serif text-2xl leading-none">{profile.employer}</p>
                <p className="mt-2 text-sm text-inksoft">
                  {profile.address}, {profile.city}
                </p>
              </div>
              {profile.portrait && (
                <img
                  src={profile.portrait}
                  alt=""
                  className="absolute -right-2 -top-5 hidden h-24 w-24 rounded-full border-4 border-paper object-cover shadow-lg sm:block"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              )}
            </div>
          </div>

          <div className="border-y border-line bg-cream py-3 no-print">
            <div className="overflow-hidden">
              <div className="marquee-track">
                {[...marquee, ...marquee].map((word, index) => (
                  <span
                    key={`${word}-${index}`}
                    className="flex items-center gap-10 text-sm uppercase tracking-[0.22em] text-forest"
                  >
                    {word}
                    <span className="text-brass">↺</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="apropos" className="scroll-mt-24 mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-brass">01 — À propos de moi</p>
              <h2 className="mt-3 font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl">{about.title}</h2>
              <p className="mt-5 text-inksoft">{about.lead}</p>
              <img
                src="/images/detail-bois.jpg"
                alt="Détail de bois de réemploi et d’outils d’atelier"
                className="mt-8 hidden h-56 w-full rounded-3xl object-cover lg:block"
              />
            </div>
            <div className="space-y-5">
              {about.paragraphs.map((paragraph) => (
                <blockquote
                  key={paragraph.slice(0, 24)}
                  className="border-l-2 border-brass pl-5 font-serif text-2xl leading-snug text-forest sm:text-[1.7rem]"
                >
                  {paragraph}
                </blockquote>
              ))}
              <div className="pt-4">
                <h3 className="text-xs uppercase tracking-[0.2em] text-inksoft">Mes principales missions</h3>
                <ol className="mt-4 divide-y divide-line border-y border-line">
                  {about.missions.map((mission, index) => (
                    <li key={mission} className="grid grid-cols-[3rem_1fr] items-start gap-3 py-4">
                      <span className="font-serif text-xl text-brass">0{index + 1}</span>
                      <span className="pt-1 leading-relaxed">{mission}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          <div id="lieu" className="scroll-mt-28 mt-16 overflow-hidden rounded-[1.8rem] bg-forest text-paper">
            <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
              <div className="p-7 sm:p-10">
                <p className="text-xs uppercase tracking-[0.22em] text-brasssoft">02 — Le lieu</p>
                <h2 className="mt-3 font-serif text-4xl leading-none sm:text-5xl">{profile.employer}, déchèterie pro</h2>
                <p className="mt-4 max-w-xl text-brasssoft">
                  Une déchèterie professionnelle expérimentale pour les artisans et entreprises du BTP. Objectif :
                  simplifier le tri à la source, favoriser le réemploi et réduire l’enfouissement des déchets du
                  bâtiment.
                </p>
                <div className="mt-8 grid gap-4 sm:grid-cols-3">
                  {steps.map((step) => (
                    <article key={step.n + step.title} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
                      <p className="font-serif text-brasssoft">{step.n}</p>
                      <h3 className="mt-1 font-medium">{step.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/75">{step.text}</p>
                    </article>
                  ))}
                </div>
                <a href={profile.site} target="_blank" rel="noreferrer" className="mt-8 inline-flex rounded-full bg-paper px-5 py-3 text-sm text-forest">
                  Page {profile.employer}
                </a>
              </div>
              <div className="grain relative bg-[#14362c] p-7 sm:p-10">
                <p className="text-xs uppercase tracking-[0.2em] text-brasssoft">Dépose préservante</p>
                <ul className="mt-6 space-y-4 text-sm">
                  <li>
                    <span className="block text-brasssoft">Adresse</span>
                    <a href={maps} target="_blank" rel="noreferrer" className="text-lg">
                      {profile.address}
                      <br />
                      {profile.city}
                    </a>
                  </li>
                  <li>
                    <span className="block text-brasssoft">Horaires</span>
                    <span className="text-lg">{profile.hours}</span>
                  </li>
                  <li>
                    <span className="block text-brasssoft">Aujourd’hui</span>
                    <span className="text-lg">
                      {open ? "Ouvert — vous pouvez déposer." : "Fermé. Prochain créneau lundi ou jeudi."}
                    </span>
                  </li>
                  <li>
                    <span className="block text-brasssoft">Standard</span>
                    <a href={deskHref} className="text-lg">
                      {profile.desk}
                    </a>
                    <span className="text-white/70"> · demander {profile.firstName}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id="entreprises" className="scroll-mt-24 bg-cream py-20 lg:py-28">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <p className="text-xs uppercase tracking-[0.22em] text-brass">03 — Nos entreprises</p>
                <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
                  Le groupe, comme réponse au territoire
                </h2>
                <p className="mt-4 text-inksoft">
                  Les structures de la Maison d’Économie Solidaire, du siège social au réemploi des aides techniques,
                  des textiles et des matériaux.
                </p>
              </div>
              <a href={profile.group} target="_blank" rel="noreferrer" className="text-sm underline decoration-brass underline-offset-4">
                eco-solidaire.fr
              </a>
            </div>

            <div className="mt-8 flex gap-2 overflow-x-auto pb-2" role="tablist" aria-label="Filtrer les entreprises">
              {groups.map((item) => (
                <button
                  key={item}
                  role="tab"
                  aria-selected={group === item}
                  onClick={() => setGroup(item)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm ${
                    group === item ? "bg-ink text-paper" : "bg-white text-inksoft ring-1 ring-line"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((company) => (
                <article key={company.id} className="card-lift flex flex-col rounded-3xl border border-line bg-paper p-4">
                  <div className="grid h-36 place-items-center rounded-2xl bg-white">
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt=""
                        className="max-h-24 max-w-[78%] object-contain"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <span className="font-serif text-3xl text-brasssoft">{company.name.charAt(0)}</span>
                    )}
                  </div>
                  <p className="mt-4 text-xs uppercase tracking-[0.16em] text-moss">{company.category}</p>
                  <h3 className="mt-1 font-serif text-2xl leading-tight">{company.name}</h3>
                  <p className="text-sm text-brass">{company.place}</p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-inksoft">{company.text}</p>
                  <a href={company.href} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-medium">
                    Découvrir
                    <span aria-hidden="true">→</span>
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="galerie" className="scroll-mt-24 mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.22em] text-brass">04 — Galerie</p>
            <h2 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">Déchèterie pro, dépose préservante</h2>
            <p className="mt-4 text-inksoft">
              Le terrain, les gestes du tri et la seconde vie des matériaux. Cliquez pour agrandir.
            </p>
          </div>
          <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
            {shots.map((shot, index) => (
              <button
                key={shot.src}
                onClick={() => setLightbox(index)}
                className="photo-zoom group mb-4 block w-full overflow-hidden rounded-3xl bg-cream text-left"
              >
                <img
                  src={shot.src}
                  alt={shot.alt}
                  loading="lazy"
                  className={`w-full object-cover ${shot.wide ? "h-56" : "h-80"}`}
                  onError={() => setBroken((current) => [...current, shot.src])}
                />
                <span className="flex items-center justify-between px-4 py-3 text-sm">
                  {shot.caption}
                  <span className="text-inksoft transition group-hover:text-ink">Agrandir</span>
                </span>
              </button>
            ))}
          </div>
          {shots.length === 0 && (
            <p className="mt-6 text-inksoft">
              Aucune photographie pour le moment. Ajoutez-en depuis l’espace admin.
            </p>
          )}
        </section>

        <section id="contact" className="scroll-mt-24 bg-ink text-paper">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-28">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-brasssoft">05 — Contactez-nous</p>
              <h2 className="mt-3 font-serif text-4xl leading-[1.05] sm:text-6xl">
                À votre écoute, pour répondre à vos besoins.
              </h2>
              <p className="mt-5 max-w-md text-white/75">
                Vous avez une question concernant le {profile.employer} ? Choisissez le sujet, puis le moyen qui vous
                convient.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-2">
                {faqs.map((item) => (
                  <button
                    key={item.title}
                    onClick={() => ask(item.title)}
                    className={`rounded-2xl px-3 py-3 text-left text-sm ring-1 ring-white/10 ${
                      subject === item.title ? "bg-paper text-ink" : "bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>

              <div className="mt-8 space-y-3 rounded-3xl bg-white/6 p-5 ring-1 ring-white/10">
                <ContactLine
                  label="Téléphone"
                  value={profile.mobile}
                  href={mobileHref}
                  onCopy={() => copy(profile.mobile, "tel")}
                  copied={copied === "tel"}
                />
                <ContactLine
                  label="E-mail"
                  value={profile.email}
                  href={`mailto:${profile.email}`}
                  onCopy={() => copy(profile.email, "mail")}
                  copied={copied === "mail"}
                />
                <ContactLine label="Site" value={profile.site.replace(/^https?:\/\//, "")} href={profile.site} />
                <p className="pt-2 text-sm text-white/65">
                  Standard {profile.employer} :{" "}
                  <a href={deskHref} className="text-paper underline decoration-brasssoft underline-offset-4">
                    {profile.desk}
                  </a>{" "}
                  — choix 1, demander {profile.firstName}.
                </p>
                <button onClick={downloadCard} className="mt-2 rounded-full bg-brasssoft px-4 py-2 text-sm text-ink">
                  Enregistrer la carte de visite
                </button>
              </div>
            </div>

            <div className="rounded-[1.7rem] bg-paper p-5 text-ink sm:p-8">
              <div className="mb-6">
                {faqs.map((item, index) => (
                  <div key={item.title} className="border-b border-line">
                    <button
                      className="flex w-full items-center justify-between py-3 text-left text-sm font-medium"
                      aria-expanded={openFaq === index}
                      onClick={() => {
                        setOpenFaq(openFaq === index ? -1 : index);
                        setSubject(item.title);
                      }}
                    >
                      {item.title}
                      <span className="text-brass">{openFaq === index ? "–" : "+"}</span>
                    </button>
                    {openFaq === index && <p className="pb-4 text-sm leading-relaxed text-inksoft">{item.text}</p>}
                  </div>
                ))}
              </div>

              <form onSubmit={submit} className="space-y-3" noValidate>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Nom" error={errors.name}>
                    <input
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      className="field"
                      autoComplete="name"
                      required
                    />
                  </Field>
                  <Field label="Structure" error="">
                    <input
                      value={form.org}
                      onChange={(event) => setForm({ ...form, org: event.target.value })}
                      className="field"
                      autoComplete="organization"
                    />
                  </Field>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="E-mail" error={errors.email}>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) => setForm({ ...form, email: event.target.value })}
                      className="field"
                      autoComplete="email"
                      required
                    />
                  </Field>
                  <Field label="Téléphone" error="">
                    <input
                      value={form.phone}
                      onChange={(event) => setForm({ ...form, phone: event.target.value })}
                      className="field"
                      autoComplete="tel"
                    />
                  </Field>
                </div>
                <Field label="Sujet" error="">
                  <select
                    value={subject}
                    onChange={(event) => {
                      setSubject(event.target.value);
                      setOpenFaq(faqs.findIndex((item) => item.title === event.target.value));
                    }}
                    className="field"
                  >
                    {faqs.map((item) => (
                      <option key={item.title}>{item.title}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Message" error={errors.message}>
                  <textarea
                    value={form.message}
                    onChange={(event) => setForm({ ...form, message: event.target.value })}
                    className="field min-h-32 resize-y"
                    required
                  />
                </Field>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button type="submit" className="rounded-full bg-forest px-5 py-3 text-sm text-paper">
                    Envoyer un e-mail
                  </button>
                  <p className="text-xs text-inksoft">
                    Ouvre votre messagerie. Aucune donnée n’est enregistrée sur ce site.
                  </p>
                </div>
                {sent && (
                  <p className="rounded-2xl bg-cream px-4 py-3 text-sm" role="status">
                    Votre message est prêt. S’il ne s’est pas ouvert, écrivez directement à{" "}
                    <a className="underline" href={`mailto:${profile.email}`}>
                      {profile.email}
                    </a>
                    .
                  </p>
                )}
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-paper">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-serif text-2xl">
              {profile.firstName} {profile.lastName}
            </p>
            <p className="mt-1 max-w-md text-sm text-inksoft">
              {profile.role} · {profile.employer} · Maison d’Économie Solidaire
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <button onClick={() => setLegal(true)} className="underline decoration-line underline-offset-4">
              Mentions
            </button>
            <a href={profile.group} target="_blank" rel="noreferrer" className="underline decoration-line underline-offset-4">
              Groupe MES
            </a>
            <a href={maps} target="_blank" rel="noreferrer" className="underline decoration-line underline-offset-4">
              Itinéraire
            </a>
            <button onClick={() => go("accueil")} className="underline decoration-line underline-offset-4">
              Haut de page
            </button>
            <button
              onClick={() => setAdmin(true)}
              className="text-inksoft/70 underline decoration-line underline-offset-4"
            >
              Espace admin
            </button>
          </div>
        </div>
      </footer>

      {lightbox !== null && shots[lightbox] && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/92 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={shots[lightbox].caption}
          onClick={() => setLightbox(null)}
        >
          <button className="absolute right-4 top-4 rounded-full bg-white/10 px-4 py-2 text-sm text-paper" onClick={() => setLightbox(null)}>
            Fermer
          </button>
          <button
            className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 px-3 py-3 text-paper sm:block"
            onClick={(event) => {
              event.stopPropagation();
              setLightbox((index) => (index === null ? index : (index - 1 + shots.length) % shots.length));
            }}
            aria-label="Photo précédente"
          >
            ←
          </button>
          <figure className="max-h-[88vh] max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <img src={shots[lightbox].src} alt={shots[lightbox].alt} className="max-h-[78vh] w-full rounded-2xl object-contain" />
            <figcaption className="mt-3 flex items-center justify-between text-sm text-paper">
              <span>{shots[lightbox].caption}</span>
              <span>
                {lightbox + 1} / {shots.length}
              </span>
            </figcaption>
          </figure>
          <button
            className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/10 px-3 py-3 text-paper sm:block"
            onClick={(event) => {
              event.stopPropagation();
              setLightbox((index) => (index === null ? index : (index + 1) % shots.length));
            }}
            aria-label="Photo suivante"
          >
            →
          </button>
        </div>
      )}

      {legal && (
        <div
          className="fixed inset-0 z-50 grid place-items-end bg-ink/50 p-4 sm:place-items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mentions-title"
        >
          <div className="max-h-[85vh] w-full max-w-lg overflow-auto rounded-3xl bg-paper p-6 text-ink shadow-2xl">
            <h2 id="mentions-title" className="font-serif text-3xl">
              Mentions
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-inksoft">
              <p>
                Éditeur : {profile.firstName} {profile.lastName}, {profile.role.toLowerCase()}, {profile.employer} —
                Maison d’Économie Solidaire, {profile.address}, {profile.city}.
              </p>
              <p>
                Contact :{" "}
                <a className="underline" href={`mailto:${profile.email}`}>
                  {profile.email}
                </a>{" "}
                · {profile.mobile}.
              </p>
              <p>
                Les horaires, modalités de dépôt et informations pratiques sont reprises des informations publiques de
                {" "}{profile.employer} et de la Maison d’Économie Solidaire. Elles peuvent évoluer : la confirmation se
                fait à l’inscription ou par téléphone.
              </p>
              <p>
                Le formulaire n’enregistre rien. Il prépare un e-mail dans votre logiciel de messagerie. Pas de
                cookies, pas de mesure d’audience.
              </p>
              <p>Les logos des structures restent la propriété de la Maison d’Économie Solidaire et de ses entreprises.</p>
            </div>
            <button onClick={() => setLegal(false)} className="mt-6 rounded-full bg-forest px-4 py-2 text-sm text-paper">
              Fermer
            </button>
          </div>
        </div>
      )}

      {admin && (
        <Admin
          content={content}
          saved={savedContent}
          onChange={setContent}
          onSaved={setSavedContent}
          onClose={closeAdmin}
        />
      )}

      <style>{`
        .field {
          width: 100%;
          border-radius: 0.9rem;
          border: 1px solid #e5dccf;
          background: #fff;
          padding: 0.75rem 0.9rem;
          font: inherit;
          color: #14221c;
        }
        .field:focus {
          outline: 2px solid #7c5c34;
          outline-offset: 1px;
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      `}</style>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-inksoft">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-red-700">{error}</span> : null}
    </label>
  );
}

function ContactLine({
  label,
  value,
  href,
  onCopy,
  copied,
}: {
  label: string;
  value: string;
  href: string;
  onCopy?: () => void;
  copied?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-brasssoft">{label}</p>
        <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer" className="text-base">
          {value}
        </a>
      </div>
      {onCopy && (
        <button onClick={onCopy} className="rounded-full bg-white/10 px-3 py-1 text-xs">
          {copied ? "Copié" : "Copier"}
        </button>
      )}
    </div>
  );
}
