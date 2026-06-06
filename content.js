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

    document.body.appendChild(box);

    console.log("Word count: " + wordCount);
    console.log("Feedback: " + feedback);
  }
});
