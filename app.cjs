const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const ejs = require('ejs');

const app = express();
const port = process.env.PORT || 3000; // Use environment variable for port

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB (Replace 'your-mongodb-connection-string' with your MongoDB URL)
mongoose.connect('your-mongodb-connection-string', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const personSchema = new mongoose.Schema({
  name: String,
  birthdate: Date,
  description: String,
  phone: String,
  organization: String,
});

const Person = mongoose.model('Person', personSchema);

// Configure body-parser
app.use(bodyParser.urlencoded({ extended: true }));

// Serve HTML file with a form to input data and display people from the database
app.get('/', (req, res) => {
  // Query the database to find all people
  Person.find({}, (err, people) => {
    if (err) {
      console.error('Database Query Error:', err);
      res.render('index', { people: [] });
    } else {
      res.render('index', { people: people });
    }
  });
});

// Handle form submission to store data in MongoDB
app.post('/add-person', (req, res) => {
  const name = req.body.name;
  const birthdate = new Date(req.body.birthdate);
  const description = req.body.description;

  const newPerson = new Person({
    name: name,
    birthdate: birthdate,
    description: description,
  });

  newPerson.save((err) => {
    if (err) {
      console.error(err);
    } else {
      res.redirect('/');
    }
  });
});

// Handle search form submission
app.post('/search', (req, res) => {
  const searchTerm = req.body.searchTerm;

  // Perform a database query to find people matching the search term
  Person.find({ name: { $regex: searchTerm, $options: 'i' } }, (err, foundPeople) => {
    if (err) {
      console.error('Database Query Error:', err);
    } else {
      res.render('index', { people: foundPeople });
    }
  });
});

// ... Rest of your routes for editing and deleting

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
