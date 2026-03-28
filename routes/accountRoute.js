// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to process the login form
router.post("/login", utilities.handleErrors(accountController.accountLogin))

// Deliver the registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Route to process the registration form
router.post('/register', utilities.handleErrors(accountController.registerAccount))

module.exports = router
