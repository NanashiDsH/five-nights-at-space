# Base Lunar Selene 3D — Edición FPS

Edición con asignación manual, fatiga y descansos. Remasterización jugable del prototipo Base Lunar Selene. Mundo 3D real con Three.js r180 y WebGL 2, cámara FPS, cinco instalaciones conectadas, vigilancia, supervivencia y ayudantes. No contiene armas ni combate. La representación utiliza modelos y materiales procedurales; es una base funcional preparada para incorporar modelos GLB/GLTF, no una colección de escenarios prefabricados.

## Inicio rápido: jugar sin instalar

1. Descomprime el ZIP completo.
2. Abre **`selene-3d.html`** en Chrome o Edge actualizado.
3. Pulsa **Iniciar exploración**. El clic captura el ratón; **ESC** lo libera.

El HTML autónomo incluye el código, Three.js y sus dependencias. No necesita cuenta, conexión ni servidor. Se comprobó la apertura desde el disco en Chrome. Algunos navegadores integrados pueden restringir WebGL o la captura del ratón: en ese caso, abre el archivo en un navegador de escritorio o utiliza el servidor local.

## Ejecutar el código modular

Requiere Node.js 20 o posterior. Las dependencias de renderizado ya están incluidas en `vendor/`; no necesitas ejecutar `npm install` para jugar ni para las pruebas de lógica.

```powershell
node server.mjs
```

Abre **http://127.0.0.1:4173**. En Windows también puedes utilizar `Iniciar-juego.cmd`. Mantén la terminal del servidor abierta mientras juegas. `PORT` permite elegir otro puerto. El servidor solo escucha en el equipo local.

## Controles

| Control | Función |
| --- | --- |
| Ratón | Mirar libremente después de capturar el cursor |
| W A S D | Caminar |
| Shift | Caminar más rápido |
| E | Interactuar con un objeto visible a un máximo de 3,25 m |
| C | Terminal de cámaras |
| M | Mapa |
| T | Tareas, refugio y comunicaciones |
| I | Inventario y equipamiento |
| ESC | Cerrar panel, pausar o liberar el cursor |

Después de cerrar un panel, pulsa **Continuar exploración** para capturar el ratón de nuevo. No se solicita la captura sin un clic válido. La cámara permanece a 1,68 m del suelo y no muestra un avatar del jugador. La base es plana; no hay salto ni plataformas.

## Tu primera partida

1. Recoge el **kit de reparación** en el pedestal de la izquierda del núcleo de control.
2. Explora el hábitat y recoge la **máscara de oxígeno**. Puedes equiparla desde `I`.
3. Consulta las tareas con `T` o acercándote a un equipo y pulsando `E`.
4. Prepara ciencia, producción de oxígeno, cosecha, ahorro o una reparación.
5. Revisa el pronóstico solar y decide si activar el refugio.
6. El ayudante asignado debe llegar al equipo. Puedes observarlo en el mundo, mapa o cámaras.
7. Para reparar, confirma la falla en monitoreo y elige un tripulante o acudir personalmente. Completa la secuencia de conectores. Esto prepara la reparación; no elimina la avería gratuitamente.
8. Ejecuta el turno. El motor aplica costos, consumos, resultados y la siguiente alerta.

Las tres misiones y sus objetivos originales se mantienen: **Primer contacto** (6 turnos, 2 hallazgos), **Noche en Selene** (8 turnos, 4 hallazgos) y **Horizonte rojo** (10 turnos, 6 hallazgos). Ganar desbloquea la siguiente misión. El aire de las instalaciones, la energía, los alimentos, la salud y la exposición conservan la simulación original.

## Oxígeno e inventario

Existen dos sistemas distintos:

- **Base:** `mission.oxygen`, gestionado por el motor original. Se consume por turno y aumenta al producir oxígeno. Una fuga añade pérdidas y puede inhabilitar la estación.
- **Personal:** `inventory.personalOxygen`, empieza en 100. Consume 8 por turno, 4 adicionales si la base tenía una fuga al iniciar el turno y 4 adicionales si recorriste más de 15 m con Shift desde el turno anterior. Caminar o esperar no consume recursos por tiempo real.

La máscara se recoge físicamente y contiene un depósito finito de **40**. Si está equipada, cubre primero el consumo personal con ese depósito. El HUD y los efectos muestran el suministro que estás respirando: porcentaje del depósito cuando la máscara tiene aire; reserva personal en los demás casos. Equiparla no crea oxígeno ni rellena el traje.

La estación del hábitat transfiere hasta **25** unidades de la base al traje o al depósito y gasta **4 de energía**. Deja al menos **15 de oxígeno** en las instalaciones. Si hay fuga, está inhabilitada. Una recarga no avanza el turno; las transferencias repetidas agotan reservas y energía reales.

