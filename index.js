require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const app = express()
const port = 3000
const ContactRequest = require('./models/ContactRequest.js')

app.use(express.static('public'))
app.use(express.json())

mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true, useUnifiedTopology: true })
const db = mongoose.connection
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to MongoDB'))

app.get('/', async (req, res) => {
    res.end('PML')
});

app.get('/contact-requests', (req, res) => {
    res.end('CONTACT-REQUESTS')
})

app.get('/contact-requests/:id', (req, res) => {
    res.end('ID CONTACT')
})

app.post('/contact-requests', (req, res) => {
    res.end('POST CONTACT')
})

app.patch('/contact-requests/:id', (req, res) => {
    res.end('patch')
})

app.delete('/contact-requests/:id', (req, res) => {
    res.end('delete')
})

app.listen(port, () => {
    console.log(`REST API server running at http://localhost:${port}`)
  });