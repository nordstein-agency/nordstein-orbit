/* --- YouTube Helper --- */
function youtubeToEmbed(url: string) {
  if (!url) return "";
  if (url.includes("youtu.be")) {
    const id = url.split("youtu.be/")[1].split("?")[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (url.includes("watch?v=")) {
    const id = url.split("watch?v=")[1].split("&")[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  return url;
}

interface LessonBlockProps {
  block: any;
}

export default function LessonBlock({ block }: LessonBlockProps) {
  // Text kann entweder ein String oder ein JSON sein
  const textContent =
    typeof block.content === "string"
      ? block.content
      : block.content?.text ?? "";

  if (block.block_type === "text") {
    return (
      <div
        className="
          p-5 rounded-xl
          bg-gradient-to-br from-[#1a0f17] via-black to-[#110811]
          border border-white/10 text-gray-200 text-sm md:text-base leading-relaxed
        "
      >
        {textContent}
      </div>
    );
  }

  if (block.block_type === "video") {
    const youtubeUrl = block.data?.youtube_url || block.content?.youtube_url;
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-black">
        <div className="absolute inset-0 bg-gradient-to-br from-[#d8a5d022] to-transparent pointer-events-none" />
        <iframe
          className="
            w-full rounded-2xl
            h-[260px]
            sm:h-[360px]
            md:h-[460px]
            lg:h-[560px]
            xl:h-[650px]
          "
          src={youtubeToEmbed(youtubeUrl)}
          allowFullScreen
        />
      </div>
    );
  }

  // Fallback
  return (
    <div className="p-4 rounded-xl border border-dashed border-white/20 text-xs text-gray-400">
      Unbekannter Block-Typ: {block.block_type}
    </div>
  );
}
