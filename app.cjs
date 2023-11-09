const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs'); // Add this line

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// ... rest of your code ...

// Serve HTML file with a form to input data and display people from the database
app.get('/', (req, res) => {
  // Query the database to find all people
  Person.find({}, (err, people) => {
    if (err) {
      console.error('Database Query Error:', err);
      res.render('index', { people: [] }); // Pass an empty array in case of an error
    } else {
      res.render('index', { people: people }); // Pass the found people to the view
    }
  });
});



// Connect to MongoDB
mongoose.connect('mongodb://localhost/peopleDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const personSchema = new mongoose.Schema({
  name: String,
  birthdate: Date, // Change age to birthdate
  description: String,
  phone: String,
  organization: String,
});





const Person = mongoose.model('Person', personSchema);

// Configure body-parser
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));

// Serve HTML file with a form to input data
app.get('/', (req, res) => {
  res.render('index', { people: [] }); // Pass an empty array initially
});

// Handle form submission to store data in MongoDB
app.post('/add-person', (req, res) => {
  const name = req.body.name;
  const birthdate = new Date(req.body.birthdate); // Parse the date input
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

// Add a route to render the person-info page
app.get('/person/:id', (req, res) => {
  const personId = req.params.id;

  // Find the person by their ID in the database
  Person.findById(personId, (err, foundPerson) => {
    if (err) {
      console.error('Database Query Error:', err);
    } else if (!foundPerson) {
      // Handle the case where the person is not found
      // Render a 404 page or provide an error message
    } else {
      // Render the person-info template with the found person
      res.render('person-info', { person: foundPerson });
    }
  });
});

app.post('/person/edit/:id', (req, res) => {
  const personId = req.params.id;
  const updatedDescription = req.body.description;
  const updatedPhone = req.body.phone;
  const updatedOrganization = req.body.organization;
  const updatedBirthdate = new Date(req.body.birthdate); // Parse the date input

  Person.findByIdAndUpdate(
    personId,
    {
      description: updatedDescription,
      phone: updatedPhone,
      organization: updatedOrganization,
      birthdate: updatedBirthdate, // Update the birthdate
    },
    (err, updatedPerson) => {
      if (err) {
        console.error('Database Update Error:', err);
      } else {
        res.redirect(`/person/${personId}`);
      }
    }
  );
});




// Add this route to handle person deletion
app.get('/person/:id/delete', (req, res) => {
  const personId = req.params.id;

  // Find the person by their ID and remove them from the database
  Person.findByIdAndRemove(personId, (err, removedPerson) => {
    if (err) {
      console.error('Database Delete Error:', err);
    } else {
      res.redirect('/');
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
