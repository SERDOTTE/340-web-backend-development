document.addEventListener("DOMContentLoaded", () => {
	const toggleButtons = document.querySelectorAll(".toggle-password")

	toggleButtons.forEach((button) => {
		button.addEventListener("click", () => {
			const targetId = button.dataset.target
			const passwordInput = document.getElementById(targetId)

			if (!passwordInput) return

			const showPassword = passwordInput.type === "password"
			passwordInput.type = showPassword ? "text" : "password"
			button.textContent = showPassword ? "Hide" : "Show"
			button.setAttribute("aria-label", showPassword ? "Hide password" : "Show password")
		})
	})

	const accountForms = document.querySelectorAll(".account-register__form, .account-update__form")

	accountForms.forEach((form) => {
		const requiredFields = Array.from(form.querySelectorAll("input[required]"))
		const passwordInput = form.querySelector('input[type="password"]')
		const passwordRuleItems = Array.from(form.querySelectorAll('[data-rule]'))

		const updatePasswordRules = () => {
			if (!passwordInput || passwordRuleItems.length === 0) return

			const value = passwordInput.value
			const checks = {
				length: value.length >= 12,
				lower: /[a-z]/.test(value),
				upper: /[A-Z]/.test(value),
				number: /\d/.test(value),
				special: /[^a-zA-Z0-9]/.test(value),
				spaces: !/\s/.test(value),
			}

			passwordRuleItems.forEach((item) => {
				const rule = item.dataset.rule
				item.classList.toggle("rule-met", Boolean(checks[rule]))
			})
		}

		const getErrorMessage = (field) => {
			const value = field.value.trim()

			if (!value) return "This field must be filled in."

			if (field.id === "account_lastname" && value.length < 2) {
				return "Please provide a last name."
			}

			if (field.id === "account_email" && !field.checkValidity()) {
				return "Enter a valid email address"
			}

			if (field.id === "account_password" && !field.checkValidity()) {
				return "Password does not meet the required format."
			}

			return ""
		}

		const setFieldError = (field, message) => {
			const errorElement = form.querySelector(`#${field.id}_error`)
			if (!errorElement) return

			errorElement.textContent = message
			errorElement.classList.toggle("is-visible", Boolean(message))
			field.classList.toggle("input-error", Boolean(message))
			field.setAttribute("aria-invalid", message ? "true" : "false")
		}

		requiredFields.forEach((field) => {
			field.addEventListener("input", () => {
				setFieldError(field, getErrorMessage(field))
				if (field.id === "account_password") updatePasswordRules()
			})
		})

		form.addEventListener("submit", (event) => {
			let hasError = false

			requiredFields.forEach((field) => {
				const message = getErrorMessage(field)
				setFieldError(field, message)
				if (message) hasError = true
			})

			if (hasError) {
				event.preventDefault()
				const firstInvalid = requiredFields.find((field) => field.classList.contains("input-error"))
				if (firstInvalid) firstInvalid.focus()
			}
		})

		updatePasswordRules()
	})

	const classificationForm = document.querySelector('.inventory-form[action="/inv/add-classification"]')
	const classificationInput = document.getElementById("classification_name")
	const classificationError = document.getElementById("classification_name_error")

	if (classificationForm && classificationInput && classificationError) {
		const lettersOnlyPattern = /^[A-Za-z]+$/

		const setClassificationState = (message, showColor = true) => {
			const hasValue = classificationInput.value.trim() !== ""
			classificationInput.classList.toggle("input-invalid", showColor && Boolean(message))
			classificationInput.classList.toggle("input-valid", showColor && !message && hasValue)
			classificationError.textContent = message
			classificationError.classList.toggle("is-visible", Boolean(message))
			classificationInput.setAttribute("aria-invalid", message ? "true" : "false")
		}

		const validateClassification = (showColor = true) => {
			const value = classificationInput.value.trim()
			let message = ""

			if (!value) {
				message = "This field must be filled in."
			} else if (!lettersOnlyPattern.test(value)) {
				message = "Use letters only. No numbers, spaces, or special characters."
			}

			setClassificationState(message, showColor)
			return !message
		}

		classificationInput.addEventListener("input", () => validateClassification(true))
		classificationInput.addEventListener("blur", () => validateClassification(false))

		classificationForm.addEventListener("submit", (event) => {
			const isValid = validateClassification()
			if (!isValid) {
				event.preventDefault()
				classificationInput.focus()
			}
		})
	}

	const inventoryForm = document.querySelector('.inventory-form[action="/inv/add-inventory"], .inventory-form[action="/inv/update"]')

	if (inventoryForm) {
		const inventoryFields = [
			document.getElementById("classificationList"),
			document.getElementById("inv_make"),
			document.getElementById("inv_model"),
			document.getElementById("inv_description"),
			document.getElementById("inv_image"),
			document.getElementById("inv_thumbnail"),
			document.getElementById("inv_price"),
			document.getElementById("inv_year"),
			document.getElementById("inv_miles"),
			document.getElementById("inv_color"),
		].filter(Boolean)

		const getInventoryErrorMessage = (field) => {
			const rawValue = field.value
			const value = typeof rawValue === "string" ? rawValue.trim() : rawValue

			if (!value) return "This field must be filled in."

			switch (field.id) {
				case "classificationList":
					return value ? "" : "Please choose a classification."
				case "inv_make":
				case "inv_model":
					return value.length < 3 ? "Minimum 3 characters required." : ""
				case "inv_year":
					return /^\d{4}$/.test(value) ? "" : "Use a valid 4-digit year."
				case "inv_price": {
					const pricePattern = /^\d+(\.\d+)?$/
					return pricePattern.test(value)
						? ""
						: "Enter a valid price (example: 120 or 120.50)."
				}
				case "inv_miles": {
					const miles = Number(value)
					return Number.isInteger(miles) && miles >= 0 ? "" : "Enter mileage as 0 or greater."
				}
				default:
					return ""
			}
		}

		const setInventoryFieldState = (field, message, showColor = true) => {
			const errorElement = document.getElementById(`${field.id}_error`)
			const rawValue = field.value
			const hasValue = typeof rawValue === "string" ? rawValue.trim() !== "" : Boolean(rawValue)

			field.classList.toggle("input-invalid", showColor && Boolean(message))
			field.classList.toggle("input-valid", showColor && !message && hasValue)
			field.setAttribute("aria-invalid", message ? "true" : "false")

			if (errorElement) {
				errorElement.textContent = message
				errorElement.classList.toggle("is-visible", Boolean(message))
			}
		}

		inventoryFields.forEach((field) => {
			const eventName = field.tagName.toLowerCase() === "select" ? "change" : "input"
			field.addEventListener(eventName, () => {
				setInventoryFieldState(field, getInventoryErrorMessage(field), true)
			})
			field.addEventListener("blur", () => {
				setInventoryFieldState(field, getInventoryErrorMessage(field), false)
			})
		})

		inventoryForm.addEventListener("submit", (event) => {
			let hasError = false

			inventoryFields.forEach((field) => {
				const message = getInventoryErrorMessage(field)
				setInventoryFieldState(field, message, true)
				if (message) hasError = true
			})

			if (hasError) {
				event.preventDefault()
				const firstInvalid = inventoryFields.find((field) => field.classList.contains("input-invalid"))
				if (firstInvalid) firstInvalid.focus()
			}
		})
	}

	const inventoryManagementList = document.getElementById("classificationList")
	const inventoryDisplay = document.getElementById("inventoryDisplay")

	if (inventoryManagementList && inventoryDisplay) {
		inventoryManagementList.addEventListener("change", async () => {
			const classificationId = inventoryManagementList.value
			inventoryDisplay.innerHTML = ""

			if (!classificationId) {
				return
			}

			try {
				const response = await fetch(`/inv/getInventory/${classificationId}`)

				if (!response.ok) {
					throw new Error(`Request failed with status ${response.status}`)
				}

				const data = await response.json()
				let dataTable = "<thead><tr><th>Vehicle Name</th><th>Modify</th><th>Delete</th></tr></thead><tbody>"

				if (data.length === 0) {
					dataTable += '<tr><td colspan="3">No inventory items found for this classification.</td></tr>'
				} else {
					data.forEach((item) => {
						dataTable += `<tr><td>${item.inv_make} ${item.inv_model}</td>`
						dataTable += `<td><a href='/inv/edit/${item.inv_id}' title='Click to update'>Modify</a></td>`
						dataTable += `<td><a href='/inv/delete/${item.inv_id}' title='Click to delete'>Delete</a></td></tr>`
					})
				}

				dataTable += "</tbody>"
				inventoryDisplay.innerHTML = dataTable
			} catch (error) {
				console.error("Error fetching inventory data:", error)
				inventoryDisplay.innerHTML = '<tbody><tr><td colspan="3">Sorry, the inventory list could not be loaded.</td></tr></tbody>'
			}
		})
	}
})