Cuando el consumo personal no está totalmente cubierto por la máscara y la reserva personal queda por debajo de 25, se pierden 6 de salud adicionales. La máscara con suministro evita esa penalización personal, pero no cambia las penalizaciones originales del aire de la base. Agotar el suministro personal y no estar respirando de una máscara con aire termina la misión. La salud no se regenera durante la misión.

El kit es reutilizable y habilita el ajuste de reparaciones. La linterna ilumina el mundo y consume **2 de energía adicionales por turno** cuando está encendida. El escáner se recoge en el laboratorio a partir del **turno 2** y consulta el diagnóstico real.

### Efectos de visión

| Suministro activo | Estado |
| --- | --- |
| 100–51 | Normal |
| 50–31 | Aviso amarillo en el HUD |
| 30–16 | Viñeta roja suave y respiración más intensa |
| 15–1 | WARNING crítico, viñeta más intensa y alarma al entrar en ese estado |
| 0 | Consecuencias de supervivencia en el motor |

El centro de la imagen sigue siendo utilizable. Las opciones permiten desactivar efectos, reducir su intensidad, quitar pulsos y desenfoque periférico, suavizar el ratón o desactivar el movimiento al caminar. Reiniciar o cargar recalcula los efectos desde el estado guardado.

## Cámaras, mapa y ayudantes

La exploración normal muestra solamente el mundo y un HUD discreto. El mapa se abre en una pantalla propia o desde la terminal. Cinco cámaras virtuales ocupan posiciones reales en control, hábitat, laboratorio, cultivos y paneles. Se renderiza solamente la seleccionada, a un máximo aproximado de 15 actualizaciones por segundo; no se dibujan cinco vistas simultáneas.

El mapa usa exactamente las coordenadas de `layout.js`. Sus indicadores muestran habitaciones, pasillos, puertas, posición y orientación del jugador, y las rutas y posiciones de los robots.

- **Vega:** detalles naranjas; prioridad de ingeniería.
- **Sol:** detalles cyan; prioridad de cultivos.
- **Leo:** detalles violetas; ciencia y apoyo.

Las averías ahora requieren detección y una orden del jugador: observa la cámara afectada o examina el equipo con E, y elige al responsable. Una tarea explícita tiene prioridad; el refugio reúne al equipo en el hábitat. Los tripulantes en descanso quedan fuera de las asignaciones. Los robots se desplazan por el grafo físico, abren puertas por proximidad y respetan colisionadores. Inspeccionar no modifica recursos ni repara. Las cámaras muestran los mismos grupos 3D que ve el jugador. El protocolo de refugio conserva la protección global por turno del juego original; no obliga a cambiar la posición del jugador para aplicar sus reglas.

Las alertas aparecen por cambios reales del estado. El historial evita repetir una misma alerta en cada fotograma y registra llegadas, recargas y reparaciones. Las alarmas de oxígeno se disparan al entrar en estado crítico. El audio sintetizado incluye ventilación, respiración, pasos, puertas, equipos, motores de robots por proximidad y avisos; comienza después de una interacción válida del usuario.

## Guardar y cargar

El menú de pausa permite guardar/cargar en el navegador y exportar/importar un JSON. Hay guardado automático después de turnos, recargas y recogida de objetos. El guardado incluye misión, recursos, inventario, tareas, preparación de reparación, jugador, ayudantes, puertas e historial. El archivo importado se valida antes de utilizarse. Las opciones se conservan por separado.

El almacenamiento de un archivo abierto desde el disco depende del navegador. Exporta un JSON si quieres trasladar una partida entre equipos, entre el HTML autónomo y localhost, o conservarla fuera del almacenamiento local.

## Opciones gráficas

- **Baja:** resolución limitada a 1×, sin sombras.
- **Media:** hasta 1,35×, sombras opcionales de 1024.
- **Alta:** hasta 1,7×, sombras opcionales de 2048.

Se utilizan materiales PBR, iluminación ambiente y dinámica, reflejos de un entorno procedural, ventanas, terreno lunar y Tierra procedural. Las tormentas cambian luces e indicadores y habilitan partículas exteriores moderadas. Las averías afectan pantallas, conductos y cultivos. Los objetos visuales son procedurales; se pueden sustituir por modelos más detallados sin alterar el motor.

## Arquitectura

