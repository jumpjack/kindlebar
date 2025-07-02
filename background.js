chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
console.log("[BG]",request.action);
  if (request.action === "captureRight") {
console.log("[BG] capture request");
    chrome.tabs.captureVisibleTab().then(dataUrl => {
      sendResponse({rightScreenshotDataUrl: dataUrl});
    }).catch(error => {
      console.error("Capture error:", error);
      sendResponse({error: error.message});
    });
    return true; // Indica risposta asincrona
  }

  if (request.action === "captureLeft") {
console.log("[BG] capture request for LEFT half");
    chrome.tabs.captureVisibleTab().then(dataUrl => {
      sendResponse({leftScreenshotDataUrl: dataUrl});
    }).catch(error => {
      console.error("Capture error:", error);
      sendResponse({error: error.message});
    });
    return true; // Indica risposta asincrona
  }

});