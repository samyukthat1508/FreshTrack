// FreshTrack shared pantry data and UI behavior.
const ITEMS_KEY = "freshTrackItems";
const VERSION_KEY = "freshTrackDataVersion";
const DATA_VERSION = "2026-09-relative-v1";

function dateWithOffset(offset) {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    return date.toISOString().slice(0, 10);
}

const sampleFoodItems = [
    ["Bread", "Bakery", 1, "loaf", 0],
    ["Milk", "Dairy", 2, "litres", 1],
    ["Eggs", "Dairy", 12, "pieces", 7],
    ["Tomatoes", "Vegetables", 6, "pieces", 3],
    ["Apples", "Fruits", 5, "pieces", 6],
    ["Rice", "Grains", 2, "kg", 180],
    ["Cheese", "Dairy", 1, "pack", 4],
    ["Bananas", "Fruits", 8, "pieces", 2],
    ["Potatoes", "Vegetables", 3, "kg", 20],
    ["Onions", "Vegetables", 2, "kg", 25],
    ["Yogurt", "Dairy", 4, "cups", 5],
    ["Chicken", "Meat", 1, "kg", 2],
    ["Carrots", "Vegetables", 1, "kg", 10],
    ["Orange Juice", "Beverages", 1, "litre", 8],
    ["Butter", "Dairy", 1, "pack", 30],
    ["Pasta", "Grains", 3, "packets", 120],
    ["Cooking Oil", "Staples", 2, "litres", 200],
    ["Spinach", "Vegetables", 2, "bunches", 1],
    ["Strawberries", "Fruits", 1, "box", 3],
    ["Biscuits", "Snacks", 3, "packets", 90],
    ["Coffee", "Beverages", 1, "jar", 210],
    ["Green Peas", "Frozen Foods", 2, "packs", 75],
    ["Tomato Sauce", "Sauces", 1, "bottle", 160],
    ["Corn Flakes", "Breakfast", 1, "box", 60],
    ["Garlic", "Vegetables", 3, "pieces", 35],
    ["Paneer", "Dairy", 1, "pack", -2],
    ["Fish", "Meat", 500, "g", -5],
    ["Mangoes", "Fruits", 3, "pieces", -9]
].map(([name, category, quantity, unit, offset], index) => ({
    id: `sample-${index + 1}`,
    name,
    category,
    quantity,
    unit,
    expiry: dateWithOffset(offset)
}));

function isValidItem(item) {
    return item &&
        item.id !== undefined &&
        item.name &&
        item.category &&
        item.quantity !== undefined &&
        item.unit &&
        /^\d{4}-\d{2}-\d{2}$/.test(item.expiry);
}

function loadItems() {
    let stored;

    try {
        stored = JSON.parse(localStorage.getItem(ITEMS_KEY));
    } catch (error) {
        stored = null;
    }

    const hasValidData =
        Array.isArray(stored) &&
        stored.length > 0 &&
        stored.every(isValidItem);

    if (
        !hasValidData ||
        localStorage.getItem(VERSION_KEY) !== DATA_VERSION
    ) {
        const items = sampleFoodItems.map(item => ({ ...item }));

        localStorage.setItem(
            ITEMS_KEY,
            JSON.stringify(items)
        );

        localStorage.setItem(
            VERSION_KEY,
            DATA_VERSION
        );

        return items;
    }

    return stored;
}

let foodItems = loadItems();

let activities = [];

try {
    activities =
        JSON.parse(
            localStorage.getItem("freshTrackActivities")
        ) || [];
} catch (error) {
    activities = [];
}

let categoryChart = null;
let analyticsCategoryChart = null;
let wasteChart = null;

function saveItems() {
    localStorage.setItem(
        ITEMS_KEY,
        JSON.stringify(foodItems)
    );
}

function saveActivities() {
    localStorage.setItem(
        "freshTrackActivities",
        JSON.stringify(activities)
    );
}

function getDaysUntilExpiry(expiry) {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return Math.round(
        (
            new Date(`${expiry}T00:00:00`) - today
        ) / 86400000
    );
}

function formatDate(date) {
    return new Date(`${date}T00:00:00`)
        .toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );
}

function getExpiryText(expiry) {
    const days =
        getDaysUntilExpiry(expiry);

    if (days < 0)
        return "Expired";

    if (days === 0)
        return "Use today";

    if (days === 1)
        return "Use tomorrow";

    return days <= 3
        ? `Use in ${days} days`
        : `Fresh for ${days} days`;
}

function getExpiryClass(expiry) {
    const days =
        getDaysUntilExpiry(expiry);

    return days < 0
        ? "expired"
        : days === 0
        ? "today"
        : days <= 3
        ? "soon"
        : "fresh";
}

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function itemCard(item) {

    return `
        <article class="pantry-item">

            <div class="pantry-item-top">

                <div class="pantry-item-emoji">
                    ${
                        item.category === "Fruits"
                            ? "🍎"
                            : item.category === "Dairy"
                            ? "🥛"
                            : "🥫"
                    }
                </div>

                <button
                    class="delete-btn"
                    type="button"
                    data-delete-id="${escapeHTML(item.id)}"
                    title="Delete item"
                >
                    ×
                </button>

            </div>

            <h3>
                ${escapeHTML(item.name)}
            </h3>

            <p class="category">
                ${escapeHTML(item.category)}
            </p>

            <div class="item-details">

                <div>
                    <span class="detail-label">
                        Quantity
                    </span>

                    <span class="detail-value">
                        ${escapeHTML(item.quantity)}
                        ${escapeHTML(item.unit)}
                    </span>
                </div>

                <div>
                    <span class="detail-label">
                        Expiry
                    </span>

                    <span class="detail-value">
                        ${formatDate(item.expiry)}
                    </span>
                </div>

            </div>

            <div class="expiry-status ${getExpiryClass(item.expiry)}">
                ${getExpiryText(item.expiry)}
            </div>

        </article>
    `;
}

