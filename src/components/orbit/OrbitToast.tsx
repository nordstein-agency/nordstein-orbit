"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Toast = {
  id: number;
  message: string;
  type?: "success" | "error" | "info";
};

type ToastContextType = {
  addToast: (msg: string, type?: Toast["type"]) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <OrbitToastProvider>");
  return ctx;
}

export function OrbitToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function addToast(message: string, type?: Toast["type"]) {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 space-y-3 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`
              px-5 py-3 rounded-xl text-white shadow-xl backdrop-blur-md border
              ${t.type === "error" ? "bg-red-600/80 border-red-400/40" : ""}
              ${t.type === "success" ? "bg-green-600/80 border-green-400/40" : ""}
              ${t.type === "info" || !t.type ? "bg-white/10 border-white/20" : ""}
            `}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
