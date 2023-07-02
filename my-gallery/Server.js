const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });

app.post('/upload', upload.single('image'), (req, res) => {
  res.json({ 
    url: `http://localhost:3001/${req.file.originalname}` 
  });
});

app.get('/images', (req, res) => {
  const images = 
  fs.readdirSync('./public').map(image => `http://localhost:3001/${image}`);
  res.json({ images });
});

app.delete('/images/:filename', (req, res) => {
  const { filename } = req.params;
  fs.unlinkSync(`./public/${filename}`);
  res.send({ message: 'Image deleted successfully' });
});

app.listen(3001, () => {
  console.log('Server started on port 3001');
});
