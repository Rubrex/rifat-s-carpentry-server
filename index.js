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

// Listen on port
app.listen(port, () =>
  console.log(colors.bgGreen.bold("Port is listening on port " + port))
);
