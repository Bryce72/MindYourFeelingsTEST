/*
* This function is going to be the main worker
* first document. gets the current pages "ID" abd will add the d-none - which effectively hides it
* second document. gets the ID for the next page we want base on ID. we remove the d-none from it to make it visible
*/
function showPage(currentPageID, nextPageID){
  // hides current page it was on
  document.getElementById(currentPageID).classList.add("d-none");

  // then shows next page it clicked on
  document.getElementById(nextPageID).classList.remove("d-none");

  console.log("something was pressed")

}




async function saveBodyLocally() {
  const page = document.getElementById('pageEnglish4_canvas');
  if (!page) return;

  // DEFINE BOX (matches your #bodyWrap)
  const box = { x: 120, y: 160, width: 360, height: 640 };

  // STEP 1: FORCE SHOW PAGE (even if d-none)
  const wasHidden = page.classList.contains('d-none');
  if (wasHidden) page.classList.remove('d-none');

  // STEP 2: SHOW DEBUG BOX
  let debugBox = document.getElementById('debug-screenshot-box');
  if (!debugBox) {
    debugBox = document.createElement('div');
    debugBox.id = 'debug-screenshot-box';
    debugBox.style.position = 'fixed';
    debugBox.style.border = '3px solid red';
    debugBox.style.pointerEvents = 'none';
    debugBox.style.zIndex = '9999';
    debugBox.style.boxShadow = '0 0 0 1px white';
    document.body.appendChild(debugBox);
  }
  debugBox.style.left = box.x + 'px';
  debugBox.style.top = box.y + 'px';
  debugBox.style.width = box.width + 'px';
  debugBox.style.height = box.height + 'px';

  // STEP 3: Wait for render
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  // STEP 4: CAPTURE
  const canvas = await html2canvas(document.body, {
    scale: window.devicePixelRatio,
    useCORS: true,
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height
  });

  // STEP 5: HIDE PAGE AGAIN
  if (wasHidden) page.classList.add('d-none');

  // STEP 6: REMOVE DEBUG BOX
  setTimeout(() => debugBox.remove(), 800);

  // STEP 7: DOWNLOAD
  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `body-screenshot-${Date.now()}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
}
    
    
    
    
    
    // post requst for the OLED
    /*
    * TODO: Find which POST requests go with which feelings
    */
  //   document.getElementById("oledBtn").addEventListener("click", async ()=>{
  //   try {
  //     await fetch("http://192.168.0.65/json/state", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ on: "t"})
  //     });
  //     console.log("Payload sent to WLED");
  //   } catch(err) {
  //     console.log("POST failed:", err);
  //   }
  // });