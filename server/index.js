const express = require('express')
const multer = require('multer')
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: function (req, file, cb) {
    console.log('storing file', file)
    console.log('under name', file.originalname)
    cb(null, file.originalname)
  }
})
const upload = multer({ storage })

const app = express()

app.use(express.static(__dirname))

app.post('/upload', upload.single('fileToUpload'), function (req, res) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  console.log('/profile upload')
  console.log('req.headers', req.headers)
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
