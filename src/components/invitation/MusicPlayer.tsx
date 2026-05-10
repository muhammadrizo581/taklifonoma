import { useEffect, useRef, useState } from "react";
import { Music, Pause } from "lucide-react";

export default function MusicPlayer({ src }: { src: string }) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const a = ref.current; if (!a) return;
    a.volume = 0.4;
    const tryPlay = () => { a.play().then(() => setPlaying(true)).catch(() => {}); };
    const onInteract = () => { tryPlay(); window.removeEventListener("click", onInteract); };
    tryPlay();
    window.addEventListener("click", onInteract, { once: true });
    return () => window.removeEventListener("click", onInteract);
  }, [src]);

  function toggle() {
    const a = ref.current; if (!a) return;
    if (a.paused) { a.play(); setPlaying(true); } else { a.pause(); setPlaying(false); }
  }

  return (
    <>
      <audio ref={ref} src={src} loop />
      <button onClick={toggle}
        className="fixed top-4 left-4 z-30 size-11 rounded-full bg-card/90 backdrop-blur border border-accent/30 grid place-items-center shadow-soft hover:scale-110 transition">
        {playing ? <Pause className="size-4" /> : <Music className="size-4" />}
      </button>
    </>
  );
}
