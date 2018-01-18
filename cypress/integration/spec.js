/* eslint-env mocha */
/* global cy, FormData, File */
describe('multipart/form-data upload', () => {
  beforeEach(() => {
    cy.visit('localhost:3000')
  })

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

    // remove "required" attribute from any file inputs
    // because it will stop form submission event
    cy.get('form input[type="file"]').each(input => {
      input.removeAttr('required')
    })

    // overwrite HTML submit action with
    // XHR request that we can modify to add any File we want to test with
    cy.get('form').then(form$ => {
      form$.on('submit', e => {
        // replace form submission with Ajax upload
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
        // 'post', '/upload'
        XHR.open(e.target.method, e.target.action)
        XHR.send(form)
        return true
      })
    })

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
