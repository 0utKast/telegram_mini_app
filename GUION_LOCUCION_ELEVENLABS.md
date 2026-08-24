# Guion de Locución para ElevenLabs: Creación de Telegram Mini Apps desde Cero

> **Instrucciones para la locución con ElevenLabs:**
> - El texto entre corchetes `[EN PANTALLA: ...]` indica los apoyos visuales, esquemas, código o infografías que acompañan al audio.
> - Las marcas `[PAUSA CORTA]` o `[PAUSA]` ayudan a modular el ritmo y respiración de la voz sintética para lograr un acabado humano y natural.
> - Al final de este documento se incluye una versión de **"Solo Texto Limpio"** lista para copiar y pegar directamente en la caja de texto de ElevenLabs.

---

## GUION CON INDICACIONES VISUALES Y DE RITMO

### BLOQUE 1: INTRODUCCIÓN Y LA REVOLUCIÓN DE LAS TELEGRAM MINI APPS

[EN PANTALLA: Título principal con animación y logotipo de Telegram "Aprende a Crear Telegram Mini Apps desde Cero". Infografía comparativa: App Store tradicional vs. Telegram Mini App]

¿Te imaginas poder lanzar una aplicación completa que tus usuarios puedan abrir al instante, sin tener que descargar decenas de megabytes de una tienda de aplicaciones, sin formularios de registro y funcionando exactamente igual en un iPhone, un teléfono Android o en un ordenador? [PAUSA CORTA]

Esto no es el futuro, es lo que hoy conocemos como las **Telegram Mini Apps**.

Durante años, crear una aplicación móvil significaba lidiar con procesos largos y tediosos: programar versiones separadas para iOS y Android, esperar días a que las tiendas aprueben cada actualización y convencer a los usuarios de instalar otra app más en su teléfono saturado.

Las Mini Apps de Telegram rompen radicalmente con esta barrera. En esencia, son aplicaciones web modernas construidas con tecnologías estándar como HTML, CSS y JavaScript, que se ejecutan dentro de la propia plataforma de Telegram a través de un WebView integrado y enriquecido. 

[EN PANTALLA: Mostrar ventajas clave en tarjetas animadas: 0 segundos de descarga, Autenticación automática, 100% Multiplataforma, Pagos nativos]

Esto significa que cuando un usuario pulsa un botón en un chat, la aplicación se abre en cero segundos. Además, Telegram le proporciona a tu servidor la identidad del usuario de forma totalmente segura y verificada. Sin contraseñas, sin registros y con actualizaciones instantáneas cada vez que modificas tu código.

A lo largo de este tutorial vamos a entender su arquitectura, cómo funciona su seguridad criptográfica y construiremos paso a paso una aplicación real y funcional: un sistema completo de catálogo de servicios y reservas con backend en Node.js, base de datos SQLite y confirmaciones automáticas enviadas por un bot.

---

### BLOQUE 2: ARQUITECTURA Y TECNOLOGÍAS CLAVE

[EN PANTALLA: Esquema animado de la arquitectura cliente-servidor mostrando las 4 capas conectadas]

Para entender cómo funciona una Mini App, debemos visualizar cuatro componentes principales que trabajan en perfecta sintonía.

En primer lugar, tenemos el **Frontend**. Es la interfaz visual con la que interactúa el usuario. Al ser una aplicación web, puedes utilizar cualquier tecnología que domines: desde JavaScript estándar con CSS hasta frameworks modernos como React, Vue o Tailwind. Para que esta web se comunique con Telegram, simplemente incluimos el archivo oficial del SDK de Telegram WebApp.

En segundo lugar, encontramos el **Cliente de Telegram**. Es el entorno que hospeda nuestra web. No se limita a mostrar la página; le proporciona acceso a funciones del dispositivo como la vibración háptica, la adaptación a los colores del tema y los botones nativos del sistema.

En tercer lugar, está nuestro **Servidor Backend**. Es el cerebro de la aplicación. En nuestro caso utilizaremos Node.js con Express. Su labor es servir la API, gestionar la lógica de negocio y, lo más importante, verificar la autenticidad de cada usuario mediante criptografía antes de guardar cualquier información.

[EN PANTALLA: Destacar la base de datos SQLite y el flujo de mensajes con la Telegram Bot API]

