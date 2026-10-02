import { useRef, useState, type ReactNode } from "react";
import {
  DEFAULT_PIN,
  defaultContent,
  fetchRemote,
  getPin,
  getSync,
  pushRemote,
  resetContent,
  saveContent,
  setPin,
  setSyncConfig,
  type Company,
  type Faq,
  type Shot,
  type SiteContent,
  type Step,
} from "./content";

type Props = {
  content: SiteContent;
  saved: SiteContent;
  onChange: (next: SiteContent) => void;
  onSaved: (next: SiteContent) => void;
  onClose: () => void;
};

const tabs = [
  { id: "identite", label: "Identité & contact" },
  { id: "apropos", label: "À propos & missions" },
  { id: "entreprises", label: "Entreprises" },
  { id: "galerie", label: "Galerie" },
  { id: "questions", label: "Questions & contact" },
  { id: "reglages", label: "Réglages" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function Admin({ content, saved, onChange, onSaved, onClose }: Props) {
  const [authed, setAuthed] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [tab, setTab] = useState<TabId>("identite");
  const [status, setStatus] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const dirty = JSON.stringify(content) !== JSON.stringify(saved);

  function flash(message: string) {
    setStatus(message);
    window.setTimeout(() => setStatus(""), 2400);
  }

  function login(event: React.FormEvent) {
    event.preventDefault();
    if (pinInput.trim() === getPin()) {
      setAuthed(true);
      setPinError("");
    } else {
      setPinError("Code incorrect.");
    }
  }

  async function publish() {
    saveContent(content);
    onSaved(content);
    const sync = getSync();
    if (sync.binId && sync.apiKey) {
      flash("Enregistré. Publication en ligne…");
      const result = await pushRemote(sync, content);
      flash(result.message);
    } else {
      flash("Enregistré sur cet appareil. Activez la publication en ligne dans Réglages.");
    }
  }

  function cancel() {
    onChange(saved);
    flash("Modifications annulées.");
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(content, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `site-mederic-verzeri-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    flash("Sauvegarde téléchargée.");
  }

  function importJson(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as SiteContent;
        if (!parsed.profile || !parsed.about) throw new Error("format");
        onChange(parsed);
        flash("Fichier importé. Pensez à enregistrer.");
      } catch {
        flash("Fichier illisible : export JSON attendu.");
      }
    };
    reader.readAsText(file);
  }

  if (!authed) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4" role="dialog" aria-modal="true">
        <form onSubmit={login} className="w-full max-w-sm rounded-3xl bg-paper p-7 shadow-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-brass">Espace admin</p>
          <h2 className="mt-2 font-serif text-3xl">Bonjour Médéric</h2>
          <p className="mt-2 text-sm text-inksoft">
            Entrez votre code d’accès pour modifier le site.
          </p>
          <input
            type="password"
            value={pinInput}
            onChange={(event) => setPinInput(event.target.value)}
            className="mt-4 w-full rounded-xl border border-line bg-white px-4 py-3"
            placeholder="Code d’accès"
            autoFocus
          />
          {pinError && <p className="mt-2 text-sm text-red-700">{pinError}</p>}
          <p className="mt-2 text-xs text-inksoft">
            Code par défaut : <code className="rounded bg-cream px-1">{DEFAULT_PIN}</code> — à
            changer dans Réglages.
          </p>
          <div className="mt-5 flex gap-3">
            <button type="submit" className="rounded-full bg-forest px-5 py-2.5 text-sm text-paper">
              Entrer
            </button>
            <button type="button" onClick={onClose} className="rounded-full border border-line px-5 py-2.5 text-sm">
              Annuler
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-paper" role="dialog" aria-modal="true" aria-label="Espace d'administration">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-forest px-4 py-3 text-paper sm:px-6">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.2em] text-brasssoft">Espace admin</p>
          <p className="font-serif text-xl leading-none">Modifier le site</p>
        </div>
        <div className="flex items-center gap-2">
          {status && <span className="rounded-full bg-white/15 px-3 py-1.5 text-xs">{status}</span>}
          {dirty && (
            <button onClick={cancel} className="rounded-full border border-white/30 px-4 py-2 text-sm">
              Annuler
            </button>
          )}
          <button
            onClick={publish}
            disabled={!dirty}
            className={`rounded-full px-4 py-2 text-sm ${
              dirty ? "bg-brasssoft text-ink" : "bg-white/15 text-white/60"
            }`}
          >
            {dirty ? "Enregistrer" : "Enregistré"}
          </button>
          <button onClick={onClose} className="rounded-full bg-white/15 px-4 py-2 text-sm">
            Voir le site
          </button>
        </div>
      </header>

      {dirty && (
        <p className="border-b border-brasssoft bg-cream px-4 py-2 text-xs text-ink sm:px-6">
          Aperçu en direct : le site derrière reflète déjà vos changements. Cliquez sur
          « Enregistrer » pour les conserver.
        </p>
      )}

      <div className="flex min-h-0 flex-1">
        <nav className="hidden w-56 shrink-0 border-r border-line p-4 sm:block" aria-label="Sections admin">
          {tabs.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`mb-1 block w-full rounded-xl px-3 py-2.5 text-left text-sm ${
                tab === item.id ? "bg-forest text-paper" : "text-inksoft hover:bg-cream"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1 overflow-y-auto">
          <div className="border-b border-line p-3 sm:hidden">
            <select
              value={tab}
              onChange={(event) => setTab(event.target.value as TabId)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm"
            >
              {tabs.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mx-auto max-w-3xl space-y-8 p-4 pb-24 sm:p-8">
            {tab === "identite" && (
              <IdentityTab content={content} onChange={onChange} />
            )}
            {tab === "apropos" && <AboutTab content={content} onChange={onChange} />}
            {tab === "entreprises" && <CompaniesTab content={content} onChange={onChange} />}
            {tab === "galerie" && <GalleryTab content={content} onChange={onChange} />}
            {tab === "questions" && <FaqTab content={content} onChange={onChange} />}
            {tab === "reglages" && (
              <SettingsTab
                content={content}
                onChange={onChange}
                onExport={exportJson}
                onImportClick={() => fileRef.current?.click()}
                onReset={() => {
                  if (window.confirm("Revenir au contenu d’origine ? Vos modifications locales seront perdues.")) {
                    resetContent();
                    onChange(defaultContent);
                    onSaved(defaultContent);
                    flash("Contenu d’origine restauré.");
                  }
                }}
                onPin={(pin) => {
                  setPin(pin);
                  flash("Code d’accès mis à jour.");
                }}
              />
            )}
          </div>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) importJson(file);
          event.target.value = "";
        }}
      />
    </div>
  );
}

/* ---------- onglets ---------- */

function IdentityTab({ content, onChange }: { content: SiteContent; onChange: (c: SiteContent) => void }) {
  const p = content.profile;
  const set = (patch: Partial<SiteContent["profile"]>) =>
    onChange({ ...content, profile: { ...p, ...patch } });
  return (
    <>
      <Section title="Identité" hint="Affiché dans l’en-tête, le grand titre et le pied de page.">
        <Row>
          <Field label="Prénom">
            <input className="input" value={p.firstName} onChange={(e) => set({ firstName: e.target.value })} />
          </Field>
          <Field label="Nom">
            <input className="input" value={p.lastName} onChange={(e) => set({ lastName: e.target.value })} />
          </Field>
        </Row>
        <Field label="Fonction">
          <input className="input" value={p.role} onChange={(e) => set({ role: e.target.value })} />
        </Field>
        <Row>
          <Field label="Structure (employeur)">
            <input className="input" value={p.employer} onChange={(e) => set({ employer: e.target.value })} />
          </Field>
          <Field label="Photo (URL, optionnel)">
            <input className="input" value={p.portrait} onChange={(e) => set({ portrait: e.target.value })} />
          </Field>
        </Row>
        <Field label="Phrase d’introduction (page d’accueil)">
          <textarea className="input min-h-24" value={p.intro} onChange={(e) => set({ intro: e.target.value })} />
        </Field>
      </Section>

      <Section title="Coordonnées" hint="Utilisées dans la section contact, la carte de visite et les mentions.">
        <Row>
          <Field label="Téléphone portable">
            <input className="input" value={p.mobile} onChange={(e) => set({ mobile: e.target.value })} />
          </Field>
          <Field label="Standard">
            <input className="input" value={p.desk} onChange={(e) => set({ desk: e.target.value })} />
          </Field>
        </Row>
        <Field label="E-mail">
          <input className="input" type="email" value={p.email} onChange={(e) => set({ email: e.target.value })} />
        </Field>
        <Row>
          <Field label="Adresse">
            <input className="input" value={p.address} onChange={(e) => set({ address: e.target.value })} />
          </Field>
          <Field label="Code postal et ville">
            <input className="input" value={p.city} onChange={(e) => set({ city: e.target.value })} />
          </Field>
        </Row>
        <Field label="Horaires (texte libre)">
          <input className="input" value={p.hours} onChange={(e) => set({ hours: e.target.value })} />
        </Field>
        <Row>
          <Field label="Lien « page Déchèt'Lab »">
            <input className="input" value={p.site} onChange={(e) => set({ site: e.target.value })} />
          </Field>
          <Field label="Lien « groupe MES »">
            <input className="input" value={p.group} onChange={(e) => set({ group: e.target.value })} />
          </Field>
        </Row>
      </Section>

      <Section title="Mots du bandeau défilant" hint="Un mot par ligne.">
        <textarea
          className="input min-h-28"
          value={content.marquee.join("\n")}
          onChange={(e) =>
            onChange({ ...content, marquee: e.target.value.split("\n").map((w) => w.trim()).filter(Boolean) })
          }
        />
      </Section>
    </>
  );
}

function AboutTab({ content, onChange }: { content: SiteContent; onChange: (c: SiteContent) => void }) {
  const a = content.about;
  const set = (patch: Partial<SiteContent["about"]>) => onChange({ ...content, about: { ...a, ...patch } });
  return (
    <>
      <Section title="À propos de moi">
        <Field label="Titre de la section">
          <input className="input" value={a.title} onChange={(e) => set({ title: e.target.value })} />
        </Field>
        <Field label="Phrase d’accroche">
          <textarea className="input min-h-20" value={a.lead} onChange={(e) => set({ lead: e.target.value })} />
        </Field>
        <ListEditor
          label="Paragraphes (citations)"
          items={a.paragraphs}
          onChange={(paragraphs) => set({ paragraphs })}
          render={(value, update) => <textarea className="input min-h-24" value={value} onChange={(e) => update(e.target.value)} />}
          blank=""
          addLabel="Ajouter un paragraphe"
        />
        <ListEditor
          label="Mes principales missions"
          items={a.missions}
          onChange={(missions) => set({ missions })}
          render={(value, update) => <textarea className="input min-h-20" value={value} onChange={(e) => update(e.target.value)} />}
          blank=""
          addLabel="Ajouter une mission"
        />
      </Section>

      <Section title="Les 3 étapes Déchèt'Lab" hint="Encart vert « Déchèt'Lab, déchèterie pro ».">
        <ListEditor<Step>
          label=""
          items={content.steps}
          onChange={(steps) => onChange({ ...content, steps })}
          render={(step, update) => (
            <div className="space-y-2">
              <Row>
                <Field label="Numéro">
                  <input className="input" value={step.n} onChange={(e) => update({ ...step, n: e.target.value })} />
                </Field>
                <Field label="Titre">
                  <input className="input" value={step.title} onChange={(e) => update({ ...step, title: e.target.value })} />
                </Field>
              </Row>
              <textarea className="input min-h-16" value={step.text} onChange={(e) => update({ ...step, text: e.target.value })} />
            </div>
          )}
          blank={{ n: "04", title: "", text: "" }}
          addLabel="Ajouter une étape"
        />
      </Section>
    </>
  );
}

function CompaniesTab({ content, onChange }: { content: SiteContent; onChange: (c: SiteContent) => void }) {
  return (
    <Section
      title="Nos entreprises"
      hint="Le filtre en haut de la section se construit automatiquement à partir du champ « Famille »."
    >
      <ListEditor<Company>
        label=""
        items={content.companies}
        onChange={(companies) => onChange({ ...content, companies })}
        render={(company, update) => (
          <div className="space-y-2">
            <Row>
              <Field label="Nom">
                <input className="input" value={company.name} onChange={(e) => update({ ...company, name: e.target.value })} />
              </Field>
              <Field label="Famille (filtre)">
                <input className="input" value={company.group} onChange={(e) => update({ ...company, group: e.target.value })} />
              </Field>
            </Row>
            <Row>
              <Field label="Catégorie (petite ligne verte)">
                <input className="input" value={company.category} onChange={(e) => update({ ...company, category: e.target.value })} />
              </Field>
              <Field label="Lieu / précision">
                <input className="input" value={company.place} onChange={(e) => update({ ...company, place: e.target.value })} />
              </Field>
            </Row>
            <Field label="Description">
              <textarea className="input min-h-20" value={company.text} onChange={(e) => update({ ...company, text: e.target.value })} />
            </Field>
            <Row>
              <Field label="Lien « Découvrir »">
                <input className="input" value={company.href} onChange={(e) => update({ ...company, href: e.target.value })} />
              </Field>
              <Field label="Logo (URL d’image)">
                <input className="input" value={company.logo} onChange={(e) => update({ ...company, logo: e.target.value })} />
              </Field>
            </Row>
          </div>
        )}
        blank={{
          id: `new-${Date.now()}`,
          group: "Réemploi",
          category: "",
          name: "Nouvelle structure",
          place: "",
          text: "",
          href: "https://",
          logo: "",
        }}
        addLabel="Ajouter une entreprise"
        titleOf={(company) => company.name}
      />
    </Section>
  );
}

function GalleryTab({ content, onChange }: { content: SiteContent; onChange: (c: SiteContent) => void }) {
  return (
    <Section
      title="Galerie"
      hint="Collez l’adresse d’une image en ligne (clic droit sur une photo → « Copier l’adresse de l’image »). Les formats paysage s’affichent mieux en « large »."
    >
      <ListEditor<Shot>
        label=""
        items={content.gallery}
        onChange={(gallery) => onChange({ ...content, gallery })}
        render={(shot, update) => (
          <div className="space-y-2">
            {shot.src && (
              <img src={shot.src} alt="" className="h-28 w-full rounded-xl object-cover" loading="lazy" />
            )}
            <Field label="Adresse de l’image (URL)">
              <input className="input" value={shot.src} onChange={(e) => update({ ...shot, src: e.target.value })} />
            </Field>
            <Row>
              <Field label="Légende">
                <input className="input" value={shot.caption} onChange={(e) => update({ ...shot, caption: e.target.value })} />
              </Field>
              <Field label="Format">
                <select
                  className="input"
                  value={shot.wide ? "large" : "portrait"}
                  onChange={(e) => update({ ...shot, wide: e.target.value === "large" })}
                >
                  <option value="portrait">Portrait</option>
                  <option value="large">Large</option>
                </select>
              </Field>
            </Row>
          </div>
        )}
        blank={{ src: "", alt: "Visuel de la galerie", caption: "Nouvelle photo", wide: false }}
        addLabel="Ajouter une photo"
        titleOf={(shot) => shot.caption || "Photo"}
      />
    </Section>
  );
}

function FaqTab({ content, onChange }: { content: SiteContent; onChange: (c: SiteContent) => void }) {
  return (
    <Section
      title="Questions de la section contact"
      hint="Ces sujets alimentent les boutons, le menu déroulant du formulaire et les réponses dépliables."
    >
      <ListEditor<Faq>
        label=""
        items={content.faqs}
        onChange={(faqs) => onChange({ ...content, faqs })}
        render={(faq, update) => (
          <div className="space-y-2">
            <Field label="Sujet">
              <input className="input" value={faq.title} onChange={(e) => update({ ...faq, title: e.target.value })} />
            </Field>
            <Field label="Réponse">
              <textarea className="input min-h-24" value={faq.text} onChange={(e) => update({ ...faq, text: e.target.value })} />
            </Field>
          </div>
        )}
        blank={{ title: "Nouveau sujet", text: "" }}
        addLabel="Ajouter un sujet"
        titleOf={(faq) => faq.title}
      />
    </Section>
  );
}

function SettingsTab({
  content,
  onChange,
  onExport,
  onImportClick,
  onReset,
  onPin,
}: {
  content: SiteContent;
  onChange: (next: SiteContent) => void;
  onExport: () => void;
  onImportClick: () => void;
  onReset: () => void;
  onPin: (pin: string) => void;
}) {
  const [pin1, setPin1] = useState("");
  const [pin2, setPin2] = useState("");
  const [pinMsg, setPinMsg] = useState("");
  const [sync, setSync] = useState(getSync());
  const [syncMsg, setSyncMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function testAndPublish() {
    setBusy(true);
    setSyncMsg("Publication en cours…");
    setSyncConfig(sync);
    const result = await pushRemote(sync, content);
    setSyncMsg(result.message);
    setBusy(false);
  }

  async function pull() {
    setBusy(true);
    setSyncMsg("Récupération en cours…");
    setSyncConfig(sync);
    const remote = await fetchRemote(sync.binId);
    if (remote) {
      onChange(remote);
      setSyncMsg("Version en ligne récupérée. Pensez à enregistrer.");
    } else {
      setSyncMsg("Impossible de lire ce bin. Vérifiez l’ID (et que le bin est public).");
    }
    setBusy(false);
  }

  return (
    <>
      <Section
        title="Publication en ligne (tous vos appareils, tous les visiteurs)"
        hint="Gratuit, via jsonbin.io. Une fois configuré, chaque « Enregistrer » publie automatiquement la nouvelle version pour tout le monde."
      >
        <ol className="list-decimal space-y-1 pl-5 text-sm text-inksoft">
          <li>
            Créez un compte gratuit sur <strong>jsonbin.io</strong> (e-mail + mot de passe).
          </li>
          <li>
            Cliquez « Create Bin », collez le contenu de votre sauvegarde JSON (bouton d’export
            ci-dessous), puis enregistrez le bin en visibilité <strong>Public</strong>.
          </li>
          <li>
            Copiez l’<strong>ID du bin</strong> (dans l’adresse, après /b/) et votre clé{" "}
            <strong>X-Master-Key</strong> (menu API Keys).
          </li>
          <li>Collez les deux ci-dessous, puis « Tester & publier ».</li>
        </ol>
        <Row>
          <Field label="ID du bin (ex. 68dd2a1bae596e708f0a1234)">
            <input
              className="input"
              value={sync.binId}
              onChange={(e) => setSync({ ...sync, binId: e.target.value })}
            />
          </Field>
          <Field label="Clé d’accès X-Master-Key">
            <input
              className="input"
              type="password"
              value={sync.apiKey}
              onChange={(e) => setSync({ ...sync, apiKey: e.target.value })}
            />
          </Field>
        </Row>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={testAndPublish}
            disabled={busy}
            className="rounded-full bg-forest px-4 py-2.5 text-sm text-paper disabled:opacity-50"
          >
            Tester & publier maintenant
          </button>
          <button
            onClick={pull}
            disabled={busy}
            className="rounded-full border border-line px-4 py-2.5 text-sm disabled:opacity-50"
          >
            Récupérer la version en ligne
          </button>
        </div>
        {syncMsg && <p className="text-sm text-inksoft">{syncMsg}</p>}
        <p className="text-xs text-inksoft">
          Sur un nouvel ordinateur : ouvrez l’espace admin, collez les mêmes ID + clé ici, puis
          « Récupérer la version en ligne ». Vous retrouvez tout votre contenu.
        </p>
      </Section>

      <Section
        title="Sauvegarde & transfert"
        hint="Vos modifications sont stockées dans le navigateur de cet appareil. Pour les retrouver ailleurs (ou les protéger), téléchargez la sauvegarde puis importez-la sur l’autre appareil."
      >
        <div className="flex flex-wrap gap-3">
          <button onClick={onExport} className="rounded-full bg-forest px-4 py-2.5 text-sm text-paper">
            Télécharger la sauvegarde (JSON)
          </button>
          <button onClick={onImportClick} className="rounded-full border border-line px-4 py-2.5 text-sm">
            Importer une sauvegarde
          </button>
          <button onClick={onReset} className="rounded-full border border-red-300 px-4 py-2.5 text-sm text-red-700">
            Revenir au contenu d’origine
          </button>
        </div>
      </Section>

      <Section title="Code d’accès" hint="Protège l’ouverture de cet espace sur cet appareil.">
        <Row>
          <Field label="Nouveau code">
            <input className="input" type="password" value={pin1} onChange={(e) => setPin1(e.target.value)} />
          </Field>
          <Field label="Confirmer">
            <input className="input" type="password" value={pin2} onChange={(e) => setPin2(e.target.value)} />
          </Field>
        </Row>
        <button
          onClick={() => {
            if (pin1.length < 4) return setPinMsg("4 caractères minimum.");
            if (pin1 !== pin2) return setPinMsg("Les deux codes ne correspondent pas.");
            onPin(pin1);
            setPin1("");
            setPin2("");
            setPinMsg("Code mis à jour ✓");
          }}
          className="rounded-full bg-forest px-4 py-2.5 text-sm text-paper"
        >
          Changer le code
        </button>
        {pinMsg && <p className="text-sm text-inksoft">{pinMsg}</p>}
      </Section>

      <Section title="Bon à savoir">
        <ul className="list-disc space-y-2 pl-5 text-sm text-inksoft">
          <li>
            L’espace admin s’ouvre depuis le lien « Espace admin » du pied de page, ou en ajoutant{" "}
            <code className="rounded bg-cream px-1">#admin</code> à l’adresse du site.
          </li>
          <li>Les visiteurs ne voient jamais cet espace : il n’apparaît qu’après saisie du code.</li>
          <li>
            Les modifications sont visibles immédiatement sur cet appareil. Pour qu’elles soient
            servies à tous les visiteurs, transmettez la sauvegarde JSON afin de mettre à jour la
            version publiée.
          </li>
        </ul>
      </Section>
    </>
  );
}

/* ---------- briques ---------- */

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-line bg-white p-5 sm:p-6">
      <h2 className="font-serif text-2xl">{title}</h2>
      {hint && <p className="mt-1 text-sm text-inksoft">{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 sm:grid-cols-2">{children}</div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-inksoft">{label}</span>
      {children}
    </label>
  );
}

function ListEditor<T>({
  label,
  items,
  onChange,
  render,
  blank,
  addLabel,
  titleOf,
}: {
  label: string;
  items: T[];
  onChange: (items: T[]) => void;
  render: (item: T, update: (next: T) => void) => ReactNode;
  blank: T;
  addLabel: string;
  titleOf?: (item: T) => string;
}) {
  function move(index: number, delta: number) {
    const next = [...items];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }
  return (
    <div>
      {label && <p className="mb-2 text-sm text-inksoft">{label}</p>}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="rounded-2xl border border-line bg-paper p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="truncate text-xs uppercase tracking-[0.14em] text-moss">
                {titleOf ? titleOf(item) : `Élément ${index + 1}`}
              </p>
              <div className="flex shrink-0 gap-1">
                <IconBtn label="Monter" onClick={() => move(index, -1)} disabled={index === 0}>
                  ↑
                </IconBtn>
                <IconBtn label="Descendre" onClick={() => move(index, 1)} disabled={index === items.length - 1}>
                  ↓
                </IconBtn>
                <IconBtn
                  label="Supprimer"
                  danger
                  onClick={() => {
                    if (window.confirm("Supprimer cet élément ?")) {
                      onChange(items.filter((_, i) => i !== index));
                    }
                  }}
                >
                  ✕
                </IconBtn>
              </div>
            </div>
            {render(item, (next) => onChange(items.map((current, i) => (i === index ? next : current))))}
          </div>
        ))}
      </div>
      <button
        onClick={() => onChange([...items, blank])}
        className="mt-3 rounded-full border border-dashed border-moss px-4 py-2 text-sm text-moss"
      >
        + {addLabel}
      </button>
    </div>
  );
}

function IconBtn({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid h-7 w-7 place-items-center rounded-lg border text-xs ${
        danger ? "border-red-200 text-red-700" : "border-line text-inksoft"
      } ${disabled ? "opacity-30" : "hover:bg-cream"}`}
    >
      {children}
    </button>
  );
}
