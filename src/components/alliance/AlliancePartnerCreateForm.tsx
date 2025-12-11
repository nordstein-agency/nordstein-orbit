

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { AllianceDropdown } from "./AllianceDropdown";
import AllianceButton from "./AllianceButton";

const supabase = createSupabaseBrowserClient();

// OPTIONAL: Root Folder for Alliance Partners in pCloud
const ALLIANCE_ROOT_FOLDER = 20025318689;

type Leader = {
  id: string;
  first_name: string | null;
  last_name: string | null;
};

export default function AlliancePartnerCreateForm() {
  const router = useRouter();

  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ➤ neuer Partner Typ (Person oder Firma)
  const [partnerType, setPartnerType] = useState<"person" | "company">("person");

  const [formData, setFormData] = useState({
    leader: "",
    first_name: "",
    last_name: "",
    birth_date: "",
    sv_nr: "",
    country: "",
    private_adress: "",
    phone: "",
    email: "",
    iban: "",
    bic: "",
    bank_name: "",
    partner_role: "fulfillment",
    role: "alliance_partner",
  });

  const updateField = (name: keyof typeof formData, value: string) =>
    setFormData((prev) => ({ ...prev, [name]: value }));


  /*
  // -----------------------------------------------------
  // LOAD LEADER LIST
  // -----------------------------------------------------
  useEffect(() => {
    async function loadLeaders() {
      setLoading(true);

      const { data: me } = await supabase.auth.getUser();
      setCurrentUser(me);

      const { data } = await supabase
        .from("users")
        .select("id, first_name, last_name")
        .order("first_name", { ascending: true });

      setLeaders((data as Leader[]) || []);
      setLoading(false);
    }

    loadLeaders();
  }, []);
*/


 // -----------------------------
  // Load User
  // -----------------------------
  useEffect(() => {
    async function load() {
      setLoading(true);

      const { data } = await supabase.auth.getUser();
      setCurrentUser(data.user ?? null);

      setLoading(false);
    }
    load();
  }, []);


  // -----------------------------
// Load Employee Tree
// -----------------------------
useEffect(() => {
    // ⚠️ HINWEIS: Dieser Hook setzt voraus, dass `currentUser` 
    // (mit der E-Mail des eingeloggten Benutzers) 
    // bereits durch eine andere Logik gesetzt wurde.
    if (!currentUser) return;

    // Typ-Definitionen für die Benutzerdaten von der API
    type UserFromApi = Leader & {
        email: string;
        leader: string | null; // ID des Vorgesetzten
    };

    async function loadTree() {
        setLoading(true);

        try {
            // 1. Alle Benutzerdaten von der Next.js API abrufen
            const allUsersResponse = await fetch("/api/one/read/users");
            
            if (!allUsersResponse.ok) {
                throw new Error("Fehler beim Laden aller Benutzerdaten von der API.");
            }
            
            // Annahme: API liefert { users: UserFromApi[] }
            const { users: allUsers }: { users: UserFromApi[] } = await allUsersResponse.json();

            if (!allUsers || allUsers.length === 0) {
                setLeaders([]);
                setLoading(false);
                return;
            }

            // 2. Aktuellen Benutzer (Me) aus der Gesamtliste identifizieren
            const me = allUsers.find((u) => u.email === currentUser.email);

            if (!me) {
                setLeaders([]);
                setLoading(false);
                return;
            }

            // 3. Client-seitige Rekursion/Filterung
            /**
             * Sammelt alle Untergebenen (direkt und indirekt) eines Leaders rekursiv.
             */
            function collectTeamTree(leaderId: string, allUsers: UserFromApi[]): Leader[] {
                // Finde alle direkten Untergebenen (leader === leaderId)
                const directReports = allUsers.filter((u) => u.leader === leaderId);

                let result: Leader[] = directReports;

                // Rekursiver Aufruf für die Untergebenen der Untergebenen
                for (const user of directReports) {
                    const children = collectTeamTree(user.id, allUsers);
                    result = [...result, ...children];
                }

                return result;
            }

            const tree = collectTeamTree(me.id, allUsers);
            
            // Fügen Sie den aktuellen Benutzer selbst zur Leader-Liste hinzu
            setLeaders([
                { id: me.id, first_name: me.first_name, last_name: me.last_name }, 
                ...tree
            ]);

        } catch (error: any) {
            console.error("Fehler beim Erstellen des Mitarbeiter-Baumes:", error.message);
            setLeaders([]);
        } finally {
            setLoading(false);
        }
    }

    loadTree();

}, [currentUser]); // Abhängigkeit: Lädt neu, wenn sich der eingeloggte Benutzer ändert






  // -----------------------------------------------------
  // SUBMIT HANDLER
  // -----------------------------------------------------
  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setSaving(true);
  setError("");

  try {
    // Pflichtfelder Orbit-seitig prüfen
    if (!formData.first_name || !formData.email) {
      throw new Error("Bitte alle Pflichtfelder ausfüllen.");
    }

    // -----------------------------------------
    // 1️⃣ Daten an ONE API schicken
    // -----------------------------------------
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_ONE_API_URL}/api/orbit/incoming/alliance-partner`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leader: formData.leader,
          first_name: formData.first_name,
          last_name: formData.last_name,

          // nur wenn Person
          birth_date: partnerType === "person" ? formData.birth_date : null,
          sv_nr: partnerType === "person" ? formData.sv_nr : null,

          email: formData.email,
          phone: formData.phone,
          private_adress: formData.private_adress,
          country: formData.country,
          iban: formData.iban,
          bic: formData.bic,
          bank_name: formData.bank_name
        })
      }
    );

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Fehler in ONE API");

    const oneUserId = json.one_user_id;

    // -----------------------------------------
    // 2️⃣ Jetzt den Orbit-eigenen Eintrag machen
    // -----------------------------------------
    const { data: partner, error: partnerErr } = await supabase
      .from("alliance_partners")
      .insert({
        user_id: oneUserId,
        partner_role: formData.partner_role,
        type: partnerType,     // Orbit-spezifisch!
        status: "active"
      })
      .select()
      .single();

    if (partnerErr) throw partnerErr;

    router.push(`/alliance/partner/${partner.id}`);

  } catch (err: any) {
    console.error(err);
    setError(err.message);
  }

  setSaving(false);
}



  // -----------------------------------------------------
  // RENDER
  // -----------------------------------------------------
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ERROR MESSAGE */}
      {error && (
        <div className="bg-red-500/20 border border-red-500/40 text-red-300 p-4 rounded-xl">
          {error}
        </div>
      )}

      {/* PARTNER-TYPE DROPDOWN */}
      <div>
        <label className="block mb-2 text-sm text-[#c9b5c7]">
          Partner Typ
        </label>
        <AllianceDropdown
          value={partnerType}
          placeholder="Bitte auswählen"
          onChange={(v) => setPartnerType(v as "person" | "company")}
          options={[
            { label: "Person / Einzelunternehmer", value: "person" },
            { label: "Firma / Gesellschaft", value: "company" },
          ]}
        />
      </div>

      {/* LEADER */}
      <div>
        <label className="block mb-2 text-sm text-[#c9b5c7]">
          Direkte Unterstellung
        </label>
        <AllianceDropdown
          value={formData.leader}
          onChange={(v) => updateField("leader", v)}
          placeholder="Bitte auswählen…"
          options={[
            { label: "Bitte auswählen…", value: "" },
            ...leaders.map((l) => ({
              label: `${l.first_name} ${l.last_name}`,
              value: l.id,
            })),
          ]}
        />
      </div>

      {/* NAME FIELDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FIRST NAME */}
        <div>
          <label className="block mb-2 text-sm text-[#c9b5c7]">
            {partnerType === "company" ? "Name des Unternehmens" : "Vorname"}
          </label>
          <input
            type="text"
            value={formData.first_name}
            onChange={(e) => updateField("first_name", e.target.value)}
            className="bg-[#2a1b29]/40 border border-[#3a2238] rounded-xl px-4 py-3 text-white w-full"
          />
        </div>

        {/* LAST NAME */}
        <div>
          <label className="block mb-2 text-sm text-[#c9b5c7]">
            {partnerType === "company"
              ? "Vertreten durch (CEO)"
              : "Nachname"}
          </label>
          <input
            type="text"
            value={formData.last_name}
            onChange={(e) => updateField("last_name", e.target.value)}
            className="bg-[#2a1b29]/40 border border-[#3a2238] rounded-xl px-4 py-3 text-white w-full"
          />
        </div>
      </div>

      {/* HIDDEN FOR COMPANIES: birthdate + svnr */}
      {partnerType === "person" && (
        <>
          {/* birth_date */}
          <div>
            <label className="block mb-2 text-sm text-[#c9b5c7]">
              Geburtsdatum
            </label>
            <input
              type="text"
              value={formData.birth_date}
              onChange={(e) => updateField("birth_date", e.target.value)}
              className="bg-[#2a1b29]/40 border border-[#3a2238] rounded-xl px-4 py-3 text-white w-full"
            />
          </div>

          {/* sv_nr */}
          <div>
            <label className="block mb-2 text-sm text-[#c9b5c7]">
              SV-Nummer
            </label>
            <input
              type="text"
              value={formData.sv_nr}
              onChange={(e) => updateField("sv_nr", e.target.value)}
              className="bg-[#2a1b29]/40 border border-[#3a2238] rounded-xl px-4 py-3 text-white w-full"
            />
          </div>
        </>
      )}

      {/* REMAINING FIELDS */}
      {[
        ["country", "Land"],
        ["private_adress", "Adresse"],
        ["phone", "Telefon"],
        ["email", "E-Mail"],
        ["iban", "IBAN"],
        ["bic", "BIC"],
        ["bank_name", "Bank"],
      ].map(([field, label]) => (
        <div key={field}>
          <label className="block mb-2 text-sm text-[#c9b5c7]">{label}</label>
          <input
            type="text"
            value={(formData as any)[field]}
            onChange={(e) => updateField(field as any, e.target.value)}
            className="bg-[#2a1b29]/40 border border-[#3a2238] rounded-xl px-4 py-3 text-white w-full"
          />
        </div>
      ))}

      {/* SUBMIT BUTTON */}
      <div className="pt-4">
        <AllianceButton type="submit" loading={saving}>
          {saving ? "Wird gespeichert…" : "Alliance Partner erstellen"}
        </AllianceButton>
      </div>
    </form>
  );
}