Y en cuarto lugar, tenemos la **Base de Datos y el Bot de Telegram**. La base de datos, en este proyecto SQLite, almacena de forma persistente nuestro catálogo y las reservas realizadas. El bot actúa como anfitrión y canal de comunicación, enviando recibos interactivos y mensajes directamente al chat del usuario.

---

### BLOQUE 3: EL TELEGRAM WEBAPP SDK EN PROFUNDIDAD

[EN PANTALLA: Captura de pantalla de la Mini App alternando automáticamente entre modo claro y modo oscuro]

La gran diferencia entre una página web convencional y una Mini App reside en el **SDK de Telegram**. Este SDK actúa como un puente directo entre nuestro código JavaScript y el sistema operativo.

Veamos sus funciones más importantes:

Primero, el ciclo de vida. Al cargar la página ejecutamos dos instrucciones fundamentales: `Telegram.WebApp.ready()`, que le comunica a Telegram que la interfaz está lista para mostrarse, y `Telegram.WebApp.expand()`, que abre la app a pantalla completa aprovechando todo el espacio visual.

Segundo, la adaptación visual inteligente. Telegram inyecta variables CSS nativas con la paleta de colores del usuario. Si el usuario utiliza Telegram en modo oscuro, nuestra aplicación se vuelve oscura de forma automática; si cambia a modo claro, la interfaz se adapta al instante. Esto ofrece una experiencia visual idéntica a la de una aplicación nativa.

[EN PANTALLA: Primer plano del botón inferior nativo (MainButton) activándose al elegir un servicio]

Tercero, los componentes nativos. En lugar de crear botones flotantes dentro del HTML que puedan tapar contenido, el SDK nos ofrece el **MainButton**: un botón integrado en la parte inferior de la pantalla del teléfono que podemos personalizar con texto, colores y animaciones de carga. También disponemos del **BackButton**, que permite retroceder entre pantallas de manera natural.

Y cuarto, la **retroalimentación háptica**. Mediante una simple línea de código podemos hacer que el teléfono vibre sutilmente cuando el usuario pulsa un botón, selecciona una categoría o confirma un pedido, generando una sensación táctil de alta calidad.

---

### BLOQUE 4: SEGURIDAD Y AUTENTICACIÓN CRIPTOGRÁFICA

[EN PANTALLA: Infografía de seguridad: Cadena initData -> Algoritmo HMAC-SHA256 -> Validación segura en el Servidor]

Llegamos a uno de los puntos más cruciales: ¿cómo sabemos quién está utilizando la aplicación sin pedirle que inicie sesión? [PAUSA]

Cuando el usuario abre la Mini App, Telegram genera una cadena de texto firmada llamada **initData**. Esta cadena contiene el identificador único del usuario, su nombre, su nombre de usuario y una marca de tiempo, acompañados de una firma digital llamada **hash**.

Aquí existe una regla de oro en ciberseguridad: **nunca debemos confiar ciegamente en los datos que envía el navegador**. Un usuario malintencionado podría intentar modificar su identificador para suplantar a otra persona.

Por eso, la validación se realiza en nuestro servidor mediante el algoritmo criptográfico **HMAC-SHA256**. 

[EN PANTALLA: Fragmento de código de validación en server/auth.js resaltando las funciones criptográficas]

El proceso es elegante y seguro:
Primero, el servidor toma todos los datos recibidos excepto el hash y los ordena alfabéticamente.
Segundo, genera una clave secreta combinando la palabra clave de Telegram con el Token privado de nuestro bot.
Tercero, calcula un nuevo hash con esa clave.
Y cuarto, compara de forma segura el hash calculado con el hash que envió Telegram.

Si coinciden con exactitud matemática, tenemos la certeza absoluta de que los datos son auténticos y fueron emitidos por los servidores oficiales de Telegram.

---

### BLOQUE 5: DESGLOSE DE NUESTRA APLICACIÓN "DEVSTUDIO"

[EN PANTALLA: Recorrido visual por la estructura de carpetas del proyecto y la interfaz de la Mini App]

Para poner en práctica todos estos conceptos, hemos desarrollado **DevStudio**: un sistema completo de catálogo de servicios y reservas para profesionales del desarrollo web.

Analicemos cómo está estructurado el proyecto:

