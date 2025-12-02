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
  if ((nextPageID === "pageEnglish4_canvas") || (nextPageID === "pageSpanish4_canvas")) {
    setTimeout(initBodyCanvas, 50);
  }

  // grabs img from local to display- only on page 5s
  if (nextPageID.startsWith("pageEnglish5_") || nextPageID.startsWith("pageSpanish5_")) {
    setTimeout(displayImg, 100);
  }


  if(nextPageID.startsWith("pageenglishsendtobrain") || nextPageID.startsWith("pagespanishsendtobrain")){
    setTimeout(displayImg, 2);
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
 * Saving it as base64 in localstorage as 'feelingsImage' - will later create a function to convert back to img
 *********************************************************/
async function saveBodyLocally() {
  const node = document.getElementById("bodyWrap");
  if (!node) return;

  const canvas = await html2canvas(node, {
    backgroundColor: null,
    scale: 2
  });

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
 * Emotion + color -> WLED JSON patterns
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







  },
  content: {
  red: {
    seg: {
      i: [7,"FF0000",12,"FF0000",21,"FF0000",22,"FF0000",23,"FF0000",24,"FF0000",
          25,"FF0000",27,"FF0000",28,"FF0000",32,"FF0000",34,"FF0000",35,"FF0000",
          36,"FF0000",37,"FF0000",38,"FF0000",39,"FF0000",41,"FF0000",42,"FF0000",
          43,"FF0000",44,"FF0000",47,"FF0000",48,"FF0000",51,"FF0000",52,"FF0000",
          57,"FF0000",60,"FF0000",61,"FF0000",62,"FF0000",63,"FF0000",64,"FF0000",
          65,"FF0000",75,"FF0000",76,"FF0000",81,"FF0000",82,"FF0000",85,"FF0000",
          86,"FF0000",89,"FF0000",90,"FF0000",94,"FF0000"]
    }
  },

  orange: {
    seg: {
      i: [7,"FF6400",12,"FF6400",21,"FF6400",22,"FF6400",23,"FF6400",24,"FF6400",
          25,"FF6400",27,"FF6400",28,"FF6400",32,"FF6400",34,"FF6400",35,"FF6400",
          36,"FF6400",37,"FF6400",38,"FF6400",39,"FF6400",41,"FF6400",42,"FF6400",
          43,"FF6400",44,"FF6400",47,"FF6400",48,"FF6400",51,"FF6400",52,"FF6400",
          57,"FF6400",60,"FF6400",61,"FF6400",62,"FF6400",63,"FF6400",64,"FF6400",
          65,"FF6400",75,"FF6400",76,"FF6400",81,"FF6400",82,"FF6400",85,"FF6400",
          86,"FF6400",89,"FF6400",90,"FF6400",94,"FF6400"]
    }
  },

  yellow: {
    seg: {
      i: [7,"FFB400",12,"FFB400",21,"FFB400",22,"FFB400",23,"FFB400",24,"FFB400",
          25,"FFB400",27,"FFB400",28,"FFB400",32,"FFB400",34,"FFB400",35,"FFB400",
          36,"FFB400",37,"FFB400",38,"FFB400",39,"FFB400",41,"FFB400",42,"FFB400",
          43,"FFB400",44,"FFB400",47,"FFB400",48,"FFB400",51,"FFB400",52,"FFB400",
          57,"FFB400",60,"FFB400",61,"FFB400",62,"FFB400",63,"FFB400",64,"FFB400",
          65,"FFB400",75,"FFB400",76,"FFB400",81,"FFB400",82,"FFB400",85,"FFB400",
          86,"FFB400",89,"FFB400",90,"FFB400",94,"FFB400"]
    }
  },

  green: {
    seg: {
      i: [7,"1EFF00",12,"1EFF00",21,"1EFF00",22,"1EFF00",23,"1EFF00",24,"1EFF00",
          25,"1EFF00",27,"1EFF00",28,"1EFF00",32,"1EFF00",34,"1EFF00",35,"1EFF00",
          36,"1EFF00",37,"1EFF00",38,"1EFF00",39,"1EFF00",41,"1EFF00",42,"1EFF00",
          43,"1EFF00",44,"1EFF00",47,"1EFF00",48,"1EFF00",51,"1EFF00",52,"1EFF00",
          57,"1EFF00",60,"1EFF00",61,"1EFF00",62,"1EFF00",63,"1EFF00",64,"1EFF00",
          65,"1EFF00",75,"1EFF00",76,"1EFF00",81,"1EFF00",82,"1EFF00",85,"1EFF00",
          86,"1EFF00",89,"1EFF00",90,"1EFF00",94,"1EFF00"]
    }
  },

  lightBlue: {
    seg: {
      i: [7,"00FFD7",12,"00FFD7",21,"00FFD7",22,"00FFD7",23,"00FFD7",24,"00FFD7",
          25,"00FFD7",27,"00FFD7",28,"00FFD7",32,"00FFD7",34,"00FFD7",35,"00FFD7",
          36,"00FFD7",37,"00FFD7",38,"00FFD7",39,"00FFD7",41,"00FFD7",42,"00FFD7",
          43,"00FFD7",44,"00FFD7",47,"00FFD7",48,"00FFD7",51,"00FFD7",52,"00FFD7",
          57,"00FFD7",60,"00FFD7",61,"00FFD7",62,"00FFD7",63,"00FFD7",64,"00FFD7",
          65,"00FFD7",75,"00FFD7",76,"00FFD7",81,"00FFD7",82,"00FFD7",85,"00FFD7",
          86,"00FFD7",89,"00FFD7",90,"00FFD7",94,"00FFD7"]
    }
  },

  deepBlue: {
    seg: {
      i: [7,"0000FF",12,"0000FF",21,"0000FF",22,"0000FF",23,"0000FF",24,"0000FF",
          25,"0000FF",27,"0000FF",28,"0000FF",32,"0000FF",34,"0000FF",35,"0000FF",
          36,"0000FF",37,"0000FF",38,"0000FF",39,"0000FF",41,"0000FF",42,"0000FF",
          43,"0000FF",44,"0000FF",47,"0000FF",48,"0000FF",51,"0000FF",52,"0000FF",
          57,"0000FF",60,"0000FF",61,"0000FF",62,"0000FF",63,"0000FF",64,"0000FF",
          65,"0000FF",75,"0000FF",76,"0000FF",81,"0000FF",82,"0000FF",85,"0000FF",
          86,"0000FF",89,"0000FF",90,"0000FF",94,"0000FF"]
    }
  },

  purple: {
    seg: {
      i: [7,"BE00FF",12,"BE00FF",21,"BE00FF",22,"BE00FF",23,"BE00FF",24,"BE00FF",
          25,"BE00FF",27,"BE00FF",28,"BE00FF",32,"BE00FF",34,"BE00FF",35,"BE00FF",
          36,"BE00FF",37,"BE00FF",38,"BE00FF",39,"BE00FF",41,"BE00FF",42,"BE00FF",
          43,"BE00FF",44,"BE00FF",47,"BE00FF",48,"BE00FF",51,"BE00FF",52,"BE00FF",
          57,"BE00FF",60,"BE00FF",61,"BE00FF",62,"BE00FF",63,"BE00FF",64,"BE00FF",
          65,"BE00FF",75,"BE00FF",76,"BE00FF",81,"BE00FF",82,"BE00FF",85,"BE00FF",
          86,"BE00FF",89,"BE00FF",90,"BE00FF",94,"BE00FF"]
    }
  },

  magenta: {
    seg: {
      i: [7,"F50064",12,"F50064",21,"F50064",22,"F50064",23,"F50064",24,"F50064",
          25,"F50064",27,"F50064",28,"F50064",32,"F50064",34,"F50064",35,"F50064",
          36,"F50064",37,"F50064",38,"F50064",39,"F50064",41,"F50064",42,"F50064",
          43,"F50064",44,"F50064",47,"F50064",48,"F50064",51,"F50064",52,"F50064",
          57,"F50064",60,"F50064",61,"F50064",62,"F50064",63,"F50064",64,"F50064",
          65,"F50064",75,"F50064",76,"F50064",81,"F50064",82,"F50064",85,"F50064",
          86,"F50064",89,"F50064",90,"F50064",94,"F50064"]
    }
  }
},
surprise: {
  red: {
    seg: {
      i: [1,"FF0000",2,"FF0000",3,"FF0000",4,"FF0000",13,"FF0000",14,"FF0000",
          15,"FF0000",20,"FF0000",21,"FF0000",22,"FF0000",23,"FF0000",24,"FF0000",
          25,"FF0000",27,"FF0000",37,"FF0000",39,"FF0000",42,"FF0000",44,"FF0000",
          45,"FF0000",46,"FF0000",58,"FF0000",61,"FF0000",62,"FF0000",63,"FF0000",
          64,"FF0000",65,"FF0000",66,"FF0000",73,"FF0000",76,"FF0000",77,"FF0000",
          78,"FF0000",79,"FF0000",80,"FF0000",81,"FF0000",82,"FF0000",83,"FF0000",
          84,"FF0000",85,"FF0000",87,"FF0000",89,"FF0000",91,"FF0000",94,"FF0000"]
    }
  },

  orange: {
    seg: {
      i: [1,"FF6400",2,"FF6400",3,"FF6400",4,"FF6400",13,"FF6400",14,"FF6400",
          15,"FF6400",20,"FF6400",21,"FF6400",22,"FF6400",23,"FF6400",24,"FF6400",
          25,"FF6400",27,"FF6400",37,"FF6400",39,"FF6400",42,"FF6400",44,"FF6400",
          45,"FF6400",46,"FF6400",58,"FF6400",61,"FF6400",62,"FF6400",63,"FF6400",
          64,"FF6400",65,"FF6400",66,"FF6400",73,"FF6400",76,"FF6400",77,"FF6400",
          78,"FF6400",79,"FF6400",80,"FF6400",81,"FF6400",82,"FF6400",83,"FF6400",
          84,"FF6400",85,"FF6400",87,"FF6400",89,"FF6400",91,"FF6400",94,"FF6400"]
    }
  },

  yellow: {
    seg: {
      i: [1,"FFB400",2,"FFB400",3,"FFB400",4,"FFB400",13,"FFB400",14,"FFB400",
          15,"FFB400",20,"FFB400",21,"FFB400",22,"FFB400",23,"FFB400",24,"FFB400",
          25,"FFB400",27,"FFB400",37,"FFB400",39,"FFB400",42,"FFB400",44,"FFB400",
          45,"FFB400",46,"FFB400",58,"FFB400",61,"FFB400",62,"FFB400",63,"FFB400",
          64,"FFB400",65,"FFB400",66,"FFB400",73,"FFB400",76,"FFB400",77,"FFB400",
          78,"FFB400",79,"FFB400",80,"FFB400",81,"FFB400",82,"FFB400",83,"FFB400",
          84,"FFB400",85,"FFB400",87,"FFB400",89,"FFB400",91,"FFB400",94,"FFB400"]
    }
  },

  green: {
    seg: {
      i: [1,"1EFF00",2,"1EFF00",3,"1EFF00",4,"1EFF00",13,"1EFF00",14,"1EFF00",
          15,"1EFF00",20,"1EFF00",21,"1EFF00",22,"1EFF00",23,"1EFF00",24,"1EFF00",
          25,"1EFF00",27,"1EFF00",37,"1EFF00",39,"1EFF00",42,"1EFF00",44,"1EFF00",
          45,"1EFF00",46,"1EFF00",58,"1EFF00",61,"1EFF00",62,"1EFF00",63,"1EFF00",
          64,"1EFF00",65,"1EFF00",66,"1EFF00",73,"1EFF00",76,"1EFF00",77,"1EFF00",
          78,"1EFF00",79,"1EFF00",80,"1EFF00",81,"1EFF00",82,"1EFF00",83,"1EFF00",
          84,"1EFF00",85,"1EFF00",87,"1EFF00",89,"1EFF00",91,"1EFF00",94,"1EFF00"]
    }
  },

  lightBlue: {
    seg: {
      i: [1,"00FFD7",2,"00FFD7",3,"00FFD7",4,"00FFD7",13,"00FFD7",14,"00FFD7",
          15,"00FFD7",20,"00FFD7",21,"00FFD7",22,"00FFD7",23,"00FFD7",24,"00FFD7",
          25,"00FFD7",27,"00FFD7",37,"00FFD7",39,"00FFD7",42,"00FFD7",44,"00FFD7",
          45,"00FFD7",46,"00FFD7",58,"00FFD7",61,"00FFD7",62,"00FFD7",63,"00FFD7",
          64,"00FFD7",65,"00FFD7",66,"00FFD7",73,"00FFD7",76,"00FFD7",77,"00FFD7",
          78,"00FFD7",79,"00FFD7",80,"00FFD7",81,"00FFD7",82,"00FFD7",83,"00FFD7",
          84,"00FFD7",85,"00FFD7",87,"00FFD7",89,"00FFD7",91,"00FFD7",94,"00FFD7"]
    }
  },

  deepBlue: {
    seg: {
      i: [1,"0000FF",2,"0000FF",3,"0000FF",4,"0000FF",13,"0000FF",14,"0000FF",
          15,"0000FF",20,"0000FF",21,"0000FF",22,"0000FF",23,"0000FF",24,"0000FF",
          25,"0000FF",27,"0000FF",37,"0000FF",39,"0000FF",42,"0000FF",44,"0000FF",
          45,"0000FF",46,"0000FF",58,"0000FF",61,"0000FF",62,"0000FF",63,"0000FF",
          64,"0000FF",65,"0000FF",66,"0000FF",73,"0000FF",76,"0000FF",77,"0000FF",
          78,"0000FF",79,"0000FF",80,"0000FF",81,"0000FF",82,"0000FF",83,"0000FF",
          84,"0000FF",85,"0000FF",87,"0000FF",89,"0000FF",91,"0000FF",94,"0000FF"]
    }
  },

  purple: {
    seg: {
      i: [1,"BE00FF",2,"BE00FF",3,"BE00FF",4,"BE00FF",13,"BE00FF",14,"BE00FF",
          15,"BE00FF",20,"BE00FF",21,"BE00FF",22,"BE00FF",23,"BE00FF",24,"BE00FF",
          25,"BE00FF",27,"BE00FF",37,"BE00FF",39,"BE00FF",42,"BE00FF",44,"BE00FF",
          45,"BE00FF",46,"BE00FF",58,"BE00FF",61,"BE00FF",62,"BE00FF",63,"BE00FF",
          64,"BE00FF",65,"BE00FF",66,"BE00FF",73,"BE00FF",76,"BE00FF",77,"BE00FF",
          78,"BE00FF",79,"BE00FF",80,"BE00FF",81,"BE00FF",82,"BE00FF",83,"BE00FF",
          84,"BE00FF",85,"BE00FF",87,"BE00FF",89,"BE00FF",91,"BE00FF",94,"BE00FF"]
    }
  },

  magenta: {
    seg: {
      i: [1,"F50064",2,"F50064",3,"F50064",4,"F50064",13,"F50064",14,"F50064",
          15,"F50064",20,"F50064",21,"F50064",22,"F50064",23,"F50064",24,"F50064",
          25,"F50064",27,"F50064",37,"F50064",39,"F50064",42,"F50064",44,"F50064",
          45,"F50064",46,"F50064",58,"F50064",61,"F50064",62,"F50064",63,"F50064",
          64,"F50064",65,"F50064",66,"F50064",73,"F50064",76,"F50064",77,"F50064",
          78,"F50064",79,"F50064",80,"F50064",81,"F50064",82,"F50064",83,"F50064",
          84,"F50064",85,"F50064",87,"F50064",89,"F50064",91,"F50064",94,"F50064"]
    }
  }
},
fear: {
  red: {
    seg: {
      i: [0,"FF0000",8,"FF0000",9,"FF0000",10,"FF0000",11,"FF0000",12,"FF0000",
          13,"FF0000",21,"FF0000",22,"FF0000",23,"FF0000",27,"FF0000",28,"FF0000",
          29,"FF0000",30,"FF0000",37,"FF0000",38,"FF0000",39,"FF0000",40,"FF0000",
          41,"FF0000",51,"FF0000",52,"FF0000",53,"FF0000",57,"FF0000",59,"FF0000",
          64,"FF0000",73,"FF0000",74,"FF0000",87,"FF0000",88,"FF0000",
          93,"FF0000",94,"FF0000"]
    }
  },

  orange: {
    seg: {
      i: [0,"FF6400",8,"FF6400",9,"FF6400",10,"FF6400",11,"FF6400",12,"FF6400",
          13,"FF6400",21,"FF6400",22,"FF6400",23,"FF6400",27,"FF6400",28,"FF6400",
          29,"FF6400",30,"FF6400",37,"FF6400",38,"FF6400",39,"FF6400",40,"FF6400",
          41,"FF6400",51,"FF6400",52,"FF6400",53,"FF6400",57,"FF6400",59,"FF6400",
          64,"FF6400",73,"FF6400",74,"FF6400",87,"FF6400",88,"FF6400",
          93,"FF6400",94,"FF6400"]
    }
  },

  yellow: {
    seg: {
      i: [0,"FFB400",8,"FFB400",9,"FFB400",10,"FFB400",11,"FFB400",12,"FFB400",
          13,"FFB400",21,"FFB400",22,"FFB400",23,"FFB400",27,"FFB400",28,"FFB400",
          29,"FFB400",30,"FFB400",37,"FFB400",38,"FFB400",39,"FFB400",40,"FFB400",
          41,"FFB400",51,"FFB400",52,"FFB400",53,"FFB400",57,"FFB400",59,"FFB400",
          64,"FFB400",73,"FFB400",74,"FFB400",87,"FFB400",88,"FFB400",
          93,"FFB400",94,"FFB400"]
    }
  },

  green: {
    seg: {
      i: [0,"1EFF00",8,"1EFF00",9,"1EFF00",10,"1EFF00",11,"1EFF00",12,"1EFF00",
          13,"1EFF00",21,"1EFF00",22,"1EFF00",23,"1EFF00",27,"1EFF00",28,"1EFF00",
          29,"1EFF00",30,"1EFF00",37,"1EFF00",38,"1EFF00",39,"1EFF00",40,"1EFF00",
          41,"1EFF00",51,"1EFF00",52,"1EFF00",53,"1EFF00",57,"1EFF00",59,"1EFF00",
          64,"1EFF00",73,"1EFF00",74,"1EFF00",87,"1EFF00",88,"1EFF00",
          93,"1EFF00",94,"1EFF00"]
    }
  },

  lightBlue: {
    seg: {
      i: [0,"00FFD7",8,"00FFD7",9,"00FFD7",10,"00FFD7",11,"00FFD7",12,"00FFD7",
          13,"00FFD7",21,"00FFD7",22,"00FFD7",23,"00FFD7",27,"00FFD7",28,"00FFD7",
          29,"00FFD7",30,"00FFD7",37,"00FFD7",38,"00FFD7",39,"00FFD7",40,"00FFD7",
          41,"00FFD7",51,"00FFD7",52,"00FFD7",53,"00FFD7",57,"00FFD7",59,"00FFD7",
          64,"00FFD7",73,"00FFD7",74,"00FFD7",87,"00FFD7",88,"00FFD7",
          93,"00FFD7",94,"00FFD7"]
    }
  },

  deepBlue: {
    seg: {
      i: [0,"0000FF",8,"0000FF",9,"0000FF",10,"0000FF",11,"0000FF",12,"0000FF",
          13,"0000FF",21,"0000FF",22,"0000FF",23,"0000FF",27,"0000FF",28,"0000FF",
          29,"0000FF",30,"0000FF",37,"0000FF",38,"0000FF",39,"0000FF",40,"0000FF",
          41,"0000FF",51,"0000FF",52,"0000FF",53,"0000FF",57,"0000FF",59,"0000FF",
          64,"0000FF",73,"0000FF",74,"0000FF",87,"0000FF",88,"0000FF",
          93,"0000FF",94,"0000FF"]
    }
  },

  purple: {
    seg: {
      i: [0,"BE00FF",8,"BE00FF",9,"BE00FF",10,"BE00FF",11,"BE00FF",12,"BE00FF",
          13,"BE00FF",21,"BE00FF",22,"BE00FF",23,"BE00FF",27,"BE00FF",28,"BE00FF",
          29,"BE00FF",30,"BE00FF",37,"BE00FF",38,"BE00FF",39,"BE00FF",40,"BE00FF",
          41,"BE00FF",51,"BE00FF",52,"BE00FF",53,"BE00FF",57,"BE00FF",59,"BE00FF",
          64,"BE00FF",73,"BE00FF",74,"BE00FF",87,"BE00FF",88,"BE00FF",
          93,"BE00FF",94,"BE00FF"]
    }
  },

  magenta: {
    seg: {
      i: [0,"F50064",8,"F50064",9,"F50064",10,"F50064",11,"F50064",12,"F50064",
          13,"F50064",21,"F50064",22,"F50064",23,"F50064",27,"F50064",28,"F50064",
          29,"F50064",30,"F50064",37,"F50064",38,"F50064",39,"F50064",40,"F50064",
          41,"F50064",51,"F50064",52,"F50064",53,"F50064",57,"F50064",59,"F50064",
          64,"F50064",73,"F50064",74,"F50064",87,"F50064",88,"F50064",
          93,"F50064",94,"F50064"]
    }
  }
},


anger: {
  red: {
    seg: {
      i: [5,"FF0000",6,"FF0000",7,"FF0000",16,"FF0000",17,"FF0000",
          18,"FF0000",19,"FF0000",26,"FF0000",31,"FF0000",33,"FF0000",
          38,"FF0000",39,"FF0000",40,"FF0000",41,"FF0000",45,"FF0000",
          47,"FF0000",50,"FF0000",66,"FF0000",68,"FF0000",70,"FF0000",
          71,"FF0000",72,"FF0000",74,"FF0000",77,"FF0000",78,"FF0000"]
    }
  },

  orange: {
    seg: {
      i: [5,"FF6400",6,"FF6400",7,"FF6400",16,"FF6400",17,"FF6400",
          18,"FF6400",19,"FF6400",26,"FF6400",31,"FF6400",33,"FF6400",
          38,"FF6400",39,"FF6400",40,"FF6400",41,"FF6400",45,"FF6400",
          47,"FF6400",50,"FF6400",66,"FF6400",68,"FF6400",70,"FF6400",
          71,"FF6400",72,"FF6400",74,"FF6400",77,"FF6400",78,"FF6400"]
    }
  },

  yellow: {
    seg: {
      i: [5,"FFB400",6,"FFB400",7,"FFB400",16,"FFB400",17,"FFB400",
          18,"FFB400",19,"FFB400",26,"FFB400",31,"FFB400",33,"FFB400",
          38,"FFB400",39,"FFB400",40,"FFB400",41,"FFB400",45,"FFB400",
          47,"FFB400",50,"FFB400",66,"FFB400",68,"FFB400",70,"FFB400",
          71,"FFB400",72,"FFB400",74,"FFB400",77,"FFB400",78,"FFB400"]
    }
  },

  green: {
    seg: {
      i: [5,"1EFF00",6,"1EFF00",7,"1EFF00",16,"1EFF00",17,"1EFF00",
          18,"1EFF00",19,"1EFF00",26,"1EFF00",31,"1EFF00",33,"1EFF00",
          38,"1EFF00",39,"1EFF00",40,"1EFF00",41,"1EFF00",45,"1EFF00",
          47,"1EFF00",50,"1EFF00",66,"1EFF00",68,"1EFF00",70,"1EFF00",
          71,"1EFF00",72,"1EFF00",74,"1EFF00",77,"1EFF00",78,"1EFF00"]
    }
  },

  lightBlue: {
    seg: {
      i: [5,"00FFD7",6,"00FFD7",7,"00FFD7",16,"00FFD7",17,"00FFD7",
          18,"00FFD7",19,"00FFD7",26,"00FFD7",31,"00FFD7",33,"00FFD7",
          38,"00FFD7",39,"00FFD7",40,"00FFD7",41,"00FFD7",45,"00FFD7",
          47,"00FFD7",50,"00FFD7",66,"00FFD7",68,"00FFD7",70,"00FFD7",
          71,"00FFD7",72,"00FFD7",74,"00FFD7",77,"00FFD7",78,"00FFD7"]
    }
  },

  deepBlue: {
    seg: {
      i: [5,"0000FF",6,"0000FF",7,"0000FF",16,"0000FF",17,"0000FF",
          18,"0000FF",19,"0000FF",26,"0000FF",31,"0000FF",33,"0000FF",
          38,"0000FF",39,"0000FF",40,"0000FF",41,"0000FF",45,"0000FF",
          47,"0000FF",50,"0000FF",66,"0000FF",68,"0000FF",70,"0000FF",
          71,"0000FF",72,"0000FF",74,"0000FF",77,"0000FF",78,"0000FF"]
    }
  },

  purple: {
    seg: {
      i: [5,"BE00FF",6,"BE00FF",7,"BE00FF",16,"BE00FF",17,"BE00FF",
          18,"BE00FF",19,"BE00FF",26,"BE00FF",31,"BE00FF",33,"BE00FF",
          38,"BE00FF",39,"BE00FF",40,"BE00FF",41,"BE00FF",45,"BE00FF",
          47,"BE00FF",50,"BE00FF",66,"BE00FF",68,"BE00FF",70,"BE00FF",
          71,"BE00FF",72,"BE00FF",74,"BE00FF",77,"BE00FF",78,"BE00FF"]
    }
  },

  magenta: {
    seg: {
      i: [5,"F50064",6,"F50064",7,"F50064",16,"F50064",17,"F50064",
          18,"F50064",19,"F50064",26,"F50064",31,"F50064",33,"F50064",
          38,"F50064",39,"F50064",40,"F50064",41,"F50064",45,"F50064",
          47,"F50064",50,"F50064",66,"F50064",68,"F50064",70,"F50064",
          71,"F50064",72,"F50064",74,"F50064",77,"F50064",78,"F50064"]
    }
  }
},

  sad: {
  red: {
    seg: {
      i: [5,"FF0000",6,"FF0000",7,"FF0000",9,"FF0000",15,"FF0000",
          19,"FF0000",20,"FF0000",24,"FF0000",32,"FF0000",47,"FF0000",
          48,"FF0000",57,"FF0000",58,"FF0000",59,"FF0000",66,"FF0000",
          68,"FF0000",69,"FF0000",70,"FF0000",71,"FF0000",72,"FF0000",
          75,"FF0000"]
    }
  },

  orange: {
    seg: {
      i: [5,"FF6400",6,"FF6400",7,"FF6400",9,"FF6400",15,"FF6400",
          19,"FF6400",20,"FF6400",24,"FF6400",32,"FF6400",47,"FF6400",
          48,"FF6400",57,"FF6400",58,"FF6400",59,"FF6400",66,"FF6400",
          68,"FF6400",69,"FF6400",70,"FF6400",71,"FF6400",72,"FF6400",
          75,"FF6400"]
    }
  },

  yellow: {
    seg: {
      i: [5,"FFB400",6,"FFB400",7,"FFB400",9,"FFB400",15,"FFB400",
          19,"FFB400",20,"FFB400",24,"FFB400",32,"FFB400",47,"FFB400",
          48,"FFB400",57,"FFB400",58,"FFB400",59,"FFB400",66,"FFB400",
          68,"FFB400",69,"FFB400",70,"FFB400",71,"FFB400",72,"FFB400",
          75,"FFB400"]
    }
  },

  green: {
    seg: {
      i: [5,"1EFF00",6,"1EFF00",7,"1EFF00",9,"1EFF00",15,"1EFF00",
          19,"1EFF00",20,"1EFF00",24,"1EFF00",32,"1EFF00",47,"1EFF00",
          48,"1EFF00",57,"1EFF00",58,"1EFF00",59,"1EFF00",66,"1EFF00",
          68,"1EFF00",69,"1EFF00",70,"1EFF00",71,"1EFF00",72,"1EFF00",
          75,"1EFF00"]
    }
  },

  lightBlue: {
    seg: {
      i: [5,"00FFD7",6,"00FFD7",7,"00FFD7",9,"00FFD7",15,"00FFD7",
          19,"00FFD7",20,"00FFD7",24,"00FFD7",32,"00FFD7",47,"00FFD7",
          48,"00FFD7",57,"00FFD7",58,"00FFD7",59,"00FFD7",66,"00FFD7",
          68,"00FFD7",69,"00FFD7",70,"00FFD7",71,"00FFD7",72,"00FFD7",
          75,"00FFD7"]
    }
  },

  deepBlue: {
    seg: {
      i: [5,"0000FF",6,"0000FF",7,"0000FF",9,"0000FF",15,"0000FF",
          19,"0000FF",20,"0000FF",24,"0000FF",32,"0000FF",47,"0000FF",
          48,"0000FF",57,"0000FF",58,"0000FF",59,"0000FF",66,"0000FF",
          68,"0000FF",69,"0000FF",70,"0000FF",71,"0000FF",72,"0000FF",
          75,"0000FF"]
    }
  },

  purple: {
    seg: {
      i: [5,"BE00FF",6,"BE00FF",7,"BE00FF",9,"BE00FF",15,"BE00FF",
          19,"BE00FF",20,"BE00FF",24,"BE00FF",32,"BE00FF",47,"BE00FF",
          48,"BE00FF",57,"BE00FF",58,"BE00FF",59,"BE00FF",66,"BE00FF",
          68,"BE00FF",69,"BE00FF",70,"BE00FF",71,"BE00FF",72,"BE00FF",
          75,"BE00FF"]
    }
  },

  magenta: {
    seg: {
      i: [5,"F50064",6,"F50064",7,"F50064",9,"F50064",15,"F50064",
          19,"F50064",20,"F50064",24,"F50064",32,"F50064",47,"F50064",
          48,"F50064",57,"F50064",58,"F50064",59,"F50064",66,"F50064",
          68,"F50064",69,"F50064",70,"F50064",71,"F50064",72,"F50064",
          75,"F50064"]
    }
  }
}
};