function displayFoodItems(items = foodItems) {

    const container =
        document.getElementById("pantryGrid");

    if (!container) return;

    container.innerHTML =
        items.length
            ? items.map(itemCard).join("")
            : `
                <div class="empty-state large-empty">
                    <span>🧺</span>
                    <h3>Your pantry is empty</h3>
                    <p>
                        Add a food item to start tracking freshness.
                    </p>
                </div>
            `;
}

function useFirstItems() {

    return foodItems
        .filter(
            item =>
                getDaysUntilExpiry(item.expiry) <= 3
        )
        .sort(
            (a, b) =>
                a.expiry.localeCompare(b.expiry)
        );
}

function displayUseFirstItems() {

    const urgent =
        useFirstItems();

    [
        document.getElementById("useFirstGrid"),
        document.getElementById("useFirstPreview")
    ].forEach(
        (container, index) => {

            if (!container) return;

            const items =
                index
                    ? urgent.slice(0, 4)
                    : urgent;

            container.innerHTML =
                items.length
                    ? items
                        .map(
                            item =>
                                index
                                    ? `
                                        <div class="food-list-item">

                                            <div class="food-item-left">

                                                <div class="food-emoji">
                                                    🥫
                                                </div>

                                                <div class="food-item-info">

                                                    <strong>
                                                        ${escapeHTML(item.name)}
                                                    </strong>

                                                    <span>
                                                        ${escapeHTML(item.quantity)}
                                                        ${escapeHTML(item.unit)}
                                                    </span>

                                                </div>

                                            </div>

                                            <span class="status-badge ${getExpiryClass(item.expiry)}">
                                                ${getExpiryText(item.expiry)}
                                            </span>

                                        </div>
                                    `
                                    : itemCard(item)
                        )
                        .join("")
                    : `
                        <div class="empty-state">
                            <span>✓</span>
                            <h3>Nothing urgent</h3>
                            <p>
                                Your pantry is in good shape.
                            </p>
                        </div>
                    `;
        }
    );
}

function updateStatistics() {

    const soon =
        useFirstItems()
            .filter(
                item =>
                    getDaysUntilExpiry(item.expiry) >= 0
            )
            .length;

    const expired =
        foodItems.filter(
            item =>
                getDaysUntilExpiry(item.expiry) < 0
        ).length;

    document.getElementById(
        "totalItems"
    ).textContent =
        foodItems.length;

    document.getElementById(
        "expiringItems"
    ).textContent =
        soon;

    document.getElementById(
        "expiredItems"
    ).textContent =
        expired;
}

function displayActivities() {

    const container =
        document.getElementById(
            "recentActivity"
        );

    if (!container) return;

    container.innerHTML =
        activities.length
            ? activities
                .slice(0, 6)
                .map(
                    a =>
                        `
                            <div class="activity-item">

                                <div class="activity-icon">
                                    ✓
                                </div>

                                <div class="activity-info">

                                    <strong>
                                        ${escapeHTML(a.message)}
                                    </strong>

                                    <span>
                                        ${escapeHTML(a.date)}
                                    </span>

                                </div>

                            </div>
                        `
                )
                .join("")
            : `
                <p class="empty-message">
                    No recent activity yet.
                </p>
            `;
}

function updateCharts() {

    const counts = {};

    foodItems.forEach(
        item =>
            counts[item.category] =
                (counts[item.category] || 0) + 1
    );

    const chartData = {

        labels:
            Object.keys(counts),

        datasets: [
            {
                label: "Items",

                data:
                    Object.values(counts),

                backgroundColor: [
                    "#2f855a",
                    "#f59e0b",
                    "#3b82f6",
                    "#ef4444",
                    "#8b5cf6",
                    "#14b8a6",
                    "#f97316"
                ]
            }
        ]
    };

    const create =
        (id, type, data) => {

            const canvas =
                document.getElementById(id);

            if (
                !canvas ||
                typeof Chart === "undefined"
            ) {
                return null;
            }

            return new Chart(
                canvas,
                {
                    type,
                    data,

                    options: {
                        responsive: true,
                        maintainAspectRatio: false
                    }
                }
            );
        };

    if (categoryChart)
        categoryChart.destroy();

    if (analyticsCategoryChart)
        analyticsCategoryChart.destroy();

    if (wasteChart)
        wasteChart.destroy();

    categoryChart =
        create(
            "categoryChart",
            "doughnut",
            chartData
        );

    analyticsCategoryChart =
        create(
            "analyticsCategoryChart",
            "doughnut",
            chartData
        );

    const groups = [
        foodItems.filter(
            i =>
                getDaysUntilExpiry(i.expiry) < 0
        ).length,

        foodItems.filter(
            i =>
                getDaysUntilExpiry(i.expiry) === 0
        ).length,

        foodItems.filter(
            i => {
                const d =
                    getDaysUntilExpiry(i.expiry);

                return d > 0 && d <= 3;
            }
        ).length,

        foodItems.filter(
            i =>
                getDaysUntilExpiry(i.expiry) > 3
        ).length
    ];

    wasteChart =
        create(
            "wasteChart",
            "bar",
            {
                labels: [
                    "Expired",
                    "Use today",
                    "Use soon",
                    "Fresh"
                ],

                datasets: [
                    {
                        label: "Items",
                        data: groups,

                        backgroundColor: [
                            "#ef4444",
                            "#f97316",
                            "#f59e0b",
                            "#2f855a"
                        ]
                    }
                ]
            }
        );
}


