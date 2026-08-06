import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";

interface ChatMessage {
  from: "customer" | "bot";
  text: string;
}

const conversation: ChatMessage[] = [
  { from: "customer", text: "Hola! ¿Tienen monómero Master Nails de 16oz?" },
  { from: "bot", text: "¡Hola! Sí, tenemos disponible 🙌 El precio es $18.50 y hay stock en nuestro local." },
  { from: "customer", text: "Perfecto, ¿y el esmalte gel Mia Secret rojo?" },
  {
    from: "bot",
    text: "Ese color se agotó, pero tenemos alternativas muy similares en stock. ¿Te muestro opciones?",
  },
];

export default function ChatDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const prefersReducedMotion = useReducedMotion();
  const [visibleCount, setVisibleCount] = useState(prefersReducedMotion ? conversation.length : 0);

  useEffect(() => {
    if (!isInView || prefersReducedMotion) return;

    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setVisibleCount(index);
      if (index >= conversation.length) clearInterval(interval);
    }, 1100);

    return () => clearInterval(interval);
  }, [isInView, prefersReducedMotion]);

  return (
    <div
      ref={ref}
      className="glass-card mx-auto flex w-full max-w-sm flex-col gap-3 rounded-3xl p-5 shadow-xl"
    >
      <div className="flex items-center gap-2 border-b border-blush-100 pb-3">
        <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
        <p className="text-sm font-semibold text-ink">Alva Importaciones · en línea</p>
      </div>

      <div className="flex min-h-[220px] flex-col gap-2">
        {conversation.slice(0, visibleCount).map((message, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
              message.from === "bot"
                ? "self-start bg-white text-ink shadow-sm"
                : "self-end bg-primary-800 text-white"
            }`}
          >
            {message.text}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
