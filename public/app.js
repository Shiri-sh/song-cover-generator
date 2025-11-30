const audioInput = document.getElementById("audioInput");
const submitButton = document.getElementById("submitButton");
const analysisOutput = document.getElementById("analysisOutput");
const imagesOutput = document.getElementById("imagesOutput");


submitButton.addEventListener("click", async () => {
    const file = audioInput.files?.[0];
    if (!file) return;


    analysisOutput.innerText = "Processing...";
    imagesOutput.innerHTML = "";


    const formData = new FormData();
    formData.append("audio", file);


    const res = await fetch("/upload", {
        method: "POST",
        body: formData,
    });
    

    const data = await res.json();

    const analysisRes = await fetch(`/analyze/${data.name}`);
    const dataAnalysis = await analysisRes.json();

    analysisOutput.innerText = data.analysis ?? "No analysis returned";
    
    const coverRes = await fetch("/generate-cover", {
        method: "POST",
        body: JSON.stringify({ analysis: dataAnalysis }),
        headers: {
            "Content-Type": "application/json",
        },
    });
    const dataCover = await coverRes.json();

    if (dataCover.images?.length) {
        dataCover.images.forEach((url) => {
            const img = document.createElement("img");
            img.src = url;
            img.className = "generated-image";
            imagesOutput.appendChild(img);
        });
    }
});