/* ============================================================
   DETAILED RECIPE DATABASE
   ============================================================ */

const recipeDatabase = [

    {
        name: "Vegetable Fried Rice",

        description:
            "A quick one-pan rice dish that uses rice and fresh vegetables from your pantry.",

        ingredients: [
            "rice",
            "carrot",
            "peas",
            "onion",
            "garlic",
            "cooking oil"
        ],

        time: 25,
        prepTime: 10,
        cookTime: 15,
        servings: 2,
        difficulty: "Easy",
        vegetarian: true,

        instructions: [
            "Cook the rice beforehand and let it cool completely.",
            "Wash and finely chop the carrot, onion and garlic.",
            "Heat cooking oil in a large pan over medium-high heat.",
            "Add onion and garlic and saute for 1–2 minutes until fragrant.",
            "Add carrot and green peas and cook until slightly tender.",
            "Add the cooled cooked rice and mix gently.",
            "Season with salt and pepper and stir-fry for 3–5 minutes.",
            "Serve hot."
        ],

        tips: [
            "Cold leftover rice gives the best texture.",
            "Do not overcrowd the pan while stir-frying.",
            "Use vegetables that are closest to expiry first."
        ]
    },


    {
        name: "Tomato Pasta",

        description:
            "Comforting pasta prepared with tomato sauce, fresh tomato, garlic, onion and cheese.",

        ingredients: [
            "pasta",
            "tomato sauce",
            "tomato",
            "onion",
            "garlic",
            "cheese",
            "cooking oil"
        ],

        time: 30,
        prepTime: 10,
        cookTime: 20,
        servings: 2,
        difficulty: "Easy",
        vegetarian: true,

        instructions: [
            "Bring a large pot of salted water to a boil.",
            "Add pasta and cook according to the packet instructions until al dente.",
            "Reserve a little pasta water, then drain the pasta.",
            "Heat oil in a pan and saute onion and garlic until fragrant.",
            "Add chopped tomato and cook until soft.",
            "Add tomato sauce and simmer for 5–7 minutes.",
            "Add the cooked pasta and mix well. Add a little pasta water if the sauce is too thick.",
            "Top with grated cheese and serve hot."
        ],

        tips: [
            "Do not overcook the pasta.",
            "Pasta water helps the sauce cling to the pasta.",
            "Use tomatoes that are close to expiry first."
        ]
    },


    {
        name: "Vegetable Sandwich",

        description:
            "A simple toasted sandwich filled with fresh vegetables and cheese.",

        ingredients: [
            "bread",
            "tomato",
            "carrot",
            "cheese",
            "onion"
        ],

        time: 15,
        prepTime: 8,
        cookTime: 7,
        servings: 2,
        difficulty: "Easy",
        vegetarian: true,

        instructions: [
            "Wash and thinly slice the tomato, carrot and onion.",
            "Place two slices of bread on a clean surface.",
            "Layer the vegetables evenly over the bread.",
            "Add cheese and season lightly with salt and pepper.",
            "Close the sandwich and brush the outside lightly with butter or oil if desired.",
            "Toast in a sandwich maker or pan until the bread is crisp and the cheese melts.",
            "Cut in half and serve immediately."
        ],

        tips: [
            "Do not overfill the sandwich or it may become difficult to toast.",
            "Use vegetables that need to be consumed soon."
        ]
    },


    {
        name: "French Toast",

        description:
            "Golden, soft French toast made with bread, eggs and milk.",

        ingredients: [
            "bread",
            "eggs",
            "milk"
        ],

        time: 15,
        prepTime: 5,
        cookTime: 10,
        servings: 2,
        difficulty: "Easy",
        vegetarian: true,

        instructions: [
            "Crack the eggs into a bowl and whisk them with milk.",
            "Dip each bread slice into the mixture, coating both sides without soaking too long.",
            "Heat a lightly greased pan over medium heat.",
            "Place the soaked bread in the pan.",
            "Cook for 2–3 minutes on each side until golden brown.",
            "Repeat with the remaining slices.",
            "Serve warm with fruit or a topping of your choice."
        ],

        tips: [
            "Medium heat prevents the outside from burning before the centre cooks.",
            "Slightly stale bread absorbs the egg mixture well."
        ]
    },


    {
        name: "Banana Pancakes",

        description:
            "Soft and naturally sweet pancakes made with ripe bananas, eggs and milk.",

        ingredients: [
            "banana",
            "eggs",
            "milk",
            "flour"
        ],

        time: 20,
        prepTime: 8,
        cookTime: 12,
        servings: 2,
        difficulty: "Easy",
        vegetarian: true,

        instructions: [
            "Peel and mash the banana in a bowl.",
            "Add eggs and milk and whisk until combined.",
            "Gradually add flour and mix into a smooth batter.",
            "Heat a non-stick pan over medium heat and lightly grease it.",
            "Pour a small ladle of batter into the pan.",
            "Cook until bubbles appear on the surface, then flip carefully.",
            "Cook the other side until golden and repeat with the remaining batter.",
            "Serve warm."
        ],

        tips: [
            "Use ripe bananas for better sweetness and flavour.",
            "Keep pancakes small so they are easier to flip."
        ]
    },


    {
        name: "Omelette",

        description:
            "A quick, fluffy omelette with eggs, vegetables and melted cheese.",

        ingredients: [
            "eggs",
            "onion",
            "tomato",
            "cheese"
        ],

        time: 12,
        prepTime: 5,
        cookTime: 7,
        servings: 1,
        difficulty: "Easy",
        vegetarian: true,

        instructions: [
            "Crack the eggs into a bowl and beat until smooth.",
            "Finely chop onion and tomato.",
            "Heat a little oil in a non-stick pan.",
            "Saute the onion and tomato for 1–2 minutes.",
            "Pour the beaten eggs over the vegetables.",
            "Let the eggs set around the edges, then add grated cheese.",
            "Fold the omelette in half and cook until the centre is set.",
            "Serve immediately."
        ],

        tips: [
            "Keep the heat medium-low for a soft omelette.",
            "Avoid overcooking the eggs as they can become dry."
        ]
    },


    {
        name: "Vegetable Soup",

        description:
            "A warm and comforting soup that helps use several fresh vegetables together.",

        ingredients: [
            "carrot",
            "potato",
            "spinach",
            "onion",
            "garlic"
        ],

        time: 35,
        prepTime: 10,
        cookTime: 25,
        servings: 3,
        difficulty: "Easy",
        vegetarian: true,

        instructions: [
            "Wash, peel and chop the vegetables into small pieces.",
            "Heat a little oil in a pot and saute onion and garlic.",
            "Add carrots and potatoes and stir for 2 minutes.",
            "Pour in enough water or vegetable stock to cover the vegetables.",
            "Bring to a boil, then reduce the heat and simmer until the potatoes are tender.",
            "Add spinach during the last few minutes of cooking.",
            "Season with salt and pepper.",
            "Serve chunky or blend until smooth."
        ],

        tips: [
            "Cut vegetables into similar sizes so they cook evenly.",
            "Add spinach near the end to retain its colour."
        ]
    },


    {
        name: "Cheese Toast",

        description:
            "Crispy toasted bread topped with melted cheese and fresh tomato.",

        ingredients: [
            "bread",
            "cheese",
            "tomato"
        ],

        time: 10,
        prepTime: 3,
        cookTime: 7,
        servings: 2,
        difficulty: "Easy",
        vegetarian: true,

        instructions: [
            "Place the bread slices on a plate or tray.",
            "Slice the tomato thinly.",
            "Add tomato slices and grated cheese over each bread slice.",
            "Season lightly with pepper and herbs if available.",
            "Toast in an oven, toaster oven or covered pan until the bread is crisp and the cheese melts.",
            "Allow it to cool for a minute and serve."
        ],

        tips: [
            "Use a thin layer of tomato so the toast does not become soggy.",
            "Watch closely near the end because cheese can brown quickly."
        ]
    },


    {
        name: "Fruit Salad",

        description:
            "A fresh fruit bowl that is ideal for using ripe fruit before it becomes overripe.",

        ingredients: [
            "apple",
            "banana",
            "mango",
            "strawberry"
        ],

        time: 10,
        prepTime: 10,
        cookTime: 0,
        servings: 2,
        difficulty: "Easy",
        vegetarian: true,

        instructions: [
            "Wash all fruits thoroughly.",
            "Peel and chop the banana and mango.",
            "Core and chop the apple into bite-sized pieces.",
            "Remove the tops from the strawberries and slice them.",
            "Add all fruit to a clean bowl.",
            "Gently mix and serve immediately or chill for a short time."
        ],

        tips: [
            "Use the ripest fruit first.",
            "Add banana shortly before serving to reduce browning."
        ]
    },


    {
        name: "Potato Curry",

        description:
            "A simple spiced potato curry that pairs well with rice or bread.",

        ingredients: [
            "potato",
            "onion",
            "tomato",
            "garlic"
        ],

        time: 35,
        prepTime: 10,
        cookTime: 25,
        servings: 3,
        difficulty: "Medium",
        vegetarian: true,

        instructions: [
            "Peel and cut the potatoes into small cubes.",
            "Heat oil in a pan and saute chopped onion and garlic.",
            "Add chopped tomato and cook until soft.",
            "Add your preferred curry spices and stir for 30 seconds.",
            "Add the potatoes and mix until coated.",
            "Add a little water, cover the pan and simmer until the potatoes are tender.",
            "Remove the lid and cook for a few more minutes until the gravy reaches the desired consistency.",
            "Serve hot with rice or bread."
        ],

        tips: [
            "Cut potatoes evenly so they finish cooking at the same time.",
            "Add water gradually to avoid making the curry too thin."
        ]
    },


    {
        name: "Chicken Sandwich",

        description:
            "A filling sandwich made with cooked chicken, cheese, bread and fresh tomato.",

        ingredients: [
            "chicken",
            "bread",
            "cheese",
            "tomato"
        ],

        time: 20,
        prepTime: 8,
        cookTime: 12,
        servings: 2,
        difficulty: "Easy",
        vegetarian: false,

        instructions: [
            "Cut the chicken into small pieces or use cooked shredded chicken.",
            "Cook the chicken thoroughly in a pan with a little oil and seasoning.",
            "Slice the tomato and cheese.",
            "Place chicken, tomato and cheese between two bread slices.",
            "Toast the sandwich in a pan or sandwich maker until the bread is crisp and the cheese melts.",
            "Allow it to rest briefly, then cut and serve."
        ],

        tips: [
            "Chicken should be fully cooked before assembling the sandwich.",
            "Use cooked chicken that is closest to its expiry date first."
        ]
    },


    {
        name: "Spinach Omelette",

        description:
            "A quick egg omelette filled with spinach, onion and cheese.",

        ingredients: [
            "spinach",
            "eggs",
            "cheese",
            "onion"
        ],

        time: 15,
        prepTime: 5,
        cookTime: 10,
        servings: 1,
        difficulty: "Easy",
        vegetarian: true,

        instructions: [
            "Wash and roughly chop the spinach.",
            "Beat the eggs in a bowl.",
            "Saute chopped onion in a lightly oiled pan.",
            "Add spinach and cook until wilted.",
            "Pour the beaten eggs over the vegetables.",
            "Sprinkle cheese over the top once the egg begins to set.",
            "Fold the omelette and cook until fully set.",
            "Serve hot."
        ],

        tips: [
            "Spinach cooks quickly, so avoid overcooking it.",
            "Use fresh spinach that needs to be consumed soon."
        ]
    },


    {
        name: "Tomato Rice",

        description:
            "A simple and flavourful rice dish made with tomatoes, onion and garlic.",

        ingredients: [
            "rice",
            "tomato",
            "onion",
            "garlic"
        ],

        time: 25,
        prepTime: 8,
        cookTime: 17,
        servings: 2,
        difficulty: "Easy",
        vegetarian: true,

        instructions: [
            "Cook the rice and keep it aside to cool slightly.",
            "Heat oil in a pan and saute chopped onion and garlic.",
            "Add chopped tomatoes and cook until soft and pulpy.",
            "Add salt and your preferred spices.",
            "Add the cooked rice and mix gently until every grain is coated.",
            "Cook for another 3–4 minutes on low heat.",
            "Serve hot with yogurt or a side dish."
        ],

        tips: [
            "Slightly cooled rice is easier to mix without breaking.",
            "Use ripe tomatoes for a naturally rich flavour."
        ]
    },


    {
        name: "Curd Rice",

        description:
            "A cooling and simple rice dish made with yogurt and a little milk.",

        ingredients: [
            "rice",
            "yogurt",
            "milk"
        ],

        time: 15,
        prepTime: 8,
        cookTime: 7,
        servings: 2,
        difficulty: "Easy",
        vegetarian: true,

        instructions: [
            "Cook the rice until soft and allow it to cool.",
            "Mash the rice lightly with a spoon.",
            "Add yogurt and a small splash of milk and mix until creamy.",
            "Add salt to taste.",
            "Chill for a few minutes if desired.",
            "Serve fresh."
        ],

        tips: [
            "Do not mix yogurt into very hot rice.",
            "Adjust the milk quantity depending on how creamy you want the dish."
        ]
    },


    {
        name: "Pasta with Tomato Sauce",

        description:
            "A quick pantry-friendly pasta with tomato sauce, garlic and melted cheese.",

        ingredients: [
            "pasta",
            "tomato sauce",
            "cheese",
            "garlic"
        ],

        time: 20,
        prepTime: 5,
        cookTime: 15,
        servings: 2,
        difficulty: "Easy",
        vegetarian: true,

        instructions: [
            "Boil salted water and cook pasta until al dente.",
            "Reserve a little pasta water and drain the pasta.",
            "Heat a pan and saute minced garlic in a little oil.",
            "Add tomato sauce and simmer for 5 minutes.",
            "Add the cooked pasta and toss until evenly coated.",
            "Add a splash of pasta water if the sauce is too thick.",
            "Top with grated cheese and serve hot."
        ],

        tips: [
            "Keep the pasta slightly firm so it does not become mushy.",
            "Add cheese just before serving for the best texture."
        ]
    }
];


