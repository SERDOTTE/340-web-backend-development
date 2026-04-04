// Needed Resources 
const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const invValidate = require("../utilities/inventory-validation")

// Route to build inventory management view
router.get("/", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildManagement))

// Route to return inventory data by classification as JSON
router.get("/getInventory/:classification_id", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.getInventoryJSON))

// Route to build edit inventory view
router.get("/edit/:inv_id", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.editInventoryView))

// Route to build add-classification view
router.get("/add-classification", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildAddClassification))

// Route to process add-classification form
router.post(
	"/add-classification",
	utilities.checkEmployeeOrAdmin,
	invValidate.classificationRules(),
	invValidate.checkClassificationData,
	utilities.handleErrors(invController.addClassification)
)

// Route to build add-inventory view
router.get("/add-inventory", utilities.checkEmployeeOrAdmin, utilities.handleErrors(invController.buildAddInventory))

// Route to process add-inventory form
router.post(
	"/add-inventory",
	utilities.checkEmployeeOrAdmin,
	invValidate.inventoryRules(),
	invValidate.checkInventoryData,
	utilities.handleErrors(invController.addInventory)
)

// Route to process update inventory form
router.post(
	"/update",
	utilities.checkEmployeeOrAdmin,
	invValidate.newInventoryRules(),
	invValidate.checkUpdateData,
	utilities.handleErrors(invController.updateInventory)
)

// Route to build inventory by classification view
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));

// Route to build inventory detail view
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId));

module.exports = router;