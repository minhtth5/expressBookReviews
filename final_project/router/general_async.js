const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    // username must be valid and not already taken
    if (!isValid(username)) {
        return res.status(400).json({ message: "Invalid username" });
    }
    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: "User already exists" });
    }
    users.push({ username, password });
    return res.status(200).json({ message: "User successfully registered" });
});

// Task 10: Get the book list available in the shop - Using async callback function
public_users.get('/', async (req, res) => {
    try {
        // Simulate async operation - fetch all books asynchronously
        const allBooks = await new Promise((resolve) => {
            setTimeout(() => {
                resolve(books);
            }, 0);
        });
        return res.status(200).json(allBooks);
    } catch (error) {
        return res.status(500).json({ message: "Error retrieving books" });
    }
});

// Task 11: Get book details based on ISBN - Using Promises
public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    const getBookByISBN = new Promise((resolve, reject) => {
        const book = books[isbn];
        if (book) {
            resolve(book);
        } else {
            reject({ message: "Book not found" });
        }
    });

    getBookByISBN
        .then(book => res.status(200).json(book))
        .catch(error => res.status(404).json(error));
});

// Task 12: Get book details based on author - Using async/await
public_users.get('/author/:author', async (req, res) => {
    try {
        const author = req.params.author.toLowerCase();

        const booksByAuthor = await new Promise((resolve, reject) => {
            const results = Object.values(books).filter(
                b => b.author.toLowerCase() === author
            );
            if (results.length > 0) {
                resolve(results);
            } else {
                reject({ message: "No books by that author" });
            }
        });

        return res.status(200).json(booksByAuthor);
    } catch (error) {
        return res.status(404).json(error);
    }
});

// Task 13: Get all books based on title - Using Promises
public_users.get('/title/:title', (req, res) => {
    const title = req.params.title.toLowerCase();

    const getBookByTitle = new Promise((resolve, reject) => {
        const results = Object.values(books).filter(
            b => b.title.toLowerCase() === title
        );
        if (results.length > 0) {
            resolve(results);
        } else {
            reject({ message: "No books with that title" });
        }
    });

    getBookByTitle
        .then(results => res.status(200).json(results))
        .catch(error => res.status(404).json(error));
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        return res.status(200).json(book.reviews);
    }
    return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;