function ingredientMatches(item, ingredient) {

    const name =
        item.name.toLowerCase();

    const target =
        ingredient.toLowerCase();

    return (
        name.includes(target) ||
        (
            target.endsWith("y") &&
            name.includes(target.slice(0, -1))
        ) ||
        (
            target === "tomato" &&
            name.includes("tomatoes")
        ) ||
        (
            target === "banana" &&
            name.includes("bananas")
        ) ||
        (
            target === "strawberry" &&
            name.includes("strawberries")
        )
    );
}

function getRecipeMatches(recipe) {

    const available =
        recipe.ingredients.filter(
            ingredient =>
                foodItems.some(
                    item =>
                        ingredientMatches(
                            item,
                            ingredient
                        )
                )
        );

    const expiring =
        available.filter(
            ingredient =>
                foodItems.some(
                    item =>
                        ingredientMatches(
                            item,
                            ingredient
                        ) &&
                        getDaysUntilExpiry(
                            item.expiry
                        ) <= 3
                )
        );

    return {
        available,

        missing:
            recipe.ingredients.filter(
                ingredient =>
                    !available.includes(ingredient)
            ),

        expiring
    };
}

function getRankedRecipes() {

    return recipeDatabase
        .map(
            recipe => ({
                ...recipe,
                match:
                    getRecipeMatches(recipe)
            })
        )
        .sort(
            (a, b) =>
                b.match.expiring.length -
                    a.match.expiring.length ||

                b.match.available.length -
                    a.match.available.length ||

                a.match.missing.length -
                    b.match.missing.length
        );
}

