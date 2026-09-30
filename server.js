const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const foodRoutes = require("./routes/foodRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/foods", foodRoutes);

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "FreshTrack API is running"
    });
});

app.get("/", (req, res) => {
    res.send("FreshTrack backend is running!");
});

const PORT = process.env.PORT || 5000;

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully");

        app.listen(PORT, () => {
            console.log(`FreshTrack server running at http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });