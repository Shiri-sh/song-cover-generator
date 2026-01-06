const audioInput = document.getElementById("audioInput");
const submitButton = document.getElementById("submitButton");
const analysisOutput = document.getElementById("analysisOutput");
const imagesOutput = document.getElementById("imagesOutput");
const uploadStatus = document.getElementById("uploadStatus");

function markdownBoldToHtml(text) {
    if (!text) return "";

    return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
}

// Small helpers to keep the click handler concise
function setUploadStatus(text) {
    uploadStatus.innerText = text ?? "";
}

function setAnalysisText(html) {
    analysisOutput.innerHTML = html ?? "";
}

function setImagesMessage(text) {
    imagesOutput.innerText = text ?? "";
}

function clearImages() {
    imagesOutput.innerHTML = "";
}

function createImageCard(url, index) {
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
        a.href = url;
        a.download = `image_${index + 1}.png`;
        a.click();
    });

    container.appendChild(img);
    container.appendChild(downloadButton);
    return container;
}

submitButton.addEventListener("click", async () => {
    const file = audioInput.files?.[0];
    if (!file) return;

    // Initial UI state
    setAnalysisText("Processing...");
    setUploadStatus("Uploading...");
    setImagesMessage("Generating images...");

    clearImages();

    const formData = new FormData();
    formData.append("audio", file);

    try {
        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        setUploadStatus(data.message ?? "Upload failed");

        const analysisRes = await fetch(`/api/analyze/${data.name}`);
        const dataAnalysis = await analysisRes.json();

        if (dataAnalysis?.analysis) {
            const formattedAnalysis = markdownBoldToHtml(dataAnalysis.analysis);
            setAnalysisText(formattedAnalysis);

            const promptText = dataAnalysis.analysis.slice(dataAnalysis.analysis.indexOf("6.") + 1);

            const coverRes = await fetch("/api/generate-cover", {
                method: "POST",
                body: JSON.stringify({ prompt: promptText }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const dataCover = await coverRes.json();

            if (dataCover.images?.length) {
                // show each image neatly
                dataCover.images.forEach((url, index) => {
                    const card = createImageCard(url, index);
                    imagesOutput.appendChild(card);
                });
            } else {
                setImagesMessage("No images generated. Try again later.");
            }
        } else {
            setAnalysisText("We had an issue with the analysis.");
            setImagesMessage("No images generated because no valid analysis result.");
        }
    } catch (err) {
        console.error("Error during processing:", err);
        setUploadStatus("Upload failed");
        setAnalysisText("An error occurred. Please try again.");
        setImagesMessage("No images generated due to an error.");
    }
});
