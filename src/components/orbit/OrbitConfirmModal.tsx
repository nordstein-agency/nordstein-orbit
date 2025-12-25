"use client";

import OrbitModal from "@/components/orbit/OrbitModal";
import OrbitButton from "@/components/orbit/OrbitButton";

interface OrbitConfirmModalProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function OrbitConfirmModal({
  open,
  title = "Aktion bestätigen",
  description = "Möchtest du diese Aktion wirklich durchführen?",
  confirmLabel = "Bestätigen",
  cancelLabel = "Abbrechen",
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}: OrbitConfirmModalProps) {
  return (
    <OrbitModal open={open} onClose={onCancel}>
      <p className="text-[11px] font-semibold tracking-[0.2em] text-[#d8a5d0] uppercase mb-1">
        Bestätigung erforderlich
      </p>

      <h2 className="text-xl font-bold mb-3">{title}</h2>

      <p className="text-sm text-white/70 mb-6 leading-relaxed">
        {description}
      </p>

      <div className="flex justify-end gap-2">
        <OrbitButton
          className="px-4 py-2 text-xs bg-white/5 border border-white/15 rounded-full hover:bg-white/10"
          onClick={onCancel}
          disabled={loading}
        >
          {cancelLabel}
        </OrbitButton>

        <OrbitButton
          className={`
            px-5 py-2 text-xs font-semibold rounded-full
            ${
              danger
                ? "bg-red-500/20 border border-red-400/40 text-red-200 hover:bg-red-500/30"
                : "bg-gradient-to-r from-[#d8a5d0] to-[#ad6ac3] text-black hover:shadow-[0_0_18px_#d8a5d077]"
            }
          `}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Bitte warten…" : confirmLabel}
        </OrbitButton>
      </div>
    </OrbitModal>
  );
}
