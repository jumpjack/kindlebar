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
      //img.alt = 'Book ' + side + ' side';
      img.className = 'book-side-image';
      img.style.position = 'fixed';

      if ((side === "left") || (side === "right")) {
console.log("Laterale");
        img.style[side] = '0';
        //img.style.width = '50px';
      } else {
console.log("Centrale");
        img.style["left"] = '50%';
//      img.style.width = '20px';
      }
      img.style.top = '50px';
      img.style.height = '95vh';
      img.style.zIndex = '999';
      img.style.pointerEvents = 'none'; // Permette di cliccare attraverso l'immagine

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
// Seleziona il container principale
const mainContainer = document.querySelector('.pagination-container');

// Crea un nuovo div per l'immagine centrale
const centerDiv = document.createElement('div');
centerDiv.className = 'center-image-container';
centerDiv.style.position = 'absolute';
centerDiv.style.left = '50%';
centerDiv.style.top = '0';
centerDiv.style.transform = 'translateX(-50%)';
centerDiv.style.height = '100%'; // Copre tutta l'altezza del container principale
centerDiv.style.zIndex = '999';
centerDiv.style.pointerEvents = 'none';

// Aggiungi il nuovo div al container principale
mainContainer.appendChild(centerDiv);

// Ora aggiungi le immagini
const buttonContainerRight = document.querySelector('.kr-chevron-container-right.chevron-container.right');
const buttonContainerLeft = document.querySelector('.kr-chevron-container-left.chevron-container');

addSideImage(buttonContainerLeft, 'https://raw.githubusercontent.com/jumpjack/kindlebar/refs/heads/main/libro-left.png', 'left');
addSideImage(buttonContainerRight, 'https://raw.githubusercontent.com/jumpjack/kindlebar/refs/heads/main/libro-right.png', 'right');
addSideImage(centerDiv, 'https://raw.githubusercontent.com/jumpjack/kindlebar/refs/heads/main/libro-center.png', 'center');

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


/////////////////////

// Configurazione container e stili
const animationContainer = document.createElement('div');
animationContainer.id = 'bookFlipContainer';
Object.assign(animationContainer.style, {
  position: 'fixed',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: '9999'
});
document.body.appendChild(animationContainer);

const style = document.createElement('style');
style.textContent = `
.flip-page {
  position: absolute;
  transform-origin: left center;
  transition: none;
  pointer-events: none;
  backface-visibility: hidden;
  box-shadow: -5px 5px 15px rgba(0,0,0,0.3);
}
`;
document.head.appendChild(style);

// Stato dell'animazione
let isAnimating = false;

// Intercetta il click sulla freccia destra
document.addEventListener('mousedown', async (event) => {
  const target = event.target.closest('#kr-chevron-right.chevron.round.right');
  if (!target || isAnimating) return;

console.log("[CONT] CLICK");

  event.preventDefault();
  event.stopImmediatePropagation();
  isAnimating = true;

  try {
    // Cattura lo screenshot usando l'API chrome
const rightScreenshotDataUrl = await new Promise((resolve) => {
  console.log("[CONT] RIGHT Screenshot request");
  chrome.runtime.sendMessage({action: "captureRight"}, (response) => {
    if (chrome.runtime.lastError) {
      console.log("[CONT] RIGHT Screenshot ERROR");
      console.error("Capture error:", chrome.runtime.lastError);
      resolve(null);
    } else {
      console.log("[CONT] RIGHT Screenshot OK");
      resolve(response?.rightScreenshotDataUrl);
    }
  });
});

// Dopo aver ottenuto rightScreenshotDataUrl, cattura lo screenshot sinistro
const leftScreenshotDataUrl = await new Promise((resolve) => {
  console.log("[CONT] LEFT Screenshot request");
  chrome.runtime.sendMessage({action: "captureLeft"}, (response) => {
    if (chrome.runtime.lastError) {
      console.log("[CONT] LEFT Screenshot ERROR");
      console.error("Capture error:", chrome.runtime.lastError);
      resolve(null);
    } else {
      console.log("[CONT] LEFT Screenshot OK");
      resolve(response?.leftScreenshotDataUrl);
    }
  });
});

    if ((leftScreenshotDataUrl) && (rightScreenshotDataUrl)) {
      await startFlipAnimation(leftScreenshotDataUrl, rightScreenshotDataUrl);
    }

    // Esegui l'azione originale dopo l'animazione
    setTimeout(() => {
      target.dispatchEvent(new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window
      }));

      isAnimating = false;
    }, 10);

    setTimeout(() => {
      target.dispatchEvent(new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
        view: window
      }));

      isAnimating = false;
    }, 50);

  } catch (error) {
    console.error("Animation error:", error);
    isAnimating = false;
  }
}, true);

