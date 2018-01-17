/* eslint-env mocha */
/* global cy, FormData, File, FileReader, XMLHttpRequest */
describe('multipart/form-data upload', () => {
  beforeEach(() => {
    cy.visit('localhost:3000')
  })

  function fileToBinary (file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.addEventListener('load', function () {
        resolve(reader.result)
      })
      reader.readAsBinaryString(file)
    })
  }

  // construct XHR and multipart data ourselves
  function sendData (filename, file) {
    // If there is a selected file, wait it is read
    // If there is not, delay the execution of the function
    // To construct our multipart form data request,
    // We need an XMLHttpRequest instance
    return fileToBinary(file).then(contents => {
      var XHR = new XMLHttpRequest()

      // We need a separator to define each part of the request
      var boundary = 'blob'

      // Store our body request in a string.
      var data = ''

      // So, if the user has selected a file
      if (file) {
        // Start a new part in our body's request
        data += '--' + boundary + '\r\n'

        // Describe it as form data
        data +=
          'content-disposition: form-data; ' +
          // Define the name of the form data
          'name="' +
          filename +
          '"; ' +
          // Provide the real name of the file
          'filename="' +
          file.name +
          '"\r\n'
        // And the MIME type of the file
        data += 'Content-Type: ' + file.type + '\r\n'

        // There's a blank line between the metadata and the data
        data += '\r\n'

        // Append the binary data to our body's request
        data += contents + '\r\n'
      }

      // Text data is simpler
      // Start a new part in our body's request
      data += '--' + boundary + '\r\n'

      // Say it's form data, and name it
      data += 'content-disposition: form-data; name="' + 'submit' + '"\r\n'
      // There's a blank line between the metadata and the data
      data += '\r\n'

      // Append the text data to our body's request
      data += 'Upload Image' + '\r\n'

      // Once we are done, "close" the body's request
      data += '--' + boundary + '--'

      // Set up our request
      XHR.open('POST', '/upload')

      // Add the required HTTP header to handle a multipart form data POST request
      XHR.setRequestHeader(
        'Content-Type',
        'multipart/form-data; boundary=' + boundary
      )

      // And finally, send our data.
      XHR.send(data)
    })
  }

  // better yet - submit using XHR the FormData
  // constructed from the form + test file
  // https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/Sending_forms_through_JavaScript
  it('works', () => {
    // spy on XHR calls
    cy.server()
    cy.route('POST', '/upload').as('upload')

    cy.get('input[name="userid"]').type('foo@bar.com')

    let win
    cy.window().then(w => {
      win = w
    })

    cy.get('form').then(form$ => {
      form$.on('submit', e => {
        // replace app's submission with Ajax upload
        e.preventDefault()

        // construct and upload FormData from form element
        // https://developer.mozilla.org/en-US/docs/Web/API/FormData/Using_FormData_Objects
        const form = new FormData(e.target)

        // the file input is empty, so delete it. We don't really have to
        // delete it, since we are going to add same name after this
        // and most servers are smart enough to keep the last value only
        form.delete('fileToUpload')
        // and append test file to upload
        form.append(
          'fileToUpload',
          new File(['foo bar'], 'test-file.txt', { type: 'text/plain' })
        )

        // add any desired custom fields using
        // form.append("name", value)

        // instead of directly using XHR in THIS TEST iframe
        // use reference to the XHR from the APP's iframe
        // this way Cypress can observe and spy on XHR
        const XHR = new win.XMLHttpRequest()
        XHR.onload = response => {
          // put the returned HTML page into the
          // app's iframe using document.write
          win.document.write(XHR.responseText)
          // and set the correct url using history.pushState
          // https://developer.mozilla.org/en-US/docs/Web/API/History_API#The_pushState()_method
          win.history.pushState({}, '', XHR.url)
        }
        XHR.open('POST', '/upload')
        XHR.send(form)
        return true
      })
    })

    // we can construct upload form ourselves
    // cy.get('form').then(form$ => {
    //   form$.on('submit', (e) => {
    //     e.preventDefault()
    //     const f = new File(['foo bar'], 'test-file.txt')
    //     // transform HTML form submission into
    //     // AJAX multiform submission
    //     sendData('fileToUpload', f)
    //   })
    // })

    cy.get('input[type="submit"]').click()

    // check upload response
    cy
      .get('@upload')
      .its('response.body')
      .should('include', 'Uploaded test-file.txt')
      .and('include', 'for foo@bar.com')

    // check current url and page
    cy.url().should('match', /upload$/)
    cy.contains('Uploaded test-file.txt')
    cy.contains('for foo@bar.com')
  })
})