| Archivo | Responsabilidad |
| --- | --- |
| `src/engine.js` | Motor original, conservado sin modificar |
| `src/operations.js` | Detección manual, responsables, fatiga, descanso y riesgo de sustitución |
| `src/survival.js` | Aire personal, máscara, transferencias y adaptación de turnos |
| `src/layout.js` | Dimensiones físicas, navegación, colisiones y coordenadas del mapa |
| `src/world.js` | Geometría, PBR, iluminación, equipos, puertas y cámaras Three.js |
| `src/player.js` | Ratón, Pointer Lock, WASD y movimiento con colisiones |
| `src/crew.js` | Prioridades originales y robots con rutas en el mundo físico |
| `src/audio.js` | Ambiente y sonidos sintetizados |
| `src/storage.js` | Configuración persistente y validación de guardados |
| `src/app.js` | Orquestación del motor, HUD, terminales, acciones e inventario |
| `vendor/` | Three.js r180, módulo core, licencia MIT y huellas SHA-256 |
| `assets/models/` | Directorio preparado para futuras sustituciones GLB/GLTF |
| `legacy/` | Copia del prototipo anterior para comparación |

## Pruebas y reconstrucción

```powershell
node --test tests/*.test.js
node build.mjs
```

El segundo comando genera `selene-3d.html` y `dist/index.html`, con dependencias embebidas y sin peticiones externas. `package.json` declara Three.js 0.180.0; se distribuye la dependencia ya descargada y no hace falta npm para reconstruir.

Las pruebas de navegador utilizadas se incluyen en `tests/browser-*.mjs`. Requieren Playwright y Chrome. Define `PLAYWRIGHT_MODULE` con la URL `file:///.../playwright/index.mjs` si Playwright no está instalado localmente; `CHROME_PATH` permite elegir el ejecutable y `BASE_URL` el servidor de prueba. No son necesarios para jugar. Consulta `VALIDACION.md` para resultados y límites de verificación.

## Ciencia y límites del modelo

Referencias: [NASA — radiación en Apolo](https://www.nasa.gov/wp-content/uploads/static/history/alsj/WOTM/WOTM-Radiation.html) y [NASA — sistemas biológicos en la Luna](https://science.nasa.gov/lunar-science/focus-areas/biological-systems/).

Todos los valores, dosis de juego, umbrales, averías y pronósticos son simulados. No hay datos DONKI en vivo ni conjuntos de datos NASA integrados. Los turnos no son días reales, los cultivos están acelerados y el retraso de comunicaciones no representa el tiempo físico Tierra–Luna. Los efectos visuales no son una evaluación médica. Prototipo independiente, sin afiliación con NASA.

No hay multijugador, física de salto, modelos humanos fotorrealistas ni materiales escaneados. La verificación automática se realizó con Chrome de escritorio y WebGL mediante SwiftShader; el rendimiento en una laptop concreta depende de su GPU, resolución y navegador. La calidad procedural actual prioriza funcionalidad y continuidad del juego.

## Asignación y fatiga

- **Detectar:** abre la cámara de una zona con avería o examina su equipo con E. La confirmación queda en la bitácora.
- **Enviar:** desde la reparación, elige a Vega (aire/paneles), Sol (riego) o Leo (laboratorio). El especialista disponible no tiene fallo aleatorio. Un sustituto tiene 30 % de fallo, o 45 % con fatiga de 50 o más.
- **Ir tú:** necesitas kit y estar a menos de 3,25 m del equipo al ajustar y ejecutar. Reparar personalmente añade 24 de fatiga. Caminar añade 0,12 por metro y correr 0,24.
- **Fatiga del equipo:** caminar añade 0,08 por metro; una reparación especializada añade 22, una sustitución 28 y una tarea normal 12. El intento fallido también cansa.
- **Fallo:** consume el turno y el costo energético completo. La avería permanece y sus pérdidas se aplican durante ese turno. No se cuenta una reparación.
- **Agotamiento:** a 80 de fatiga no se aceptan nuevas intervenciones. A 65 no puedes correr y a 80 tu marcha se ralentiza. Todavía puedes caminar a una cama.
- **Tu descanso:** utiliza E en una cama del hábitat y ejecuta un turno de descanso; recuperas hasta 35 de fatiga. Ahorrar energía desde otra sala no te descansa.
- **Descanso del equipo:** abre Tripulación en monitoreo, tareas o con R. Envía al ayudante al hábitat. Recupera hasta 35 por turno después de llegar; antes de llegar no recupera nada. Debe completar al menos un turno y bajar de 80 para poder pulsar Volver al servicio. Mientras tanto, puede sustituirlo otro tripulante.
- **Guardado:** fatigas, descansos, detección y responsable se conservan. Los guardados anteriores se migran con fatiga inicial cero.

Estas cifras son reglas educativas de juego, no valores fisiológicos reales.
