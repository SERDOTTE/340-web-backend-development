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
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})

//Index route
app.get("/", function(req, res) {
  res.render("index", { title: "Home" })
})

app.get("/custom", function(req, res) {
  res.render("index", { title: "Custom" })
})

app.get("/sedan", function(req, res) {
  res.render("index", { title: "Sedan" })
})

app.get("/suv", function(req, res) {
  res.render("index", { title: "SUV" })
})

app.get("/truck", function(req, res) {
  res.render("index", { title: "Truck" })
})
