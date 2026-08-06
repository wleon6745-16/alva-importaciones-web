import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

interface Testimonial {
  name: string;
  role: string;
  quote: string;
}

// TODO: reemplazar por testimonios reales de clientes cuando estén disponibles
const testimonials: Testimonial[] = [
  {
    name: "Estudiante del curso de uñas",
    role: "Curso Profesional de Uñas Acrílicas",
    quote:
      "Aprendí desde cero y hoy tengo mis propias clientas. Las asesoras siempre están pendientes de resolver dudas.",
  },
  {
    name: "Clienta frecuente",
    role: "Compra por WhatsApp",
    quote:
      "Pregunto por WhatsApp y me responden al instante con el precio y si hay stock. Ya no pierdo tiempo yendo sin saber.",
  },
  {
    name: "Profesional de uñas",
    role: "Compra al por mayor",
    quote: "Tienen las marcas que necesito para mi negocio y buenos precios al por mayor.",
  },
];

export default function TestimonialCarousel() {
  const [index, setIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const current = testimonials[index];

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center">
      <div className="relative h-40 w-full">
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={index}
            initial={prefersReducedMotion ? {} : { opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, x: -24 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex flex-col justify-center gap-3"
          >
            <p className="font-display text-lg text-ink">“{current.quote}”</p>
            <footer className="text-sm text-ink-muted">
              {current.name} · {current.role}
            </footer>
          </motion.blockquote>
        </AnimatePresence>
      </div>

      <div className="flex gap-2">
        {testimonials.map((_, i) => (
          <button
            key={i}
            aria-label={`Ver testimonio ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              i === index ? "bg-primary-800" : "bg-blush-100"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