function displayRecipes() {

    const container =
        document.getElementById(
            "recipeGrid"
        );

    if (!container) return;

    const search =
        document
            .getElementById("recipeSearch")
            .value
            .toLowerCase()
            .trim();

    const filter =
        document.getElementById(
            "recipeFilter"
        ).value;

    const recipes =
        getRankedRecipes()
            .filter(
                recipe => {

                    const searchable =
                        `${recipe.name} ${recipe.ingredients.join(" ")}`
                            .toLowerCase();

                    const filterMatch =
                        filter === "all" ||

                        (
                            filter === "quick" &&
                            recipe.time <= 20
                        ) ||

                        (
                            filter === "vegetarian" &&
                            recipe.vegetarian
                        ) ||

                        (
                            filter === "non-vegetarian" &&
                            !recipe.vegetarian
                        ) ||

                        (
                            filter === "expiring" &&
                            recipe.match.expiring.length > 0
                        );

                    return (
                        filterMatch &&
                        (
                            !search ||
                            searchable.includes(search)
                        )
                    );
                }
            );

    container.innerHTML =
        recipes.length
            ? recipes
                .map(
                    recipe =>
                        `
                            <article class="recipe-card">

                                <div class="recipe-image">
                                    ${
                                        recipe.vegetarian
                                            ? "🥗"
                                            : "🍗"
                                    }
                                </div>

                                <div class="recipe-content">

                                    <div class="recipe-card-heading">

                                        <h3>
                                            ${escapeHTML(recipe.name)}
                                        </h3>

                                        <span class="recipe-match">
                                            ${recipe.match.available.length}/${recipe.ingredients.length}
                                            available
                                        </span>

                                    </div>

                                    <p>
                                        ${escapeHTML(recipe.description)}
                                    </p>

                                    <div class="recipe-meta">
                                        <span>
                                            ${recipe.time} min
                                        </span>

                                        <span>
                                            ${escapeHTML(recipe.difficulty)}
                                        </span>
                                    </div>

                                    <p class="recipe-ingredients">

                                        <strong>
                                            In your pantry:
                                        </strong>

                                        ${
                                            recipe.match.available.length
                                                ? recipe.match.available
                                                    .map(escapeHTML)
                                                    .join(", ")
                                                : "None yet"
                                        }

                                        ${
                                            recipe.match.missing.length
                                                ? `
                                                    <br>
                                                    <strong>
                                                        Missing:
                                                    </strong>

                                                    ${recipe.match.missing
                                                        .map(escapeHTML)
                                                        .join(", ")}
                                                `
                                                : ""
                                        }

                                    </p>

                                    <button
                                        class="primary-button recipe-view-button"
                                        type="button"
                                        data-recipe-index="${recipes.indexOf(recipe)}"
                                    >
                                        View Recipe
                                    </button>

                                </div>

                            </article>
                        `
                )
                .join("")
            : `
                <div class="empty-state large-empty">

                    <span>🍳</span>

                    <h3>
                        No exact recipe found.
                    </h3>

                    <p>
                        Try adding more ingredients
                        or explore these general recipes.
                    </p>

                </div>
            `;

    container.dataset.recipeNames =
        JSON.stringify(
            recipes.map(
                recipe =>
                    recipe.name
            )
        );
}


