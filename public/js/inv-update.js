document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#updateForm")

  if (!form) return

  const updateBtn = form.querySelector('button[type="submit"], input[type="submit"]')
  if (!updateBtn) return

  const trackedFields = Array.from(form.elements).filter((field) => {
    if (!field || !field.tagName || field.disabled) return false
    if (!["INPUT", "SELECT", "TEXTAREA"].includes(field.tagName)) return false
    if (["hidden", "submit", "button", "reset"].includes(field.type)) return false
    return true
  })

  const normalizeValue = (value) => String(value ?? "").replace(/\r\n/g, "\n").trim()

  const getCurrentValue = (field) => {
    if (field.type === "checkbox" || field.type === "radio") {
      return field.checked ? "checked" : ""
    }

    if (field.tagName === "SELECT" && field.multiple) {
      return Array.from(field.selectedOptions).map((option) => option.value).join("|")
    }

    return normalizeValue(field.value)
  }

  const getInitialValue = (field) => {
    if (field.type === "checkbox" || field.type === "radio") {
      return field.defaultChecked ? "checked" : ""
    }

    if (field.tagName === "SELECT" && field.multiple) {
      return Array.from(field.options)
        .filter((option) => option.defaultSelected)
        .map((option) => option.value)
        .join("|")
    }

    if (field.tagName === "SELECT") {
      const defaultOption = Array.from(field.options).find((option) => option.defaultSelected)
      return normalizeValue(defaultOption ? defaultOption.value : field.value)
    }

    return normalizeValue(field.defaultValue)
  }

  const initialValues = new Map(trackedFields.map((field) => [field, getInitialValue(field)]))
  let hasUserInteracted = false

  const syncUpdateButton = () => {
    const hasChanges = trackedFields.some((field) => getCurrentValue(field) !== initialValues.get(field))
    updateBtn.disabled = !hasUserInteracted || !hasChanges
    updateBtn.classList.toggle("is-disabled", updateBtn.disabled)
  }

  updateBtn.disabled = true
  updateBtn.classList.add("is-disabled")

  trackedFields.forEach((field) => {
    const handleInteraction = () => {
      hasUserInteracted = true
      syncUpdateButton()
    }

    field.addEventListener("input", handleInteraction)
    field.addEventListener("change", handleInteraction)
  })

  form.addEventListener("reset", () => {
    hasUserInteracted = false
    window.setTimeout(syncUpdateButton, 0)
  })

  syncUpdateButton()
})