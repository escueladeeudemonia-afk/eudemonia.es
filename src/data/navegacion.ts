export type EnlaceNav = {
  label: string;
  href: string;
  nota: string;
};

export type GrupoNav = {
  label: string;
  enlaces: EnlaceNav[];
};

/** Menú compartido por la cabecera y el pie. El logo sigue enlazando al inicio. */
export const navegacion: GrupoNav[] = [
  {
    label: "La Fundación",
    enlaces: [
      { label: "La Fundación", href: "/fundacion", nota: "Qué es y quiénes somos" },
      { label: "Transparencia", href: "/transparencia", nota: "Programas, precios y cuentas" },
      { label: "Participa", href: "/participa", nota: "Cómo colaborar" },
    ],
  },
  {
    label: "Programas",
    enlaces: [
      { label: "CreaTuVida", href: "/creatuvida", nota: "Presencial, de pago" },
      { label: "La Escuela", href: "/la-escuela", nota: "Se entra por CreaTuVida" },
      { label: "Organizaciones", href: "/organizaciones", nota: "Se contrata a medida" },
    ],
  },
  {
    label: "Contenido",
    enlaces: [
      { label: "Podcast", href: "/podcast", nota: "Gratuito" },
      { label: "Epístolas", href: "/epistolas", nota: "Gratuito" },
    ],
  },
  {
    label: "Empieza",
    enlaces: [
      { label: "Eude-Score", href: "/test", nota: "Test gratuito, 3 minutos" },
      { label: "El libro", href: "/libro", nota: "Regalo al suscribirte" },
      { label: "Estoicismo", href: "/estoicismo", nota: "Audio gratuito" },
    ],
  },
];

export function rutaActiva(pathname: string, href: string) {
  const actual = pathname.replace(/\/$/, "") || "/";
  const destino = href.replace(/\/$/, "") || "/";
  return actual === destino || (destino !== "/" && actual.startsWith(destino));
}
