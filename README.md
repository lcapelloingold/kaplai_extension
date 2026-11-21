# Kaplai — extensión de navegador

Revisa el sitio de cada página que abrís y te avisa si parece peligroso. Es un chequeo
rápido, pensado para no frenar la navegación: no ejecuta nada ni visita el sitio. Para
analizar un archivo o una URL a fondo está la plataforma Kaplai.

| Ícono | Qué significa |
|---|---|
| `!` rojo | **Peligrosa:** el sitio figura en URLhaus como distribuidor de malware. |
| `?` ámbar | **Sospechosa:** su dirección tiene señales comunes en sitios engañosos (una IP en lugar de un nombre, caracteres que imitan a otros, muchos subdominios, un acortador). |
| nada | **Sin detecciones** o no se pudo revisar. El popup dice cuál de las dos. |

**Nunca dice "seguro":** que no encuentre nada no prueba que el sitio lo sea. Y **no
bloquea**: sólo avisa.

Chrome (Manifest V3); el mismo código anda en Edge. JavaScript plano, sin dependencias
ni compilación.

## Cómo funciona

En cada navegación, `background.js` manda **sólo el origen** (`https://sitio.com`) a
`POST /api/analysis/url-check/` del back de Kaplai (`kaplai_backend`), que contesta con las
heurísticas del análisis de URLs y la lista de URLhaus. La respuesta se guarda 10 minutos por
origen y se pinta en el badge de esa pestaña. `localhost` y las direcciones privadas no se
mandan. Qué se envía y qué no está en [`PRIVACY.md`](PRIVACY.md).

| Archivo | Qué hace |
|---|---|
| `check.js` | Qué se revisa y qué nivel es. Sin APIs de Chrome, para poder testearlo |
| `background.js` | El service worker: escucha las navegaciones, consulta y pone el badge |
| `popup.html`, `popup.js` | El resultado de la pestaña activa |

## Probarla

1. En Chrome, abrir `chrome://extensions` y prender **Modo de desarrollador**.
2. **Cargar descomprimida** y elegir esta carpeta.
3. Después de cada cambio, el botón de recargar de la tarjeta de Kaplai.

Las pestañas que ya estaban abiertas al instalarla no se revisan hasta recargarlas.

**Contra el back local:** cambiar `API_URL` en `background.js` a
`http://localhost:8000/api/analysis/url-check/` y levantar el back con `runserver`. Sin
lista, ningún sitio sale peligroso. Para probar el `!` rojo, crear un archivo con un host por
línea (por ejemplo `example.com`) y poner su ruta en `ANALYSIS_URL_BLOCKLIST_PATH`, en el
`.env` del back.

**Tests:**

```bash
node --test
```

## Publicarla en la Chrome Web Store

Lo que falta, y lo hace el dueño de la cuenta:

- una cuenta de desarrollador (USD 5, un solo pago);
- una URL pública para `PRIVACY.md` (sirve el archivo en GitHub si el repo es público, o
  una página del front);
- en "Prácticas de privacidad", declarar **historial web** y explicar el propósito único:
  avisar si el sitio visitado parece peligroso;
- capturas del popup, y la ficha en español;
- si se quiere, sacar `http://localhost:8000/*` de `host_permissions`: sólo sirve para
  desarrollo.

**Antes de publicar, la lista de URLhaus tiene que estar andando en producción** (ver
`docs/deploy-aws.md` del back). Sin ella, la extensión nunca dice "peligrosa".
