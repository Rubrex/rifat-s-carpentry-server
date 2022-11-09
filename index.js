const express = require("express");
const cors = require("cors");
const colors = require("colors");
const { MongoClient, ObjectId } = require("mongodb");
var jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.SECRET_ACCESS_TOKEN, function (err, decoded) {
    // err
    // decoded undefined
    if (err) {
      // if wrong token or expired
      return res.status(401).send("unauthorized access");
    }
    // saving devoded value in req object to access it in app.get methods
    req.decoded = decoded;
    next();
  });
};

// MongoDB Stuff
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.f3qt6qk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    console.log("Database connected".yellow.italic);
  } catch (error) {
    console.log(error.name.bgRed, error.message.bold);
  }
}
// Call the server
connectDB();

// Select Database & collections
const serviceCollection = client.db("rifatCarpentry").collection("services");
const reviewsCollection = client.db("rifatCarpentry").collection("reviews");
const blogsCollection = client.db("rifatCarpentry").collection("blogs");

// Create JET Token and send it while logged in
app.post("/jwt", (req, res) => {
  const user = req.body;
  console.log(user);
  const token = jwt.sign(user, process.env.SECRET_ACCESS_TOKEN, {
    expiresIn: "1h",
  });
  res.send({ token: token });
});

// ENDPOINTS
//
// GET Endpoints

app.get("/", (req, res) => {
  res.send("Rifat's Carpentry REST API is running");
});

// Check length of total services
app.get("/checkServices", async (req, res) => {
  try {
    const totalServices = await serviceCollection.find({}).toArray();
    const length = totalServices.length;
    console.log(length);
    res.send({ services: length });
  } catch (err) {
    console.log(err);
  }
});

// Get Services
app.get("/services", async (req, res) => {
  try {
    const service = parseInt(req.query.service);
    const services = await serviceCollection.find({}).limit(service).toArray();
    res.send(services);
  } catch (err) {
    console.log(err);
  }
});

// Get service by id
app.get("/services/:id", async (req, res) => {
  try {
    const id = +req.params.id;
    const service = await serviceCollection.findOne({ service_id: id });
    console.log(typeof id, service);
    res.send(service);
  } catch (err) {
    console.log(err);
  }
});

// Get Reviews by service_id

app.get("/reviews/:serviceId", async (req, res) => {
  try {
    const serviceId = +req.params.serviceId;
    const reviews = await reviewsCollection
      .find({ service_id: serviceId })
      .toArray();
    res.send(reviews);
  } catch (err) {
    console.log(err);
  }
});

// Get My Reviews by query email + JWT

app.get("/reviews", verifyToken, async (req, res) => {
  try {
    // Verify token email + req email
    const decoded = req.decoded;

    const email = req.query.email;

    if (decoded.email !== email) {
      return res.status(403).send("Access forbidden");
    }

    const myreviews = await reviewsCollection
      .find({ reviewer_email: email })
      .toArray();
    res.send(myreviews);
  } catch (err) {
    console.log(err);
  }
});

// Get Blogs
app.get("/blogs", async (req, res) => {
  try {
    const blogs = await blogsCollection.find({}).toArray();
    res.send(blogs);
  } catch (err) {
    console.log(err);
  }
});

// POST Endpoints

// Add review
app.post("/reviews", async (req, res) => {
  try {
    const review = req.body;
    console.log(review);
    const result = await reviewsCollection.insertOne(review);
    res.send(result);
  } catch (err) {
    console.log(err);
  }
});

// Add Service

app.post("/services", async (req, res) => {
  try {
    const service = req.body;
    console.log(service);
    const result = await serviceCollection.insertOne(service);
    res.send(result);
  } catch (err) {
    console.log(err);
  }
});

// DELETE
// Delete a review by _id
app.delete("/reviews/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    const deleteReview = await reviewsCollection.deleteOne(query);
    console.log(id, deleteReview);

    if (deleteReview.deletedCount === 1) {
      console.log("Successfully deleted one document.");
      res.send(deleteReview);
    }
  } catch (err) {
    console.log(err);
  }
});

// PATCH : Update review by params & body
/*
  fetch(`http://localhost:5000/reviews/${id}`,{
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(object)
  })
*/
app.patch("/reviews/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { ratings, review_desc } = req.body;

    const query = { _id: ObjectId(id) };
    const updateDoc = {
      $set: {
        reviewer_ratings: ratings,
        reviewer_review: review_desc,
      },
    };

    const updated = await reviewsCollection.updateOne(query, updateDoc);
    console.log(updateDoc, id, updated);
    res.send(updated);
  } catch (err) {
    console.log(err);
  }
});

// Listen on port
app.listen(port, () =>
  console.log(colors.bgGreen.bold("Port is listening on port " + port))
);
