const audioInput = document.getElementById("audioInput");
const submitButton = document.getElementById("submitButton");
const analysisOutput = document.getElementById("analysisOutput");
const imagesOutput = document.getElementById("imagesOutput");
const uploadStatus = document.getElementById("uploadStatus");

submitButton.addEventListener("click", async () => {
    const file = audioInput.files?.[0];
    if (!file) return;


    analysisOutput.innerText = "Processing...";
    uploadStatus.innerText = "Uploading...";
    imagesOutput.innerText = "Generating images...";
    imagesOutput.innerHTML = "";


    const formData = new FormData();
    formData.append("audio", file);

    
    const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
    });
    

    const data = await res.json();
    uploadStatus.innerText = data.message ?? "Upload failed";
    const analysisRes = await fetch(`/api/analyze/${data.name}`);
    const dataAnalysis = await analysisRes.json();

    analysisOutput.innerText = data.analysis ?? "No analysis returned";

    const coverRes = await fetch("/api/generate-cover", {
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