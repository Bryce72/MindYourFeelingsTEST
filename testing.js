/*********************************************************
 * Simple page navigation
 *********************************************************/
function showPage(currentPageID, nextPageID) {
  // hides current page
  if (currentPageID) {
    const cur = document.getElementById(currentPageID);
    if (cur) cur.classList.add("d-none");
  }

  // shows next page
  const next = document.getElementById(nextPageID);
  if (next) next.classList.remove("d-none");

  console.log("Page change:", currentPageID, "→", nextPageID);

  // If we're going to the canvas page, ensure the drawing surface is ready
  if (nextPageID === "pageEnglish4_canvas") {
    setTimeout(initBodyCanvas, 50);
  }
}

/*********************************************************
 * Drawing canvas setup (Page 4)
 *********************************************************/
let drawCtx;
let drawCanvas;
let currentColor = "#c62828";   // default stroke color (red)
let currentColorKey = "red";    // logical key used in WLED_PATTERNS
let drawing = false;
let lastX = 0, lastY = 0;
let canvasReady = false;

function initBodyCanvas() {
  if (canvasReady) return;

  const wrap = document.getElementById("bodyWrap");
  drawCanvas = document.getElementById("draw");

  if (!wrap || !drawCanvas) {
    console.warn("bodyWrap/draw canvas missing");
    return;
  }

  const rect = wrap.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  drawCanvas.width  = rect.width * dpr;
  drawCanvas.height = rect.height * dpr;

  drawCtx = drawCanvas.getContext("2d");
  drawCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawCtx.lineCap   = "round";
  drawCtx.lineJoin  = "round";
  drawCtx.lineWidth = 14;
  drawCtx.strokeStyle = currentColor;

  // Color buttons – single-select behavior using data-color + data-color-key
  document.querySelectorAll(".color-dot").forEach(btn => {
    const color = btn.getAttribute("data-color");
    const colorKey = btn.getAttribute("data-color-key");
    btn.style.backgroundColor = color;

    btn.addEventListener("click", () => {
      currentColor = color;
      currentColorKey = colorKey || "red";
      drawCtx.strokeStyle = currentColor;

      // visual selected state (requires .color-dot.selected in CSS if you want a highlight)
      document.querySelectorAll(".color-dot")
              .forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    });
  });

  // Mouse events
  drawCanvas.addEventListener("mousedown", startDraw);
  drawCanvas.addEventListener("mousemove", drawMove);
  window.addEventListener("mouseup", endDraw);

  // Touch events
  drawCanvas.addEventListener("touchstart", startDraw, { passive: false });
  drawCanvas.addEventListener("touchmove",  drawMove,  { passive: false });
  window.addEventListener("touchend", endDraw);

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

/*********************************************************
 * Save drawing region as PNG (for kiosk debug / later email)
 *********************************************************/
async function saveBodyLocally() {
  const node = document.getElementById("bodyWrap");
  if (!node) return;

  const canvas = await html2canvas(node, {
    backgroundColor: null,
    scale: 2
  });

  // 1) Download locally
  canvas.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-feelings.png";
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");

  // 2) Store data URL (e.g., for later upload/email)
  const dataUrl = canvas.toDataURL("image/png");
  try {
    localStorage.setItem("feelingsImage", dataUrl);
  } catch (err) {
    console.warn("Could not store feelingsImage in localStorage:", err);
  }

  return true;
}

/*********************************************************
 * WLED patterns + emotion/color mapping
 *********************************************************/

// Where your WLED controller lives
const WLED_URL = "http://10.65.139.123/json/state";

/**
 * Special helper states - not yet wired to UI, but ready if you need them
 */
const WLED_SPECIAL = {
  off: {
    // Blank/Off/Black:
    seg: { i: [0, 100, "000000"] }
  },
  idle: {
    // Idle pattern:
    ps: 1
  }
};

/**
 * Emotion + color → WLED JSON patterns
 * For now: ONLY "amusement" ("happy") is wired up.
 * You can add content/surprise/fear/anger/sad under the TODO later.
 */
const WLED_PATTERNS = {
  // "Happy" corresponds to "amusement"
  amusement: {
    red: {
      seg: {
        i: [4,"FF0000",5,"FF0000",6,"FF0000",7,"FF0000",9,"FF0000",
            31,"FF0000",32,"FF0000",33,"FF0000",34,"FF0000",47,"FF0000",
            48,"FF0000",49,"FF0000",50,"FF0000",53,"FF0000",54,"FF0000",
            55,"FF0000",56,"FF0000",57,"FF0000",67,"FF0000",69,"FF0000",
            70,"FF0000",72,"FF0000",76,"FF0000",77,"FF0000",78,"FF0000",
            79,"FF0000",80,"FF0000",81,"FF0000",83,"FF0000",91,"FF0000",
            92,"FF0000",93,"FF0000",96,"FF0000",97,"FF0000"]
      }
    },
    orange: {
      seg: {
        i: [4,"FF6400",5,"FF6400",6,"FF6400",7,"FF6400",9,"FF6400",
            31,"FF6400",32,"FF6400",33,"FF6400",34,"FF6400",47,"FF6400",
            48,"FF6400",49,"FF6400",50,"FF6400",53,"FF6400",54,"FF6400",
            55,"FF6400",56,"FF6400",57,"FF6400",67,"FF6400",69,"FF6400",
            70,"FF6400",72,"FF6400",76,"FF6400",77,"FF6400",78,"FF6400",
            79,"FF6400",80,"FF6400",81,"FF6400",83,"FF6400",91,"FF6400",
            92,"FF6400",93,"FF6400",96,"FF6400",97,"FF6400"]
      }
    },
    yellow: {
      seg: {
        i: [4,"FFB400",5,"FFB400",6,"FFB400",7,"FFB400",9,"FFB400",
            31,"FFB400",32,"FFB400",33,"FFB400",34,"FFB400",47,"FFB400",
            48,"FFB400",49,"FFB400",50,"FFB400",53,"FFB400",54,"FFB400",
            55,"FFB400",56,"FFB400",57,"FFB400",67,"FFB400",69,"FFB400",
            70,"FFB400",72,"FFB400",76,"FFB400",77,"FFB400",78,"FFB400",
            79,"FFB400",80,"FFB400",81,"FFB400",83,"FFB400",91,"FFB400",
            92,"FFB400",93,"FFB400",96,"FFB400",97,"FFB400"]
      }
    },
    green: {
      seg: {
        i: [4,"1EFF00",5,"1EFF00",6,"1EFF00",7,"1EFF00",9,"1EFF00",
            31,"1EFF00",32,"1EFF00",33,"1EFF00",34,"1EFF00",47,"1EFF00",
            48,"1EFF00",49,"1EFF00",50,"1EFF00",53,"1EFF00",54,"1EFF00",
            55,"1EFF00",56,"1EFF00",57,"1EFF00",67,"1EFF00",69,"1EFF00",
            70,"1EFF00",72,"1EFF00",76,"1EFF00",77,"1EFF00",78,"1EFF00",
            79,"1EFF00",80,"1EFF00",81,"1EFF00",83,"1EFF00",91,"1EFF00",
            92,"1EFF00",93,"1EFF00",96,"1EFF00",97,"1EFF00"]
      }
    },
    lightBlue: {
      seg: {
        i: [4,"00FFD7",5,"00FFD7",6,"00FFD7",7,"00FFD7",9,"00FFD7",
            31,"00FFD7",32,"00FFD7",33,"00FFD7",34,"00FFD7",47,"00FFD7",
            48,"00FFD7",49,"00FFD7",50,"00FFD7",53,"00FFD7",54,"00FFD7",
            55,"00FFD7",56,"00FFD7",57,"00FFD7",67,"00FFD7",69,"00FFD7",
            70,"00FFD7",72,"00FFD7",76,"00FFD7",77,"00FFD7",78,"00FFD7",
            79,"00FFD7",80,"00FFD7",81,"00FFD7",83,"00FFD7",91,"00FFD7",
            92,"00FFD7",93,"00FFD7",96,"00FFD7",97,"00FFD7"]
      }
    },
    deepBlue: {
      seg: {
        i: [4,"0000FF",5,"0000FF",6,"0000FF",7,"0000FF",9,"0000FF",
            31,"0000FF",32,"0000FF",33,"0000FF",34,"0000FF",47,"0000FF",
            48,"0000FF",49,"0000FF",50,"0000FF",53,"0000FF",54,"0000FF",
            55,"0000FF",56,"0000FF",57,"0000FF",67,"0000FF",69,"0000FF",
            70,"0000FF",72,"0000FF",76,"0000FF",77,"0000FF",78,"0000FF",
            79,"0000FF",80,"0000FF",81,"0000FF",83,"0000FF",91,"0000FF",
            92,"0000FF",93,"0000FF",96,"0000FF",97,"0000FF"]
      }
    },
    purple: {
      seg: {
        i: [4,"BE00FF",5,"BE00FF",6,"BE00FF",7,"BE00FF",9,"BE00FF",
            31,"BE00FF",32,"BE00FF",33,"BE00FF",34,"BE00FF",47,"BE00FF",
            48,"BE00FF",49,"BE00FF",50,"BE00FF",53,"BE00FF",54,"BE00FF",
            55,"BE00FF",56,"BE00FF",57,"BE00FF",67,"BE00FF",69,"BE00FF",
            70,"BE00FF",72,"BE00FF",76,"BE00FF",77,"BE00FF",78,"BE00FF",
            79,"BE00FF",80,"BE00FF",81,"BE00FF",83,"BE00FF",91,"BE00FF",
            92,"BE00FF",93,"BE00FF",96,"BE00FF",97,"BE00FF"]
      }
    },
    magenta: {
      seg: {
        i: [4,"F50064",5,"F50064",6,"F50064",7,"F50064",9,"F50064",
            31,"F50064",32,"F50064",33,"F50064",34,"F50064",47,"F50064",
            48,"F50064",49,"F50064",50,"F50064",53,"F50064",54,"F50064",
            55,"F50064",56,"F50064",57,"F50064",67,"F50064",69,"F50064",
            70,"F50064",72,"F50064",76,"F50064",77,"F50064",78,"F50064",
            79,"F50064",80,"F50064",81,"F50064",83,"F50064",91,"F50064",
            92,"F50064",93,"F50064",96,"F50064",97,"F50064"]
      }
    }
  }

  // TODO later:
  // content: { red: {...}, orange: {...}, ... },
  // surprise: { ... },
  // fear: { ... },
  // anger: { ... },
  // sad: { ... }
};

/*********************************************************
 * Emotion tracking + WLED sending
 *********************************************************/
let currentEmotion = null;   // e.g. "amusement"

function setEmotion(emotionName) {
  currentEmotion = emotionName;
  console.log("Emotion set:", currentEmotion);
}

async function sendWledPattern() {
  if (!currentEmotion || !currentColorKey) {
    console.warn("Missing emotion or color:", currentEmotion, currentColorKey);
    return;
  }

  const emotionBlock = WLED_PATTERNS[currentEmotion];
  if (!emotionBlock) {
    console.warn("No patterns defined for emotion:", currentEmotion);
    return;
  }

  const payload = emotionBlock[currentColorKey];
  if (!payload) {
    console.warn("No pattern for color:", currentColorKey, "in emotion:", currentEmotion);
    return;
  }

  try {
    const res = await fetch(WLED_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      console.warn("WLED returned non-OK:", res.status);
    } else {
      console.log("WLED pattern sent:", currentEmotion, currentColorKey);
    }
  } catch (err) {
    console.error("Failed to POST to WLED:", err);
  }
}

/*********************************************************
 * Final Accept handler (Page 4)
 * - save drawing
 * - send WLED pattern
 * - go back home
 *********************************************************/
async function onFinalAccept() {
  await saveBodyLocally();
  await sendWledPattern();
  showPage("pageEnglish4_canvas", "pageHome");
}
