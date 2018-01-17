/* eslint-env mocha */
/* global cy, File, FileReader, XMLHttpRequest */
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
  function sendData (filename, file) {
    // If there is a selected file, wait it is read
    // If there is not, delay the execution of the function
    // To construct our multipart form data request,
    // We need an XMLHttpRequest instance
    return fileToBinary(file).then(contents => {
      var XHR = new XMLHttpRequest()
      
      // We need a separator to define each part of the request
      var boundary = 'blob';

      // Store our body request in a string.
      var data = '';

      // So, if the user has selected a file
      if (file) {
        // Start a new part in our body's request
        data += '--' + boundary + '\r\n';

        // Describe it as form data
        data += 'content-disposition: form-data; ' +
        // Define the name of the form data
        'name="' + filename + '"; ' +
        // Provide the real name of the file
        'filename="' + file.name + '"\r\n'
        // And the MIME type of the file
        data += 'Content-Type: ' + file.type + '\r\n'
        
        // There's a blank line between the metadata and the data
        data += '\r\n'
        
        // Append the binary data to our body's request
        data += contents + '\r\n'
      }

      // Text data is simpler
      // Start a new part in our body's request
      data += '--' + boundary + '\r\n';

      // Say it's form data, and name it
      data += 'content-disposition: form-data; name="' + 'submit' + '"\r\n'
      // There's a blank line between the metadata and the data
      data += '\r\n'
      
      // Append the text data to our body's request
      data += 'Upload Image' + '\r\n';

      // Once we are done, "close" the body's request
      data += '--' + boundary + '--';

      // Set up our request
      XHR.open('POST', '/upload')
      
      // Add the required HTTP header to handle a multipart form data POST request
      XHR.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary)
      
      // And finally, send our data.
      XHR.send(data)
    })
  }

  // https://developer.mozilla.org/en-US/docs/Learn/HTML/Forms/Sending_forms_through_JavaScript
  it('works', () => {
    cy.get('form').then(form$ => {
      form$.on('submit', (e) => {
        e.preventDefault()
        const f = new File(['foo bar'], 'test-file.txt')
        sendData('fileToUpload', f)
      })
    })
    cy.get('input[type="submit"]').click()
    cy.get('@upload').its('response.body').should('equal', 'Uploaded test-file.txt')
  })
})
