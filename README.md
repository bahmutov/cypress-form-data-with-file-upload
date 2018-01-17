Testing multipart file upload in Cypress

If the app uses "naked" HTML form submission with file input [index.html](index.html), the Cypress test [spec.js](cypress/integration/spec.js) can either replace the submission on the fly with XHR. The form can be constructed manually or using `FormData(forElement)`. Fake test file can be added to the form data in both cases.

**Tip:** use app's window's XMLHttpRequest object so your test can spy on the upload and its response.

## Instructions

- `npm install`
- start server [index.js](index.js) with `npm start`
- run Cypress with `npm test` or `npm run cy:run`

This code could be made into tiny little helper to answer https://github.com/cypress-io/cypress/issues/170