/*********************************************************
 * Emotion tracking + WLED sending
 *********************************************************/
let currentEmotion = null;   // e.g. "amusement"

function setEmotion(emotionName) {
  currentEmotion = emotionName;

  if(emotionName === 'amusement'){englishBrainPage = `pageEnglish5_happy`}
  else{englishBrainPage = `pageEnglish5_${emotionName}`;}
  


  console.log("Emotion set:", currentEmotion);
}

async function sendWledPattern() {

  console.log("this is the combo that should send!~~~~~~:", currentEmotion, currentColorKey);

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

// save mg locally
async function saveImgLocal(){
  await saveBodyLocally();
}


// nav from canvas page to page 5
async function saveAndGo() {
  await saveImgLocal();   // waits for the image to be READY

   // TODO map rest of emotions for english.. will probably need to do it for spanish too
  let emotionMap = {
      "amusement": "pageEnglish5_happy",
      // "fear": ,
      // "content": ,
      // "suprise": ,
      // "sadness": ,
      // "anger"
  };


  

  console.log("check map! run~~~~~", emotionMap[currentEmotion]);  // cool now I know this will work.
  let nextPageFrom5 = emotionMap[currentEmotion];

  console.log("next page id from 5 :", nextPageFrom5);

  showPage("pageEnglish4_canvas", "pageenglishsendtobrain");
}


async function sendToBrain() {


  //TODO uncomment this!
  await sendWledPattern();

  // need to mod this to show next page based on emotion name
  console.log("I am here!~~~~~~~~~~~~~~~~~~~",currentEmotion);

}




// function to turn the oled off
async function sendWledOff() {
  try {
    const res = await fetch(WLED_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(WLED_SPECIAL.off)
    });

    if (!res.ok) {
      console.warn("WLED OFF returned non-OK:", res.status);
    } else {
      console.log("WLED turned OFF / cleared");
    }
  } catch (err) {
    console.error("Failed to POST OFF to WLED:", err);
  }
}



