# SPEC — "Un día con la parroquia en el bolsillo" (storyline A)

GOAL:    quien lo vea en el feed entiende que la app de la parroquia le acompaña todo el día y escanea el QR / abre parroquiaciudadarce.org/app.
OUTPUT:  HyperFrames, 1080 x 1920 (9:16), 30 fps
TIME:    36 s x 30 = 1080 frames. Sin música (no hay sesión de HeyGen); efectos del banco local.

LOOK:    suelo plano que cambia de color con la hora (inundación de color 0.55 s power2.inOut):
         6:00 #fbe6cc · 10:00 #dff4fc · 15:00 #61c2e6 · 18:00 #e88f21 · 20:00 #09203e (sigue en el cierre).
         Tinta #09203e sobre suelos claros, #ffffff sobre el azul noche. Acento ámbar #e88f21: la hora y una frase del cierre.
         Display: Newsreader 600, 78 px titulares, 124 px frase final, tracking -1%. Texto: Hanken Grotesk 700 34 px (hora, +12% tracking) y 500 36 px.
         Medio: capturas reales de la app (public/img/app) dentro de un teléfono azul marino #051733, bisel 14 px, radio 60 px,
         sombra 0 30 px 70 px rgba(5,23,51,.28). Sin grano, sin viñeta.
OBJECTS: el teléfono con las pantallas reales; el sol (círculo ámbar 200 px) que cruza el cielo y de noche es luna (#f4fbff);
         el logo de la parroquia (icon.svg) y el QR real (qr-app.png).
MOTION:  llegada de títulos: palabra a palabra blur 6→0 px + opacidad 0.13 s, 0.067 s entre palabras, sin desplazamiento.
         Cámara (acercamiento a la tarjeta): 0.6 s power2.inOut, escala 1.4–1.65, la tarjeta queda centrada en y≈950.
         Cambio de pantalla: barrido horizontal 0.55 s power3.inOut. Salida del teléfono: 0.5 s power3.in.
         Logo: la luna viaja al centro y se convierte en el logo (0.7 s power3.inOut), luego el logo se asienta 0.3 s expo.out.
SHOTS:
  0.0–6.0   06:00 · Inicio: el sol ya está bajo a la izquierda, título visible en el cuadro 0 ("Empezá el día con el Evangelio.");
            1.6 s acercamiento al Evangelio de hoy (Lc 13, 10-17). Sonido: ninguno → whoosh al cambiar.
  6.0–11.5  10:00 · Radio: barrido a la pantalla Radio Católica; suelo celeste; acercamiento a "EN VIVO · Música entre programas".
  11.5–17.0 15:00 · Agenda: "El próximo evento, siempre a la vista."; acercamiento a "Próximo evento".
  17.0–22.5 18:00 · Rezar: atardecer ámbar; "El Rosario y la Liturgia de las Horas."; acercamiento a tarjetas y horas.
  22.5–28.0 20:00 · Sectores: noche azul, luna; "Conocé tu sector y su ermita."; acercamiento a Sector 1 · Barrio El Centro.
  28.0–31.0 Frase: el teléfono sale hacia abajo (whoosh); "Tu parroquia, / todo el día." (todo el día en ámbar).
  31.0–36.0 Cierre: la luna se vuelve el logo, "App de la parroquia", "Inmaculada Concepción de María · Ciudad Arce",
            QR en tarjeta blanca y parroquiaciudadarce.org/app; se mantiene ≥2.5 s. Chime al logo, pop al QR.
BANNED:  vacío oscuro con elementos pequeños flotando; brillos, partículas, degradados; tres tarjetas en fila; títulos que se mueven
         mientras se leen; logo en una esquina; maquetas inventadas (solo capturas reales); itálicas de acento.
QA:      cuadros 0.0, 3.0, 8.5, 14.0, 19.5, 25.0, 29.5, 34.0: título legible en la banda 168–1330 px, tarjeta enfocada nítida,
         nada de texto bajo 1330 px, contraste correcto en cada suelo.
