# Análisis y decisiones de integración

El prototipo se localizó en `outputs/base-lunar/dist`. `engine.js` contiene un motor de turnos independiente del DOM: `createMission`, `planCost`, `validatePlan`, `advance` y diagnósticos. `app.js` lo conectaba a interfaces SVG. `firstperson.js` era una presentación plana; `scenes.js` generaba ilustraciones. `crew.js` combinaba prioridades de asignación, movimiento en coordenadas de un mapa y montaje del mapa en el DOM.

Se conservó byte por byte `engine.js`. Las reglas de las tres misiones, daños, costos y condiciones de victoria siguen entrando por `advance`. El nuevo `survival.js` lo adapta para el inventario y oxígeno personal. Las reglas añadidas están documentadas en README y cubiertas por pruebas.

Se separó la navegación de los ayudantes de la interfaz. Las prioridades de asignación se mantuvieron, pero los destinos, rutas y posiciones ahora usan coordenadas físicas de `layout.js`. Los mismos objetos 3D alimentan el renderizado FPS y las cámaras virtuales. El mapa proyecta esas coordenadas; no posee una simulación independiente.

La colisión utiliza la unión de habitaciones y pasillos, radios de los agentes, cajas de mobiliario y el estado animado de las puertas. El movimiento se divide en pasos pequeños para evitar atravesar colisionadores con deltas grandes. El raycasting incluye las superficies opacas para impedir interactuar a través de paredes.

La exploración no tiene un temporizador de supervivencia. Los recursos se consumen al confirmar turnos, conservando el ritmo del prototipo. Los robots y puertas avanzan por tiempo de fotograma; los menús de pausa/configuración suspenden ese movimiento y liberan el cursor. La terminal, mapa y tareas permiten observar a los ayudantes mientras deciden sus órdenes.

Los materiales, geometrías primitivas y luces se reutilizan. Las sombras se limitan a una luz principal. La vigilancia reutiliza un solo renderer, renderiza una cámara a la vez y limita su frecuencia. No hay descargas de imágenes ni modelos durante una partida.

El proyecto anterior se conserva en `legacy/`, además del respaldo descargable existente. La edición 3D incluye fuentes modulares, servidor local, pruebas, licencias y un HTML autónomo generado a partir de esas mismas fuentes.

La actualización de operaciones sustituye el despacho automático a averías por detección y asignación explícita. `operations.js` centraliza disponibilidad, fatiga, descanso y riesgo. En un intento fallido, el adaptador usa el consumo de un turno sin reparación y debita el costo del intento; así la fuga o baja producción sigue afectando los recursos. `engine.js` permanece idéntico.
