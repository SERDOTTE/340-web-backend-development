/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const inventoryRoute = require("./routes/inventoryRoute")
const baseController = require("./controllers/baseController")
const utilities = require("./utilities/")

/* ***********************
 * Routes
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root

app.use(static)

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500
const host = process.env.HOST || "localhost"

//Index route
app.get("/", utilities.handleErrors(baseController.buildHome))

app.get("/custom", utilities.handleErrors(async function(req, res) {
  const nav = await utilities.getNav()
  res.render("index", { title: "Custom", nav })
})

app.get("/sedan", async function(req, res) {
  const nav = await utilities.getNav()
  res.render("index", { title: "Sedan", nav })
})

app.get("/suv", async function(req, res) {
  const nav = await utilities.getNav()
  res.render("index", { title: "SUV", nav })
})

app.get("/truck", async function(req, res) {
  const nav = await utilities.getNav()
  res.render("index", { title: "Truck", nav })
})

// Inventory routes
app.use("/inv", inventoryRoute)

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if(err.status == 404){ message = err.message} else {message = 'Oh no! There was a crash. Maybe try a different route?'}
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})
