const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser=require('cookie-parser');
const bodyParser=require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Connect to MongoDB using Mongoose
mongoose.connect('mongodb://127.0.0.1/gallery', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// User model
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: {
    type: String,
    default: 'user',
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
  }],
});
const User = mongoose.model('User', userSchema);

// Login page route
app.get('/login', (req, res) => {
  res.render('login');
});

// Signup page route
app.get('/', (req, res) => {
  res.render('signup');
});
app.get('/timer', (req, res) => {
  res.render('timer');
});

app.post('/signup', async (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.render('signup', { error: 'Please provide both username and password' });
  }

  try {
    // Check if the username already exists in the database
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render('signup', { error: 'Username already exists' });
    }

    // Create a new user
    const newUser = new User({
      username,
      password
    });

    // Save the new user to the database
    await newUser.save();

    // Store the username in the session and redirect to the dashboard
    req.session.username = username;
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.render('signup', { error: 'An error occurred. Please try again later.' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.render('login', { error: 'Please provide both username and password' });
  }

  try {
    // Find the user in the database
    const user = await User.findOne({ username }).exec();

    // Check if the user exists and if the password matches
    if (!user || password !== user.password) {
      return res.render('login', { error: 'Invalid username or password' });
    }

    // Store the username in the session and redirect to the dashboard
    req.session.username = username;
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.render('login', { error: 'An error occurred. Please try again later.' });
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error('Error destroying session:', error);
    }
    res.redirect('/');
  });
});

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
  const filename = req.file.originalname;
  res.json({ 
    url: `http://localhost:3001/${req.file.originalname}`,
    name:filename

  });
  
});

app.get('/images', (req, res) => {
  const images = 
    fs.readdirSync('./public').map(image => ({
      name: image,
      url: `http://localhost:3001/${image}`
    }));
  res.json({ images });
});

app.delete('/images/:filename', (req, res) => {
  const { filename } = req.params;
  fs.unlinkSync(`./public/${filename}`);
  res.send({ message: 'Image deleted successfully' });
});

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/dashboard', (req, res) => {
  const username = req.session.username;
  console.log(username);
  const images = fs.readdirSync('./public').map(image => ({
    name: image,
    url: `http://localhost:3001/${image}`
  }));
  res.render('gallery', { username, images });
});


app.listen(3001, () => {
  console.log('Server started on port 3001');
});


