
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { uploadAudio ,analyzeAudio,generateCover} from './controllers.js';
dotenv.config();

//const PORT = process.env.PORT || 3000;
const PORT=3000;
const app = express();
const router = express.Router();

app.use(cors());
app.use(express.json());
app.use('/api', router);

router.post('/upload', multer().single('file'),uploadAudio);
router.get('/analyze', analyzeAudio);
router.get('/generate-cover', generateCover);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


