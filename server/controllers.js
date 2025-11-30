import { GoogleGenAI,createUserContent,
  createPartFromUri, } from '@google/genai';

const uploadAudio = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  console.log('Uploaded file:', req.file.path);
  // Process the uploaded audio file
  res.json({
     message: 'File uploaded successfully.',
     filePath: req.file.name });
};

const analyzeAudio = async (req, res) => {
  // Analyze the audio file
  const { filename } = req.params;
  console.log('Analyzing file:', filename);
  
  const myfile = await ai.files.upload({
    file: `/uploads/${filename}`,
    config: { mimeType: "audio/mp3" },
  });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: createUserContent([
      createPartFromUri(myfile.uri, myfile.mimeType),
      "Describe this audio clip",
    ]),
  });
  
  res.json({ analysis: response.text });
}
const generateCover = async (req, res) => {
  // Generate a cover for the audio file
  const { analysis } = req.body;
  console.log('Generating cover with analysis:', analysis);


  res.send('Cover generated successfully.');
}
export { uploadAudio ,analyzeAudio ,generateCover };