/* ============================================================
   DETAILED RECIPE POPUP
   ============================================================ */

function openRecipeDetail(recipeName) {

    const recipe =
        getRankedRecipes()
            .find(
                item =>
                    item.name === recipeName
            );

    if (!recipe) return;

    const modal =
        document.getElementById(
            "recipeModal"
        );

    const title =
        document.getElementById(
            "recipeModalTitle"
        );

    const meta =
        document.getElementById(
            "recipeModalMeta"
        );

    const content =
        document.getElementById(
            "recipeModalContent"
        );

    if (
        !modal ||
        !title ||
        !meta ||
        !content
    ) {
        return;
    }

    title.textContent =
        recipe.name;

    meta.textContent =
        `${recipe.time} minutes · ${recipe.difficulty} · ${recipe.servings || 2} servings`;

    const ingredientHTML =
        recipe.ingredients
            .map(
                ingredient =>
                    `
                        <li>

                            ${escapeHTML(ingredient)}

                            ${
                                recipe.match.available.includes(
                                    ingredient
                                )

                                    ? `
                                        <strong class="available-label">
                                            ✓ Available in pantry
                                        </strong>
                                    `

                                    : `
                                        <span class="missing-label">
                                            • Need to buy
                                        </span>
                                    `
                            }

                        </li>
                    `
            )
            .join("");

    const stepsHTML =
        recipe.instructions
            .map(
                (step, index) =>
                    `
                        <li>
                            <strong>
                                Step ${index + 1}:
                            </strong>

                            ${escapeHTML(step)}
                        </li>
                    `
            )
            .join("");

    const tipsHTML =
        (recipe.tips || [])
            .map(
                tip =>
                    `
                        <li>
                            ${escapeHTML(tip)}
                        </li>
                    `
            )
            .join("");

    content.innerHTML = `

        <p class="recipe-detail-description">
            ${escapeHTML(recipe.description)}
        </p>


        <div class="recipe-detail-info">

            <div>
                <strong>
                    ⏱ Preparation
                </strong>

                <span>
                    ${recipe.prepTime || recipe.time} min
                </span>
            </div>


            <div>
                <strong>
                    🍳 Cooking
                </strong>

                <span>
                    ${recipe.cookTime || recipe.time} min
                </span>
            </div>


            <div>
                <strong>
                    🍽 Servings
                </strong>

                <span>
                    ${recipe.servings || 2}
                </span>
            </div>


            <div>
                <strong>
                    📊 Difficulty
                </strong>

                <span>
                    ${escapeHTML(recipe.difficulty)}
                </span>
            </div>

        </div>


        <div class="recipe-detail-section">

            <h3>
                🛒 Ingredients
            </h3>

            <ul class="recipe-detail-ingredients">
                ${ingredientHTML}
            </ul>

        </div>


        <div class="recipe-detail-section">

            <h3>
                👩‍🍳 Step-by-Step Instructions
            </h3>

            <ol class="recipe-steps">
                ${stepsHTML}
            </ol>

        </div>


        ${
            tipsHTML
                ? `
                    <div class="recipe-detail-section recipe-tips">

                        <h3>
                            💡 Cooking Tips
                        </h3>

                        <ul>
                            ${tipsHTML}
                        </ul>

                    </div>
                `
                : ""
        }

    `;

    modal.classList.add("show");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );
}

