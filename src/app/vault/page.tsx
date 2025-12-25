"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import OneButton from "@/components/orbit/OrbitButton";
import {
  Archive,
  Sparkles,
  ShieldCheck,
  FileText,
  Lock,
  Search,
  Filter,
  ChevronRight,
  Database,
  FolderKanban,
  ClipboardList,
  Wand2,
  Layers,
  Clock,
  Users,
  BadgeCheck,
  ArrowRight,
} from "lucide-react";

/* ======================================================
   TYPES
====================================================== */

type VaultView = "warrooms" | "generator" | "library";

type VaultCategoryKey =
  | "all"
  | "auto"
  | "contracts"
  | "analysis"
  | "internal"
  | "archive";

type VaultStatus = "ready" | "draft" | "locked";

type VaultItem = {
  id: string;
  title: string;
  description: string;
  category: VaultCategoryKey;
  icon: any;
  status: VaultStatus;
  tags: string[];
  source: string;
  createdAt: string;
  warRoomId?: string | null;
  purposeKey?: string | null;
};

type WarRoomStatus = "active" | "review" | "archived";

type WarRoom = {
  id: string;
  title: string;
  subtitle: string; // z.B. Lead/Kunde
  status: WarRoomStatus;
  owner: string;
  updatedAt: string;
  tags: string[];
  linkedDocs: number;
  nextSteps: number;
};

type TemplateLock = "open" | "role" | "process" | "locked";

type PurposeKey =
  | "lead_analysis"
  | "offer"
  | "contract"
  | "briefing"
  | "exec_summary"
  | "partnerscale_deliverable";

type Purpose = {
  key: PurposeKey;
  title: string;
  description: string;
  icon: any;
  lock: TemplateLock;
  tags: string[];
  // später: required fields, permissions, preconditions, route, etc.
};

type RoleKey =
  | "sales_trainee_i"
  | "sales_trainee_ii"
  | "sales_consultant"
  | "sales_manager"
  | "sales_director"
  | "vice_president"
  | "senior_vice_president"
  | "executive";

/* ======================================================
   MOCK DATA
====================================================== */

const CATEGORIES: {
  key: VaultCategoryKey;
  title: string;
  subtitle: string;
  icon: any;
}[] = [
  { key: "all", title: "Alle Dokumente", subtitle: "Gesamter Vault", icon: Archive },
  { key: "auto", title: "Automatisch", subtitle: "Von Orbit erzeugt", icon: Sparkles },
  { key: "contracts", title: "Verträge", subtitle: "Angebote & Abschlüsse", icon: ShieldCheck },
  { key: "analysis", title: "Analysen", subtitle: "Reports & Auswertungen", icon: Database },
  { key: "internal", title: "Intern", subtitle: "Briefings, Notizen", icon: FileText },
  { key: "archive", title: "Archiv", subtitle: "Historisch & gesperrt", icon: Lock },
];

const WAR_ROOMS: WarRoom[] = [
  {
    id: "wr-001",
    title: "War Room · Müller GmbH",
    subtitle: "Lead → Potenzialanalyse & Angebot",
    status: "active",
    owner: "Du",
    updatedAt: "2025-12-24",
    tags: ["Lead", "Hot", "Q4"],
    linkedDocs: 5,
    nextSteps: 3,
  },
  {
    id: "wr-002",
    title: "War Room · PartnerScale CORE",
    subtitle: "Kunde → Vertrag & Onboarding",
    status: "review",
    owner: "Leadership",
    updatedAt: "2025-12-22",
    tags: ["Kunde", "Retainer", "Setup"],
    linkedDocs: 7,
    nextSteps: 2,
  },
  {
    id: "wr-003",
    title: "War Room · Altbestand 2023",
    subtitle: "Archiv → read-only",
    status: "archived",
    owner: "Migration",
    updatedAt: "2024-01-03",
    tags: ["Archiv"],
    linkedDocs: 12,
    nextSteps: 0,
  },
];

