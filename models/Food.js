const mongoose = require("mongoose");

const foodSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 0
        },

        unit: {
            type: String,
            required: true,
            trim: true
        },

        expiryDate: {
            type: Date,
            required: true
        },

        storageLocation: {
            type: String,
            default: "Pantry Shelf",
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Food", foodSchema);