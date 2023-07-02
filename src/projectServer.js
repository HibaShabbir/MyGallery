

// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser'); // add cookie-parser
const nodemailer = require('nodemailer');
var currSession;
// Create Express app
console.log('Starting app...');
const app = express();
console.log('app started!');
app.use(cookieParser()); // use cookie-parser
app.use(session({
  secret: 'mykey123',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,
    sameSite: 'lax',
    maxAge: 3600000
  }
}));

app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Accept', '*/*');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Credentials', 'true'); 
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Connect to MongoDB using Mongoose
mongoose.connect('mongodb://127.0.0.1/WebProject', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Define Mongoose schema for user data
const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  disease: { type: String },
  food: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  points:{ type: Number,  default: '0' },
  waterTracking: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WaterTracking' }],
  sleepTracking: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SleepTracking' }],
  workoutTracking: [{ type: mongoose.Schema.Types.ObjectId, ref: 'WorkoutTracking' }]

});

// Create Mongoose model for user data
const User = mongoose.model('User', userSchema);

const workoutTrackingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  goal: { type: String, required: true },
  daysCompleted: { type: Number, default: 0 },
});

const WorkoutTracking = mongoose.model('WorkoutTracking', workoutTrackingSchema);

const waterTrackingSchema = new mongoose.Schema({
  email: { type: String, required: true },
  consumed: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});
const WaterTracking = mongoose.model('WaterTracking', waterTrackingSchema);

// Save or update workout progress
app.post('/api/workout/progress', async (req, res) => {
  try {

    const email = currSession.email;
    const { goal, daysCompleted } = req.body;

    // Find the user
    const user = await User.findOne({email});
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userId= user._id;
    console.log("days completed" + daysCompleted);
    // Check if workout tracking record exists for the specific goal
    let workoutTracking = await WorkoutTracking.findOne({ user: userId, goal });

    if (workoutTracking) {
      // Update the existing record
      workoutTracking.daysCompleted = daysCompleted;
    } else {
      // Create a new record
      workoutTracking = new WorkoutTracking({ user : userId, goal, daysCompleted });
      user.workoutTracking.push(workoutTracking); // Save the workout record in the user's workoutTracking array
    }

    // Save the workout tracking record
    await workoutTracking.save();
    await user.save(); // Save the user

    res.status(200).json({ message: 'Workout progress saved successfully' });
  } catch (error) {
    console.error('Error saving workout progress', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/user/workoutTracking', async (req, res) => {
  try {
    console.log("get workout req");
    const email = currSession.email;
    // Find the user
    const user = await User.findOne({email}).populate('workoutTracking');;
    console.log("user mail"+user.email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const userId= user._id;
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Extract workoutTracking records from the user
    const workoutTrackingRecords = user.workoutTracking.map((workoutTracking) => ({
      daysCompleted: workoutTracking.daysCompleted,
      goal: workoutTracking.goal,
    }));
    console.log(workoutTrackingRecords);
    res.status(200).json(workoutTrackingRecords);
  } catch (error) {
    console.error('Error retrieving workoutTracking records', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//create sleep tracking schema
const sleepTrackingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hoursOfSleep: { type: Number, required: true },
  startTime: { type: String, required: true },
  quality: { type: Number, required: true },
}, { timestamps: true });

const SleepTracking = mongoose.model('SleepTracking', sleepTrackingSchema);


// Define Mongoose schema for feedback
const feedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  feedback: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});
// Create Mongoose model for feedback
const Feedback = mongoose.model('Feedback', feedbackSchema);


const dietPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  monday: {
    breakfast: String,
    snack1: String,
    lunch: String,
    snack2: String,
    dinner: String
  },
  tuesday: {
    breakfast: String,
    snack1: String,
    lunch: String,
    snack2: String,
    dinner: String
  },
  wednesday: {
    breakfast: String,
    snack1: String,
    lunch: String,
    snack2: String,
    dinner: String
  },
  thursday: {
    breakfast: String,
    snack1: String,
    lunch: String,
    snack2: String,
    dinner: String
  },
  friday: {
    breakfast: String,
    snack1: String,
    lunch: String,
    snack2: String,
    dinner: String
  },
  saturday: {
    breakfast: String,
    snack1: String,
    lunch: String,
    snack2: String,
    dinner: String
  },
  sunday: {
    breakfast: String,
    snack1: String,
    lunch: String,
    snack2: String,
    dinner: String
  }
});

const DietPlan = mongoose.model('DietPlan', dietPlanSchema);

const reviewSchema = new mongoose.Schema({
  email: { type: String, required: true },
  rating: { type: Number, required: true },
  review: { type: String, required: true },
  dietPlanName: { type: String, required: true },
  dietPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'DietPlan' }
});

const Review = mongoose.model('Review', reviewSchema);

// Create symptom schema and model
const symptomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  diagnosis: {
    type: String,
    required: true,
  },
});
// Fetch symptoms
app.get('/api/symptoms', async (req, res) => {
  try {
    const symptoms = await Symptom.find();
    res.json(symptoms);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch symptoms' });
  }
});

// Add symptom
app.post('/api/symptoms', async (req, res) => {
  try {
    const { name, diagnosis } = req.body;
    const newSymptom = new Symptom({ name, diagnosis });
    await newSymptom.save();
    res.status(201).json(newSymptom);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add symptom' });
  }
});

// Delete symptom
app.delete('/api/symptoms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Symptom.findByIdAndDelete(id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete symptom' });
  }
});

const Symptom = mongoose.model('Symptom', symptomSchema);

app.post('/api/submit-review', async (req, res) => {
  try {
    const {  rating, review, dietPlanName, dietPlan } = req.body;
    const email=currSession.email;
    // Create a new Review object with the submitted data
    const newReview = new Review({
      email,
      rating,
      review,
      dietPlanName,
      dietPlan,
      
    });

    // Save the new review to the database
    const savedReview = await newReview.save();

    // Return the saved review as a response
    res.status(201).json(savedReview);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// Define server endpoint for creating a new user
app.post('/api/signup', async (req, res) => {
  // Extract user data from request body
  const { email, password, age, gender, height, weight, disease, food , role } = req.body;
  
  // Check if user with same email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: 'User already exists' });
  }

  // Create new User instance with extracted data
  const newUser = new User({ email, password, age, gender, height, weight, disease, food , role});
  
  // Save new user data to MongoDB
  try {
    const result = await newUser.save();
    // handle result
    currSession=newUser;
    console.log('New user created:');
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    // handle errora
    console.error('Error saving user data to MongoDB:', err);
    res.status(500).send('Error saving user data to MongoDB');
  }
});

//login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).send({ success: false, message: 'Invalid username or password' });
    }

    if (user.password !== password) {
      return res.status(401).send({ success: false, message: 'Invalid username or password' });
    }

    // Set user session data
    req.session.user = user;

    // Set a cookie to store the user's session ID
    res.cookie('sessionID', req.sessionID);
    currSession=user;
    console.log("res.cookie.sessionID' = "+ req.sessionID);

    const isAdmin = user.role === 'admin';
    return res.send({ success: true, isAdmin, user });
    
  } catch (err) {
    console.error(err);
    return res.status(500).send({ success: false, message: 'Internal server error' });
  }
});


// Define endpoint for checking user session
app.get('/api/login-info', async (req, res) => {
  const sessionID = req.cookies.sessionID;
  //console.log("sessionId = "+sessionID);
  //console.log("req.session = " + currSession);
  //(req.sessionID === sessionID && req.session.user) {
    
    const email = currSession.email;
    const user = await User.findOne({ email });
    const isAdmin = user.role === 'admin'; // 'role' property in your user object that indicates whether the user is an admin
    return res.send({ success: true, isAdmin, user });
  
});

// Define endpoint for logging out user
app.post('/api/logout', (req, res) => {
  // Clear the session data and remove the session cookie
  const user = req.session.user;
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying user session:', err);
      return res.status(500).send('Error destroying user session');
    }
    
    res.clearCookie('sessionID');
    return res.status(200).send({ user , message: 'Logged out successfully'});
  });
});

// Middleware function to check if the user is an admin
/*const isAdmin = (req, res, next) => {
  const user = req.session.user;
  console.log(user);
  if (user && user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
}*/

