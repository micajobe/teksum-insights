const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the app directory
app.use(express.static(path.join(__dirname, 'app')));

// Serve the index.html file for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'app', 'page.tsx'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
}); 