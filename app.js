const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const multer  = require('multer')
const PATH = './uploads/'
const fs = require('fs')
const path = require('path')
// router import
const user = require('./routes/user')
const app = express();
const FileStreamRotator = require('file-stream-rotator')

const logDirectory = path.join(__dirname, 'log')
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)
const rotateLogStream = FileStreamRotator.getStream({
  date_format: 'YYYYMMDD',
  filename: path.join(logDirectory,'access-%DATE%.log'),
  frequency: 'daily',
  verbose: false,
  max_logs: 10,
  size: '50k'
})
// const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});
// morgan.token('from',function(req,res){
//   return req.query.from || '-'
// })
morgan.token('body',function(req,res){
  return req.body ? JSON.stringify(req.body) : '-'
})
morgan.format('short', ':remote-addr :remote-user [:date[clf]] :method :body :url HTTP/:http-version :status :res[content-length] - :response-time ms');
app.use(express.json())
app.use(morgan('short', {
  stream: rotateLogStream,
  // stream: accessLogStream,
  // skip: function(req,res) { return res.statusCode < 400 }
}));

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