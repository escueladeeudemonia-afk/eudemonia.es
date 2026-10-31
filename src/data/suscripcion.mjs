// MailerLite nuevo: cuenta Apolonio 2756175. IDs públicos verificados el 31-oct-2026.
// El ID de alta es distinto del ID del DOM y del callback (grootId).
export const mailerliteAccountId = "2756175";
export const mailerliteScript = "https://groot.mailerlite.com/js/w/webforms.min.js?v83147fa8ce2d95cb73ece7f28b469519";
export const mailerliteFormAction = (formId) =>
  `https://dashboard.mailerlite.com/jsonp/${mailerliteAccountId}/forms/${formId}/subscribe`;

export const formulariosMailerLite = {
  libro: { formId: "202778184196818343", grootId: "47845308" },
  estoicismo: { formId: "202778185704670640", grootId: "47845312" },
  epistolas: { formId: "202778189574964505", grootId: "47845314" },
};
export const suscripcionEpistolas = {
  ...formulariosMailerLite.epistolas,
  redirectUrl: "https://eudemonia.es/gracias/",
};
