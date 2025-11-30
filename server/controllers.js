import { GoogleGenAI,createUserContent,
  createPartFromUri, } from '@google/genai';
  import * as fs from "node:fs";
  import path from 'path';
  import dotenv from 'dotenv';
  dotenv.config();
import { fileURLToPath } from 'url';

  const ai=new GoogleGenAI({
    apiKey: process.env.GENAI_API_KEY,
  });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const uploadAudio = async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.json({
     message: 'File uploaded successfully.',
     name: req.file.filename });
};

const analyzeAudio = async (req, res) => {
  // Analyze the audio file
  console.log('APIKEY:', process.env.GENAI_API_KEY);
  const { filename } = req.params;
  console.log('Analyzing file:', filename);
  const filePath = path.join(__dirname,`/uploads/${filename}`);
  if (!fs.existsSync(filePath)) {
    console.log('File does not exist:', filePath);
  }
  const prompt= `Analyze this audio file and provide:
        1. Main topic/content (2-3 sentences)
        2. Mood (energetic/calm/melancholic/happy)
        3. Genre (technology/business/entertainment/news/music)
        4. Target audience
        5. 3-5 keywords
        6. description for an image that would represent this audio well.`;

  const base64AudioFile=fs.readFileSync(filePath, { encoding: "base64" }); 
  const contents=[
    {text: prompt},
    {
      inlineData: {
        data: base64AudioFile,
        mimeType: "audio/mp3",
      }
    }
  ]
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: contents,
  });
  // const myfile = await ai.files.upload({
  //   file: filePath,
  //   config: { mimeType: "audio/mp3" },
  // });
  // console.log('file uploaded to GenAI:', myfile);
  // const response = await ai.models.generateContent({
  //   model: "gemini-2.5-flash",
  //   contents: createUserContent([
  //     createPartFromUri(myfile.uri, myfile.mimeType),
  //        ]),prompt
  // });
  console.log('Analysis response:', response.text);
  res.json({ analysis: response.text });
}
const generateCover = async (req, res) => {
  // Generate a cover for the audio file
  const { analysis } = req.body;
  console.log('Generating cover with analysis:', analysis);
  const response= await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents:`create 3 images based on the following analysis: ${analysis}`,
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      const buffer = Buffer.from(imageData, "base64");
      fs.writeFileSync("gemini-native-image.png", buffer);
      console.log("Image saved as gemini-native-image.png");
    }
  }
   
  res.send('Cover generated successfully.');
}
export { uploadAudio ,analyzeAudio ,generateCover };