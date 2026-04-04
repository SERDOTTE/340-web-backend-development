const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory management view
 * ************************** */
invCont.buildManagement = async function (req, res, next) {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()

  res.render("inventory/management", {
    title: "Vehicle Management",
    nav,
    classificationList,
    errors: null,
  })
}

/* ***************************
 *  Build add classification view
 * ************************** */
invCont.buildAddClassification = async function (req, res, next) {
  const nav = await utilities.getNav()
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
    classification_name: "",
  })
}

/* ***************************
 *  Add classification data
 * ************************** */
invCont.addClassification = async function (req, res, next) {
  const nav = await utilities.getNav()
  const { classification_name } = req.body
  const addResult = await invModel.addClassification(classification_name)

  if (addResult && addResult.rowCount > 0) {
    req.flash("notice", `Classification ${classification_name} added successfully.`)
    const updatedNav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav: updatedNav,
      classificationList,
      errors: null,
    })
    return
  }

  req.flash("notice", "Sorry, adding the classification failed.")
  res.status(501).render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
    classification_name,
  })
}

/* ***************************
 *  Build add inventory view
 * ************************** */
invCont.buildAddInventory = async function (req, res, next) {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  res.render("inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    classificationList,
    errors: null,
    inv_make: "",
    inv_model: "",
    inv_year: "",
    inv_description: "",
    inv_image: "/images/vehicles/no-image.png",
    inv_thumbnail: "/images/vehicles/no-image-tn.png",
    inv_price: "",
    inv_miles: "",
    inv_color: "",
    classification_id: "",
  })
}

/* ***************************
 *  Add inventory data
 * ************************** */
invCont.addInventory = async function (req, res, next) {
  const nav = await utilities.getNav()
  const {
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
  } = req.body

  const addResult = await invModel.addInventory(
    classification_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color
  )

  if (addResult && addResult.rowCount > 0) {
    req.flash("notice", `${inv_make} ${inv_model} was added successfully.`)
    const updatedNav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList()
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav: updatedNav,
      classificationList,
      errors: null,
    })
    return
  }

  req.flash("notice", "Sorry, adding the inventory item failed.")
  const classificationList = await utilities.buildClassificationList(classification_id)
  res.status(501).render("inventory/add-inventory", {
    title: "Add Vehicle",
    nav,
    classificationList,
    errors: null,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
  })
}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data.length > 0 ? data[0].classification_name : "Inventory"
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory item detail view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.invId
  const data = await invModel.getInventoryById(inv_id)

  if (!data) {
    return next({ status: 404, message: "Sorry, that vehicle was not found." })
  }

  const detailHtml = await utilities.buildInventoryDetail(data)
  let nav = await utilities.getNav()

  res.render("./inventory/detail", {
    title: `${data.inv_make} ${data.inv_model}`,
    nav,
    detailHtml,
  })
}

/* ***************************
 *  Return inventory by classification as JSON
 * ************************** */
invCont.getInventoryJSON = async function (req, res, next) {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)

  if (invData && invData.length > 0) {
    return res.json(invData)
  }

  return res.json([])
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()

  const itemData = await invModel.getInventoryById(inv_id)

  if (!itemData) {
    return next({ status: 404, message: "Sorry, that vehicle was not found." })
  }

  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("./inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id,
  })
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  const inventoryId = Array.isArray(inv_id) ? parseInt(inv_id[0], 10) : parseInt(inv_id, 10)
  const selectedClassificationId = Array.isArray(classification_id)
    ? parseInt(classification_id[0], 10)
    : parseInt(classification_id, 10)

  const updateResult = await invModel.updateInventory(
    inventoryId,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    selectedClassificationId
  )

  if (updateResult) {
    const itemName = `${inv_make} ${inv_model}`.trim()
    req.flash("notice", `${itemName} was successfully updated.`)
    return res.redirect("/inv/")
  } else {
    req.flash("notice", "Sorry, the update failed.")
    return res.redirect("/inv/")
  }
}

module.exports = invCont

