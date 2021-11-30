require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const app = express()
const port = 3000
const ContactRequestRouter = require('./Router/ContactRequestRouter')
const UserRouter = require('./Router/UserRouter');
const ReviewRouter = require('./Router/ReviewRouter');

app.use(express.static('public'))
app.use(express.json())

mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection

db.on('error', (error) => console.error(error))
db.once('open', () => {
    console.log("Connected to DB");
})

app.use(ContactRequestRouter);
app.use(UserRouter)
app.use(ReviewRouter)

app.listen(port, () => {
    console.log(`REST API server running at http://localhost:${port}`)
  });