console.log("CONTENTS - Enhanced Book Effect");

function drawBookContent(ctx, percentage, canvasWidth, canvasHeight) {
  const THICK = 1; // Spessore delle linee nere
  const DIST = 2; // Spessore delle linee bianche
  const lineSpacing = THICK + DIST;
  const linesLeft = 2 * Math.round(percentage / 10);
  const linesRight = 2 * Math.round((100 - percentage) / 10);
  const YOFFSET = -10;
  const PAGE_CURVATURE = 15; // Curvatura delle pagine
  console.log("[drawBookContent]", percentage);

  // Disegna le linee orizzontali sulla sinistra (pagine lette) con curvatura
  for (let i = 0; i < linesLeft; i++) {
    const y = canvasHeight - (i + 1) * lineSpacing;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; // Nero più trasparente
    ctx.beginPath();
    ctx.moveTo(0, y + YOFFSET);
    ctx.quadraticCurveTo(
      canvasWidth / 4,
      y + YOFFSET - PAGE_CURVATURE * (i / linesLeft),
      canvasWidth / 2 - 10,
      y + YOFFSET
    );
    ctx.stroke();
  }

  // Disegna le linee orizzontali sulla destra (pagine da leggere) con curvatura
  for (let i = 0; i < linesRight; i++) {
    const y = canvasHeight - (i + 1) * lineSpacing;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; // Nero più trasparente
    ctx.beginPath();
    ctx.moveTo(canvasWidth / 2 + 10, y + YOFFSET);
    ctx.quadraticCurveTo(
      (3 * canvasWidth) / 4,
      y + YOFFSET - PAGE_CURVATURE * (i / linesRight),
      canvasWidth,
      y + YOFFSET
    );
    ctx.stroke();
  }
}

function replaceDivWithCanvas() {
  const footer = document.querySelector('ion-footer[item-i-d="reader-footer"]');
  if (footer) {
    const textDiv = footer.querySelector('ion-title[item-i-d="reader-footer-title"] div.text-div');
    if (textDiv) {
      const text = textDiv.textContent;
      const percentageMatch = text.match(/(\d+)%/);
      if (percentageMatch) {
        const percentage = parseInt(percentageMatch[1], 10);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const canvasWidth = document.documentElement.clientWidth;
        const canvasHeight = 80; // Aumentata l'altezza per un effetto più realistico
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Aggiungi ombreggiatura per profondità
        canvas.style.boxShadow = '0 -5px 15px rgba(0, 0, 0, 0.2)';
        canvas.style.position = 'fixed';
        canvas.style.bottom = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = '1000';

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = 'https://raw.githubusercontent.com/jumpjack/kindlebar/refs/heads/main/libro-bottom.png';

        img.onload = function() {
          // Disegna l'immagine con opacità ridotta
          ctx.globalAlpha = 0.8;
          ctx.drawImage(img, 0, 70, canvas.width, img.height);
          ctx.globalAlpha = 1.0;

          // Aggiungi un gradiente per un effetto più realistico
          const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
          gradient.addColorStop(0, 'rgba(200, 180, 150, 0.3)');
          gradient.addColorStop(1, 'rgba(150, 120, 80, 0.1)');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);

          drawBookContent(ctx, percentage, canvasWidth, canvasHeight);

          // Aggiungi una linea centrale per la rilegatura
          ctx.strokeStyle = 'rgba(100, 70, 40, 0.5)';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(canvasWidth / 2, 0);
          ctx.lineTo(canvasWidth / 2, canvasHeight);
          ctx.stroke();

          // Aggiungi event listener per il clic sul canvas
          canvas.addEventListener('click', function(event) {
console.log("CLICK");
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
console.log("   y=",y);

            if (x < canvasWidth / 2) {
              // Clic sulle pagine lette (sinistra)
              const val = (canvasHeight - y) / canvasHeight;
              const newPercentage = val * percentage;
console.log("   newPercentage=",newPercentage);
              updateSlider(newPercentage);
            } else {
              // Clic sulle pagine da leggere (destra)
              const val = (canvasHeight - y) / canvasHeight;
              const newPercentage = percentage + val * (100 - percentage);
console.log("   newPercentage=",newPercentage);
              updateSlider(newPercentage);
            }
          });

          // Sostituisci il footer con il canvas
          footer.parentNode.replaceChild(canvas, footer);
        };

        img.onerror = function() {
          console.error("Errore nel caricamento dell'immagine");
        };
      }
    }
  }
}

function updateSlider(newPercentage) {
  const slider = document.querySelector('ion-range[id="kr-scrubber-bar"]');
console.log("Slider=",slider);
  if (slider) {
    const max = parseInt(slider.getAttribute('max'));
    const newValue = (newPercentage / 100) * max;
    slider.value = newValue.toString();
console.log("NEW slider value=",slider.value);

    // Trigger event per aggiornare la visualizzazione
    const event = new Event('input', { bubbles: true });
    slider.dispatchEvent(event);
  }
}

// Funzione per aggiungere immagini ai lati
function addSideImage(container, imageUrl, side) {
  if (container) {
    const existingImage = container.querySelector('.book-side-image');
    if (!existingImage) {
      const img = document.createElement('img');
      img.src = imageUrl;
      img.alt = 'Book ' + side + ' side';
      img.className = 'book-side-image';
      img.style.position = 'fixed';
      img.style[side] = '0';
      img.style.top = '0';
      img.style.height = '100vh';
      img.style.zIndex = '999';
      img.style.pointerEvents = 'none'; // Permette di cliccare attraverso l'immagine
      // Aggiungi ombreggiatura per profondità
      if (side === 'left') {
        img.style.boxShadow = '5px 0 15px rgba(0, 0, 0, 0.3)';
      } else {
        img.style.boxShadow = '-5px 0 15px rgba(0, 0, 0, 0.3)';
      }
      document.body.appendChild(img);
    }
  }
}

// Aggiungi un listener per il pulsante dell'estensione
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "replaceDiv") {
    replaceDivWithCanvas();
    // Aggiungi immagini ai lati
    const buttonContainerRight = document.querySelector('.kr-chevron-container-right.chevron-container.right');
    const buttonContainerLeft = document.querySelector('.kr-chevron-container-left.chevron-container');
    addSideImage(buttonContainerLeft, 'https://raw.githubusercontent.com/jumpjack/kindlebar/refs/heads/main/libro-left.png', 'left');
    addSideImage(buttonContainerRight, 'https://raw.githubusercontent.com/jumpjack/kindlebar/refs/heads/main/libro-right.png', 'right');
  }
});
