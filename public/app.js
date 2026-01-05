const audioInput = document.getElementById("audioInput");
const submitButton = document.getElementById("submitButton");
const analysisOutput = document.getElementById("analysisOutput");
const imagesOutput = document.getElementById("imagesOutput");
const uploadStatus = document.getElementById("uploadStatus");

function markdownBoldToHtml(text) {
    if (!text) return "";

    return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

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
    
    console.log("dataAnalysis", dataAnalysis);
    
    const formattedAnalysis = markdownBoldToHtml(dataAnalysis.analysis);

    analysisOutput.innerHTML = formattedAnalysis || "No analysis returned";
    console.log("sliced prompt",dataAnalysis.analysis.slice(dataAnalysis.analysis.indexOf("6.") + 1));
    const coverRes = await fetch("/api/generate-cover", {
        method: "POST",
        body: JSON.stringify({ prompt: dataAnalysis.analysis.slice(dataAnalysis.analysis.indexOf("6.") + 1) }),
        headers: {
            "Content-Type": "application/json",
        },
    });
    const dataCover = await coverRes.json();

    console.log("dataCover", dataCover);

    if (dataCover.images?.length) {
        dataCover.images.forEach((url, index) => {
            const container = document.createElement("div");
            container.className = "image-container";

            const img = document.createElement("img");
            img.src = url;
            img.className = "generated-image";
            img.alt = `Generated Image ${index + 1}`;

            const downloadButton = document.createElement("button");
            downloadButton.innerText = "Download";
            downloadButton.addEventListener("click", () => {
                const a = document.createElement("a");
                a.href = JSON.parse(url);
                //JSON.parse(url);
                console.log("url.slice(1, -1):", url.slice(1, -1));
                console.log("a.JSON.parse(url):", JSON.parse(url));
                a.download = `image_${index + 1}.png`;
                a.click();
            });

            container.appendChild(img);
            container.appendChild(downloadButton);
            imagesOutput.appendChild(container);
        });
    }
});
