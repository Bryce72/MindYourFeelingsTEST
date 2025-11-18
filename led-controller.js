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




  let drawCtx;
  let drawCanvas;
  let currentColor = '#c62828';   // default red
  let drawing = false;
  let lastX = 0, lastY = 0;
  let canvasReady = false;

  // Call this when page 4 is first shown
  function initBodyCanvas() {
    if (canvasReady) return;

    const wrap = document.getElementById('bodyWrap');
    drawCanvas = document.getElementById('draw');

    // match canvas pixel size to the wrapper box + devicePixelRatio
    const rect = wrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    drawCanvas.width  = rect.width * dpr;
    drawCanvas.height = rect.height * dpr;

    drawCtx = drawCanvas.getContext('2d');
    drawCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawCtx.lineCap   = 'round';
    drawCtx.lineJoin  = 'round';
    drawCtx.lineWidth = 14;
    drawCtx.strokeStyle = currentColor;

    // Color buttons
    document.querySelectorAll('.color-dot').forEach(btn => {
      const color = btn.getAttribute('data-color');
      btn.style.backgroundColor = color;

      btn.addEventListener('click', () => {
        currentColor = color;
        drawCtx.strokeStyle = currentColor;
      });
    });

    // Mouse events
    drawCanvas.addEventListener('mousedown', startDraw);
    drawCanvas.addEventListener('mousemove', drawMove);
    window.addEventListener('mouseup', endDraw);

    // Touch events
    drawCanvas.addEventListener('touchstart', startDraw, {passive:false});
    drawCanvas.addEventListener('touchmove', drawMove, {passive:false});
    window.addEventListener('touchend', endDraw);

    canvasReady = true;
  }

  function getPos(e) {
    const rect = drawCanvas.getBoundingClientRect();
    let clientX, clientY;

    if (e.touches && e.touches.length) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function startDraw(e) {
    e.preventDefault();
    drawing = true;
    const pos = getPos(e);
    lastX = pos.x;
    lastY = pos.y;
  }

  function drawMove(e) {
    if (!drawing) return;
    e.preventDefault();
    const pos = getPos(e);
    drawCtx.beginPath();
    drawCtx.moveTo(lastX, lastY);
    drawCtx.lineTo(pos.x, pos.y);
    drawCtx.stroke();
    lastX = pos.x;
    lastY = pos.y;
  }

  function endDraw(e) {
    if (!drawing) return;
    drawing = false;
  }

  // Override your showPage to initialize canvas when needed
  const originalShowPage = window.showPage;
  window.showPage = function (fromId, toId) {
    if (originalShowPage) originalShowPage(fromId, toId);
    else {
      // simple fallback if you didn't have showPage before
      if (fromId) document.getElementById(fromId).classList.add('d-none');
      document.getElementById(toId).classList.remove('d-none');
    }
    if (toId === 'pageEnglish4_canvas') {
      // make sure layout is visible before sizing canvas
      setTimeout(initBodyCanvas, 50);
    }
  };

  // ---------- Saving the drawing region ----------
  async function saveBodyLocally() {
    const node = document.getElementById('bodyWrap');

    // html2canvas already loaded from CDN
    const canvas = await html2canvas(node, {
      backgroundColor: null,
      scale: 2
    });

    // 1) download locally (good for kiosk debug)
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'my-feelings.png';
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');

    // 2) keep a copy for later emailing (e.g. send to server)
    const dataUrl = canvas.toDataURL('image/png');
    // Example: stash in localStorage for now
    localStorage.setItem('feelingsImage', dataUrl);

    // If you have an API endpoint, you could instead:
    // await fetch('/save-feelings-image', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ image: dataUrl })
    // });

    return true;
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


