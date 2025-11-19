"use client";

import { useState, useMemo } from "react";
import OrbitButton from "@/components/orbit/OrbitButton";
import { OrbitDropzone } from "@/components/orbit/OrbitDropzone";
import { parseLeadFile, mapToLead } from "@/lib/leadImport";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

// ------------------------------------------------------
// SAFETY HELPERS (Fix für alle Excel/XLSX/CSV Probleme)
// ------------------------------------------------------
function safeStr(value: any): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function safeLower(value: any): string {
  return safeStr(value).toLowerCase();
}

type MappedLead = ReturnType<typeof mapToLead>;

type PreviewRow = MappedLead & {
  _rowIndex: number;
  _errors: string[];
  _isDuplicate?: boolean;
};

export default function LeadUploadPage() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [loading, setLoading] = useState(false);

const [page, setPage] = useState(1);
const pageSize = 20;

const totalPages = Math.ceil(rows.length / pageSize);

const paginatedRows = useMemo(() => {
  const start = (page - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}, [rows, page]);


  const [uploadError, setUploadError] = useState<string | null>(null);

  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const pathname = usePathname();

  const activeTab = pathname === "/leads/upload" ? "import" : "list";

  // ------------------------------
  // Validierungs-Logik
  // ------------------------------
  const validRows = useMemo(
    () => rows.filter((r) => r._errors.length === 0),
    [rows]
  );

  const invalidRowsCount = useMemo(
    () => rows.length - validRows.length,
    [rows, validRows.length]
  );

  // ------------------------------
  // Datei laden & parsen
  // ------------------------------
  async function handleFile(file: File) {
    setUploadError(null);
    setFileName(file.name);
    setRows([]);
   


    try {
      const rawRows = await parseLeadFile(file);

      let mapped: PreviewRow[] = (rawRows as any[]).map((raw, index) => {
        const base = mapToLead(raw) as MappedLead;

        const errors: string[] = [];

        // Pflichtfelder prüfen
        if (
          !safeStr(base.company_name) &&
          !safeStr(base.website) &&
          !safeStr(base.email)
        ) {
          errors.push(
            "Mindestens eines der Felder Firma, Website oder E-Mail muss gefüllt sein."
          );
        }

        return {
          ...base,
          _rowIndex: index + 2,
          _errors: errors,
        };
      });

      // -----------------------------
      // Duplikate erkennen
      // -----------------------------
      const dupMap = new Map<string, PreviewRow[]>();

      for (const row of mapped) {
        const key = `${safeLower(row.website)}|${safeLower(row.email)}`;

        if (key === "|") continue;

        if (!dupMap.has(key)) dupMap.set(key, [row]);
        else dupMap.get(key)!.push(row);
      }

      // Flag setzen
      mapped = mapped.map((row) => {
        const key = `${safeLower(row.website)}|${safeLower(row.email)}`;
        if (key === "|") return row;

        const group = dupMap.get(key);
        if (group && group.length > 1) {
          return {
            ...row,
            _isDuplicate: true,
            _errors: [
              ...row._errors,
              "Möglicher Duplikat-Eintrag innerhalb der Datei.",
            ],
          };
        }

        return row;
      });

      setRows(mapped);
      setPage(1);

    } catch (err: any) {
      console.error(err);
      setUploadError(err?.message ?? "Fehler beim Einlesen der Datei.");
    }
  }

  // ------------------------------
  // Upload nach Supabase
  // ------------------------------
  async function upload() {
    setUploadError(null);

    if (!validRows.length) {
      setUploadError("Keine gültigen Leads vorhanden.");
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Kein Benutzer eingeloggt.");

      const payload = validRows.map(
        ({ _rowIndex, _errors, _isDuplicate, ...lead }) => ({
          ...lead,
          owner: user.id,
        })
      );

      const BATCH_SIZE = 300;

      for (let i = 0; i < payload.length; i += BATCH_SIZE) {
        const chunk = payload.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from("leads").insert(chunk);
        if (error) throw error;
      }

      alert(`Import erfolgreich: ${payload.length} Leads wurden angelegt.`);
      setRows([]);
      setFileName(null);
    } catch (err: any) {
      console.error(err);
      setUploadError(err?.message ?? "Fehler beim Upload.");
    } finally {
      setLoading(false);
    }
  }

  // -------------------------------------------------------
  // UI
  // -------------------------------------------------------
  return (
    <div className="pt-16 px-6 pl-40 pr-8 space-y-10 max-w-5xl">
      {/* TABS */}
      <div className="flex items-center gap-6 border-b border-white/10 pb-3">
        <button
          className={`text-sm pb-2 transition ${
            activeTab === "list"
              ? "text-white border-b-2 border-[#B244FF]"
              : "text-white/40 hover:text-white/80"
          }`}
          onClick={() => router.push("/leads")}
        >
          Aktive Leads
        </button>

        <button
          className={`text-sm pb-2 transition ${
            activeTab === "import"
              ? "text-white border-b-2 border-[#B244FF]"
              : "text-white/40 hover:text-white/80"
          }`}
          onClick={() => router.push("/leads/upload")}
        >
          Lead-Import
        </button>
      </div>

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Lead-Import</h1>
          <p className="text-sm text-white/60 mt-1">
            Lade eine CSV oder XLSX-Datei hoch, prüfe die Vorschau und importiere
            nur gültige Leads.
          </p>
        </div>

        <Link href="/leads">
          <OrbitButton>← Zurück</OrbitButton>
        </Link>
      </div>

      {/* DROPZONE */}
      <div className="space-y-3">
        <OrbitDropzone onFileSelect={handleFile} />

        {fileName && (
          <p className="text-xs text-white/50">
            Datei: <span className="font-mono">{fileName}</span>
          </p>
        )}
      </div>

      {/* ERROR */}
      {uploadError && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {uploadError}
        </div>
      )}

      {/* PREVIEW */}
      {rows.length > 0 && (
        <div className="space-y-4 text-white">
          {/* INFO BAR */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="px-3 py-1 rounded-full bg-white/5 text-white/80">
              Gesamt: {rows.length}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300">
              Gültig: {validRows.length}
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300">
              Fehler: {invalidRowsCount}
            </span>
          </div>

          {/* TABELLE */}
          <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20">
            <table className="min-w-full text-sm">
              <thead className="bg-white/5 text-left">
                <tr>
                  <th className="px-3 py-2">Zeile</th>
                  <th className="px-3 py-2">Firma</th>
                  <th className="px-3 py-2">Website</th>
                  <th className="px-3 py-2">E-Mail</th>
                  <th className="px-3 py-2">Branche</th>
                  <th className="px-3 py-2">Region</th>
                  <th className="px-3 py-2">Fehler</th>
                </tr>
              </thead>

              <tbody>
                {paginatedRows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={
                      row._errors.length > 0
                        ? "bg-red-500/5"
                        : "hover:bg-white/5"
                    }
                  >
                    <td className="px-3 py-2 text-xs text-white/50">
                      {row._rowIndex}
                    </td>

                    <td className="px-3 py-2">{safeStr(row.company_name) || "–"}</td>
                    <td className="px-3 py-2">{safeStr(row.website) || "–"}</td>
                    <td className="px-3 py-2">{safeStr(row.email) || "–"}</td>
                    <td className="px-3 py-2">{safeStr(row.industry) || "–"}</td>
                    <td className="px-3 py-2">{safeStr(row.region) || "–"}</td>

                    <td className="px-3 py-2 text-xs">
                      {row._errors.length > 0 ? (
                        <ul className="space-y-1 text-amber-200">
                          {row._errors.map((e, i) => (
                            <li key={i}>• {e}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-emerald-300">OK</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

                {/* Pagination */}
<div className="flex items-center justify-between py-3 text-sm text-white/70">
  <div>
    Seite {page} / {totalPages}
  </div>

  <div className="flex items-center gap-2">
    <button
      onClick={() => setPage((p) => Math.max(1, p - 1))}
      disabled={page === 1}
      className="px-3 py-1 rounded bg-white/10 disabled:opacity-30"
    >
      ← Zurück
    </button>

    <button
      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
      disabled={page === totalPages}
      className="px-3 py-1 rounded bg-white/10 disabled:opacity-30"
    >
      Weiter →
    </button>
  </div>
</div>


          {rows.length > 50 && (
            <p className="text-xs text-white/50">
              Hinweis: Nur die ersten 50 Zeilen werden angezeigt.
            </p>
          )}

          <OrbitButton
            className="mt-2"
            onClick={upload}
            disabled={loading || validRows.length === 0}
          >
            {loading
              ? "Import läuft…"
              : validRows.length === 0
              ? "Keine gültigen Leads"
              : `Import starten (${validRows.length} gültige Leads)`}
          </OrbitButton>
        </div>
      )}
    </div>
  );
}
