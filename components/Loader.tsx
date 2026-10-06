import { AiOutlineLoading3Quarters } from "react-icons/ai";

export default function Loader({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-4 bg-white/70 backdrop-blur-md"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <AiOutlineLoading3Quarters
        className="animate-spin text-brand"
        size={38}
        aria-hidden="true"
      />
      <span className="text-xs font-semibold tracking-wide text-ink">
        {label}
      </span>
    </div>
  );
}
