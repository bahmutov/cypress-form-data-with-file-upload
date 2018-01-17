const express = require('express')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

const app = express()

app.use(express.static('.'))

app.post('/upload', upload.single('fileToUpload'), function (req, res) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  console.log('/profile upload')
  console.log('req.file =', req.file)
  const name = req.file && req.file.originalname
  const email = req.body && req.body.userid
  console.log('req.body', req.body)
  res
    .send(
      `
    <html>
      <body>
        <p>Uploaded ${name || 'undefined'}</p>
        <p>for ${email || 'unknown'}</p>
      </body>
    </html>
  `
    )
    .end()
  // res.redirect('/success.html')
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))