// Using this for when the user just click finish with nothing sent to email
function finalFinish(){
  sendWledOff();
  location.reload();
};


// clear local storage for img
function clearStorage(){
  
  localStorage.removeItem("feelingsImage");
  localStorage.removeItem("feelingsImagepage5_full");
  
}


// This function is used for page 5. Was given 3 assets per emotion. so ill randomize it here
function randomImg() {
    let emotionMap = {
      "amusement": ["./images/english/englishpage5_happy1.png", "./images/english/englishpage5_happy2.png", "./images/english/englishpage5_happy3.png"],
      "fear": [""],
      "content": [""],
      "suprise": [""],
      "sadness": [""],
      "anger": [""]
  };

}



// converting base64 from the localstorage to an img 
// Source - https://stackoverflow.com/a
// Posted by Fizzix, modified by community. See post 'Timeline' for change history
// Retrieved 2025-11-28, License - CC BY-SA 4.0

function getBase64Image(img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    var dataURL = canvas.toDataURL("image/png");

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}


function displayImg() {
    const dataImage = localStorage.getItem("feelingsImage");
    if (!dataImage) return;

    // find visible page container
    const visiblePage = document.querySelector(".page-container:not(.d-none)");
    if (!visiblePage) return;

    // find either .tableBannerBrain OR .tableBanner
    const brainImg = visiblePage.querySelector(".tableBannerBrain");
    const bannerImg = visiblePage.querySelector(".tableBanner");

    if (brainImg) {
        brainImg.src = dataImage;
        console.log("Loaded into Brain page");
    } else if (bannerImg) {
        bannerImg.src = dataImage;
        console.log("Loaded into Page 5");
    } else {
        console.log("No banner found on this page.");
    }
}