// Funzione principale di animazione
async function startFlipAnimation(leftScreenshotDataUrl, rightScreenshotDataUrl) {
  return new Promise((resolve) => {
    animationContainer.innerHTML = '';

    // Crea e mostra l'immagine sfocata sinistra (leggera)
    const leftBlurredImg = new Image();
    leftBlurredImg.src = leftScreenshotDataUrl;

    // Crea e mostra l'immagine sfocata destra (molto marcata)
    const rightBlurredImg = new Image();
    rightBlurredImg.src = rightScreenshotDataUrl;

    Promise.all([new Promise(res => leftBlurredImg.onload = res),
                new Promise(res => rightBlurredImg.onload = res)]).then(() => {
      const width = leftBlurredImg.width / 2;
      const height = leftBlurredImg.height;

      // Dimensioni proporzionali
      const viewportHeight = window.innerHeight;
      const scaleFactor = (viewportHeight * 0.8) / (height * 0.8);
      const scaledWidth = width * scaleFactor;
      const scaledHeight = height * scaleFactor;

      // Preparazione canvas per sfocatura sinistra
      const leftCanvas = document.createElement('canvas');
      leftCanvas.width = width;
      leftCanvas.height = height;
      const leftCtx = leftCanvas.getContext('2d');

      // Ritaglia e sfoca la metà sinistra
      leftCtx.drawImage(
        leftBlurredImg,
        0, 55, width , height * 0.8,
        0, 55, width , height * 0.8
      );
      leftCtx.filter = 'blur(12px)';
      leftCtx.drawImage(leftCanvas, 0, 0);

      // Preparazione canvas per sfocatura destra (più marcata)
      const rightCanvas = document.createElement('canvas');
      rightCanvas.width = width;
      rightCanvas.height = height;
      const rightCtx = rightCanvas.getContext('2d');

      // Ritaglia e sfoca la metà destra
      rightCtx.drawImage(
        rightBlurredImg,
        width, 55, width * 0.8, height * 0.8,
        0, 55, width * 0.8, height * 0.8
      );
      rightCtx.filter = 'blur(20px)'; // Sfocatura molto più forte
      rightCtx.drawImage(rightCanvas, 0, 0);

      // Crea elementi immagine
      const leftPage = document.createElement('img');
      leftPage.src = leftCanvas.toDataURL();
      leftPage.className = 'flip-page blurred-left';

      const rightPage = document.createElement('img');
      rightPage.src = rightCanvas.toDataURL();
      rightPage.className = 'flip-page blurred-right';

      // Stili per le immagini sfocate
      Object.assign(leftPage.style, {
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
        left: '0',
        top: '0',
        position: 'absolute',
        opacity: '0.8',
        filter: 'blur(12px)'
      });

      Object.assign(rightPage.style, {
        width: `${scaledWidth}px`,
        height: `${scaledHeight}px`,
        right: '0',
        top: '0',
        position: 'absolute',
        opacity: '0.9',
        filter: 'blur(20px)'
      });

      // Aggiungi entrambe le immagini sfocate al container
      animationContainer.appendChild(leftPage);
      animationContainer.appendChild(rightPage);

      // Aspetta un breve momento prima di iniziare l'animazione
      setTimeout(() => {
        // Crea l'immagine animata (non sfocata)
        const img = new Image();
        img.src = rightScreenshotDataUrl;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = width;
          canvas.height = height;

          // Ritaglia la metà destra con margini
          ctx.drawImage(
            img,
            width, 55, width * 0.8, height * 0.8,
            0, 55, width * 0.8, height * 0.8
          );

          const page = document.createElement('img');
          page.src = canvas.toDataURL();
          page.className = 'flip-page animated';

          Object.assign(page.style, {
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
            right: '0',
            top: '0',
            position: 'absolute',
            zIndex: '10'
          });

          animationContainer.appendChild(page);

          // Animazione (come prima)
          const startTime = performance.now();
          const animationDuration = 2000;

        function animateFrame(currentTime) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / animationDuration, 1);
          const angle = 360 * progress;

          if (progress <= 0.5) {
            scaleX = Math.max(0.1, 1 - 0.9 * (progress / 0.5));
            posX = -(scaledWidth * progress);
            posY = scaledHeight * 0.05 * progress;
            page.style.transform = `
              rotateY(${angle}deg)
              perspective(${scaledWidth * 3}px)
              scaleX(${scaleX})
              translateY(${posY}px)
            `;
          } else {
            scaleX = Math.max(0.1, 0.1 + 0.9 * ((progress - 0.5) / 0.5));
            posX = -(scaledWidth * progress * 0.85);
            posY = scaledHeight * 0.05 * (1 - progress);
            page.style.transform = `
              rotateY(${angle}deg)
              perspective(${scaledWidth * 3}px)
              scaleX(${scaleX})
              translateX(${posX}px)
              translateY(${posY}px)
            `;
          }

          if (progress < 1) {
            requestAnimationFrame(animateFrame);
          } else {
            // Rimuovi entrambe le immagini alla fine
            animationContainer.removeChild(page);
            animationContainer.removeChild(leftPage);
            animationContainer.removeChild(rightPage);
            resolve();
          }
        }



          requestAnimationFrame(animateFrame);
        };
      }, 50); // Piccolo ritardo prima di iniziare l'animazione
    });
  });
}
// Listener per i messaggi di background (se necessario)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
console.log("[CONT]",request.action);

  if (request.action === "ping") {
console.log("[CONT] ping response");
    sendResponse({status: "ready"});
  }
});