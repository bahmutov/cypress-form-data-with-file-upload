// constructs XHR request with multipart form manually

/* global FileReader, XMLHttpRequest */
function fileToBinary (file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.addEventListener('load', function () {
      resolve(reader.result)
    })
    reader.readAsBinaryString(file)
  })
}

// Construct XHR with multipart data ourselves and send
//
// Example:
// cy.get('form').then(form$ => {
//   form$.on('submit', (e) => {
//     e.preventDefault()
//     const f = new File(['foo bar'], 'test-file.txt')
//     // transform HTML form submission into
//     // AJAX multiform submission
//     sendMultiPartFormData('fileToUpload', f)
//   })
// })
function sendMultiPartFormData (filename, file) {
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

module.exports = sendMultiPartFormData
