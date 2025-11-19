import Papa from "papaparse";
import * as XLSX from "xlsx";

export async function parseLeadFile(file: File): Promise<any[]> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  if (ext === "csv") {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: Papa.ParseResult<any>) => resolve(results.data)
      });
    });
  }

  if (ext === "xlsx") {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet);
  }

  throw new Error("Unsupported file format");
}

export function mapToLead(input: any) {
  const normalized = Object.fromEntries(
    Object.entries(input).map(([k, v]) => [k.toLowerCase().trim(), v])
  );

  return {
    company_name:
      normalized["company_name"] ||
      normalized["company"] ||
      normalized["firma"] ||
      normalized["unternehmensname"] ||
      normalized["name"] ||
      null,

    website:
      normalized["website"] ||
      normalized["webseite"] ||
      normalized["homepage"] ||
      normalized["url"] ||
      null,

    email:
      normalized["email"] ||
      normalized["e-mail"] ||
      normalized["mail"] ||
      normalized["kontakt"] ||
      null,

    industry:
      normalized["industry"] ||
      normalized["branche"] ||
      null,

    region:
      normalized["region"] ||
      normalized["land"] ||
      normalized["country"] ||
      null,

    address:
      normalized["adresse"] ||
      normalized["address"] ||
      null,

    phone:
      normalized["telefon"] ||
      normalized["phone"] ||
      null,

    ceo:
      normalized["ceo"] ||
      normalized["inhaber"] ||
      normalized["geschäftsführer"] ||
      null,

    socials: {
      linkedin: normalized["linkedin"] || null,
      instagram: normalized["instagram"] || null,
      facebook: normalized["facebook"] || null,
    },

    signals: {},

    status: "new",

    score: 0,
  };
}

