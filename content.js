console.log("CONTENTS - Enhanced Book Effect");
let imagesAdded = false; // Flag per controllare se le immagini laterali sono state aggiunte
let lastPercentage = null; // Variabile per memorizzare l'ultimo valore dello slider
const MAX_PAGES_HEIGHT = 70;
const CANVAS_HEIGHT = 80;
const YOFFSET = 10;

function drawBookContent(ctx, percentage, canvasWidth, canvasHeight) {
  const THICK = 1; // Spessore delle linee nere
  const DIST = 2; // Spessore delle linee bianche
  const lineSpacing = THICK + DIST;
  const linesLeft = 2 * Math.round(percentage / 10);
  const linesRight = 2 * Math.round((100 - percentage) / 10);
  const YOFFSET = -1;
  const PAGE_CURVATURE = 15; // Curvatura delle pagine

  // Disegna le linee orizzontali sulla sinistra (pagine lette) con curvatura
  for (let i = 0; i < linesLeft; i++) {
    const y = canvasHeight - (i + 1) * lineSpacing - YOFFSET;
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
    const y = canvasHeight - (i + 1) * lineSpacing - YOFFSET;
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
        const canvasHeight = CANVAS_HEIGHT; // Aumentata l'altezza per un effetto più realistico
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        // Aggiungi ombreggiatura per profondità
        //canvas.style.boxShadow = '0 -5px 15px rgba(0, 0, 0, 0.2)';
        canvas.style.position = 'fixed';
        canvas.style.bottom = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = '1000';

        // Aggiungi il canvas al footer
        footer.appendChild(canvas);

        return { canvas, ctx, canvasWidth, canvasHeight, percentage };
      }
    }
  }
  return null;
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

