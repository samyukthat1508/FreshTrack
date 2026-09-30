const express = require("express");
const Food = require("../models/Food");

const router = express.Router();

// GET all food items
router.get("/", async (req, res) => {
    try {
        const foods = await Food.find().sort({ expiryDate: 1 });

        res.json(foods);
    } catch (error) {
        console.error("Error fetching food:", error);
        res.status(500).json({
            message: "Failed to fetch food items"
        });
    }
});

// GET one food item
router.get("/:id", async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);

        if (!food) {
            return res.status(404).json({
                message: "Food item not found"
            });
        }

        res.json(food);
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch food item"
        });
    }
});

// CREATE food item
router.post("/", async (req, res) => {
    try {
        const {
            name,
            category,
            quantity,
            unit,
            expiryDate,
            storageLocation
        } = req.body;

        if (!name || !category || quantity === undefined || !unit || !expiryDate) {
            return res.status(400).json({
                message: "Name, category, quantity, unit and expiry date are required"
            });
        }

        const food = new Food({
            name,
            category,
            quantity,
            unit,
            expiryDate,
            storageLocation
        });

        const savedFood = await food.save();

        res.status(201).json(savedFood);
    } catch (error) {
        console.error("Error creating food:", error);

        res.status(500).json({
            message: "Failed to add food item"
        });
    }
});

// UPDATE food item
router.put("/:id", async (req, res) => {
    try {
        const {
            name,
            category,
            quantity,
            unit,
            expiryDate,
            storageLocation
        } = req.body;

        const updatedFood = await Food.findByIdAndUpdate(
            req.params.id,
            {
                name,
                category,
                quantity,
                unit,
                expiryDate,
                storageLocation
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedFood) {
            return res.status(404).json({
                message: "Food item not found"
            });
        }

        res.json(updatedFood);
    } catch (error) {
        console.error("Error updating food:", error);

        res.status(500).json({
            message: "Failed to update food item"
        });
    }
});

// DELETE food item
router.delete("/:id", async (req, res) => {
    try {
        const deletedFood = await Food.findByIdAndDelete(req.params.id);

        if (!deletedFood) {
            return res.status(404).json({
                message: "Food item not found"
            });
        }

        res.json({
            message: "Food item deleted successfully",
            food: deletedFood
        });
    } catch (error) {
        console.error("Error deleting food:", error);

        res.status(500).json({
            message: "Failed to delete food item"
        });
    }
});

module.exports = router;