# Modelos 3D

Esta versión utiliza geometría procedural real de Three.js. La creación de habitaciones, mobiliario, puertas y robots está en `src/world.js`. La lógica de rutas permanece en `src/crew.js` y la geometría navegable en `src/layout.js`.

Para introducir modelos GLB/GLTF, añade los archivos aquí e incorpora GLTFLoader de la misma versión r180. Sustituye los grupos visuales conservando las escalas en metros, coordenadas de equipos, etiquetas de interacción, colisionadores y posiciones de los robots. Los modelos visuales no deben cambiar las reglas de `engine.js`.
