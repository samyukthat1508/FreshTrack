const mongoose = require("mongoose");
require("dotenv").config();

const Food = require("./models/Food");

function dateWithOffset(days) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + days);
    return date;
}

const foodItems = [
    ["Bread", "Bakery", 1, "loaf", 0, "Pantry Shelf"],
    ["Milk", "Dairy", 2, "litres", 1, "Refrigerator"],
    ["Eggs", "Dairy", 12, "pieces", 7, "Refrigerator"],
    ["Tomatoes", "Vegetables", 6, "pieces", 3, "Refrigerator"],
    ["Apples", "Fruits", 5, "pieces", 6, "Refrigerator"],
    ["Rice", "Grains", 2, "kg", 180, "Pantry Shelf"],
    ["Cheese", "Dairy", 1, "pack", 4, "Refrigerator"],
    ["Bananas", "Fruits", 8, "pieces", 2, "Counter"],
    ["Potatoes", "Vegetables", 3, "kg", 20, "Pantry Shelf"],
    ["Onions", "Vegetables", 2, "kg", 25, "Pantry Shelf"],
    ["Yogurt", "Dairy", 4, "cups", 5, "Refrigerator"],
    ["Chicken", "Meat", 1, "kg", 2, "Freezer"],
    ["Carrots", "Vegetables", 1, "kg", 10, "Refrigerator"],
    ["Orange Juice", "Beverages", 1, "litre", 8, "Refrigerator"],
    ["Butter", "Dairy", 1, "pack", 30, "Refrigerator"],
    ["Pasta", "Grains", 3, "packets", 120, "Pantry Shelf"],
    ["Cooking Oil", "Staples", 2, "litres", 200, "Pantry Shelf"],
    ["Spinach", "Vegetables", 2, "bunches", 1, "Refrigerator"],
    ["Strawberries", "Fruits", 1, "box", 3, "Refrigerator"],
    ["Biscuits", "Snacks", 3, "packets", 90, "Pantry Shelf"],
    ["Coffee", "Beverages", 1, "jar", 210, "Pantry Shelf"],
    ["Green Peas", "Frozen Foods", 2, "packs", 75, "Freezer"],
    ["Tomato Sauce", "Sauces", 1, "bottle", 160, "Pantry Shelf"],
    ["Corn Flakes", "Breakfast", 1, "box", 60, "Pantry Shelf"],
    ["Garlic", "Vegetables", 3, "pieces", 35, "Pantry Shelf"],
    ["Paneer", "Dairy", 1, "pack", -2, "Refrigerator"],
    ["Fish", "Meat", 500, "g", -5, "Freezer"],
    ["Mangoes", "Fruits", 3, "pieces", -9, "Refrigerator"]
];

async function seedDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("Connected to MongoDB");

        await Food.deleteMany({});

        const documents = foodItems.map(
            ([name, category, quantity, unit, expiryOffset, storageLocation]) => ({
                name,
                category,
                quantity,
                unit,
                expiryDate: dateWithOffset(expiryOffset),
                storageLocation
            })
        );

        await Food.insertMany(documents);

        console.log(`${documents.length} food items added successfully.`);

        await mongoose.connection.close();
        console.log("Database connection closed.");
    } catch (error) {
        console.error("Seeding failed:", error.message);
        process.exit(1);
    }
}

seedDatabase();