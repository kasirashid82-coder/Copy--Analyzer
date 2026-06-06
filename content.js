console.log("Copy Analyzer loaded");

document.addEventListener("mouseup", function() {
  const selectedText = window.getSelection().toString();

  if (selectedText.length > 0) {
    const existingBox = document.getElementById("copy-analyzer-box");

    if (existingBox) {
      existingBox.remove();
    }

    const wordCount = selectedText.split(" ").length;
    let feedback = "";

    if (wordCount < 10) {
      feedback = "Good - short and clear";
    } else if (wordCount <= 20) {
      feedback = "Okay - could be shorter";
    } else {
      feedback = "Too long for a headline";
    }

    const box = document.createElement("div");
    box.id = "copy-analyzer-box";
    box.textContent = "Word count: " + wordCount + " - " + feedback;
    box.style.cssText = `
      display: block !important;
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      padding: 16px !important;
      background: white !important;
      color: black !important;
      border: 2px solid black !important;
      font: 16px Arial, sans-serif !important;
      z-index: 2147483647 !important;
    `;

    document.documentElement.appendChild(box);

    console.log("Word count: " + wordCount);
    console.log("Feedback: " + feedback);
    console.log("Visible box added:", document.getElementById("copy-analyzer-box"));
  }
});
