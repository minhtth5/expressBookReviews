const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  {
    username: "admin",
    password: "123456"
  }
];

const isValid = (username) => { //returns boolean
  // a basic check: non-empty string and not already registered
  if (!username || typeof username !== 'string') return false;
  return !users.find(user => user.username === username);
}

const authenticatedUser = (username, password) => { //returns boolean
  if (!username || !password) return false;
  return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }
  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({ username }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = { token: accessToken };
    return res.status(200).json({ message: "Login successful" });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  if (!review) {
    return res.status(400).json({ message: "Review text is required" });
  }
  // determine user from token stored in session
  let username = null;
  if (req.session && req.session.authorization && req.session.authorization.token) {
    try {
      const decoded = jwt.verify(req.session.authorization.token, 'access');
      username = decoded.username;
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  }
  if (!username) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  if (books[isbn]) {
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review added/updated successfully" });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  // determine user from token stored in session
  let username = null;
  if (req.session && req.session.authorization && req.session.authorization.token) {
    try {
      const decoded = jwt.verify(req.session.authorization.token, 'access');
      username = decoded.username;
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  }
  if (!username) {
    return res.status(401).json({ message: "User not authenticated" });
  }
  if (books[isbn]) {
    if (books[isbn].reviews[username]) {
      delete books[isbn].reviews[username];
      return res.status(200).json({ message: "Review deleted successfully" });
    } else {
      return res.status(404).json({ message: "Review not found" });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
