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