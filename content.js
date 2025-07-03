console.log("[CONTENTS] - kindlebar");
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
/*
document.addEventListener('mousedown', (event) => {
    console.log("Questo è un listener di test", event);
}, { capture: true }); // Usa `capture: true` per intercettare l'evento prima degli altri
*/

// Intercetta il click sulla freccia destra
document.addEventListener('mousedown', async (event) => {
console.log(event);
    const rightTarget = event.target.closest('#kr-chevron-right.chevron.round.right');
    const leftTarget = event.target.closest('#kr-chevron-left.chevron.round');

   // if (rightTarget || leftTarget) {
console.log(rightTarget);
        await sfoglia({ rightTarget: rightTarget, leftTarget : leftTarget });
  //  }
}, { capture: true });


document.addEventListener('keydown', async (event) => {
    switch (event.key) {
        case 'ArrowRight':
        case 'PageDown':
            console.log("Freccia DESTRA o Pag Giù premuta");
            await sfoglia({ rightTarget: document.querySelector('#kr-chevron-right'), leftTarget : null });
            break;
        case 'ArrowLeft':
        case 'PageUp':
            console.log("Freccia SINISTRA o Pag Su premuta");
            await sfoglia({ rightTarget:null, leftTarget :  document.querySelector('#kr-chevron-left') });
            break;
        case 'ArrowUp':
            console.log("Freccia SU premuta");
            await sfoglia({ rightTarget:null, leftTarget :  document.querySelector('#kr-chevron-left') });
            break;
        case 'ArrowDown':
            console.log("Freccia GIÙ premuta");
            await sfoglia({ rightTarget: document.querySelector('#kr-chevron-right'), leftTarget : null });
            break;
    }
}, { capture: true });



async function sfoglia(param) {
    console.log("param:", param);


    const rightTarget = param.rightTarget;//event.target.closest('#kr-chevron-right.chevron.round.right');
    const leftTarget = param.leftTarget;//event.target.closest('#kr-chevron-left.chevron.round');

  if ((!rightTarget && !leftTarget) || isAnimating) return;

console.log("[CONT] CLICK", rightTarget ? "RIGHT" : "LEFT");

  event.preventDefault();
  event.stopImmediatePropagation();
  isAnimating = true;

  try {
    // Cattura gli screenshot
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
      if (rightTarget) {
console.log("Quello di prima");
        await startFlipAnimation(leftScreenshotDataUrl, rightScreenshotDataUrl, 'right');
      } else {
console.log("Quello nuovo");
        await startFlipAnimation(leftScreenshotDataUrl, rightScreenshotDataUrl, 'left');
      }
    }

    // Esegui l'azione originale dopo l'animazione
    const target = rightTarget || leftTarget;
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
}//, true);



function addNoise(ctx, width, height) {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 100; // Livello di rumore
        data[i] += noise;     // R
        data[i + 1] += noise; // G
        data[i + 2] += noise; // B
    }
    ctx.putImageData(imageData, 0, 0);


}




