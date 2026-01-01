
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
import {
  GoogleGenAI, createUserContent,
  createPartFromUri,
} from '@google/genai';
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

  // Analyze the audio file
  try {
    console.log('APIKEY:', process.env.GENAI_API_KEY);
    const { filename } = req.params;
    console.log('Analyzing file:', filename);
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
    res.json({ analysis: response.text[0] });
  } catch (err) {
    console.log('Error during analysis:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const generateCover = async (req, res) => {
  // Generate a cover for the audio file
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const images = [];

    for (let i = 0; i < 3; i++) {
      const response = await axios.post(
        "https://router.huggingface.co/api/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
          inputs: prompt  // כאן המידע מהשרת
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.HF_TOKEN}`,
            "Content-Type": "application/json"
          },
          responseType: "json" // או arraybuffer אם אתה רוצה תמונה ישירות
        }
      );

      const fileName = `img_${Date.now()}_${i}.png`;
      const filePath = path.join("public", "generated", fileName);

      fs.writeFileSync(filePath, response.data);

      images.push({
        url: `/generated/${fileName}`
      });
    }

    res.json({ success: true, images });
  } catch (err) {
    console.log(err);
  }

  res.send('Cover generated successfully.');
};

export { uploadAudio, analyzeAudio, generateCover };