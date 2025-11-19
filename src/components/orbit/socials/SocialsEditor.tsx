"use client";

import OrbitInput from "@/components/orbit/OrbitInput";

type Socials = Record<string, string>;

interface SocialsEditorProps {
  value: Socials;
  onChange: (value: Socials) => void;
}

export default function SocialsEditor({ value, onChange }: SocialsEditorProps) {
  const socials = value ?? {};

  function update(field: string, v: string) {
    onChange({
      ...socials,
      [field]: v,
    });
  }

  return (
    <div className="space-y-6">
      <OrbitInput
        label="LinkedIn"
        value={socials.linkedin ?? ""}
        onChange={(v: string) => update("linkedin", v)}
      />

      <OrbitInput
        label="Instagram"
        value={socials.instagram ?? ""}
        onChange={(v: string) => update("instagram", v)}
      />

      <OrbitInput
        label="X / Twitter"
        value={socials.twitter ?? ""}
        onChange={(v: string) => update("twitter", v)}
      />

      <OrbitInput
        label="TikTok"
        value={socials.tiktok ?? ""}
        onChange={(v: string) => update("tiktok", v)}
      />

      <OrbitInput
        label="YouTube"
        value={socials.youtube ?? ""}
        onChange={(v: string) => update("youtube", v)}
      />
    </div>
  );
}
