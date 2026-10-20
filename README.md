# FreshTrack – Smart Pantry & Food Waste Reduction

## About the Project
FreshTrack is a web-based smart pantry management application designed to help users organize food items, track expiry dates, reduce food waste, and discover recipes using available ingredients.

## Features
- **Dashboard:** View total pantry items, expiring items, expired items, and waste-related information.
- **Pantry Management:** Add and manage food items with their category, quantity, unit, and expiry date.
- **Expiry Tracking:** Identify expired and soon-to-expire food items.
- **Use First:** Highlight food items that need attention first.
- **Recipe Suggestions:** Explore recipes with ingredients, preparation time, cooking time, and detailed instructions.
- **Waste Analytics:** Visualize pantry information through charts.
- **Search and Filters:** Find food items quickly.
- **Dark Mode:** Switch between light and dark themes.

## Technologies Used
- HTML5
- CSS3
- JavaScript
- Node.js
- Express.js
- MongoDB (if configured in the current version)
- Git and GitHub

## Project Structure
- `index.html` – Application interface
- `style.css` – Styling and layout
- `script.js` – Frontend functionality
- `server.js` – Backend server
- `foodRoutes.js` – Food-related API routes
- `Food.js` – Food data model
- `seed.js` – Sample data setup

## How to Run
1. Clone or download this repository.
2. Install Node.js if it is not already installed.
3. Open the project folder in VS Code.
4. Run `npm install` in the terminal.
5. Configure the required environment variables in a local `.env` file.
6. Start the server using the command specified in `package.json`.
7. Open the local URL displayed by the server.

## Objective
The objective of FreshTrack is to encourage better food management habits by helping users monitor pantry items, consume food before expiry, and make use of ingredients already available at home.

## Future Enhancements
- Expiry reminder notifications
- User authentication
- Improved recipe recommendations
- Shopping list generation
- Cloud deployment