En la carpeta del cliente encontramos un archivo HTML semántico y responsivo organizado en tres vistas principales: el catálogo de servicios, el formulario interactivo de reserva y el historial de pedidos.

Los estilos en CSS están vinculados directamente a las variables del tema de Telegram, complementados con un diseño limpio, tarjetas modernas y microanimaciones fluidas.

[EN PANTALLA: Demostración del "Modo Simulador de Navegador" en acción en Chrome/Safari]

Un detalle clave que hemos incorporado en el archivo JavaScript del cliente es el **Modo Simulador**. Cuando abres la aplicación directamente en tu navegador habitual fuera de Telegram, aparece una barra superior de desarrollo que te permite cambiar entre usuarios de prueba y alternar el tema claro y oscuro. De este modo, puedes programar y depurar toda la interfaz a gran velocidad sin necesidad de abrir Telegram a cada instante.

En el backend, nuestro servidor Express gestiona las rutas de la API, ejecuta la verificación criptográfica y utiliza SQLite para registrar las reservas en la base de datos local con máxima velocidad y cero configuración compleja.

Además, cuando el usuario pulsa el botón de confirmar reserva, el módulo del bot redacta de forma automática un recibo detallado con formato HTML y se lo entrega directamente en su chat privado.

---

### BLOQUE 6: INSTALACIÓN, CONFIGURACIÓN Y PUESTA EN MARCHA

[EN PANTALLA: Demostración en vídeo paso a paso: BotFather -> Token en .env -> Terminal -> Telegram Web]

Veamos ahora los pasos exactos para configurar y desplegar la aplicación desde cero:

**Paso número uno:** Accedemos a Telegram en nuestro navegador web entrando en `web.telegram.org` e iniciamos sesión con nuestro número de teléfono.

**Paso número dos:** Buscamos al bot oficial de Telegram llamado **BotFather**, identificado con el tick azul de verificación. Escribimos la instrucción `/newbot`, le asignamos un nombre visible y un nombre de usuario que termine en la palabra "bot". BotFather nos responderá con el **Token de la API**, que es la clave secreta de nuestro bot.

**Paso número tres:** Abrimos el archivo de configuración `.env` en la raíz de nuestro proyecto y pegamos el token en la variable `TELEGRAM_BOT_TOKEN`.

[EN PANTALLA: Consola ejecutando npm start y mostrando la URL generada por Cloudflare Tunnel]

**Paso número cuatro:** Telegram exige por seguridad que todas las Mini Apps se ejecuten bajo una conexión cifrada **HTTPS**. Para conectar nuestro servidor local sin costes ni servidores externos, ejecutamos el comando `npm start`. Nuestro script utiliza **Cloudflare Quick Tunnels** para generar una dirección HTTPS pública y estable, configurando automáticamente el botón del menú de Telegram a través de la API.

**Paso número cinco:** Abrimos el chat de nuestro bot en Telegram, pulsamos el botón del menú inferior o el comando de inicio, y nuestra Mini App se desplegará al instante en pantalla completa, lista para recibir reservas en tiempo real.

---

### BLOQUE 7: CONCLUSIÓN Y SIGUIENTES PASOS

[EN PANTALLA: Resumen final de logros y texto de despedida con enlaces al repositorio y recursos]

Como hemos visto, las Telegram Mini Apps representan una de las oportunidades más potentes en el desarrollo moderno de software. Combinan la agilidad y libertad de la web con el alcance, la seguridad y la experiencia inmersiva de las aplicaciones nativas.

A partir de esta base puedes escalar tu proyecto añadiendo pagos directos con **Telegram Stars**, integrando bases de datos en la nube como PostgreSQL y desplegando tu servidor en plataformas como Vercel o Railway.

Tienes todo el código fuente organizado y documentado en el proyecto. ¡Ahora es tu turno de crear tu propia Mini App y llevar tus ideas a millones de usuarios en Telegram!

---

## VERSIÓN SOLO TEXTO LIMPIO (LISTA PARA COPIAR EN ELEVENLABS)