// Funzione principale di animazione (modificata per gestire entrambe le direzioni)
async function startFlipAnimation(leftScreenshotDataUrl, rightScreenshotDataUrl, direction = 'right') {
  return new Promise((resolve) => {
    animationContainer.innerHTML = '';

    // Crea e mostra le immagini sfocate
    const leftBlurredImg = new Image();
    leftBlurredImg.src = leftScreenshotDataUrl;
    const rightBlurredImg = new Image();
    rightBlurredImg.src = rightScreenshotDataUrl;

    Promise.all([new Promise(res => leftBlurredImg.onload = res),
                new Promise(res => rightBlurredImg.onload = res)]).then(() => {
      const width = leftBlurredImg.width / 2;
      const height = leftBlurredImg.height;
      const viewportHeight = window.innerHeight;
      const scaleFactor = (viewportHeight * 0.8) / (height * 0.8);
      const scaledWidth = width * scaleFactor;
      const scaledHeight = height * scaleFactor;

      // Preparazione canvas per sfocatura
      const prepareCanvas = (img, isLeft) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        const srcX = isLeft ? 0.15 * width : width;
        const destX = isLeft ? 0 : 0; // Ritaglia sempre a sinistra del canvas

        ctx.drawImage(
          img,
          srcX, 50, width , height * 0.82,
          destX, 50, width, height * 0.82
        );

        // Applica sfocatura diversa per lato attivo/inattivo
        ctx.filter = isLeft ?
          (direction === 'right' ? 'blur(4px)' : 'blur(4px)') :
          (direction === 'right' ? 'blur(4px)' : 'blur(4px)');

//addNoise(ctx, canvas.width, canvas.height);

        ctx.drawImage(canvas, 0, 0);
        return canvas;
      };

      const leftCanvas = prepareCanvas(leftBlurredImg, true);
      const rightCanvas = prepareCanvas(rightBlurredImg, false);

      // Crea elementi immagine sfocati
      const createBlurredPage = (canvas, isLeft) => {
        const page = document.createElement('img');
        page.src = canvas.toDataURL();
        page.className = `flip-page blurred-${isLeft ? 'left' : 'right'}`;

        Object.assign(page.style, {
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`,
          [isLeft ? 'left' : 'right']: '0',
          top: '0',
          position: 'absolute',
          opacity: isLeft ? (direction === 'right' ? '0.8' : '0.9') : (direction === 'right' ? '0.9' : '0.8'),
          filter: isLeft ?
            (direction === 'right' ? 'blur(12px)' : 'blur(20px)') :
            (direction === 'right' ? 'blur(20px)' : 'blur(12px)'),
          zIndex: '1'
        });

        return page;
      };

      const leftPage = createBlurredPage(leftCanvas, true);
      const rightPage = createBlurredPage(rightCanvas, false);

      animationContainer.appendChild(leftPage);
      animationContainer.appendChild(rightPage);

      setTimeout(() => {
        // Crea l'immagine animata
        const img = new Image();
        img.src = direction === 'right' ? rightScreenshotDataUrl : leftScreenshotDataUrl;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          const srcX = direction === 'right' ? width : 0.15 * width;

          ctx.drawImage(
            img,
            srcX, 55, width * 0.8, height * 0.8,
            0, 55, width * 0.8, height * 0.8
          );

          const page = document.createElement('img');
          page.src = canvas.toDataURL();
          page.className = 'flip-page animated';

          Object.assign(page.style, {
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
            [direction === 'right' ? 'right' : 'left']: '0',
            top: '0',
            position: 'absolute',
            zIndex: '10',
            transformOrigin: direction === 'right' ? 'left center' : 'right center'
          });

          animationContainer.appendChild(page);

          // Animazione
          const startTime = performance.now();
          const animationDuration = 2000;

          function animateFrame(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);
            const angle = direction === 'right' ? 360 * progress : -360 * progress;
            if (progress <= 0.5) {
              const scaleX = Math.max(0.1, 1 - 0.9 * (progress / 0.5));
              const posX = direction === 'right' ?
                -(scaledWidth * progress) :
                (scaledWidth * progress);
              const posY = scaledHeight * 0.05 * progress;

              page.style.transform = `
                rotateY(${angle}deg)
                perspective(${scaledWidth * 3}px)
                scaleX(${scaleX})
                translateX(${posX}px)
                translateY(${posY}px)
              `;
            } else {
              const scaleX = Math.max(0.1, 0.1 + 0.9 * ((progress - 0.5) / 0.5));
              const posX = direction === 'right' ?
                -(scaledWidth * progress * 0.85) :
                (scaledWidth * progress * 0.85);
              const posY = scaledHeight * 0.05 * (1 - progress);

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
              // Rimuovi gli elementi
              animationContainer.removeChild(page);
              animationContainer.removeChild(leftPage);
              animationContainer.removeChild(rightPage);
              resolve();
            }
          }

          requestAnimationFrame(animateFrame);
        };
      }, 50);
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