function closeRecipeDetail() {

    const modal =
        document.getElementById(
            "recipeModal"
        );

    if (!modal) return;

    modal.classList.remove("show");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* ============================================================
   SEARCH / FILTER
   ============================================================ */

function filterFoodItems() {

    const text =
        document
            .getElementById(
                "searchInput"
            )
            .value
            .toLowerCase()
            .trim();

    const category =
        document.getElementById(
            "categoryFilter"
        ).value;

    const status =
        document.getElementById(
            "statusFilter"
        ).value;

    displayFoodItems(
        foodItems.filter(
            item => {

                const days =
                    getDaysUntilExpiry(
                        item.expiry
                    );

                const statusMatch =
                    status === "all" ||

                    (
                        status === "expired" &&
                        days < 0
                    ) ||

                    (
                        status === "today" &&
                        days === 0
                    ) ||

                    (
                        status === "soon" &&
                        days > 0 &&
                        days <= 3
                    ) ||

                    (
                        status === "fresh" &&
                        days > 3
                    );

                return (
                    (
                        item.name
                            .toLowerCase()
                            .includes(text) ||

                        item.category
                            .toLowerCase()
                            .includes(text)
                    ) &&

                    (
                        category === "all" ||
                        item.category === category
                    ) &&

                    statusMatch
                );
            }
        )
    );
}


/* ============================================================
   REFRESH
   ============================================================ */

function refreshUI() {

    displayFoodItems();

    displayUseFirstItems();

    updateStatistics();

    displayActivities();

    updateCharts();

    filterFoodItems();

    displayRecipes();
}


/* ============================================================
   NAVIGATION
   ============================================================ */

function showSection(sectionId) {

    document
        .querySelectorAll(
            ".page-section"
        )
        .forEach(
            section =>
                section.classList.toggle(
                    "active-section",
                    section.id === sectionId
                )
        );

    document
        .querySelectorAll(
            ".nav-link"
        )
        .forEach(
            link =>
                link.classList.toggle(
                    "active",
                    link.dataset.section === sectionId
                )
        );
}


/* ============================================================
   MODALS
   ============================================================ */

function openAddFoodModal() {

    const modal =
        document.getElementById(
            "foodModal"
        );

    if (!modal) return;

    modal.classList.add("show");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );
}

function closeAddFoodModal() {

    const modal =
        document.getElementById(
            "foodModal"
        );

    if (!modal) return;

    modal.classList.remove("show");

    modal.setAttribute(
        "aria-hidden",
        "true"
    );
}


/* ============================================================
   NOTIFICATION
   ============================================================ */

function notify(message) {

    const note =
        document.createElement(
            "div"
        );

    note.className = "toast";

    note.textContent = message;

    document.body.appendChild(note);

    setTimeout(
        () => note.remove(),
        2500
    );
}


/* ============================================================
   ADD FOOD
   ============================================================ */

