
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { uploadAudio ,analyzeAudio,generateCover} from './controllers.js';
dotenv.config();

const PORT = process.env.PORT || 3000;
//const PORT=3000;
const app = express();
const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use('/api', router);
app.use(express.static(path.join(__dirname, '../public')));


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'server/uploads/');
  },
  filename: (req, file, cb) => {
    const name = Date.now() + '-' + file.originalname;
    cb(null, name);
  }
});
const upload = multer({ storage: storage });

router.post('/upload', upload.single('audio'), uploadAudio);
router.get('/analyze/:filename', analyzeAudio);
router.post('/generate-cover', generateCover);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


