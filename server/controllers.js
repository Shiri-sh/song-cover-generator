
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import {
  GoogleGenAI
} from '@google/genai';

import { GoogleGenerativeAI } from '@google/generative-ai';

import * as fs from "node:fs";
import path from 'path';
import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();
import { fileURLToPath } from 'url';

const ai = new GoogleGenAI({
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
    name: req.file.filename
  });
};

const analyzeAudio = async (req, res) => {
  console.log("API KEY:", process.env.GENAI_API_KEY);
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, `/uploads/${filename}`);

    if (!fs.existsSync(filePath)) {
      console.log('File does not exist:', filePath);
    }
    const prompt = `Analyze this audio file and provide:
        1. Main topic/content (2-3 sentences)
        2. Mood (energetic/calm/melancholic/happy)
        3. Genre (technology/business/entertainment/news/music)
        4. Target audience
        5. 3-5 keywords
        6. description for an image that would represent this audio well.`;

    const base64AudioFile = fs.readFileSync(filePath, { encoding: "base64" });
    const contents = [
      { text: prompt },
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

    console.log('Analysis response:', response.text);
    res.json({ analysis: response.text });
  } catch (err) {
    console.log('Error during analysis:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};
const generateCover = async (req, res) => {
  const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const { prompt } = req.body;
  if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
  }
   const result = await model.generateContent(
      `Return ONLY a single, clean image description.
      No options, no titles, no markdown, no explanations.
      Just one paragraph suitable as an AI image prompt.

      Text:
      ${prompt}`
   );
   const response =  result.response;
   const aiImagePrompt= response.text().trim();
  
  const generatedImageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(aiImagePrompt)}?nologo=true&private=true&enhance=true`;

  console.log("Generated Image URL:", generatedImageUrl+"'");
  res.json({ success: true, images: [generatedImageUrl] });
}


export { uploadAudio, analyzeAudio, generateCover };