// saveing page 5 locally

function getCurrentPage5Element() {
    // find all English + Spanish page 5 containers
    const pages = document.querySelectorAll('[id^="pageEnglish5_"], [id^="pageSpanish5_"]');

    for (const p of pages) {
        if (!p.classList.contains("d-none")) {
            return p;  
        }
    }

    return null; // none visible
}







async function savePage5() {
    const page5 = getCurrentPage5Element();

    if (!page5) {
        console.error("No active Page 5 found");
        return;
    }

    const canvas = await html2canvas(page5, {
        backgroundColor: "#FFFFFF",
        scale: 1,
        useCORS: true,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high"
    });

    const data = canvas.toDataURL("image/jpeg", 0.9); 
    localStorage.setItem("feelingsImagepage5_full", data);

    console.log("Saved smooth Page 5 screenshot!");
}



// email function
async function sendEmailWithImage() {
    const email = document.getElementById("user_email").value;
    const imageBase64 = localStorage.getItem("feelingsImagepage5_full");
    const emotion = currentEmotion || "unknown";

    const payload = {
        email: email,
        emotion: emotion,
        image: imageBase64
    };

    try {
        const res = await fetch("http://localhost:1024/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const json = await res.json();

        if (json.success) {
            Swal.fire("Sent!", "Your drawing has been emailed.", "success");
        } else {
            Swal.fire("Error", json.error || "Failed to send email.", "error");
        }

    } catch (err) {
        console.error(err);
        Swal.fire("Error", "Could not connect to email server.", "error");
    }
}



// reduces to 32KB
function compressImageBase64(base64) {
    return new Promise(resolve => {
        const img = new Image();

        img.onload = () => {
            const canvas = document.createElement("canvas");

            // Resize to 40% of original dimensions
            canvas.width = img.width * 0.20;
            canvas.height = img.height * 0.20;

            const ctx = canvas.getContext("2d");
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            
            const compressed = canvas.toDataURL("image/jpeg", 0.50);
            resolve(compressed);
        };

        img.src = base64;
    });
}










