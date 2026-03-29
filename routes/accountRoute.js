// Needed Resources
const express = require("express")
const router = new express.Router()
const utilities = require("../utilities")
const accountController = require("../controllers/accountController")
const regValidate = require("../utilities/account-validation")

// Route to build login view
router.get("/login", utilities.handleErrors(accountController.buildLogin))

// Route to process the login form
router.post("/login", utilities.handleErrors(accountController.accountLogin))

// Deliver the registration view
router.get("/register", utilities.handleErrors(accountController.buildRegister))

// Process the registration data
router.post(
	"/register",
	regValidate.registationRules(),
	regValidate.checkRegData,
	utilities.handleErrors(accountController.registerAccount)
)

module.exports = router
