/* global FormData, XMLHttpRequest */
// submit HTML form using XHR by constructing FormData
// https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/Sending_forms_through_JavaScript
//
// for examples see cypress/integration/spec.js
const attachFiles = (files, getWindow) => form$ => {
  if (!getWindow) {
    getWindow = () => null
  }

  let win
  getWindow().then(w => {
    win = w
  })

  // remove "required" attribute from any file inputs
  // because it will stop form submission event
  form$.find('input[type="file"]').each((k, input) => {
    input.removeAttribute('required')
  })

  form$.on('submit', e => {
    // replace form submission with Ajax upload
    e.preventDefault()

    // construct and upload FormData from form element
    // https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects
    const form = new FormData(e.target)

    Object.keys(files).forEach(name => {
      // the file input is empty, so delete it. We don't really have to
      // delete it, since we are going to add same name after this
      // and most servers are smart enough to keep the last value only
      form.delete(name)

      // and append given file instance instead
      form.append(name, files[name])
    })

    // add any desired custom fields using
    // form.append("name", value)

    // instead of directly using XHR in THIS TEST iframe
    // use reference to the XHR from the APP's iframe
    // this way Cypress can observe and spy on XHR
    const XHR = win ? new win.XMLHttpRequest() : new XMLHttpRequest()
    if (win) {
      XHR.onload = response => {
        // put the returned HTML page into the
        // app's iframe using document.write
        win.document.write(XHR.responseText)
        // and set the correct url using history.pushState
        // https://developer.mozilla.org/en-US/docs/Web/API/History_API#The_pushState()_method
        win.history.pushState({}, '', XHR.url)
      }
    }
    // method and action will be something like 'post', '/upload'
    XHR.open(e.target.method, e.target.action)
    XHR.send(form)
    return true
  })
}

module.exports = attachFiles
