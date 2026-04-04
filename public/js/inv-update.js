const form = document.querySelector("#updateForm")

if (form) {
  const updateBtn = form.querySelector('button[type="submit"], input[type="submit"]')
  const trackedFields = Array.from(
    form.querySelectorAll("input:not([type='hidden']), select, textarea")
  )

  const getFieldValue = (field) => {
    if (field.type === "checkbox" || field.type === "radio") {
      return field.checked
    }

    return field.value
  }

  const initialValues = new Map(trackedFields.map((field) => [field.name || field.id, getFieldValue(field)]))

  const syncUpdateButton = () => {
    const hasChanges = trackedFields.some((field) => {
      const key = field.name || field.id
      return getFieldValue(field) !== initialValues.get(key)
    })

    if (updateBtn) {
      updateBtn.disabled = !hasChanges
    }
  }

  trackedFields.forEach((field) => {
    const eventName = field.tagName.toLowerCase() === "select" ? "change" : "input"
    field.addEventListener(eventName, syncUpdateButton)
    field.addEventListener("change", syncUpdateButton)
  })

  syncUpdateButton()
}