function DoSomething(){
    window.alert = function () { };

    // Use SweetAlert to display an alert
    Swal.fire({
        title: 'English',
        icon: 'question',
        confirmButtonText: 'OK'
    });
}

function DoSomethingSpanish(){
    window.alert = function () { };

    // Use SweetAlert to display an alert
    Swal.fire({
        title: 'Espanol',
        icon: 'question',
        confirmButtonText: 'OK'
    });
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