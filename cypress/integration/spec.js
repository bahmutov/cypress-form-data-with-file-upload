/* eslint-env mocha */
/* global cy, File, Cypress */
const attachFiles = require('../..')

describe('multipart/form-data', () => {
  beforeEach(() => {
    cy.visit('localhost:3000')
  })

  it('upload', () => {
    // we can enter info into the form fields
    cy.get('input[name="userid"]').type('foo@bar.com')

    // files to upload for each input[type="file"] name
    // we are going to construct a single text file
    const files = {
      fileToUpload: new File(['foo bar'], 'test-file.txt', {
        type: 'text/plain'
      })
    }
    // get the form element and attach files to upload
    cy.get('form').then(attachFiles(files))

    // submit the form
    cy.get('input[type="submit"]').click()

    // check saved file
    cy.readFile('uploads/test-file.txt').should('equal', 'foo bar')

    // check current url
    cy.url().should('match', /upload$/)

    // check new page contents
    cy.contains('Uploaded test-file.txt')
    cy.contains('for foo@bar.com')
  })

  if (Cypress.platform === 'linux') {
    it('upload with spying fails to spy on Travis')
  } else {
    it('upload with spying', () => {
      // spy on XHR calls
      cy.server()
      cy.route('POST', '/upload').as('upload')

      // we can enter info into the form fields
      cy.get('input[name="userid"]').type('foo@bar.com')

      // files to upload for each input[type="file"] name
      // we are going to construct a single text file
      const files = {
        fileToUpload: new File(['foo bar'], 'test-file.txt', {
          type: 'text/plain'
        })
      }
      // get the form element and attach files to upload
      cy.get('form').then(attachFiles(files))

      // submit the form
      cy.get('input[type="submit"]').click()

      // check upload response
      cy
        .get('@upload')
        .its('response.body')
        .should('include', 'Uploaded test-file.txt')
        .and('include', 'for foo@bar.com')
    })
  }
})
