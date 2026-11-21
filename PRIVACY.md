# Política de privacidad de la extensión Kaplai

Última actualización: 21 de noviembre de 2026.

La extensión Kaplai revisa el sitio que estás visitando y te avisa si parece peligroso. Para
eso necesita preguntarle al servidor de Kaplai por cada sitio. Esto es todo lo que pasa con
esos datos.

## Qué se envía

- **Sólo el origen de cada página:** el esquema, el dominio y el puerto, por ejemplo
  `https://sitio.com`. **Nunca** la ruta, lo que buscás, los parámetros ni nada del
  contenido de la página.
- **Sólo al servidor de Kaplai.** Ningún tercero recibe los sitios que visitás. La lista de
  sitios maliciosos (URLhaus) la descarga el servidor y la compara internamente: URLhaus
  nunca ve qué sitio se consultó ni quién lo consultó.

## Qué no se envía

- Las páginas locales: `localhost` y las direcciones de redes privadas (como la de tu
  router) no salen de tu navegador.
- Las páginas internas del navegador (`chrome://`, pestañas nuevas) y los archivos locales.
- Ningún dato de tu cuenta: la extensión no pide iniciar sesión.

## Qué se guarda

- **En el servidor, nada.** El sitio consultado no se guarda, y como viaja en el cuerpo
  del pedido y no en la dirección, tampoco queda en los registros de acceso. Para limitar
  el abuso, el servidor cuenta cuántos pedidos llegan de cada dirección IP durante un
  minuto, sin asociarlos a ningún sitio.
- **En tu navegador**, la respuesta de cada sitio durante 10 minutos, para no preguntar
  dos veces lo mismo. Se borra al cerrar el navegador.

## Permisos

- **Historial de navegación** (`webNavigation`): para enterarse de qué sitio abrís en cada
  pestaña. Chrome lo muestra al instalar como "Leer tu historial de navegación". La
  extensión no lee tu historial guardado: sólo ve la página que se abre en el momento.
- **Almacenamiento** (`storage`): para la caché de 10 minutos.

## Contacto

Kaplai es un proyecto final de la Universidad Argentina de la Empresa (UADE). Consultas:
<luchicapello@hotmail.com>.