function addFoodItem(event) {

    event.preventDefault();

    const form =
        event.currentTarget;

    const formData =
        new FormData(form);

    const item = {

        id:
            `item-${Date.now()}`,

        name:
            formData
                .get("name")
                .trim(),

        category:
            formData.get("category"),

        quantity:
            formData
                .get("quantity")
                .trim(),

        unit:
            formData
                .get("unit")
                .trim(),

        expiry:
            formData.get("expiry")
    };

    if (
        !item.name ||
        !item.category ||
        !item.quantity ||
        !item.unit ||
        !item.expiry
    ) {

        notify(
            "Please complete all required fields."
        );

        return;
    }

    foodItems.push(item);

    saveItems();

    activities.unshift({

        message:
            `${item.name} was added to your pantry.`,

        date:
            new Date().toLocaleString()
    });

    saveActivities();

    form.reset();

    closeAddFoodModal();

    refreshUI();

    notify(
        `${item.name} added to your pantry.`
    );
}


/* ============================================================
   DELETE FOOD
   ============================================================ */

function deleteFoodItem(id) {

    const item =
        foodItems.find(
            food =>
                String(food.id) ===
                String(id)
        );

    if (
        !item ||
        !confirm(
            `Delete ${item.name}?`
        )
    ) {
        return;
    }

    foodItems =
        foodItems.filter(
            food =>
                String(food.id) !==
                String(id)
        );

    saveItems();

    activities.unshift({

        message:
            `${item.name} was removed from your pantry.`,

        date:
            new Date().toLocaleString()
    });

    saveActivities();

    refreshUI();
}


/* ============================================================
   DARK MODE
   ============================================================ */

function toggleTheme() {

    document.body.classList.toggle(
        "dark-mode"
    );

    localStorage.setItem(
        "freshTrackTheme",
        document.body.classList.contains(
            "dark-mode"
        )
            ? "dark"
            : "light"
    );
}


/* ============================================================
   INITIALIZE APPLICATION
   ============================================================ */

function initializeApp() {

    if (
        localStorage.getItem(
            "freshTrackTheme"
        ) === "dark"
    ) {
        document.body.classList.add(
            "dark-mode"
        );
    }

    document.getElementById(
        "currentDate"
    ).textContent =
        new Date().toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    document
        .querySelectorAll(
            ".nav-link"
        )
        .forEach(
            link =>
                link.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        showSection(
                            link.dataset.section
                        );
                    }
                )
        );


    document
        .querySelectorAll(
            "[data-section-link]"
        )
        .forEach(
            link =>
                link.addEventListener(
                    "click",
                    () =>
                        showSection(
                            link.dataset.sectionLink
                        )
                )
        );


    [
        "addFoodBtn",
        "addFoodBtnPantry"
    ]
        .forEach(
            id =>
                document
                    .getElementById(id)
                    .addEventListener(
                        "click",
                        openAddFoodModal
                    )
        );


    [
        "closeModal",
        "cancelModal"
    ]
        .forEach(
            id =>
                document
                    .getElementById(id)
                    .addEventListener(
                        "click",
                        closeAddFoodModal
                    )
        );


    document
        .getElementById(
            "foodForm"
        )
        .addEventListener(
            "submit",
            addFoodItem
        );


    [
        "searchInput",
        "categoryFilter",
        "statusFilter"
    ]
        .forEach(
            id =>
                document
                    .getElementById(id)
                    .addEventListener(
                        id === "searchInput"
                            ? "input"
                            : "change",
                        filterFoodItems
                    )
        );


    [
        "recipeSearch",
        "recipeFilter"
    ]
        .forEach(
            id =>
                document
                    .getElementById(id)
                    .addEventListener(
                        id === "recipeSearch"
                            ? "input"
                            : "change",
                        displayRecipes
                    )
        );


    document
        .getElementById(
            "recipeGrid"
        )
        .addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-recipe-index]"
                    );

                if (!button) return;

                const names =
                    JSON.parse(
                        event.currentTarget
                            .dataset
                            .recipeNames ||
                        "[]"
                    );

                openRecipeDetail(
                    names[
                        Number(
                            button.dataset
                                .recipeIndex
                        )
                    ]
                );
            }
        );


    document
        .getElementById(
            "closeRecipeModal"
        )
        .addEventListener(
            "click",
            closeRecipeDetail
        );


    document
        .getElementById(
            "recipeModal"
        )
        .addEventListener(
            "click",
            event => {

                if (
                    event.target.id ===
                    "recipeModal"
                ) {
                    closeRecipeDetail();
                }
            }
        );


    document
        .getElementById(
            "pantryGrid"
        )
        .addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        "[data-delete-id]"
                    );

                if (button) {

                    deleteFoodItem(
                        button.dataset.deleteId
                    );
                }
            }
        );


    document
        .getElementById(
            "foodModal"
        )
        .addEventListener(
            "click",
            event => {

                if (
                    event.target.id ===
                    "foodModal"
                ) {
                    closeAddFoodModal();
                }
            }
        );


    [
        "themeToggle",
        "settingsThemeToggle"
    ]
        .forEach(
            id =>
                document
                    .getElementById(id)
                    .addEventListener(
                        "click",
                        toggleTheme
                    )
        );


    document
        .getElementById(
            "clearDataBtn"
        )
        .addEventListener(
            "click",
            () => {

                if (
                    confirm(
                        "Clear all pantry items?"
                    )
                ) {

                    foodItems = [];

                    saveItems();

                    refreshUI();

                    notify(
                        "Pantry cleared."
                    );
                }
            }
        );


    refreshUI();
}

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);