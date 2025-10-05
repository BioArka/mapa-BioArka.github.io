document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("contenedor");
  const grupo = document.getElementById("mapa-grupo");
  const mapa = document.getElementById("mapa");
  const zonas = document.querySelectorAll(".zona");
  const infos = document.querySelectorAll(".cont.info");

  // Detectar si es dispositivo móvil
  const esMovil = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

  // VARIABLES INICIALES
  let escalaZoom = esMovil ? 0.8 : 1;      // zoom inicial distinto
  const zoomMin = esMovil ? 0.8 : 1;     
  const zoomMax = esMovil ? 1 : 1.5;     
  let posX = esMovil ? -1000 : -1250;       // posición inicial X distinta
  let posY = esMovil ? 0 : -150;            // posición inicial Y
  let arrastrando = false;
  let inicioX, inicioY;
  let zoomHabilitado = true;

  // Para touch
  let pinchDistanciaInicial = null;
  let escalaInicial = escalaZoom;

  function aplicarTransformacion() {
    const contW = contenedor.offsetWidth;
    const contH = contenedor.offsetHeight;
    const imgW = mapa.naturalWidth * escalaZoom;
    const imgH = mapa.naturalHeight * escalaZoom;

    // Limitar movimiento para que no se vea el fondo
    const minX = Math.min(0, contW - imgW);
    const minY = Math.min(0, contH - imgH);
    const maxX = 0;
    const maxY = 0;

    posX = Math.min(maxX, Math.max(minX, posX));
    posY = Math.min(maxY, Math.max(minY, posY));

    grupo.style.transform = `translate(${posX}px, ${posY}px) scale(${escalaZoom})`;
  }

  // Aplicar inicial
  mapa.addEventListener("load", aplicarTransformacion);
  if (mapa.complete && mapa.naturalWidth > 0) aplicarTransformacion();

  // Zoom con scroll
  contenedor.addEventListener("wheel", (e) => {
    if (!zoomHabilitado) return;
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.05 : -0.05;
    escalaZoom = Math.min(zoomMax, Math.max(zoomMin, escalaZoom + delta));
    aplicarTransformacion();
  });

  // Mouse drag
  contenedor.addEventListener("mousedown", (e) => {
    if (!zoomHabilitado) return;
    arrastrando = true;
    inicioX = e.clientX - posX;
    inicioY = e.clientY - posY;
    contenedor.style.cursor = "grabbing";
  });

  document.addEventListener("mouseup", () => {
    arrastrando = false;
    contenedor.style.cursor = "default";
  });

  document.addEventListener("mousemove", (e) => {
    if (!arrastrando || !zoomHabilitado) return;
    posX = e.clientX - inicioX;
    posY = e.clientY - inicioY;
    aplicarTransformacion();
  });

  // --- TOUCH ---
  contenedor.addEventListener("touchstart", (e) => {
    if (!zoomHabilitado) return;

    if (e.touches.length === 1) {
      // arrastre
      arrastrando = true;
      inicioX = e.touches[0].clientX - posX;
      inicioY = e.touches[0].clientY - posY;
    } else if (e.touches.length === 2) {
      // pinch zoom
      arrastrando = false;
      pinchDistanciaInicial = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      escalaInicial = escalaZoom;
    }
  });

  contenedor.addEventListener("touchmove", (e) => {
    if (!zoomHabilitado) return;
    e.preventDefault();

    if (e.touches.length === 1 && arrastrando) {
      posX = e.touches[0].clientX - inicioX;
      posY = e.touches[0].clientY - inicioY;
      aplicarTransformacion();
    } else if (e.touches.length === 2 && pinchDistanciaInicial) {
      const nuevaDistancia = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const factor = nuevaDistancia / pinchDistanciaInicial;
      escalaZoom = Math.min(zoomMax, Math.max(zoomMin, escalaInicial * factor));
      aplicarTransformacion();
    }
  }, { passive: false });

  contenedor.addEventListener("touchend", () => {
    arrastrando = false;
    pinchDistanciaInicial = null;
  });

  // POPUPS
  zonas.forEach((zona, i) => {
    zona.addEventListener("click", () => {
      infos[i].style.display = "flex";
      zoomHabilitado = false;
    });
  });

  infos.forEach((info) => {
    const cerrar = info.querySelector(".cerrar");
    cerrar.addEventListener("click", () => {
      info.style.display = "none";
      zoomHabilitado = true;
    });
  });

  // 🌟 PANTALLA DE INICIO 🌟
  const btnInicio = document.getElementById("btn-inicio");
  const pantallaInicio = document.getElementById("pantalla-inicio");

  if (btnInicio && pantallaInicio) {
    btnInicio.addEventListener("click", () => {
      pantallaInicio.style.opacity = "0";
      setTimeout(() => {
        pantallaInicio.style.display = "none";
      }, 800);
    });
  }
}); // 👈 esta es la última llave y paréntesis