const PURPOSES: Purpose[] = [
  {
    key: "lead_analysis",
    title: "Lead-Analyse (KPA)",
    description: "Automatische Potenzialanalyse & Handlungsempfehlungen (CI-konform).",
    icon: Sparkles,
    lock: "process",
    tags: ["Auto", "KPA", "Lead"],
  },
  {
    key: "offer",
    title: "Angebot",
    description: "Purpose-basiertes Angebot mit fixem Template-Set (kein Freestyle).",
    icon: Layers,
    lock: "role",
    tags: ["Sales", "Pricing", "Template"],
  },
  {
    key: "contract",
    title: "Vertrag",
    description: "Nur nach VK/ABS-Logik freischaltbar – Versionierung & Audit.",
    icon: ShieldCheck,
    lock: "locked",
    tags: ["Legal", "Version", "Audit"],
  },
  {
    key: "briefing",
    title: "Briefing / Projektstart",
    description: "Interne Übergabe (PM/Fulfillment) – sauber, standardisiert.",
    icon: ClipboardList,
    lock: "open",
    tags: ["Intern", "Delivery"],
  },
  {
    key: "exec_summary",
    title: "Executive Summary",
    description: "Management-Overview für Führung / GF – kurz, klar, entscheidungsfähig.",
    icon: BadgeCheck,
    lock: "role",
    tags: ["Executive", "Summary"],
  },
  {
    key: "partnerscale_deliverable",
    title: "PartnerScale Deliverable",
    description: "Phase-basierte Deliverables (SYSTEMS/GROWTH/TALENT) – strikt geführt.",
    icon: Wand2,
    lock: "process",
    tags: ["PartnerScale", "Phase"],
  },
];

const VAULT_ITEMS: VaultItem[] = [
  {
    id: "doc-001",
    title: "Lead Analyse – Müller GmbH",
    description: "Potenzialanalyse basierend auf KPA-Checkliste.",
    category: "auto",
    icon: Sparkles,
    status: "ready",
    tags: ["Analyse", "Lead", "Auto"],
    source: "Orbit Intelligence",
    createdAt: "2025-12-21",
    warRoomId: "wr-001",
    purposeKey: "lead_analysis",
  },
  {
    id: "doc-002",
    title: "Angebot – PartnerScale CORE",
    description: "Offer Template v1.0, Draft (noch nicht final).",
    category: "contracts",
    icon: Layers,
    status: "draft",
    tags: ["Angebot", "VK"],
    source: "Orbit → One",
    createdAt: "2025-12-20",
    warRoomId: "wr-002",
    purposeKey: "offer",
  },
  {
    id: "doc-003",
    title: "Kalender-Disziplin – November",
    description: "Soll/Ist Vergleich aus Kalender & Tageskontrolle.",
    category: "analysis",
    icon: Database,
    status: "ready",
    tags: ["Report", "Disziplin"],
    source: "Orbit Analytics",
    createdAt: "2025-12-18",
    warRoomId: null,
    purposeKey: "exec_summary",
  },
  {
    id: "doc-004",
    title: "Vertrag – Altbestand 2023",
    description: "Archivierter Vertrag (read-only).",
    category: "archive",
    icon: Lock,
    status: "locked",
    tags: ["Archiv", "Legal"],
    source: "Migration",
    createdAt: "2023-06-01",
    warRoomId: "wr-003",
    purposeKey: "contract",
  },
];

/* ======================================================
   HELPERS
====================================================== */

function statusBadge(status: VaultStatus) {
  if (status === "ready") {
    return (
      <span className="text-[10px] tracking-wider uppercase px-2 py-1 rounded-full border border-emerald-300/25 bg-emerald-500/10 text-emerald-200">
        Ready
      </span>
    );
  }
  if (status === "draft") {
    return (
      <span className="text-[10px] tracking-wider uppercase px-2 py-1 rounded-full border border-[#B244FF]/25 bg-[#B244FF]/10 text-[#d8a5d0]">
        Draft
      </span>
    );
  }
  return (
    <span className="text-[10px] tracking-wider uppercase px-2 py-1 rounded-full border border-white/10 bg-white/5 text-white/60">
      Locked
    </span>
  );
}

