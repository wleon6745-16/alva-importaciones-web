// Preguntas frecuentes con respuesta REAL (direcciones, horario y curso salen de site-config y de la
// coleccion de cursos; nada se escribe dos veces ni se inventa). Sirven a dos publicos a la vez: la persona
// que las lee en la pagina y los buscadores / asistentes de IA que las leen como FAQPage.
import { getCollection } from "astro:content";
import { siteConfig } from "./site-config";

export interface Faq {
  question: string;
  answer: string;
}

function hoursText(): string {
  return siteConfig.hours.map((h) => `${h.days}: ${h.time}`).join("; ");
}

export function businessFaqs(): Faq[] {
  const [alt1, alt2] = siteConfig.alternateNames;
  return [
    {
      question: "¿Alva Importaciones, Alva Import y AlvaImport son lo mismo?",
      answer: `Sí. ${siteConfig.name} también se escribe y se busca como ${alt1} o ${alt2}: es la misma importadora de belleza de Portoviejo, Manabí, Ecuador, con los mismos locales y el mismo WhatsApp.`,
    },
    {
      question: "¿Qué vende Alva Importaciones?",
      answer:
        "Muebles para salón de belleza (camillas, sillones de peluquería y barbería, butacas y mesas de trabajo), insumos de uñas, productos capilares y maquillaje. También dicta un curso profesional de uñas en Portoviejo.",
    },
    {
      question: "¿Dónde están los locales de Alva Importaciones en Portoviejo?",
      answer: siteConfig.locations.map((l) => `${l.name}: ${l.address}`).join(". ") + ".",
    },
    {
      question: "¿Cuál es el horario de atención?",
      answer: `${hoursText()}.`,
    },
    {
      question: "¿Cómo compro o consulto un precio?",
      answer:
        "Escríbenos por WhatsApp con el nombre o el código del producto y te confirmamos precio y disponibilidad al instante. El sitio no tiene carrito de compra: la venta se coordina con una asesora por WhatsApp o en cualquiera de los locales.",
    },
  ];
}

/** Preguntas del curso de uñas, con los datos de la coleccion `cursos` (misma fuente que la pagina /cursos). */
export async function courseFaqs(): Promise<Faq[]> {
  const [curso] = await getCollection("cursos");
  if (!curso) return [];
  const h = (label: string) => curso.data.highlights.find((x) => x.label === label)?.value;
  const duracion = h("Duración");
  const inversion = h("Inversión");
  const matricula = h("Matrícula");
  const horario = h("Horario");
  const facts = [
    duracion && `Dura ${duracion}`,
    inversion && `la inversión es ${inversion}`,
    matricula && `la matrícula es ${matricula}`,
    horario && `el horario: ${horario.charAt(0).toLowerCase()}${horario.slice(1)}`,
  ].filter(Boolean) as string[];
  return [
    {
      question: "¿Hay un curso de uñas en Portoviejo?",
      answer: `Sí. ${siteConfig.name} (${siteConfig.alternateNames[0]}) dicta el ${curso.data.title.toLowerCase()} en Portoviejo, de forma presencial.${facts.length ? ` ${facts.join("; ")}.` : ""}`,
    },
    {
      question: "¿Cómo me inscribo al curso de uñas?",
      answer: "Escríbenos por WhatsApp para reservar tu cupo: una asesora te confirma los cupos disponibles y los pasos de inscripción.",
    },
  ];
}
