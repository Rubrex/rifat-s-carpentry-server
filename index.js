const express = require("express");
const cors = require("cors");
const colors = require("colors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

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

// ENDPOINTS
//
// GET Endpoints

app.get("/", (req, res) => {
  res.send("Rifat's Carpentry REST API is running");
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
    const id = req.params.id;
    const service = await serviceCollection.findOne({ service_id: id });
    res.send(service);
  } catch (err) {
    console.log(err);
  }
});

// Get Reviews by service_id

app.get("/reviews/:serviceId", async (req, res) => {
  try {
    const serviceId = req.params.serviceId;
    const reviews = await reviewsCollection
      .find({ service_id: serviceId })
      .toArray();
    res.send(reviews);
  } catch (err) {
    console.log(err);
  }
});

// Get My Reviews by query email + JWT

app.get("/reviews", async (req, res) => {
  try {
    const email = req.query.email;
    const myreviews = await reviewsCollection
      .find({ reviewer_email: email })
      .toArray();
    res.send(myreviews);
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

// Listen on port
app.listen(port, () =>
  console.log(colors.bgGreen.bold("Port is listening on port " + port))
);
