const express = require('express')
const multer  = require('multer')
const upload = multer({ dest: 'uploads/' })

const app = express()

app.post('/upload', upload.single('avatar'), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  console.log('/profile upload')
  console.log('req.file =', req.file)
  console.log('req.body', req.body)
  res.status(200).send('ok')
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))