function warRoomBadge(status: WarRoomStatus) {
  if (status === "active") {
    return (
      <span className="text-[10px] tracking-wider uppercase px-2 py-1 rounded-full border border-[#B244FF]/25 bg-[#B244FF]/10 text-[#d8a5d0]">
        Active
      </span>
    );
  }
  if (status === "review") {
    return (
      <span className="text-[10px] tracking-wider uppercase px-2 py-1 rounded-full border border-amber-300/20 bg-amber-500/10 text-amber-200">
        Review
      </span>
    );
  }
  return (
    <span className="text-[10px] tracking-wider uppercase px-2 py-1 rounded-full border border-white/10 bg-white/5 text-white/55">
      Archived
    </span>
  );
}

function lockBadge(lock: TemplateLock) {
  if (lock === "open") {
    return (
      <span className="text-[10px] tracking-wider uppercase px-2 py-1 rounded-full border border-white/10 bg-white/5 text-white/60">
        Open
      </span>
    );
  }
  if (lock === "role") {
    return (
      <span className="text-[10px] tracking-wider uppercase px-2 py-1 rounded-full border border-[#d8a5d0]/20 bg-[#B244FF]/10 text-[#d8a5d0]">
        Role-Gated
      </span>
    );
  }
  if (lock === "process") {
    return (
      <span className="text-[10px] tracking-wider uppercase px-2 py-1 rounded-full border border-emerald-300/20 bg-emerald-500/10 text-emerald-200">
        Process-Gated
      </span>
    );
  }
  return (
    <span className="text-[10px] tracking-wider uppercase px-2 py-1 rounded-full border border-white/10 bg-white/5 text-white/55">
      Locked
    </span>
  );
}

/* ======================================================
   PAGE
====================================================== */

