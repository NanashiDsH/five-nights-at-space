# Verificación de Selene 3D

Se verificó la aplicación en Chrome de escritorio, mediante Playwright en modo sin ventana y WebGL 2 con SwiftShader. Las imágenes de prueba se capturaron del renderizador real. No se utilizó una imagen estática para representar el escenario.

## Pruebas de lógica

`node --test tests/simulation.test.js`: ocho pruebas aprobadas. Incluyen nueve rutas completas de misión con generación solar mínima/media/máxima, recargas conservativas, reservas de máscara, costo de linterna, umbrales de oxígeno, validación de partidas, configuración, colisiones, rutas dentro de instalaciones y las condiciones originales del motor.

El SHA-256 de `src/engine.js` se comparó con el motor anterior y coincide: no se modificó su contenido.

## Pruebas de navegador realizadas

- Inicio sin errores de JavaScript o WebGL bloqueantes.
- Captura del ratón por clic y liberación al abrir un panel.
- Movimiento horizontal del ratón y rotación de cámara.
- Desplazamiento WASD, paredes sólidas y apertura de puertas por proximidad.
- Recogida física del kit y la máscara mediante raycasting y E.
- Equipamiento de máscara desde inventario.
- Efectos críticos de oxígeno, umbrales y restablecimiento después de reiniciar.
- Reducción de pulsos y modificación del FOV mediante las opciones reales.
- Recargas con descuento de recursos; estación inhabilitada por fuga.
- Vigilancia mediante cámaras virtuales del mismo escenario.
- Ocultación del mapa al volver a la exploración.
- Oclusión de interacciones por una pared.
- Guardado y carga del estado del jugador y los recursos.
- Seis destinos de tarea, averías simultáneas y refugio: todos los robots llegaron atravesando las puertas y pasillos físicos.
- Las tres misiones se completaron también desde la interfaz de navegador, con secuencias manuales de reparación, espera de ayudantes, costos por turno y pantallas de victoria.
- El HTML autónomo abrió desde `file:///`, inició WebGL y Pointer Lock sin efectuar solicitudes HTTP externas.

## Criterios de aceptación del pedido

| Criterio | Evidencia |
| --- | --- |
| 1. Inicio sin errores bloqueantes | Prueba de arranque y navegador |
| 2. Sala en 3D real | Escena Three.js y capturas WebGL |
| 3. Mirada con ratón | Pointer Lock y cambio comprobado de yaw |
| 4. Movimiento WASD | Desplazamiento medido por entrada de teclado |
| 5. Paredes sólidas | Movimiento bloqueado y pruebas de colisión |
| 6. Primera persona | Cámara de 1,68 m sin cuerpo del jugador |
| 7. Mapa fuera de exploración | Panel cerrado y eliminado al volver al FPS |
| 8. Terminal con cámaras y mapa | Pestañas funcionales y renderizado de la cámara seleccionada |
| 9. Alertas desde averías | Diagnósticos enlazados a `mission.faults` |
| 10. Tres ayudantes | Grupos 3D y marcadores del mismo sistema |
| 11. Rutas coherentes | Recorridos en coordenadas físicas, comprobados contra instalaciones |
| 12. Inspección de averías | Asignación automática y llegada comprobada |
| 13. Reparaciones originales | Ajustar no repara; ejecutar aplica `advance` |
| 14. Efectos progresivos | Umbrales unitarios y estado crítico en navegador |
| 15. Warning crítico | Mensaje visible con reserva crítica |
| 16. Equipar máscara | Recogida física y botón de inventario comprobados |
| 17. Estación responde a averías | Transferencia y bloqueo por fuga comprobados |
| 18. Tres misiones jugables | Nueve recorridos de lógica y tres partidas completas de navegador |
| 19. Guardado/carga | JSON validado y recuperación de una reserva modificada |
| 20. Configuración | Persistencia, controles de FOV y reducción de movimiento comprobados |

## Límites de la verificación

No se realizó un benchmark en el equipo físico del usuario ni una prueba auditiva humana. Los modelos son procedurales y no se presentan como recursos cinematográficos escaneados. Los efectos son moderados y configurables. La simulación es educativa: no hay datos solares en vivo, certificación científica ni uso médico. Los archivos de prueba permiten repetir y ampliar las comprobaciones en otro equipo.

## Actualización de asignación, fatiga y descanso

16 pruebas de lógica aprobadas, incluidas ocho nuevas de operaciones. Se comprobaron detección previa, despacho manual, especialista, sustituto con éxito y fallo, costo completo sin reparación gratuita, presencia del jugador, camas, recuperación por turno, tripulantes no disponibles y migración de guardados. La prueba de navegador `browser-operations.mjs` recorre detección en cámara, descanso del especialista, sustituto fallido, recuperación y retorno al servicio, reparación personal y descanso usando una cama 3D real. Las referencias anteriores a envío automático describen la edición inicial; la política vigente es la asignación manual.