```text
¿Te imaginas poder lanzar una aplicación completa que tus usuarios puedan abrir al instante, sin tener que descargar decenas de megabytes de una tienda de aplicaciones, sin formularios de registro y funcionando exactamente igual en un iPhone, un teléfono Android o en un ordenador?

Esto no es el futuro, es lo que hoy conocemos como las Telegram Mini Apps.

Durante años, crear una aplicación móvil significaba lidiar con procesos largos y tediosos: programar versiones separadas para iOS y Android, esperar días a que las tiendas aprueben cada actualización y convencer a los usuarios de instalar otra app más en su teléfono saturado.

Las Mini Apps de Telegram rompen radicalmente con esta barrera. En esencia, son aplicaciones web modernas construidas con tecnologías estándar como HTML, CSS y JavaScript, que se ejecutan dentro de la propia plataforma de Telegram a través de un WebView integrado y enriquecido.

Esto significa que cuando un usuario pulsa un botón en un chat, la aplicación se abre en cero segundos. Además, Telegram le proporciona a tu servidor la identidad del usuario de forma totalmente segura y verificada. Sin contraseñas, sin registros y con actualizaciones instantáneas cada vez que modificas tu código.

A lo largo de este tutorial vamos a entender su arquitectura, cómo funciona su seguridad criptográfica y construiremos paso a paso una aplicación real y funcional: un sistema completo de catálogo de servicios y reservas con backend en Node.js, base de datos SQLite y confirmaciones automáticas enviadas por un bot.

Para entender cómo funciona una Mini App, debemos visualizar cuatro componentes principales que trabajan en perfecta sintonía.

En primer lugar, tenemos el Frontend. Es la interfaz visual con la que interactúa el usuario. Al ser una aplicación web, puedes utilizar cualquier tecnología que domines: desde JavaScript estándar con CSS hasta frameworks modernos como React, Vue o Tailwind. Para que esta web se comunique con Telegram, simplemente incluimos el archivo oficial del SDK de Telegram WebApp.

En segundo lugar, encontramos el Cliente de Telegram. Es el entorno que hospeda nuestra web. No se limita a mostrar la página; le proporciona acceso a funciones del dispositivo como la vibración háptica, la adaptación a los colores del tema y los botones nativos del sistema.

En tercer lugar, está nuestro Servidor Backend. Es el cerebro de la aplicación. En nuestro caso utilizaremos Node.js con Express. Su labor es servir la API, gestionar la lógica de negocio y, lo más importante, verificar la autenticidad de cada usuario mediante criptografía antes de guardar cualquier información.

Y en cuarto lugar, tenemos la Base de Datos y el Bot de Telegram. La base de datos, en este proyecto SQLite, almacena de forma persistente nuestro catálogo y las reservas realizadas. El bot actúa como anfitrión y canal de comunicación, enviando recibos interactivos y mensajes directamente al chat del usuario.

La gran diferencia entre una página web convencional y una Mini App reside en el SDK de Telegram. Este SDK actúa como un puente directo entre nuestro código JavaScript y el sistema operativo.

Veamos sus funciones más importantes:

Primero, el ciclo de vida. Al cargar la página ejecutamos dos instrucciones fundamentales: Telegram WebApp ready, que le comunica a Telegram que la interfaz está lista para mostrarse, y Telegram WebApp expand, que abre la app a pantalla completa aprovechando todo el espacio visual.

Segundo, la adaptación visual inteligente. Telegram inyecta variables CSS nativas con la paleta de colores del usuario. Si el usuario utiliza Telegram en modo oscuro, nuestra aplicación se vuelve oscura de forma automática; si cambia a modo claro, la interfaz se adapta al instante. Esto ofrece una experiencia visual idéntica a la de una aplicación nativa.

Tercero, los componentes nativos. En lugar de crear botones flotantes dentro del HTML que puedan tapar contenido, el SDK nos ofrece el MainButton: un botón integrado en la parte inferior de la pantalla del teléfono que podemos personalizar con texto, colores y animaciones de carga. También disponemos del BackButton, que permite retroceder entre pantallas de manera natural.

Y cuarto, la retroalimentación háptica. Mediante una simple línea de código podemos hacer que el teléfono vibre sutilmente cuando el usuario pulsa un botón, selecciona una categoría o confirma un pedido, generando una sensación táctil de alta calidad.

Llegamos a uno de los puntos más cruciales: ¿cómo sabemos quién está utilizando la aplicación sin pedirle que inicie sesión?

Cuando el usuario abre la Mini App, Telegram genera una cadena de texto firmada llamada initData. Esta cadena contiene el identificador único del usuario, su nombre, su nombre de usuario y una marca de tiempo, acompañados de una firma digital llamada hash.

Aquí existe una regla de oro en ciberseguridad: nunca debemos confiar ciegamente en los datos que envía el navegador. Un usuario malintencionado podría intentar modificar su identificador para suplantar a otra persona.

Por eso, la validación se realiza en nuestro servidor mediante el algoritmo criptográfico HMAC-SHA256.

El proceso es elegante y seguro:
Primero, el servidor toma todos los datos recibidos excepto el hash y los ordena alfabéticamente.
Segundo, genera una clave secreta combinando la palabra clave de Telegram con el Token privado de nuestro bot.
Tercero, calcula un nuevo hash con esa clave.
Y cuarto, compara de forma segura el hash calculado con el hash que envió Telegram.

Si coinciden con exactitud matemática, tenemos la certeza absoluta de que los datos son auténticos y fueron emitidos por los servidores oficiales de Telegram.

Para poner en práctica todos estos conceptos, hemos desarrollado DevStudio: un sistema completo de catálogo de servicios y reservas para profesionales del desarrollo web.

Analicemos cómo está estructurado el proyecto:

En la carpeta del cliente encontramos un archivo HTML semántico y responsivo organizado en tres vistas principales: el catálogo de servicios, el formulario interactivo de reserva y el historial de pedidos.

Los estilos en CSS están vinculados directamente a las variables del tema de Telegram, complementados con un diseño limpio, tarjetas modernas y microanimaciones fluidas.

Un detalle clave que hemos incorporado en el archivo JavaScript del cliente es el Modo Simulador. Cuando abres la aplicación directamente en tu navegador habitual fuera de Telegram, aparece una barra superior de desarrollo que te permite cambiar entre usuarios de prueba y alternar el tema claro y oscuro. De este modo, puedes programar y depurar toda la interfaz a gran velocidad sin necesidad de abrir Telegram a cada instante.

En el backend, nuestro servidor Express gestiona las rutas de la API, ejecuta la verificación criptográfica y utiliza SQLite para registrar las reservas en la base de datos local con máxima velocidad y cero configuración compleja.

Además, cuando el usuario pulsa el botón de confirmar reserva, el módulo del bot redacta de forma automática un recibo detallado con formato HTML y se lo entrega directamente en su chat privado.

Veamos ahora los pasos exactos para configurar y desplegar la aplicación desde cero:

Paso número uno: Accedemos a Telegram en nuestro navegador web entrando en web.telegram.org e iniciamos sesión con nuestro número de teléfono.

Paso número dos: Buscamos al bot oficial de Telegram llamado BotFather, identificado con el tick azul de verificación. Escribimos la instrucción /newbot, le asignamos un nombre visible y un nombre de usuario que termine en la palabra bot. BotFather nos responderá con el Token de la API, que es la clave secreta de nuestro bot.

Paso número tres: Abrimos el archivo de configuración .env en la raíz de nuestro proyecto y pegamos el token en la variable TELEGRAM_BOT_TOKEN.

Paso número cuatro: Telegram exige por seguridad que todas las Mini Apps se ejecuten bajo una conexión cifrada HTTPS. Para conectar nuestro servidor local sin costes ni servidores externos, ejecutamos el comando npm start. Nuestro script utiliza Cloudflare Quick Tunnels para generar una dirección HTTPS pública y estable, configurando automáticamente el botón del menú de Telegram a través de la API.

Paso número cinco: Abrimos el chat de nuestro bot en Telegram, pulsamos el botón del menú inferior o el comando de inicio, y nuestra Mini App se desplegará al instante en pantalla completa, lista para recibir reservas en tiempo real.

Como hemos visto, las Telegram Mini Apps representan una de las oportunidades más potentes en el desarrollo moderno de software. Combinan la agilidad y libertad de la web con el alcance, la seguridad y la experiencia inmersiva de las aplicaciones nativas.

A partir de esta base puedes escalar tu proyecto añadiendo pagos directos con Telegram Stars, integrando bases de datos en la nube como PostgreSQL y desplegando tu servidor en plataformas como Vercel o Railway.

Tienes todo el código fuente organizado y documentado en el proyecto. ¡Ahora es tu turno de crear tu propia Mini App y llevar tus ideas a millones de usuarios en Telegram!
```
