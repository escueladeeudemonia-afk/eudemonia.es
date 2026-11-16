# CreaTuVida: anticipada hasta el domingo 21 de febrero de 2027

Confirmación de Fran del **16-nov-2026**. La formación sigue siendo el **5, 6 y 7 de marzo de 2027**. La tarifa anticipada termina el **domingo 21-feb-2027** a las 23:59 (hora de Madrid). El corte es el **lunes 22-feb a las 00:00 Europe/Madrid**, equivalente a **2027-02-21T23:00:00Z**. Horarios, lugar e importes se conservan.

Fran autorizó actualizar la web y Stripe. No se han enviado correos ni operado cobros, clientes, suscripciones o reembolsos.

## Web

Textos de la anticipada actualizados en `src/data/creatuvida.yaml`, `src/pages/index.astro` y `src/pages/la-escuela.astro`. Fundación, Participa y Transparencia ya citaban las fechas de marzo y no el plazo comercial. Se retiró la nota obsoleta del episodio 67 que decía que la web aún mostraba el 26-28 de febrero.

El programador, el workflow y las unidades de systemd pasan al 22-feb. Instalador: `ops/instalar-fin-anticipada-20270222.sh`. La PR #71 (tarifa general) sigue abierta: hay que actualizarla sobre esta base y sincronizar el SHA en el script antes de reinstalar el timer.

## Stripe

Cuenta de la **Fundación Escuela de Eudemonía**, `acct_1UJX36DSZpK2mD7f`. No se usó la cuenta de Apolonio (`acct_1Mkal6Fu6qf1f8E1`), que solo corresponde a Phronesis y a ediciones históricas de CreaTuVida. Producto `prod_VWwNh7gtKVT05T` y los cuatro enlaces vigentes, con importes y URLs conservados.

El detalle de objetos y la verificación están en el seguimiento del repositorio operativo y en las evidencias copiadas al documentar el cambio.
