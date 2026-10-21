# Taster

Idiomas: [English](README.md) · **Español**

<a href="https://josoroma.github.io/taster/"><img src="assets/showcase/logo.svg" alt="Logotipo de Taster" width="220"></a>

**Ideas con las que puedes jugar, explorar y aprender.** [Explora la galería interactiva](https://josoroma.github.io/taster/) · [Visita el repositorio](https://github.com/josoroma/taster)

[![Los catorce ejemplos de Taster: Lumen, Bell Lab, Workshop, SHIFT, Cerebra, INNERSPACE, DEXTRA, FOLD, diagrama de Taster, video de Taster, LEAF, CRANK, CUE y SPARK](assets/showcase/taster-collage.png)](https://josoroma.github.io/taster/)

Nuevos flujos con prompts de `$taster` listos para usar: [LEAF · libro interactivo](#leaf), [CRANK · simulación de máquinas](#crank), [CUE · efectos de movimiento](#cue) y [SPARK · inventos Arduino para niños](#spark).

## Contenido

- [Acerca de Taster](#acerca-de-taster)
- [Qué permite hacer](#qué-permite-hacer)
- [Usar el skill](#usar-el-skill)
- [Explorar los catorce proyectos incluidos](#explorar-los-catorce-proyectos-incluidos)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Iniciar un proyecto independiente](#iniciar-un-proyecto-independiente)
- [Compilar y verificar](#compilar-y-verificar)
- [Publicar con GitHub Pages](#publicar-con-github-pages)
- [Guía de lectura](#guía-de-lectura)
- [Créditos y límites](#créditos-y-límites)
- [Ejemplos](#ejemplos)
  - [Proyectos incluidos y sus prompts](#proyectos-incluidos-y-sus-prompts)
    - [Lumen](#lumen--the-sunken-garden)
    - [Bell Lab](#bell-lab)
    - [Workshop](#workshop)
    - [SHIFT](#shift)
    - [Cerebra](#cerebra)
    - [INNERSPACE](#innerspace)
    - [DEXTRA](#dextra)
    - [FOLD](#fold)
    - [Diagrama de Taster](#diagrama-de-taster)
    - [Video de Taster](#video-de-taster)
    - [LEAF](#leaf)
    - [CRANK](#crank)
    - [CUE](#cue)
    - [SPARK](#spark)
  - [Más ideas de proyectos](#más-ideas-de-proyectos)
    - [Computación cuántica y átomos](#computación-cuántica-y-átomos)
    - [LLMs y computación](#llms-y-computación)
    - [Espacio y tiempo](#espacio-y-tiempo)
    - [Matemáticas y física](#matemáticas-y-física)
    - [Inventos Arduino para niños](#inventos-arduino-para-niños)
    - [Robótica y mecanismos](#robótica-y-mecanismos)
    - [CAD y fabricación](#cad-y-fabricación)
    - [Impresión 3D](#impresión-3d)
    - [Óptica y biología](#óptica-y-biología)
    - [Juegos para aprender](#juegos-para-aprender)
    - [Presentación y adaptación](#presentación-y-adaptación)

## Acerca de Taster

**Taster es un skill reutilizable para crear ciencia interactiva, estructuras moleculares, modelos de ingeniería, libros interactivos, inventos Arduino para niños, efectos de movimiento, mundos jugables, diagramas y videos explicativos.** Sus herramientas combinan escenas detalladas, exploración con la cámara, ensamblajes reversibles y animaciones basadas en un modelo.

Dale un tema, un público y la idea que quieres ayudar a descubrir. Taster elige una representación adecuada, construye el modelo, organiza la explicación y comprueba el resultado en un navegador. Puedes pedir un dibujo técnico sobrio, un mecanismo 3D que se pueda explorar, una escena científica cinematográfica o un pequeño juego completo sin tener que elegir primero una biblioteca de renderizado.

```text
$taster explica cómo una pinza robótica convierte la rotación del motor en movimiento de los dedos.
Usa una vista ortográfica sobria, resalta la articulación activa y permite recorrer
la línea de tiempo del mecanismo, explorar sus piezas y volver a ensamblarlo con exactitud.
```

## Qué permite hacer

| Función | Qué puede hacer quien la usa |
| --- | --- |
| Exploración con la cámara | Orbitar, acercar y alejar, desplazar la vista, enfocar una pieza, restablecer la vista o interrumpir un recorrido guiado. |
| Ensamblaje reversible | Separar componentes, explorar sus relaciones y volver a la posición ensamblada sin acumular desviaciones. |
| Animación explicativa | Reproducir, pausar, avanzar por capítulos, retroceder en la línea de tiempo y cambiar la velocidad de reproducción. |
| Modelos científicos | Vincular la geometría, las ecuaciones, las lecturas y los textos explicativos a un mismo estado; identificar los supuestos y las metáforas visuales. |
| Ingeniería sobria | Explorar trazados ortográficos, aristas ocultas, cotas, etapas de construcción, sistemas de referencia robóticos o trayectorias de deposición. |
| Experiencias jugables | Aprender reglas, actuar sobre un modelo, recibir respuestas a sus acciones, alcanzar un final claro y reiniciar. |
| Estructuras moleculares | Inspeccionar coordenadas, seleccionar residuos y distinguir la animación de inspección de una trayectoria de dinámica molecular. |
| Diagramas | Explorar procesos y arquitecturas con relaciones etiquetadas y exportar SVG con una identidad visual coherente. |
| Video | Recorrer una composición HTML determinista y renderizar un MP4 reproducible con Hyperframes. |
| Libros interactivos | Leer capítulos, explorar explicaciones animadas, consultar transcripciones, escuchar narración opcional y comprobar lo aprendido. |
| Simulación de máquinas | Inspeccionar mecanismos cuya geometría, movimiento y lecturas numéricas proceden de un mismo modelo. |
| Efectos de movimiento | Comparar efectos con nombre, recorrer su animación, ajustar parámetros y reutilizar un prompt preciso. |
| Inventos Arduino | Imaginar un proyecto, predecir su comportamiento, probar un modelo en el navegador, explorar el cableado y adaptar un sketch legible. |
| Exploración accesible | Usar alternativas de teclado y controles táctiles, movimiento reducido, textos legibles y diseños adaptables. |

El skill adapta la presentación al tema. Las explicaciones de ingeniería usan, por defecto, superficies discretas y líneas precisas. Las escenas científicas pueden incorporar iluminación cinematográfica cuando ayuda a aclarar la idea. Incluir un juego es opcional, y las afirmaciones científicas poco conocidas necesitan fuentes adecuadas.

## Usar el skill

Conserva el repositorio completo al instalar el skill; `SKILL.md` enlaza las guías, las utilidades de ejecución y los ejemplos completos. Desde la raíz de este repositorio, crea un enlace en tu directorio de skills:

```sh
mkdir -p "$HOME/.agents/skills"
ln -s "$PWD" "$HOME/.agents/skills/taster"
```

Si el destino ya existe, revísalo antes de cambiar nada. Invoca **`$taster`** en un prompt o selecciona **Taster** en el selector de skills. Puede ser necesario iniciar una nueva sesión después de instalarlo. El repositorio se llama `taster`; su identificador en los prompts es `$taster`.

Para tener un compañero dedicado a inventar, instala el [skill Arduino Inventor](skills/arduino-inventor/SKILL.md) incluido desde la raíz del repositorio e invoca **`$arduino-inventor`**:

```sh
mkdir -p "$HOME/.codex/skills"
ln -s "$PWD/skills/arduino-inventor" "$HOME/.codex/skills/arduino-inventor"
```

Revisa cualquier destino existente antes de cambiarlo. Puede ser necesario iniciar una nueva sesión para descubrirlo. El compañero ayuda a imaginar, elegir, predecir y depurar al ritmo de cada niño; no hace falta tener una placa ni indicar la edad para empezar a imaginar. `$taster` también admite proyectos Arduino y puede crear una lección interactiva en el navegador. Consulta [el prompt de SPARK](#spark) y [la guía de Arduino](references/arduino-projects.md).

Un prompt útil indica el tema, el público, la pregunta central, la interacción deseada y el estilo visual. Añade los archivos proporcionados, las unidades, los supuestos científicos o los formatos de exportación requeridos cuando sean relevantes. Deja abiertas las decisiones de implementación, salvo que ya tengas tecnologías o un flujo de trabajo que quieras conservar. Consulta los [proyectos incluidos y los prompts adicionales](#ejemplos) como punto de partida.

## Explorar los catorce proyectos incluidos

Explora la [galería de ejemplos](https://josoroma.github.io/taster/examples/) sin instalar nada. Los catorce proyectos completos tienen código editable en [`examples/`](examples/README.md), con fuentes tipográficas incluidas y utilidades de ejecución compartidas.

Para ejecutar y editar el código, usa **Node.js 22+** y un navegador moderno. Los ejemplos 3D necesitan WebGL 2; SHIFT usa Canvas 2D, y el diagrama, la película, LEAF, CUE y SPARK usan SVG/HTML. La narración opcional de LEAF utiliza las voces disponibles en el navegador. La reproducción no necesita claves de API ni recursos externos.

```sh
npm ci
npm start
```

Usa la dirección que muestra `npm start` para trabajar en tu copia. La sección final [Proyectos incluidos y sus prompts](#proyectos-incluidos-y-sus-prompts) reúne cada proyecto con su carpeta de código fuente, su ubicación de vista previa y un prompt reutilizable.

Usa `PORT=8080 npm start` para elegir otro puerto.

## Estructura del repositorio

```text
taster/
├── SKILL.md                     Punto de entrada del skill y principios de trabajo
├── agents/openai.yaml           Metadatos para descubrir el skill
├── skills/arduino-inventor/      Skill para inventar Arduino con niños
├── README.md                    Instalación, guía de proyectos y colección de prompts
├── README-ES.md                 Versión en español de esta guía
├── index.html                   Galería pública con enlaces a los ejemplos en ejecución
├── kit/                         Cámara, línea de tiempo, ensamblaje y visor técnico
├── assets/fonts/                Fuentes locales compartidas y avisos de licencia
├── assets/showcase/             Logotipo de Taster, capturas de pantalla y collage
├── examples/
│   ├── README.md                Resumen de los ejemplos y notas para adaptarlos
│   ├── index.html               Catálogo con enlaces a los catorce ejemplos
│   ├── lumen/                   Página del juego, estilos, código fuente y guía
│   ├── bell-lab/                Página de computación cuántica, estilos y código fuente
│   ├── workshop/                Página CAD, estilos, código fuente y recursos CAD
│   ├── ai-history/              Película animada, modelo de capítulos y guía del código
│   ├── brain-atlas/             Cerebro 3D, información de sus regiones y ensamblaje
│   ├── particle-atlas/          Viaje al interior de la materia y atlas de partículas conocidas
│   ├── cyborg-hand/             Mano articulada, recorrido del mecanismo y exploración
│   ├── molecular-lab/           Coordenadas experimentales de una proteína y exploración
│   ├── taster-diagram/          Diagrama de Taster y exportación SVG
│   ├── taster-film/             Composición HTML, vista previa y video renderizado
│   ├── paper-lab/               LEAF: libro interactivo, transcripción, animación y cuestionario
│   ├── machine-lab/             CRANK: máquina cinemática y exploración 3D
│   ├── motion-lab/              CUE: efectos con nombre y generador de prompts
│   └── arduino-lab/             SPARK: inventos, circuito y sketches Arduino
├── references/                  Guías de movimiento, ciencia, ingeniería, libros y ejecución
├── scripts/                     Generación, compilación, reconstrucción CAD y comprobaciones del navegador
├── tests/                       Comprobaciones de modelos, geometría y movimiento
└── evals/evals.json              Prompts y criterios de evaluación del skill
```

Cada ejemplo mantiene juntos su HTML, el código de la aplicación, los estilos y los módulos de escena y modelo. La geometría generada, el código Python y los archivos exportados de Workshop están en [`examples/workshop/assets/cad-plate/`](examples/workshop/assets/cad-plate/README.md). Las utilidades compartidas permanecen en `kit/`; el generador copia las dependencias que necesita cada proyecto nuevo.

## Iniciar un proyecto independiente

Elige el ejemplo más cercano a tu idea y genera el proyecto en un directorio vacío:

```sh
node scripts/create-project.mjs /path/to/new-project --template bell-lab
cd /path/to/new-project
npm ci
npm start
```

| Plantilla | Punto de partida para |
| --- | --- |
| `bell-lab` | Explicaciones científicas guiadas, ensamblaje reversible, lecturas del modelo en tiempo real y retos opcionales. |
| `lumen` | Un mundo de juego que se puede explorar, con movimiento, objetivos y un final. |
| `workshop` | Explicaciones de ingeniería sobrias con etapas de construcción y exploración técnica. |
| `ai-history` | Relatos animados breves con capítulos, una línea de tiempo reversible y contexto respaldado por fuentes. |
| `brain-atlas` | Estructuras biológicas etiquetadas, separación reversible y exploración con información contextual. |
| `particle-atlas` | Recorridos guiados por distintas escalas científicas, exploración de partículas y clasificación respaldada por fuentes. |
| `cyborg-hand` | Mecanismos articulados, separación reversible de la cubierta exterior y exploración con una estética futurista sobria. |
| `molecular-lab` | Estructuras de proteínas con procedencia, selección de residuos y representaciones moleculares. |
| `taster-diagram` | Diagramas interactivos con identidad visual, relaciones etiquetadas y exportación SVG. |
| `taster-film` | Composiciones HTML deterministas y video renderizado con Hyperframes. |
| `paper-lab` | Capítulos inspirados en Papermorph con animación, transcripción, narración opcional y cuestionarios. |
| `machine-lab` | Mecanismos inspirados en machine-skill con cinemática analítica, lecturas numéricas y exploración 3D. |
| `motion-lab` | Efectos de Motion Prompt con vistas previas deterministas, parámetros ajustables y prompts reutilizables. |
| `arduino-lab` | Laboratorio de inventos Arduino para niños con modelo de comportamiento, plan de pines, predicciones y sketches descargables. |

El generador copia un ejemplo, las herramientas que necesita, los recursos locales, las pruebas y los scripts. El proyecto generado funciona de forma independiente del skill instalado. Adapta en conjunto el modelo, las etiquetas, las representaciones visuales y el objetivo de aprendizaje; cambiar de tema suele exigir algo más que sustituir textos.

Los proyectos existentes pueden incorporar utilidades individuales sin tener que empezar de nuevo. Lee la [API de ejecución](references/kit.md) antes de integrarlas.

## Compilar y verificar

```sh
npm test
npm run build
```

Las pruebas cubren el comportamiento del modelo y las propiedades de la geometría o el movimiento que deben mantenerse. La compilación de producción genera un directorio estático `dist/` con dependencias locales. Sírvelo mediante HTTP; la carga directa con `file://` no es compatible.

Usa [`scripts/capture.mjs`](scripts/capture.mjs) y [`scripts/drive.mjs`](scripts/drive.mjs) para obtener capturas del navegador y comprobar las interacciones. La [guía de ejecución](references/kit.md) explica su uso. Revisa los diseños de escritorio y de pantalla estrecha, los controles de teclado, el movimiento reducido, las acciones de pausar, recorrer la línea de tiempo y reiniciar, y el estado final real. Prueba por separado un proyecto generado para detectar dependencias accidentales de la copia local del repositorio del skill.

Workshop incluye geometría CAD precalculada. Para regenerar sus representaciones por etapa y los archivos de exportación reales a partir del código Python incluido, instala `uv` y ejecuta:

```sh
uv run scripts/build-cad-example.py
```

El generador fija la versión de SMLibPy y valida la geometría. La reproducción normal en el navegador no necesita Python ni un servicio CAD. Consulta la [guía de recursos CAD](examples/workshop/assets/cad-plate/README.md) para conocer el código fuente, las unidades, los detalles del mallado y los archivos exportados.

## Publicar con GitHub Pages

La galería pública está en **[josoroma.github.io/taster](https://josoroma.github.io/taster/)**. Publica los mismos proyectos completos de `examples/`, por lo que las vistas previas y el código fuente permanecen juntos sin una copia aparte en `examples-io/`.

El [flujo de trabajo de GitHub Actions](.github/workflows/pages.yml) compila y despliega el sitio cuando llegan cambios a `main`; también se puede iniciar manualmente desde la pestaña Actions del repositorio. Instala las dependencias con sus versiones fijadas, ejecuta las pruebas, compila con `npm run build` y publica `dist/` en GitHub Pages. En **Settings → Pages** del repositorio, elige **GitHub Actions** como origen.

Para comprobar los archivos estáticos generados antes de publicarlos:

```sh
npm ci
npm test
npm run build
python3 -m http.server 8080 --directory dist
```

Abre la dirección que muestra el servidor HTTP. Los archivos generados incluyen la galería, los ejemplos, las herramientas, las fuentes tipográficas y las dependencias de renderizado incluidas. Los enlaces relativos funcionan tanto aquí como bajo la ruta `/taster/` de GitHub Pages.

## Guía de lectura

| Guía | Cuándo consultarla |
| --- | --- |
| [Punto de entrada del skill](SKILL.md) | Invocación, decisiones automáticas, flujo de trabajo y criterios de finalización. |
| [Cámara y ensamblaje](references/camera-and-assembly.md) | Control de la cámara, recorridos, enfoque, trayectorias de separación, reensamblaje y navegación por la línea de tiempo. |
| [Narración científica](references/scientific-storytelling.md) | Fuentes, representaciones visuales fieles, supuestos del modelo y errores frecuentes de cada disciplina. |
| [Explicaciones de ingeniería](references/engineering-explainers.md) | Construcción CAD, robótica, fabricación aditiva, convenciones de líneas y exportaciones reales. |
| [Estructuras moleculares](references/molecular-structures.md) | Procedencia, residuos, representaciones, trayectorias y límites científicos. |
| [Diagramas](references/diagrams.md) | Jerarquía editorial, relaciones, exploración y exportación SVG. |
| [Video](references/video.md) | Composiciones Hyperframes, línea de tiempo, renderizado y verificación. |
| [Libros interactivos](references/interactive-books.md) | Planificar capítulos, narración, animaciones y cuestionarios a partir de fuentes, siguiendo ideas de Papermorph. |
| [Simulación de máquinas](references/machine-simulations.md) | Elegir modelos, unidades, geometría, exploración y películas opcionales. |
| [Vocabulario de movimiento](references/motion-vocabulary.md) | Resolver packs e identificadores de Motion Prompt, definir tiempos y crear prompts precisos. |
| [Proyectos Arduino](references/arduino-projects.md) | Ideas elegidas por el niño, supuestos de la placa, circuitos, sketches legibles, predicciones y depuración. |
| [Identidad de Taster](references/identity.md) | Logotipo, tipografía y colores existentes. |
| [API de ejecución](references/kit.md) | Firmas de las utilidades, ejemplos de integración, copia de proyectos y verificación en el navegador. |
| [Ejemplos funcionales](examples/README.md) | Qué demuestra cada proyecto incluido y cómo adaptarlo. |
| [Casos de evaluación](evals/evals.json) | Solicitudes realistas y comportamientos que debe cumplir un buen resultado. |

## Créditos y límites

Three.js usa la licencia MIT; las compilaciones incluyen su aviso. Las fuentes locales DM Sans e Italiana usan la SIL Open Font License, con avisos en `assets/fonts/`. Consulta [LICENSE](LICENSE) para ver la licencia de Taster y los avisos de terceros que la acompañan. Workshop usa geometría generada con [SMLibPy](https://smlibpy.classcad.ch/) 0.3.1.

Taster es un skill y un conjunto de herramientas reutilizables, no un simulador para todos los temas que aparecen en los prompts siguientes. Bell Lab modela un sistema ideal de dos cúbits; su equipo es una metáfora visual. Lumen es un mundo de juego artístico. Workshop ofrece una construcción CAD reproducible, con geometría sólida STEP y una malla STL a escala milimétrica. No controla una impresora ni incluye un laminador, y la guía de robótica no incorpora un motor de dinámica robótica.

SHIFT ilustra algunos avances de la IA desde 2017 y presenta la inteligencia artificial general (AGI) como una meta de investigación abierta. Cerebra usa formas y límites regionales esquemáticos del cerebro; la separación sirve para facilitar la exploración, y sus descripciones destacan las redes conectadas.

INNERSPACE ilustra la estructura conocida de las partículas y la clasificación del Modelo Estándar. Sus nubes, transiciones de escala y rotación de la vista son esquemáticas; el espín cuántico es intrínseco y no se afirman constituyentes más profundos de los quarks o los leptones.

DEXTRA es una demostración cinemática conceptual: las posiciones de las articulaciones y la separación dependen de un modelo determinista. Su geometría generada por código es ilustrativa y no incluye un análisis de fuerzas validado, tolerancias de fabricación ni exportaciones CAD para producción.

FOLD usa coordenadas experimentales de crambina de [RCSB PDB 1CRN](https://www.rcsb.org/structure/1CRN). Su animación facilita inspeccionar una estructura estática; no simula el plegamiento ni la dinámica molecular.

El ejemplo de diagramas toma principios de [Diagram Design](https://github.com/cathrynlavery/diagram-design) y [Archify](https://github.com/tt-a1i/archify), conservando la identidad de Taster. El ejemplo de video utiliza [Hyperframes](https://github.com/heygen-com/hyperframes) y contiene un MP4, una vista previa y [comandos de renderizado reproducibles](examples/taster-film/README.md). Los nuevos temas requieren modelos y fuentes adecuados.

[Papermorph](https://github.com/DozenTwelve/Papermorph), [machine-skill](https://github.com/AirsupHQ/machine-skill) y [Motion Prompt](https://github.com/showheyohtaki/motion-prompt) inspiran tres flujos adicionales. Las guías enlazan sus fuentes; LEAF, CRANK y CUE son implementaciones originales de Taster. Se incorporan instrucciones de creación y plantillas ejecutables, sin instalar los skills originales ni prometer compatibilidad con sus motores o API. LEAF usa texto original y ondas lineales ideales; CRANK modela cinemática de cuerpos rígidos; CUE demuestra seis efectos de un subconjunto local. La extracción de PDF, la narración de producción, la dinámica de máquinas y el catálogo completo de efectos requieren trabajo específico.

[Learn Arduino](https://learn-arduino-red.vercel.app/), de Dilum Sanjaya, inspira la progresión práctica de Arduino Inventor y SPARK. SPARK es un ejemplo original de Taster para una **Arduino Uno R3 asumida explícitamente**: su modelo JavaScript conecta controles, un circuito ilustrado y código `.ino` generado. No compila ni ejecuta C++ arbitrario. Tampoco calcula voltajes del circuito, se conecta a una placa ni demuestra que se haya probado un montaje físico. Consulta [la guía para la placa concreta](references/arduino-projects.md) antes de adaptar el cableado.

## Ejemplos

Elige un proyecto incluido para explorar una implementación funcional, o usa las ideas adicionales para comenzar algo nuevo. Cada prompt aparece una sola vez. Adapta el público, los archivos fuente, las dimensiones y el objetivo de aprendizaje a tu proyecto.

### Proyectos incluidos y sus prompts

Estos catorce proyectos están disponibles en `examples/`. Cada entrada indica su código y ubicación de vista previa e incluye un prompt reutilizable que describe el proyecto.

#### Lumen — The Sunken Garden

Código fuente: [`examples/lumen/`](examples/lumen/) · [Jugar en línea](https://josoroma.github.io/taster/examples/lumen/)

```text
$taster crea una aventura completa para el navegador en un jardín mecánico sumergido.
Permite al jugador guiar a un guardián mecánico, esquivar centinelas con impulsos
rápidos y restaurar tres balizas mediante desafíos de sincronización para volver
a abrir la puerta final. Usa un renderizado 3D con ambientación envolvente,
sonido opcional, objetivos claros, controles de teclado y puntero, y un final
satisfactorio que invite a volver a jugar.
```

#### Bell Lab

Código fuente: [`examples/bell-lab/`](examples/bell-lab/) · [Abrir en línea](https://josoroma.github.io/taster/examples/bell-lab/)

```text
$taster crea una lección interactiva para principiantes sobre cómo preparar
un estado de Bell. Permíteme aplicar puertas H, X, Z y X controlada, inspeccionar
amplitudes y probabilidades conjuntas, y después resolver tres desafíos de estados
objetivo que incluyan la fase relativa. Añade inspección con la cámara y un
ensamblaje reversible, e identifica el aparato como una metáfora visual.
```

#### Workshop

Código fuente: [`examples/workshop/`](examples/workshop/) · [Abrir en línea](https://josoroma.github.io/taster/examples/workshop/)

```text
$taster explica una placa de montaje construida a partir de un prisma rectangular,
con esquinas redondeadas, cuatro agujeros y una cavidad ciega. Usa un renderizado
técnico sobrio e instantáneas CAD reales vinculadas al código fuente ejecutado.
Muestra las dimensiones y el volumen correspondientes a cada etapa, permite
desplazar y ampliar la vista e incluye exportaciones STEP y STL validadas.
```

#### SHIFT

Código fuente: [`examples/ai-history/`](examples/ai-history/) · [Ver en línea](https://josoroma.github.io/taster/examples/ai-history/)

```text
$taster crea una animación de 90 segundos para el navegador, renderizada mediante
código, sobre la IA: desde Attention Is All You Need en 2017 hasta la cuestión
abierta de la AGI. Explica hitos seleccionados mediante metáforas visuales
originales, textos legibles, controles por capítulos y una línea de tiempo
reversible. Cita fuentes primarias y separa claramente las posibilidades futuras
de la historia establecida; no inventes una fecha de llegada de la AGI.
```

#### Cerebra

Código fuente: [`examples/brain-atlas/`](examples/brain-atlas/) · [Explorar en línea](https://josoroma.github.io/taster/examples/brain-atlas/)

```text
$taster construye una explicación interactiva del cerebro en 3D con regiones
identificadas, pistas e información contextual. Permíteme orbitar, desplazar
y ampliar la vista, seleccionar una región, separar las partes para inspeccionar
estructuras profundas y volver a ensamblarlas con exactitud. Explica cómo
funcionan las regiones mediante redes conectadas e identifica las formas y la
separación como esquemas educativos, no como un atlas clínico.
```

#### INNERSPACE

Código fuente: [`examples/particle-atlas/`](examples/particle-atlas/) · [Explorar en línea](https://josoroma.github.io/taster/examples/particle-atlas/)

```text
$taster crea un viaje de 78 segundos desde un átomo de helio hasta su núcleo,
sus protones y neutrones, y sus quarks, para terminar con un atlas de las partículas
elementales conocidas. Usa diagramas 3D que giren, ampliación y desplazamiento
de la vista, etiquetas y reproducción reversible. Permíteme comparar las cargas
de los quarks de valencia del protón y del neutrón e inspeccionar las funciones,
la carga y el espín de las partículas. Distingue la rotación de la representación
del espín cuántico y detente en la estructura confirmada antes de presentar
las preguntas de investigación abiertas.
```

#### DEXTRA

Código fuente: [`examples/cyborg-hand/`](examples/cyborg-hand/) · [Inspeccionar en línea](https://josoroma.github.io/taster/examples/cyborg-hand/)

```text
$taster crea una mano cíborg futurista que se extienda por completo y se cierre
en un puño mediante articulaciones y un pulgar oponible. Usa grafito, una cubierta
protectora plateada y detalles verdes discretos. Añade desplazamiento, ampliación
y órbita de la cámara, vistas predefinidas, etiquetas de componentes, ángulos de
las articulaciones en tiempo real y un estudio de movimiento reversible de
32 segundos. Permite separar la mano abierta en capas que puedan inspeccionarse
y volver a ensamblarse con exactitud. Trátala como un mecanismo cinemático
conceptual, sin afirmaciones no fundamentadas sobre fuerzas o fabricación.
```

#### FOLD

Código: [`examples/molecular-lab/`](examples/molecular-lab/) · [Explorar en línea](https://josoroma.github.io/taster/examples/molecular-lab/)

```text
$taster crea una explicación molecular interactiva de la crambina 1CRN.
Incluye las coordenadas experimentales, su procedencia y selección de residuos.
Permite comparar representaciones e inspeccionar los puentes disulfuro.
Distingue la animación de inspección de la dinámica molecular.
```

#### Diagrama de Taster

Código: [`examples/taster-diagram/`](examples/taster-diagram/) · [Explorar en línea](https://josoroma.github.io/taster/examples/taster-diagram/)

```text
$taster explica cómo funciona Taster con un diagrama editorial interactivo.
Usa su logotipo, DM Sans, Italiana, fondo de papel, verde bosque y acentos lima.
Permite explorar las etapas y las rutas molecular, de diagramas y de video,
y exportar un SVG autónomo.
```

#### Video de Taster

Código: [`examples/taster-film/`](examples/taster-film/) · [Ver en línea](https://josoroma.github.io/taster/examples/taster-film/)

```text
$taster produce un video breve que explique Taster usando su identidad visual.
Incluye una composición HTML determinista para Hyperframes, una vista previa
con controles de reproducción, el MP4 y el comando exacto para renderizarlo.
```

#### LEAF

Código y guía: [`examples/paper-lab/`](examples/paper-lab/README.md) · Vista local: `/examples/paper-lab/` · Plantilla: `paper-lab`

Una lectura interactiva sobre superposición de ondas inspirada en Papermorph. Recorre tres capítulos, controla la animación, cambia la fase relativa, lee la transcripción, escucha las voces opcionales del navegador y responde una comprobación de conocimientos.

```text
$taster convierte una breve lección original sobre superposición de ondas en un
libro interactivo al estilo Papermorph. Incluye tres capítulos, control de fase,
animación SVG con línea de tiempo, transcripción, narración opcional y un cuestionario
con explicaciones. Muestra los supuestos científicos y las fuentes.
```

#### CRANK

Código y guía: [`examples/machine-lab/`](examples/machine-lab/README.md) · Vista local: `/examples/machine-lab/` · Plantilla: `machine-lab`

Un mecanismo de biela y manivela inspirado en machine-skill que conecta el ensamblaje 3D con su cinemática analítica. Inspecciona sus piezas, ajusta el mecanismo, separa la cubierta y compara el desplazamiento y la velocidad en distintos ángulos.

```text
$taster crea un mecanismo interactivo de biela y manivela inspirado en machine-skill.
Calcula el movimiento a partir del radio, la longitud de la biela, el ángulo y la
velocidad. Muestra lecturas en unidades SI y permite inspeccionar las piezas,
separar la cubierta, pausar, recorrer el ciclo y reiniciar. Explica los supuestos.
```

#### CUE

Código y guía: [`examples/motion-lab/`](examples/motion-lab/README.md) · Vista local: `/examples/motion-lab/` · Plantilla: `motion-lab`

Un estudio de Motion Prompt con Pop-in, Stagger, Mask reveal, Overshoot, Anticipation y Motion path. Elige un efecto, ajusta duración e intensidad, explora cualquier instante y copia un prompt con su identidad original. Las vistas previas son implementaciones locales originales de esos conceptos.

```text
$taster crea un laboratorio de Motion Prompt con Pop-in, Stagger, Mask reveal,
Overshoot, Anticipation y Motion path. Conserva la atribución de pack e ID, demuestra
cada efecto con SVG determinista e incluye controles de tiempo, repetición,
duración, intensidad y copia del prompt. Inicia en pausa con movimiento reducido.
```

#### SPARK

Código y guía: [`examples/arduino-lab/`](examples/arduino-lab/README.md) · Vista local: `/examples/arduino-lab/` · Plantilla: `arduino-lab`

Un banco de inventos Arduino para las primeras ideas de un niño. Elige Lighthouse, Secret signal o Firefly, ponle nombre al invento, predice qué pasará y pruébalo. Ajusta el tiempo del ciclo y la perilla de brillo, mantén pulsado el botón, explora las piezas y la lista de cableado, pausa o avanza el tiempo y descarga el sketch `.ino` correspondiente. El circuito supone explícitamente una Uno R3, un LED con resistencia de 330 Ω en D9, un botón `INPUT_PULLUP` en D2 y un potenciómetro de 10 kΩ en A0. El comportamiento del navegador y el brillo cualitativo son distintos de una validación eléctrica o física.

```text
$taster ayuda a mi hijo de 12 años a imaginar un invento Arduino inspirado en Learn Arduino.
Aún no hemos confirmado un kit físico. Ofrece tres ideas y deja que elija y nombre
una. Empieza con un laboratorio en el navegador como SPARK con predecir → probar →
explicar, piezas explorables y controles sencillos.
Usa una Uno R3 explícita como ejemplo: LED en D9 con resistencia de 330 Ω,
botón con pull-up en D2 y perilla en A0. Incluye piezas y tabla de pines, un sketch
.ino legible y descargable y un pequeño reto de depuración. Explica qué verifica
el modelo del navegador y qué requiere una placa real; adapta el cableado cuando
sepamos cuál tenemos.
```

### Más ideas de proyectos

Los siguientes 50 prompts describen proyectos adicionales o adaptaciones. Sus temas no se incluyen como ejemplos completos; el agente debe implementar y verificar el modelo y las interacciones solicitados.

#### Computación cuántica y átomos

**Interferencia cuántica**

```text
$taster explica un interferómetro de un solo cúbit con un control de fase
y probabilidades de salida medidas. Vincula cada cambio visual con el cálculo
del estado y permíteme comparar la evolución coherente con un modelo de pérdida
de coherencia de fase claramente identificado.
```

**Un orbital de hidrógeno**

```text
$taster construye una explicación pausada en 3D de los orbitales 1s y 2p del
hidrógeno para estudiantes de secundaria. Permíteme rotar y seccionar la densidad
de probabilidad, distingue el signo de la amplitud de la probabilidad y evita
mostrar un electrón siguiendo una órbita como la de un planeta.
```

**Corrección de errores cuánticos**

```text
$taster explica el código de tres cúbits para corregir inversiones de bit mediante
un circuito pequeño que pueda inspeccionarse. Permíteme introducir un error X,
leer el síndrome y recuperar el estado codificado; deja explícito que este código
no puede corregir errores cuánticos arbitrarios.
```

**Entrelazamiento y medición**

```text
$taster crea una explicación del entrelazamiento con dos estaciones en las que
pueda elegir bases de medición locales y comparar las estadísticas tras reunir
ambos registros. Muestra por qué las correlaciones no permiten enviar un mensaje
controlable a una velocidad superior a la de la luz.
```

#### LLMs y computación

**Atención que puedes calcular**

```text
$taster explica una cabeza de atención mediante una secuencia diminuta y vectores
numéricos visibles de consulta, clave y valor. Permíteme inspeccionar los productos
escalares, el escalado, softmax y la salida ponderada, con todos los valores
mostrados procedentes del mismo cálculo.
```

**Dentro de un bloque transformer**

```text
$taster crea una explicación sobria de un bloque transformer con capas separables
y un recorrido del token que pueda explorar ajustando la línea de tiempo.
Especifica la arquitectura utilizada, muestra las conexiones residuales
y distingue las representaciones aprendidas de los conceptos humanos literales.
```

**Generación autorregresiva y caché KV**

```text
$taster muestra cómo un decodificador pequeño genera un token a la vez y reutiliza
una caché KV. Permíteme comparar la ejecución con y sin caché, incluida la máscara
causal y el recuento real de operaciones del modelo de demostración, en lugar
de inventar tiempos de ejecución.
```

**Retropropagación**

```text
$taster construye una explicación interactiva de la retropropagación en una red
diminuta de dos capas. Permíteme cambiar un peso, inspeccionar la pérdida calculada
en la propagación hacia delante y el gradiente obtenido con la regla de la cadena,
y comparar ese gradiente con una comprobación mediante diferencias finitas.
```

**Paquetes, colas y reintentos**

```text
$taster crea una simulación de red compacta que muestre paquetes recorriendo
colas de capacidad limitada. Permíteme variar la latencia, la capacidad y las
pérdidas, y explica cómo una política de reintentos especificada afecta a la entrega,
sin presentar el movimiento decorativo como datos de tiempos reales.
```

#### Espacio y tiempo

**Estructura de un agujero negro**

```text
$taster crea una explicación guiada de un agujero negro con vistas de inspección
del horizonte, la región de fotones, la sombra y el disco de acreción. Identifica
qué formas son esquemáticas y qué efectos ópticos se calculan, y mantén la escala
fácil de interpretar.
```

**Dilatación gravitacional del tiempo**

```text
$taster compara relojes estacionarios a distintas distancias radiales fuera de un
agujero negro sin rotación. Permíteme ajustar el radio e inspeccionar la relación
entre sus ritmos de marcha a partir de una ecuación explícita; mantén todos los
ejemplos de relojes estacionarios fuera del horizonte e indica los supuestos.
```

**Conos de luz y simultaneidad**

```text
$taster explica la relatividad especial con un diagrama de espacio-tiempo de
1+1 dimensiones. Permíteme cambiar de sistema de referencia inercial, seguir los
mismos sucesos y comparar los cortes de simultaneidad mientras los conos de luz
y el intervalo invariante se mantienen coherentes.
```

**Transferencia entre órbitas**

```text
$taster construye una lección jugable sobre una transferencia de Hohmann entre
órbitas circulares. Permíteme elegir el radio de destino e inspeccionar ambos
impulsos y el tiempo de vuelo sin propulsión. Distingue el cálculo ideal de dos
cuerpos de una trayectoria lista para una misión real.
```

**El espacio en expansión**

```text
$taster explica la expansión cosmológica mediante un factor de escala ajustable
y marcadores comóviles. Muestra la diferencia entre distancia comóvil y distancia
propia, e indica la simplificación dimensional de la visualización y el modelo
de expansión elegido.
```

#### Matemáticas y física

**Síntesis de Fourier**

```text
$taster permite que un estudiante construya una señal periódica a partir de armónicos
con controles de amplitud y fase. Sincroniza los fasores giratorios, las ondas
componentes y su suma; después, añade un reto para reproducir una forma de onda
objetivo dentro de una tolerancia de error visible.
```

**Un péndulo doble**

```text
$taster crea una simulación de un péndulo doble que se pueda inspeccionar, con dos
condiciones iniciales cercanas y lecturas de energía. Utiliza un integrador adecuado,
muestra la deriva numérica e incorpora a la explicación la pausa, el reinicio y
unas condiciones iniciales reproducibles.
```

**Los vectores propios como direcciones**

```text
$taster explica una transformación lineal real de 2×2 mediante una base que se pueda
arrastrar y una cuadrícula animada. Permíteme identificar direcciones invariantes y
comparar matrices con vectores propios reales distintos, un valor propio repetido
o ningún vector propio real.
```

**Ondas en una frontera**

```text
$taster muestra cómo un pulso se refleja y se transmite en la frontera entre dos
medios unidimensionales. Permíteme cambiar los parámetros relevantes de los
materiales y observar las condiciones de frontera, las velocidades de propagación
y el balance de energía del modelo elegido.
```

**Difusión a partir de caminatas aleatorias**

```text
$taster explica la difusión comparando caminatas aleatorias con una semilla definida
y un perfil de concentración. Permíteme cambiar la frecuencia de los pasos e
inspeccionar el desplazamiento cuadrático medio, distinguiendo claramente las
trayectorias individuales de las estadísticas del conjunto.
```

#### Inventos Arduino para niños

**Un invento a partir de una historia**

```text
$arduino-inventor quiero hacer algo para el dormitorio de un pequeño astronauta.
Dame tres ideas con luces y botones. Déjame elegir mi favorita, ponerle un nombre
y predecir qué hará. Todavía no tengo placa; empieza con un plan en papel o un
modelo de comportamiento en el navegador y explica cada pieza con palabras sencillas.
```

**Una criatura que envía una señal**

```text
$arduino-inventor ayuda a mi hijo de 12 años a inventar una luciérnaga de cartón que envía
una señal luminosa secreta. Tenemos una Uno R3, un LED, una resistencia de 330 ohmios,
un botón y cables. Empieza con un solo comportamiento, incluye una tabla de pines
y un sketch comentado, y deja que cambie el patrón después de predecir el resultado.
```

**Una planta que puede pedir ayuda**

```text
$taster convierte la idea de mi hijo para recordar el cuidado de una planta en una
pequeña exploración Arduino. Empieza con un control que represente un sensor
imaginario y deja que elija el mensaje o la señal luminosa. Antes de proponer
cableado físico, identifica nuestra placa y módulo sensor. Distingue las lecturas
simuladas de las mediciones reales e incluye un experimento y una pista de depuración.
```

#### Robótica y mecanismos

**Muñeca robótica y sistemas de coordenadas**

```text
$taster crea una explicación 3D sobria de una muñeca robótica de tres ejes, con ejes
articulares visibles y sistemas de coordenadas locales seleccionables. Permíteme
mover una articulación a la vez, inspeccionar la cadena de transformaciones y
reiniciar sin mezclar el movimiento de funcionamiento con las posiciones explosionadas.
```

**Cinemática inversa de dos eslabones**

```text
$taster construye un brazo plano de dos eslabones cuyo objetivo para el efector final
pueda arrastrar. Muestra ambas ramas de solución de la cinemática inversa, los límites
articulares y el espacio de trabajo alcanzable; señala los objetivos inalcanzables
en lugar de estirar los eslabones para llegar a ellos.
```

**Pinza paralela**

```text
$taster explica cómo una pinza de piñón y cremallera convierte la rotación del motor
en desplazamientos iguales y opuestos de sus dedos. Utiliza trazos sobrios, un
control de posición articular y una vista explosionada reversible que revele cómo
los dientes y las guías restringen el movimiento.
```

**Mecanismo de cuatro barras**

```text
$taster crea una explicación de un mecanismo de cuatro barras con longitudes de
eslabón editables y una manivela accionada. Conserva el cierre del lazo, explica las
configuraciones no válidas y muestra la trayectoria del acoplador sin dar a entender
que el modelo cinemático incluye fuerzas.
```

**Inspeccionar un modelo de robot proporcionado**

```text
$taster utiliza el URDF y las mallas de este proyecto para crear una herramienta
de inspección en el navegador. Conserva los orígenes, ejes articulares, límites y
unidades declarados, y añade un breve recorrido de cámara por la cadena cinemática
y un control para restablecer la postura de inicio.
```

#### CAD y fabricación

**Revolución, transición y barrido**

```text
$taster crea tres animaciones de construcción sobrias, una al lado de la otra,
que comparen revolución, transición entre perfiles (loft) y barrido. Resalta el
perfil, el eje o la trayectoria, y después la superficie o el sólido resultante,
con selección directa de etapas y un encuadre de cámara uniforme.
```

**Una sección de un rodamiento**

```text
$taster explica el conjunto de rodamiento proporcionado mediante un plano de corte
móvil. Cierra las caras del corte y aplica un rayado a la sección, conserva un
contorno sin cortar para orientar la vista y permíteme aislar los aros, los elementos
rodantes y la jaula antes de restaurar el conjunto.
```

**Tolerancias y ajustes**

```text
$taster construye una explicación de un eje y un agujero con límites de diámetro
ajustables. Calcula el juego o la interferencia a partir de las dimensiones
indicadas, exagera la separación solo en una vista de detalle etiquetada y evita
inventar una afirmación de cumplimiento de normas.
```

**Orden de montaje**

```text
$taster convierte las piezas CAD proporcionadas en una lección de montaje con
componentes identificados por nombre y una secuencia de pasos reversible. Utiliza
direcciones de inserción plausibles, mantén visibles las referencias de acoplamiento
e identifica cualquier interferencia sin resolver en lugar de ocultarla.
```

#### Impresión 3D

**Del sólido a las capas**

```text
$taster explica cómo un modelo FDM se convierte en cortes horizontales, perímetros
y relleno. Permíteme mover el plano de corte y cambiar una altura de capa ilustrativa,
mostrando las dimensiones y distinguiendo claramente las trayectorias esquemáticas
de la salida de un programa laminador.
```

**Inspeccionar G-code real**

```text
$taster visualiza el G-code de impresora proporcionado como una explicación de solo
lectura. Interpreta sus modos de coordenadas y extrusión, distingue la deposición
de los desplazamientos sin extrusión y sincroniza la posición de la boquilla, el
material visible y la selección de capa al recorrer la línea de tiempo.
```

**Soportes y orientación**

```text
$taster compara tres orientaciones de impresión de un mismo soporte y explica por
qué los voladizos pueden necesitar estructuras de soporte. Permíteme inspeccionar
secciones transversales y posibles regiones de soporte; indica los supuestos del
proceso en lugar de garantizar automáticamente que la pieza sea imprimible.
```

**Secuencia de impresión con resina**

```text
$taster crea una explicación sobria de la impresión con resina mediante máscara,
de abajo hacia arriba. Muestra la capa de exposición seleccionada, el movimiento
de la plataforma de construcción y la etapa de separación en una misma línea de
tiempo reversible, con una nota clara cuando se compriman los tiempos del proceso.
```

**Patrones de relleno**

```text
$taster compara rellenos de cuadrícula, triangulares y de tipo giroide dentro de
una pieza seccionada. Permíteme ajustar la densidad nominal e inspeccionar la
distribución del material, pero separa las observaciones geométricas de las
afirmaciones sobre resistencia mecánica que requieran simulaciones o ensayos.
```

#### Óptica y biología

**Objetivo de cámara en vista explosionada**

```text
$taster crea una explicación sobria de un objetivo con separación reversible de
sus elementos ópticos y láminas del diafragma, identificados por nombre. Añade un
modelo sencillo de rayos con supuestos explícitos y muestra cómo el enfoque y la
apertura afectan a los rayos calculados, no solo a la vista de la cámara.
```

**Interferencia en películas delgadas**

```text
$taster explica la interferencia en películas delgadas con controles de espesor,
índice de refracción y longitud de onda. Traza las trayectorias relevantes, incluye
los cambios de fase por reflexión y relaciona la intensidad mostrada con un modelo
óptico explícito.
```

**Replicación del ADN**

```text
$taster crea una explicación guiada de la replicación del ADN para un curso
introductorio de biología. Permíteme inspeccionar la dirección de las cadenas y
comparar la síntesis de la cadena conductora con la de la retardada, con controles
por capítulos y simplificaciones explícitas de escala o movimiento en la escena molecular.
```

**El ciclo cardíaco**

```text
$taster explica el ciclo cardíaco mediante un modelo simplificado de cámaras y
válvulas. Sincroniza las relaciones de presión, los estados de las válvulas y la
dirección del flujo en una línea de tiempo que se pueda recorrer, e identifícalo
como un esquema educativo, no como datos de un paciente.
```

**Cinética enzimática**

```text
$taster conecta una animación de unión de una enzima con un pequeño modelo cinético
que muestre sus supuestos y permita ajustar la concentración de sustrato. Compara
la velocidad calculada con la predicción del modelo elegido e identifica cuándo
se utilizan supuestos de estado estacionario.
```

#### Juegos para aprender

**Rompecabezas de encuentro orbital**

```text
$taster crea un pequeño juego de encuentro orbital con un presupuesto limitado
de maniobras. Utiliza un modelo coherente de dos cuerpos, enseña los controles
mediante el primer reto y define el éxito tanto por la distancia como por la
velocidad relativa, con una opción clara para reiniciar.
```

**Laboratorio de espejos**

```text
$taster crea un juego de rompecabezas en el que gire espejos para dirigir un haz
a través de objetivos. Utiliza direcciones de reflexión calculadas y reglas de
colisión visibles, añade cinco niveles cuidadosamente diseñados y permíteme
inspeccionar los ángulos de incidencia y reflexión.
```

**Taller de trenes de engranajes**

```text
$taster crea un juego de montaje de trenes de engranajes para alcanzar una relación
de transmisión objetivo. Mantén la coherencia entre el número de dientes, los
sentidos de giro y la geometría de engrane, y explica un montaje fallido mediante
el mecanismo en lugar de mostrar únicamente una puntuación en rojo.
```

**Reto robótico de recogida y colocación**

```text
$taster construye un juego cinemático de un brazo robótico con límites articulares
y tres objetivos de colocación. Proporciona controles manuales de las articulaciones
y una superposición del espacio de trabajo alcanzable, e indica exactamente qué
reglas de colisión o agarre implementa el juego simplificado.
```

#### Presentación y adaptación

**Dar sobriedad a una escena existente**

```text
$taster adapta esta explicación existente al estilo de ingeniería sobrio de mi
referencia: fondo de color carbón, vistas ortográficas, contornos claros y un color
de acento. Conserva su modelo y sus controles mientras sustituyes los efectos
decorativos por énfasis que tengan un propósito.
```

**Recorrido de cámara con inspección**

```text
$taster añade a este modelo un recorrido de cámara que se pueda interrumpir,
pasando de una vista general a tres mecanismos identificados por nombre y de
regreso. Permite que la interacción del usuario tome el control de inmediato,
proporciona botones para enfocar y encuadrar todo, y mantén legible cada parada
en pantallas estrechas.
```

**Separación y reensamblaje fiables**

```text
$taster añade una vista explosionada reversible a este conjunto utilizando sus
posiciones originales de reposo. Permíteme recorrer la línea de tiempo en cualquier
dirección, aislar una pieza y repetir la separación y el reensamblaje sin deriva;
elige trayectorias que comuniquen las relaciones de acoplamiento reales.
```

**Una versión accesible para el aula**

```text
$taster adapta esta explicación interactiva para usarla con teclado y en una tableta
de aula. Proporciona alternativas etiquetadas a los gestos, subtítulos legibles
y un modo opcional de movimiento reducido basado en pasos, sin eliminar los
controles significativos del modelo.
```

**Una ilustración técnica fija**

```text
$taster utiliza este mecanismo para producir una explicación SVG autónoma con
vista fija, una vista del conjunto montado, un detalle explosionado y etiquetas
concisas de las piezas. Mantén un carácter estático y editorial: da prioridad
a la jerarquía de líneas, las relaciones precisas y la legibilidad al ancho
previsto del artículo.
```
