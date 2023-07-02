const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true })); // Add this line
app.use(session({
  secret: 'secret-key',
  resave: true,
  saveUninitialized: true,
}));
// Set up the view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', (req, res) => {
    const sessionCount = req.session.views || 0;
    req.session.views = sessionCount + 1;
    res.render('index', { user: req.session.user, sessionCount });
  });
  

app.get('/login', (req, res) => {
  res.render('login');
});
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Validate the username and password
  if (username === 'bob' && password === '12345678') {
    // Set the user in the session
    req.session.user = username;
    res.redirect('/');
  } else {
    res.render('login', { error: 'Invalid username or password' });
  }
});
app.get('/logout', (req, res) => {
  // Clear the session and redirect to the login page
  req.session.destroy();
  res.redirect('/login');
});
app.listen(3001, () => {
  console.log('Server started on port 3001');
});