export default function VaultPage() {
  // später: aus Auth / DB
const role = "sales_manager" as RoleKey;

  const [view, setView] = useState<VaultView>("warrooms");
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<VaultCategoryKey>("all");

  const [selectedWarRoomId, setSelectedWarRoomId] = useState<string | null>(
    WAR_ROOMS[0]?.id ?? null
  );
  const [selectedPurposeKey, setSelectedPurposeKey] = useState<PurposeKey | null>(
    "lead_analysis"
  );
  const [selectedDocId, setSelectedDocId] = useState<string | null>(
    VAULT_ITEMS[0]?.id ?? null
  );

  // War Rooms filtered
  const filteredWarRooms = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WAR_ROOMS.filter((w) => {
      if (!q) return true;
      const hay = [w.title, w.subtitle, w.owner, ...(w.tags ?? [])]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [query]);

  const selectedWarRoom = useMemo(() => {
    return WAR_ROOMS.find((w) => w.id === selectedWarRoomId) ?? null;
  }, [selectedWarRoomId]);

  // Purposes filtered (lock simulation: role/process/locked)
const availablePurposes = useMemo(() => {
  return PURPOSES.filter((p) => {
    // komplett offen
    if (p.lock === "open") return true;

    // role-gated: nur absolute Einsteiger ausschließen
    if (p.lock === "role") {
      return role !== "sales_trainee_i";
    }

    // process-gated: aktuell IMMER erlaubt (VK/ABS später)
    if (p.lock === "process") {
      return true;
    }

    // locked: wirklich nur Geschäftsführung
    if (p.lock === "locked") {
      return role === "executive";
    }

    return true;
  });
}, [role]);


  const filteredPurposes = useMemo(() => {
    const q = query.trim().toLowerCase();
    return availablePurposes.filter((p) => {
      if (!q) return true;
      const hay = [p.title, p.description, ...(p.tags ?? [])]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [availablePurposes, query]);

  const selectedPurpose = useMemo(() => {
    return PURPOSES.find((p) => p.key === selectedPurposeKey) ?? null;
  }, [selectedPurposeKey]);

  // Vault docs filtered
  const filteredDocs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return VAULT_ITEMS.filter((d) => {
      const catOk = activeCategory === "all" ? true : d.category === activeCategory;
      if (!catOk) return false;

      if (!q) return true;
      const hay = [d.title, d.description, d.source, ...(d.tags ?? [])]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [activeCategory, query]);

  const selectedDoc = useMemo(() => {
    return VAULT_ITEMS.find((d) => d.id === selectedDocId) ?? null;
  }, [selectedDocId]);

  return (
    <main className="min-h-screen pt-20 px-6 text-white bg-gradient-to-br from-[#120914] via-[#0b0710] to-[#050013]">
      {/* Decorative Vault Glow */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[540px] w-[920px] rounded-full blur-3xl opacity-25 bg-[#B244FF]" />
        <div className="absolute top-40 right-[-160px] h-[460px] w-[460px] rounded-full blur-3xl opacity-18 bg-[#d8a5d0]" />
        <div className="absolute bottom-[-200px] left-[-180px] h-[560px] w-[560px] rounded-full blur-3xl opacity-12 bg-[#B244FF]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="rounded-3xl border border-white/10 bg-black/35 backdrop-blur-2xl p-6 shadow-[0_0_40px_rgba(178,68,255,0.18)] animate-fade-up">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold tracking-[0.22em] text-[#d8a5d0] uppercase">
                Orbit · Vault
              </p>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                ORBIT VAULT
              </h1>
              <p className="text-white/65 text-sm max-w-2xl">
                Vault ist nicht nur Ablage: War Rooms bündeln Kontext, der Generator erzeugt
                zweckgebundene Dokumente (Templates nicht frei), alles ist versioniert & auditierbar.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm"
              >
                <ChevronRight className="h-4 w-4 mr-1 rotate-180 opacity-70" />
                Zurück
              </Link>

              <OneButton>
                <span className="inline-flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Upload (später)
                </span>
              </OneButton>
            </div>
          </div>

          {/* Search + View Switch */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-3">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-black/40 border border-white/10 hover:border-[#d8a5d0]/30 transition">
                <Search className="h-4 w-4 text-white/60" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Suchen: War Room, Zweck, Dokument, Lead, Vertrag, Analyse..."
                  className="w-full bg-transparent outline-none text-sm text-white placeholder:text-white/35"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 px-2 py-2 rounded-2xl bg-black/40 border border-white/10">
              <button
                onClick={() => setView("warrooms")}
                className={`flex-1 px-3 py-2 rounded-xl text-sm border transition ${
                  view === "warrooms"
                    ? "bg-white/10 border-white/10"
                    : "bg-transparent border-transparent hover:bg-white/5"
                }`}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <FolderKanban className="h-4 w-4" />
                  War Rooms
                </span>
              </button>
              <button
                onClick={() => setView("generator")}
                className={`flex-1 px-3 py-2 rounded-xl text-sm border transition ${
                  view === "generator"
                    ? "bg-white/10 border-white/10"
                    : "bg-transparent border-transparent hover:bg-white/5"
                }`}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  Generator
                </span>
              </button>
              <button
                onClick={() => setView("library")}
                className={`flex-1 px-3 py-2 rounded-xl text-sm border transition ${
                  view === "library"
                    ? "bg-white/10 border-white/10"
                    : "bg-transparent border-transparent hover:bg-white/5"
                }`}
              >
                <span className="inline-flex items-center justify-center gap-2">
                  <Archive className="h-4 w-4" />
                  Library
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* VIEW: WAR ROOMS */}
        {view === "warrooms" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* War Room List */}
            <section className="lg:col-span-6 rounded-3xl border border-white/10 bg-black/35 backdrop-blur-2xl overflow-hidden animate-fade-up">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs tracking-wider uppercase text-white/50">
                    War Rooms
                  </p>
                  <p className="text-sm text-white/70">
                    {filteredWarRooms.length} Treffer
                  </p>
                </div>
                <div className="text-[11px] text-white/45 inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 opacity-70" />
                  Live Kontext (später)
                </div>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredWarRooms.map((w, idx) => {
                  const selected = w.id === selectedWarRoomId;
                  return (
                    <button
                      key={w.id}
                      onClick={() => setSelectedWarRoomId(w.id)}
                      style={{ animationDelay: `${idx * 45}ms` }}
                      className={`report-card-animate text-left rounded-3xl border p-4 transition ${
                        selected
                          ? "border-[#d8a5d0]/35 bg-[#B244FF]/10 shadow-[0_0_30px_rgba(178,68,255,0.16)]"
                          : "border-white/10 bg-black/30 hover:bg-black/35"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="h-10 w-10 rounded-2xl flex items-center justify-center border border-white/10 bg-black/40 text-[#d8a5d0]">
                          <FolderKanban className="h-4 w-4" />
                        </div>
                        <div className="shrink-0">{warRoomBadge(w.status)}</div>
                      </div>

                      <div className="mt-3 space-y-2">
                        <p className="font-semibold">{w.title}</p>
                        <p className="text-[12px] text-white/60 leading-snug">
                          {w.subtitle}
                        </p>

                        <div className="grid grid-cols-2 gap-2 pt-2">
                          <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                            <p className="text-[10px] uppercase tracking-wider text-white/45">
                              Docs
                            </p>
                            <p className="text-sm font-semibold">{w.linkedDocs}</p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
                            <p className="text-[10px] uppercase tracking-wider text-white/45">
                              Next Steps
                            </p>
                            <p className="text-sm font-semibold">{w.nextSteps}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                          {w.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* War Room Preview */}
            <aside className="lg:col-span-6 rounded-3xl border border-white/10 bg-black/35 backdrop-blur-2xl overflow-hidden animate-fade-up">
              <div className="p-4 border-b border-white/10">
                <p className="text-xs tracking-wider uppercase text-white/50">
                  War Room Preview
                </p>
              </div>

              <div className="p-4">
                {selectedWarRoom ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-bold leading-tight">
                          {selectedWarRoom.title}
                        </p>
                        <p className="text-[12px] text-white/60 mt-1">
                          {selectedWarRoom.subtitle}
                        </p>
                      </div>
                      <div className="shrink-0">{warRoomBadge(selectedWarRoom.status)}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                        <p className="text-[11px] uppercase tracking-wider text-white/45 mb-3">
                          Kontext (später dynamisch)
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-white/60">Owner</span>
                            <span className="text-[#d8a5d0] text-xs">{selectedWarRoom.owner}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white/60">Updated</span>
                            <span className="text-[#d8a5d0] text-xs">{selectedWarRoom.updatedAt}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-white/60">Dokumente</span>
                            <span className="text-[#d8a5d0] text-xs">{selectedWarRoom.linkedDocs}</span>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                        <p className="text-[11px] uppercase tracking-wider text-white/45 mb-3">
                          Short Actions
                        </p>
                        <div className="space-y-2">
                          <button
                            className="w-full px-4 py-3 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition"
                            onClick={() => setView("generator")}
                          >
                            <span className="inline-flex items-center gap-2">
                              <Wand2 className="h-4 w-4" />
                              Dokument erzeugen (Purpose)
                              <ArrowRight className="h-4 w-4 opacity-70" />
                            </span>
                          </button>

                          <button
                            className="w-full px-4 py-3 rounded-full bg-black/30 border border-white/10 text-white/60 hover:bg-black/35 transition"
                            onClick={() => alert("Später: War Room öffnen (Route + Tabs).")}
                          >
                            War Room öffnen
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                      <p className="text-[11px] uppercase tracking-wider text-white/45 mb-3">
                        War Room Tabs (Zielbild)
                      </p>
                      <ul className="text-[12px] text-white/65 space-y-2">
                        <li>• Dokumente (Vault verknüpft)</li>
                        <li>• Notizen & Decisions</li>
                        <li>• Next Steps / Tasks</li>
                        <li>• Timeline / Audit</li>
                        <li>• Links / Ressourcen</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-white/10 bg-black/30 p-6 text-center">
                    <p className="text-sm font-semibold mb-2">Wähle einen War Room</p>
                    <p className="text-white/55 text-sm">
                      Links anklicken – rechts siehst du Kontext & Actions.
                    </p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}

        {/* VIEW: GENERATOR */}
        {view === "generator" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Purpose Library */}
            <section className="lg:col-span-7 rounded-3xl border border-white/10 bg-black/35 backdrop-blur-2xl overflow-hidden animate-fade-up">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs tracking-wider uppercase text-white/50">
                    Dokument-Generator
                  </p>
                  <p className="text-sm text-white/70">
                    Purpose-basiert · Templates nicht frei
                  </p>
                </div>
                <div className="text-[11px] text-white/45 inline-flex items-center gap-2">
                  <Users className="h-4 w-4 opacity-70" />
                  Role: {role.toUpperCase()}
                </div>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPurposes.map((p, idx) => {
                  const Icon = p.icon;
                  const selected = p.key === selectedPurposeKey;
                  return (
                    <button
                      key={p.key}
                      onClick={() => setSelectedPurposeKey(p.key)}
                      style={{ animationDelay: `${idx * 55}ms` }}
                      className={`report-card-animate text-left rounded-3xl border p-4 transition ${
                        selected
                          ? "border-[#d8a5d0]/35 bg-[#B244FF]/10 shadow-[0_0_30px_rgba(178,68,255,0.16)]"
                          : "border-white/10 bg-black/30 hover:bg-black/35"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="h-10 w-10 rounded-2xl flex items-center justify-center border border-white/10 bg-black/40 text-[#d8a5d0]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="shrink-0">{lockBadge(p.lock)}</div>
                      </div>

                      <div className="mt-3 space-y-2">
                        <p className="font-semibold">{p.title}</p>
                        <p className="text-[12px] text-white/60 leading-snug">
                          {p.description}
                        </p>

                        <div className="flex flex-wrap gap-2 pt-2">
                          {p.tags.slice(0, 3).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Generator Preview / Setup */}
            <aside className="lg:col-span-5 rounded-3xl border border-white/10 bg-black/35 backdrop-blur-2xl overflow-hidden animate-fade-up">
              <div className="p-4 border-b border-white/10">
                <p className="text-xs tracking-wider uppercase text-white/50">
                  Generator Setup
                </p>
              </div>

              <div className="p-4">
                {selectedPurpose ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-bold leading-tight">
                          {selectedPurpose.title}
                        </p>
                        <p className="text-[12px] text-white/60 mt-1">
                          {selectedPurpose.description}
                        </p>
                      </div>
                      <div className="shrink-0">{lockBadge(selectedPurpose.lock)}</div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                      <p className="text-[11px] uppercase tracking-wider text-white/45 mb-3">
                        Regeln (Zielbild)
                      </p>
                      <ul className="text-[12px] text-white/65 space-y-2">
                        <li>• Template-Auswahl ist nicht frei – nur Purpose erlaubt.</li>
                        <li>• Rechte/Role + Prozessbedingungen bestimmen Freischaltung.</li>
                        <li>• Ergebnis wird versioniert im Vault gespeichert + War Room verknüpft.</li>
                      </ul>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                      <p className="text-[11px] uppercase tracking-wider text-white/45 mb-3">
                        Inputs (Platzhalter)
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Kontext</span>
                          <span className="text-[#d8a5d0] text-xs">War Room / Lead / Kunde</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Daten</span>
                          <span className="text-[#d8a5d0] text-xs">Orbit + One</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Output</span>
                          <span className="text-[#d8a5d0] text-xs">PDF + Vault Entry</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <OneButton>
                        <span className="inline-flex items-center gap-2">
                          <Wand2 className="h-4 w-4" />
                          Dokument erzeugen (mock)
                        </span>
                      </OneButton>

                      <button
                        className="w-full px-4 py-3 rounded-full bg-black/30 border border-white/10 text-white/60 hover:bg-black/35 transition"
                        onClick={() => alert("Später: Template-Konfiguration / Admin-Panel.")}
                      >
                        Template-Setup (Admin)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-white/10 bg-black/30 p-6 text-center">
                    <p className="text-sm font-semibold mb-2">Wähle einen Purpose</p>
                    <p className="text-white/55 text-sm">
                      Links auswählen – rechts siehst du Regeln & Setup.
                    </p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}

        {/* VIEW: LIBRARY */}
        {view === "library" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Categories Sidebar */}
            <aside className="lg:col-span-3 rounded-3xl border border-white/10 bg-black/35 backdrop-blur-2xl overflow-hidden animate-fade-up">
              <div className="p-4 border-b border-white/10">
                <p className="text-xs tracking-wider uppercase text-white/50">
                  Kategorien
                </p>
              </div>

              <div className="p-2">
                {CATEGORIES.map((c) => {
                  const Icon = c.icon;
                  const active = c.key === activeCategory;
                  return (
                    <button
                      key={c.key}
                      onClick={() => setActiveCategory(c.key)}
                      className={`w-full text-left px-3 py-3 rounded-2xl flex items-start gap-3 transition ${
                        active ? "bg-white/10 border border-white/10" : "hover:bg-white/5"
                      }`}
                    >
                      <div
                        className={`mt-0.5 h-9 w-9 rounded-2xl flex items-center justify-center border border-white/10 ${
                          active ? "bg-[#B244FF]/10 text-[#d8a5d0]" : "bg-black/30 text-white/70"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold truncate">{c.title}</p>
                          <span className="text-[10px] text-white/35">
                            {c.key === "all"
                              ? VAULT_ITEMS.length
                              : VAULT_ITEMS.filter((d) => d.category === c.key).length}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/50 leading-snug">{c.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="p-4 border-t border-white/10">
                <div className="rounded-2xl bg-black/30 border border-white/10 p-4">
                  <p className="text-xs font-semibold text-white/80 mb-1">
                    Audit & Versionierung
                  </p>
                  <p className="text-[11px] text-white/55 leading-snug">
                    Jede Erstellung bekommt eine Source (Purpose + Prozess) und eine Version-Historie.
                  </p>
                </div>
              </div>
            </aside>

            {/* Doc Library */}
            <section className="lg:col-span-6 rounded-3xl border border-white/10 bg-black/35 backdrop-blur-2xl overflow-hidden animate-fade-up">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs tracking-wider uppercase text-white/50">
                    Vault Library
                  </p>
                  <p className="text-sm text-white/70">
                    {filteredDocs.length} Treffer
                  </p>
                </div>
                <div className="flex items-center gap-2 text-white/45 text-[11px]">
                  <Filter className="h-4 w-4" />
                  Smart Filter (später)
                </div>
              </div>

              <div className="p-4">
                {filteredDocs.length === 0 ? (
                  <div className="rounded-3xl border border-white/10 bg-black/30 p-10 text-center">
                    <p className="text-sm font-semibold mb-2">Keine Dokumente gefunden</p>
                    <p className="text-white/55 text-sm">
                      Versuch Keywords wie <span className="text-[#d8a5d0]">Vertrag</span>,{" "}
                      <span className="text-[#d8a5d0]">Analyse</span>,{" "}
                      <span className="text-[#d8a5d0]">War Room</span>.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredDocs.map((d, idx) => {
                      const Icon = d.icon;
                      const selected = d.id === selectedDocId;
                      return (
                        <button
                          key={d.id}
                          onClick={() => setSelectedDocId(d.id)}
                          style={{ animationDelay: `${idx * 45}ms` }}
                          className={`report-card-animate text-left rounded-3xl border p-4 transition ${
                            selected
                              ? "border-[#d8a5d0]/35 bg-[#B244FF]/10 shadow-[0_0_30px_rgba(178,68,255,0.16)]"
                              : "border-white/10 bg-black/30 hover:bg-black/35"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="h-10 w-10 rounded-2xl flex items-center justify-center border border-white/10 bg-black/40 text-[#d8a5d0]">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="shrink-0">{statusBadge(d.status)}</div>
                          </div>

                          <div className="mt-3 space-y-2">
                            <p className="font-semibold">{d.title}</p>
                            <p className="text-[12px] text-white/60 leading-snug">
                              {d.description}
                            </p>

                            <div className="flex flex-wrap gap-2 pt-2">
                              {(d.tags ?? []).slice(0, 3).map((t) => (
                                <span
                                  key={t}
                                  className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/60"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            {/* Doc Preview */}
            <aside className="lg:col-span-3 rounded-3xl border border-white/10 bg-black/35 backdrop-blur-2xl overflow-hidden animate-fade-up">
              <div className="p-4 border-b border-white/10">
                <p className="text-xs tracking-wider uppercase text-white/50">
                  Dokument Preview
                </p>
              </div>

              <div className="p-4">
                {selectedDoc ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-lg font-bold leading-tight">{selectedDoc.title}</p>
                        <p className="text-[12px] text-white/60 mt-1">
                          {selectedDoc.description}
                        </p>
                      </div>
                      <div className="shrink-0">{statusBadge(selectedDoc.status)}</div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-black/30 p-4">
                      <p className="text-[11px] uppercase tracking-wider text-white/45 mb-3">
                        Metadata
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Quelle</span>
                          <span className="text-[#d8a5d0] text-xs">{selectedDoc.source}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Erstellt</span>
                          <span className="text-[#d8a5d0] text-xs">{selectedDoc.createdAt}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">Purpose</span>
                          <span className="text-[#d8a5d0] text-xs">
                            {selectedDoc.purposeKey ?? "—"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/60">War Room</span>
                          <span className="text-[#d8a5d0] text-xs">
                            {selectedDoc.warRoomId ?? "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <OneButton>Dokument öffnen</OneButton>
                      <button
                        className="w-full px-4 py-3 rounded-full bg-black/30 border border-white/10 text-white/60 hover:bg-black/35 transition"
                        onClick={() => alert("Später: Version-Historie & Audit Trail.")}
                      >
                        Versionen / Audit
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-white/10 bg-black/30 p-6 text-center">
                    <p className="text-sm font-semibold mb-2">Wähle ein Dokument</p>
                    <p className="text-white/55 text-sm">
                      Links anklicken – rechts siehst du Meta & Actions.
                    </p>
                  </div>
                )}
              </div>
            </aside>
          </div>
        )}

        <div className="h-10" />
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(10px) scale(0.99); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-up {
          animation: fadeUp 420ms cubic-bezier(0.22, 0.61, 0.36, 1) both;
        }

        @keyframes reportCardIn {
          0% {
            opacity: 0;
            transform: translateY(14px) scale(0.985);
            filter: blur(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        .report-card-animate {
          animation: reportCardIn 520ms cubic-bezier(0.22, 0.61, 0.36, 1) both;
          will-change: transform, opacity, filter;
        }
      `}</style>
    </main>
  );
}