// Funzione per ridisegnare il contenuto del libro
function redrawBookContent() {
  const footer = document.querySelector('ion-footer[item-i-d="reader-footer"]');

const ionRange = document.getElementById('kr-scrubber-bar');
if (ionRange && ionRange.shadowRoot) {
  const rangeWrapper = ionRange.shadowRoot.querySelector('label.range-wrapper');
  if (rangeWrapper) {
    rangeWrapper.style.display = 'none'; // Nasconde il wrapper
  }
}
  if (footer) {
    const textDiv = footer.querySelector('ion-title[item-i-d="reader-footer-title"] div.text-div');
    if (textDiv) {
      const text = textDiv.textContent;
      const percentageMatch = text.match(/(\d+)%/);
      if (percentageMatch) {
        const percentage = parseInt(percentageMatch[1], 10);

        // Controlla se il valore è cambiato
        if (percentage !== lastPercentage) {
          let canvas = footer.querySelector('canvas');
          let ctx = canvas ? canvas.getContext('2d') : null;

          if (!canvas) {
            const result = replaceDivWithCanvas();
            if (!result) return;
            ({ canvas, ctx } = result);
            const { canvasWidth, canvasHeight } = result;
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;

            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = 'https://raw.githubusercontent.com/jumpjack/kindlebar/refs/heads/main/libro-bottom.png';
            img.onload = function() {
              //ctx.globalAlpha = 0.8;
              ctx.drawImage(img, 0, MAX_PAGES_HEIGHT, canvas.width, img.height);
              //ctx.globalAlpha = 1.0;
              ctx.fillStyle = 'rgb(231, 222, 199)';//gradient; // debug
              //ctx.fillRect(0, 0, canvas.width, canvas.height);
                drawBookContent(ctx, percentage, canvas.width, canvas.height);

              // Aggiungi una linea centrale per la rilegatura
              ctx.strokeStyle = 'rgba(100, 70, 40, 0.5)';
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.moveTo(canvas.width / 2, 0);
              ctx.lineTo(canvas.width / 2, canvas.height);
              ctx.stroke();

              // Aggiungi event listener per il clic sul canvas
              canvas.addEventListener('click', function(event) {
                const rect = canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
console.log("Click on x,y=",x,y);

const maxAlt = CANVAS_HEIGHT - MAX_PAGES_HEIGHT - YOFFSET;
console.log("Massima altezza:",maxAlt);
const currLevelLeft = ((CANVAS_HEIGHT - MAX_PAGES_HEIGHT) + MAX_PAGES_HEIGHT-(percentage * MAX_PAGES_HEIGHT/100)).toFixed(0)- YOFFSET;
const currLevelRight = CANVAS_HEIGHT -  ((CANVAS_HEIGHT - MAX_PAGES_HEIGHT) + MAX_PAGES_HEIGHT-((100-percentage) * MAX_PAGES_HEIGHT/100)).toFixed(0)- YOFFSET;


console.log("%=",percentage);
console.log("   Livello attuale sin:",currLevelLeft);
console.log("   Livello attuale des:",currLevelRight);

if (x < canvas.width / 2)  {
console.log("CONTROLLO SINISTRA");
  if  (y < maxAlt) {
    console.log("In " , y.toFixed(0) , " non ci arriveranno mai");
    return;
  }


  if (y < currLevelLeft) {
    console.log(y.toFixed(0) , " e' sopra le gia' sfogliate");
    return;
  }
}

if (x > canvas.width / 2)  {
console.log("CONTROLLO DESTRA");
  if  (y < maxAlt) {
    console.log("In " , y.toFixed(0) , " non ci arriveranno mai");
    return;
  }


  if (y < currLevelRight) {
    console.log(y.toFixed(0) , " e' sopra le DA SFOGLIARE");
    return;
  }
}

console.log("CLICK VALIDO! y=",y.toFixed(0), ", currLevelLeft=", currLevelLeft, ", currLevelRight=",currLevelRight);
console.log("   ");

const ionRange = document.getElementById('kr-scrubber-bar');
const maxValue = parseInt(ionRange.getAttribute('max'), 10);
console.log("prev %=",percentage, "=", maxValue, "(max)");
                if (x < canvas.width / 2) {
console.log("    LEFT");
                  const percOfReadPages = (MAX_PAGES_HEIGHT - (y-(CANVAS_HEIGHT - MAX_PAGES_HEIGHT))) / MAX_PAGES_HEIGHT;
                  //          (70 - (y-10)) / 70
                  const newPercentage = percOfReadPages * percentage;
console.log("    percOfReadPages=",percOfReadPages, ",%=",newPercentage);
const newValue = Math.round((newPercentage / 100) * maxValue);
simulateSliderChange(newPercentage); // debug
                } else {
console.log("    RIGHT");
                  const percOfUnreadPages = (MAX_PAGES_HEIGHT - (y-(CANVAS_HEIGHT - MAX_PAGES_HEIGHT))) / MAX_PAGES_HEIGHT;;
                  const newPercentage = 100 - 100*percOfUnreadPages;
console.log("    percOfUnreadPages=",percOfUnreadPages, ",%=",newPercentage);
simulateSliderChange(newPercentage); // debug
                }
              });
            };
            img.onerror = function() {
              console.error("Errore nel caricamento dell'immagine");
            };
          } else {
            // Cancella il canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = 'https://raw.githubusercontent.com/jumpjack/kindlebar/refs/heads/main/libro-bottom.png';
            img.onload = function() {
              ctx.globalAlpha = 0.8;
              ctx.drawImage(img, 0, MAX_PAGES_HEIGHT, canvas.width, img.height);
              ctx.globalAlpha = 1.0;
              // Aggiungi un gradiente per un effetto più realistico
              //const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
              //gradient.addColorStop(0, 'rgba(200, 180, 150, 0.3)');
              //gradient.addColorStop(1, 'rgba(150, 120, 80, 0.1)');
              ctx.fillStyle =  'rgb(231, 222, 199)';//gradient;
//ctx.fillRect(0, 0, canvas.width, canvas.height);
drawBookContent(ctx, percentage, canvas.width, canvas.height);

              // Aggiungi una linea centrale per la rilegatura
              ctx.strokeStyle = 'rgba(100, 70, 40, 0.5)';
              ctx.lineWidth = 3;
              ctx.beginPath();
              ctx.moveTo(canvas.width / 2, 0);
              ctx.lineTo(canvas.width / 2, canvas.height);
              ctx.stroke();
            };
          }

          // Aggiorna il valore memorizzato
          lastPercentage = percentage;
        }

        // Aggiungi le immagini laterali solo se non sono già state aggiunte
        if (!imagesAdded) {
          const buttonContainerRight = document.querySelector('.kr-chevron-container-right.chevron-container.right');
          const buttonContainerLeft = document.querySelector('.kr-chevron-container-left.chevron-container');
          addSideImage(buttonContainerLeft, 'https://raw.githubusercontent.com/jumpjack/kindlebar/refs/heads/main/libro-left.png', 'left');
          addSideImage(buttonContainerRight, 'https://raw.githubusercontent.com/jumpjack/kindlebar/refs/heads/main/libro-right.png', 'right');
          imagesAdded = true; // Imposta il flag a true dopo aver aggiunto le immagini
        }
      }
    }
  }
}



function simulateSliderChange(newPercentage) {

    const ionRange = document.getElementById('kr-scrubber-bar');

  if (!ionRange) {
    console.error('Slider non trovato');
    return;
  }

  // Calcola il nuovo valore in base alla percentuale
  const maxValue = parseInt(ionRange.getAttribute('max'), 10);
  const newValue = Math.round((newPercentage / 100) * maxValue);

  // Imposta il nuovo valore
  ionRange.value = newValue;

  // Crea e invia l'evento personalizzato 'ionChange'
  const changeEvent = new CustomEvent('ionChange', {
    detail: {
      value: newValue,
      isIncrease: true // solo esempio
    },
    bubbles: true,
    cancelable: true
  });

  ionRange.dispatchEvent(changeEvent);
}


// Aggiungi un listener per il pulsante dell'estensione
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
console.log("Message",request.action);
  if (request.action === "replaceDiv") {

    // Esegui la funzione una volta all'inizio
    redrawBookContent();
    // Imposta un intervallo per eseguire la funzione ogni secondo
    setInterval(redrawBookContent, 1000);
  }
});
