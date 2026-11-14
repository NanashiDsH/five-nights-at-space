# Base Lunar — Sala de control

Juego educativo para niños de 7 a 12 años, desarrollado con HTML, CSS y JavaScript. Parte de la idea original de vigilar cámaras y operar sistemas de supervivencia, adaptada a una base lunar.

## Jugar

La partida ahora comienza en **primera persona**, dentro de la sala de control. A la izquierda están el oxígeno y la salud; a la derecha hay un monitor principal y cuatro cámaras seleccionables. Los monitores muestran el estado real de la partida, incluidas las averías y la tripulación en el refugio. Puedes asignar tareas y ejecutar turnos desde el escritorio. Los botones superiores permiten cambiar entre primera persona y el panel de control original sin reiniciar la misión.

**Salud:** cerrar un turno con menos de 25 de oxígeno resta 6 de salud; una tormenta sin refugio resta 8. Los efectos se suman. La salud no se recupera durante una misión y llegar a cero termina la partida. Son reglas de juego simplificadas, no valores médicos. Pulsa **Examinar mi estado** para consultarlas.

**Terminal de sistemas:** está a la derecha, debajo de los monitores. Informa de las reservas de comida, el circuito de ventilación y las cámaras cuyas zonas tienen averías. Usa los estados **OK**, **REVISAR** y **CRÍTICO**. Sus botones permiten ir a la cámara o preparar la cosecha, la producción de oxígeno o la reparación. Las alertas se recalculan con el estado de la partida y se despejan al resolver el problema. Las cámaras mantienen señal: la alerta identifica una avería en la zona observada.

**Mapa de la cámara de control (CAM 00):** aparece en el centro de la vista en primera persona y junto al monitor en el panel original. Conecta hábitat, paneles, cultivos y laboratorio mediante pasillos. Las zonas con alertas muestran **WARNING**. Al pulsar una zona se abre su cámara. El botón central devuelve a tu puesto de control.

**Ayudantes:** Vega, Sol y Leo salen automáticamente a inspeccionar las alertas. El mapa muestra sus recorridos y posiciones; las cámaras muestran a quienes ya llegaron. Las órdenes de trabajo asignan un ayudante a la tarea y el botón de ejecutar espera su llegada. Inspeccionar no repara gratuitamente: debes preparar la reparación, completar el ajuste y ejecutar el turno. El refugio tiene prioridad y reúne al equipo en el hábitat. La preferencia de reducir movimiento hace los desplazamientos instantáneos.

Abre `juego-base-lunar.html`, incluido como entrega independiente. No necesita instalación, cuenta ni conexión. Contiene toda la interfaz, las ilustraciones vectoriales y el código.

1. Pulsa **Tomar el mando** en el selector de misiones.
2. Cambia entre las cuatro cámaras con los botones o las teclas 1–4.
3. Pulsa un equipo iluminado para preparar una tarea. Las alertas naranjas identifican averías.
4. Si reparas, completa la secuencia de conectores. El ajuste prepara la reparación; no la aplica gratis.
5. Decide si llevar al equipo al refugio y revisa los costos.
6. Pulsa **Ejecutar turno**. Consulta las variaciones de recursos y la bitácora.

Puedes activar los sonidos desde la barra superior. No hay cronómetro ni sobresaltos. La interfaz respeta la preferencia de reducir movimiento del navegador.

## Las misiones

| Misión | Turnos | Hallazgos mínimos | Sistemas que fallan |
| --- | --- | --- | --- |
| Primer contacto | 6 | 2 | Aire |
| Noche en Selene | 8 | 4 | Paneles y aire |
| Horizonte rojo | 10 | 6 | Aire, paneles y riego |

Completa los turnos con oxígeno y comida por encima de cero, exposición por debajo de 100 y los hallazgos solicitados. Ganar desbloquea la siguiente misión. Los desbloqueos se conservan en el almacenamiento local del navegador cuando está disponible; una partida en curso se reinicia al recargar.

## Qué enseña

El generador de oxígeno, el invernadero, el laboratorio y la operación del refugio comparten energía. Las fugas consumen reservas adicionales. Reparar ocupa una tarea, pero reduce pérdidas futuras. El jugador puede comparar estrategias y volver a intentarlo sin penalizaciones permanentes.

## Código

- `dist/index.html`: estructura y ventanas del juego.
- `dist/style.css`: interfaz adaptable y animaciones.
- `dist/engine.js`: recursos, averías, costos y condiciones de victoria.
- `dist/scenes.js`: cuatro escenas SVG y astronautas, sin imágenes externas.
- `dist/app.js`: cámaras, tareas, ajustes manuales, sonidos y progresión.
- `dist/firstperson.js` y `dist/firstperson.css`: sala en primera persona, manos y escritorio, soporte personal y monitores sincronizados.

Los archivos separados usan módulos ES y deben servirse por HTTP para desarrollarlos. Con Node.js, puede utilizarse un servidor estático existente. Para jugar directamente desde el disco, usa el HTML autónomo entregado junto al código.

## Ciencia y límites

Referencias NASA: [radiación en Apolo](https://www.nasa.gov/wp-content/uploads/static/history/alsj/WOTM/WOTM-Radiation.html) y [sistemas biológicos en el entorno lunar](https://science.nasa.gov/lunar-science/focus-areas/biological-systems/).

Todos los valores, eventos y pronósticos son simulados. No se incorporan conjuntos de datos NASA ni hay conexión en vivo a DONKI. La exposición es un indicador del juego, no una dosis médica. Los turnos y los ciclos de cultivo son simplificaciones. La respuesta de la Tierra al siguiente turno no representa el tiempo físico de comunicación Tierra–Luna. La energía del refugio corresponde a su operación; el blindaje es físico.

## Verificación

Pruebas automatizadas de lógica: las tres misiones se completan con generación solar mínima, media y máxima; costos, fallas persistentes, beneficios de reparaciones, protección solar, comunicación diferida, objetivos científicos, finales de derrota e inmutabilidad del estado comprobados. Sintaxis de JavaScript comprobada. Revisión visual automatizada pendiente: el servicio de control del navegador no estuvo disponible.

El proyecto se entrega localmente; todavía no tiene un enlace público de demostración. La presentación o video de entrega tampoco está incluida en esta actualización del juego.