// to fetch all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find(); // fetch all users from database
    res.status(200).json(users); // send the response with status code 200 and JSON data
  } catch (error) {
    console.log("message users cannot be sent !");
    res.status(500).json({ message: 'Internal server error' }); // send error response with status code 500 and error message
  }
});

// Define endpoint for deleting a user by ID
app.delete('/api/users/:email', async (req, res) => {
  try {
    // Decode email parameter
    const userEmail = decodeURIComponent(req.params.email);
    console.log(userEmail);
    await User.findOneAndDelete({ email: userEmail });
    res.status(200).json({ message: `User with email ${userEmail} has been deleted` });
  } catch (error) {
    console.error(`Error deleting user with email ${userEmail}:`, error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const getUserByEmail = async (email) => {
  try {
    const user = await User.findOne({ email });
    return user;
  } catch (error) {
    throw new Error(`Error while finding user by email: ${error.message}`);
  }
};

app.get('/api/user/profile', async (req, res) => {
  try {
    const user = currSession;
    const email = user.email;
    const userUppdate = await User.findOne({ email });
    if (!userUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

 app.put('/api/user/profile', async (req, res) => {
  try {
    const email=currSession.email;
    console.log(email);
    const { weight, height, age, gender, disease, points } = req.body;
    const user = await User.findOneAndUpdate({ email }, { weight, height, age, gender, disease, points }, { new: true });
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});

app.post('/updateUserPoints', async (req, res) => {
  const email = currSession.email; // Get the user's email from the request object
  const points = req.body.points; // Get the new number of points from the request body

  try {
    // Find the user by email and update the points field
    const user = await User.findOneAndUpdate(
      { email: email },
      { $set: { points: points } },
      { new: true, overwrite: false }
    );

    res.status(200).json({ message: 'Points updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update points' });
  }
});

app.post('/api/submit-feedback', async (req, res) => {
  try {
      const feedback = new Feedback({
      user: currSession._id,
      feedback: req.body.feedback
    });
    console.log(feedback);
    await feedback.save();
    res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// define a route for handling POST requests to add a new diet plan
app.post('/api/add-diet-plan', (req, res) => {
  const dietPlan = new DietPlan({
    name: req.body.Name,
    monday: req.body.Monday,
    tuesday: req.body.Tuesday,
    wednesday: req.body.Wednesday,
    thursday: req.body.Thursday,
    friday: req.body.Friday,
    saturday: req.body.Saturday,
    sunday: req.body.Sunday
  });

  dietPlan.save()
    .then(savedPlan => {
      console.log('New diet plan saved:');
      res.status(201).json({ message: 'Diet plan saved successfully' });
    })
    .catch(error => {
      console.error('Error saving diet plan:', error);
      res.status(500).json({ message: 'Error saving diet plan' });
    });
});

app.get('/api/get-diet-plans', async (req, res) => {
  try {
    const dietPlans = await DietPlan.find({}); // retrieve only the Name field
    console.log(dietPlans);
    res.status(200).send(dietPlans);
  } catch (err) {
    console.error('Error retrieving diet plans:', err);
    res.status(500).send({ message: 'Error retrieving diet plans' });
  }
});

// define the route to delete a diet plan by name
app.delete('/api/delete-diet-plan/:name', async (req, res) => {
  const name = req.params.name;
  console.log(name);
  try {
    // find the diet plan with the given name
  

    // remove the diet plan from the database
    const result = await DietPlan.findOneAndDelete({ name });
    console.log(result);
    // return a success message
    return res.status(200).json({ message: 'Diet plan deleted successfully' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'An error occurred while deleting the diet plan' });
  }
});
app.post('/api/add-water-record', async (req, res) => {
  try {
    // Find the user by email
    const email = currSession.email;
    const user = await User.findOne({ email });

    // Create a new water tracking entry
    const waterTracking = new WaterTracking({
      email: email,
      consumed: req.body.consumed, // Set the consumed amount from the request body
    });

    // Save the water tracking entry to the database
    await waterTracking.save();

    // Add the new water tracking entry to the user's waterTracking array
    user.waterTracking.push(waterTracking);
    await user.save();

    // Send a response with the new water tracking entry
    res.status(200).json(waterTracking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


app.get('/api/get-water-tracking', async (req, res) => {
  try {
    // Find the user by email
    const email = currSession.email;
    const user = await User.findOne({ email }).populate('waterTracking');

    // Return the water tracking entries for the user
    res.status(200).json(user.waterTracking);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/update-water-record', async (req, res) => {
  // Find the user by email
  const email = currSession.email;
  const user = await User.findOne({ email }).populate('waterTracking');

  // Find the water tracking record for today's date
  const today = new Date().setHours(0, 0, 0, 0);
  let waterRecord = user.waterTracking.find(
    (record) => new Date(record.date).setHours(0, 0, 0, 0) === today
  );

  if (!waterRecord) {
    // Create a new water tracking entry
    waterRecord = new WaterTracking({
      user: user._id,
      consumed: req.body.consumed, // Set the consumed amount
    });

    // Save the water tracking entry to the database
    await waterRecord.save();

    // Add the new water tracking entry to the user's waterTracking array
    user.waterTracking.push(waterRecord._id);
    await user.save();

    return res.send(waterRecord);
  }

  // Update the consumed amount of the water tracking record
  waterRecord.consumed = waterRecord.consumed + req.body.consumed;

  // Save the updated water tracking record to the database
  await waterRecord.save();

  res.send(waterRecord);
});

app.post('/api/add-sleep-record', async (req, res) => {
  const email = currSession.email;

  try {
    const user = await User.findOne({ email }).populate('sleepTracking');
    const { hoursOfSleep, startTime, quality } = req.body;
    const sleep = new SleepTracking({ user, hoursOfSleep, startTime, quality });
    console.log(sleep);
    const sleepData = await sleep.save();
    //console.log('Sleep tracking data saved to database:', sleepData);

    // Push the sleepData _id to the sleepTracking array of the corresponding user
    user.sleepTracking.push(sleepData._id);
    await user.save();

    return res.status(200).send(sleepData);
  } catch (error) {
    console.log('Error saving sleep tracking data to database:', error);
    return res.status(500).send('Error saving sleep tracking data to database');
  }
});

app.get('/api/sleepTracking', async (req, res) => {
  try {
    // Extract the user ID from the request parameters
    const email = currSession.email;
    const user = await User.findOne({ email })
    const userId = user._id;
    console.log("user id"+userId);
    // Fetch all sleep tracking records for the user
    const sleepRecords = await SleepTracking.find({ user: userId });
    console.log(sleepRecords);
    // send the sleep tracking data as the response
    res.json(sleepRecords);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

app.get('/api/waterTracking', async (req, res) => {
  try {
    const email = currSession.email;
    // find all water records for the user
    const waterRecords = await WaterTracking.find({ email });

    console.log(waterRecords);
    // return the water records to the client
    res.json(waterRecords);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// POST endpoint to handle sending reminder email
app.post('/api/send-reminder-email', (req, res) => {
  // Set up your email transport (SMTP)
  const transporter = nodemailer.createTransport({
    port: 465,
    host: 'smtp.gmail.com',
    auth: {
      user: 'rabiashakil786@gmail.com',
      pass: 'vzehenfkizkhpnrj',
    },
    secure: true,
  });

  const email = currSession.email;

  const mailOptions = {
    from: 'rabiashakil786@gmail.com',
    to: email,
    subject: 'Drink Water Reminder',
    text: 'Hey! Don\'t forget to drink water regularly to stay hydrated.',
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending reminder email:', error);
      res.status(500).send('Failed to send reminder email.');
    } else {
      console.log('Reminder email sent:', info.response);
      res.status(200).send('Reminder email sent successfully!');
    }
  });
});
// Start server listening on port 5000
app.listen(5000, () => console.log('Server started listening on port 5000'));

 
