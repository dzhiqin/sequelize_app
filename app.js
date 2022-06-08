const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const multer  = require('multer')
const PATH = './uploads/'

// router import
const user = require('./routes/user')
const app = express();

app.use(express.json())
app.use(morgan('tiny'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, PATH);
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(' ').join('-');
    cb(null, fileName)
  }
});
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
      if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/gif") {
          cb(null, true);
      } else {
          cb(null, false);
          return cb(new Error('Allowed only .png, .jpg, .jpeg and .gif'));
      }
  }
});
// Routing
app.use('/api', user)

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to  application." });
});

app.post('/add', upload.single('image'), (req, res, next) => {
  console.log('upload res',res);
  res.json({message: 'success'})
})

// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});