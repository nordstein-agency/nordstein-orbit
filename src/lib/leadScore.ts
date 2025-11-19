import type { Lead } from "@/types/lead";

export function scoreLead(lead: Lead) {
  let industryScore = 0;
  let regionScore = 0;
  let signalsScore = 0;
  let ceoScore = 0;
  let manualScore = lead.manual_score ?? 0;

  // 1. Industry Score
  const goodIndustries = ["IT", "Software", "Finanzen", "Coaching", "Marketing"];
  if (lead.industry && goodIndustries.includes(lead.industry)) {
    industryScore = 30;
  }

  // 2. Region Score
  const topRegions = ["DACH", "DE", "AT", "CH"];
  if (lead.region && topRegions.includes(lead.region)) {
    regionScore = 10;
  }

  // 3. Signals Score
  if (lead.signals) {
    if (lead.signals.website_quality === "high") signalsScore += 20;
    if (lead.signals.social_presence === "strong") signalsScore += 10;
    if (lead.signals.tech_stack?.length > 2) signalsScore += 10;
  }

  // 4. CEO Score
  if (lead.ceo) {
    if (lead.socials?.linkedin) ceoScore += 5;
    if (lead.socials?.instagram) ceoScore += 5;
  }

  // SUMME
  const total = industryScore + regionScore + signalsScore + ceoScore + manualScore;

  return {
    total,
    breakdown: {
      industry: industryScore,
      region: regionScore,
      signals: signalsScore,
      ceo: ceoScore,
      manual: manualScore,
    },
  };
}
