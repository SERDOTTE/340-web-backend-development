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

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})

//Index route
app.get("/", baseController.buildHome)

app.get("/custom", async function(req, res) {
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
