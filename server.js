const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const morgan = require('morgan')
const { readdirSync } = require('fs')
require('dotenv').config()
const connectDB = require('./config/db')
connectDB()


const app = express()
app.use(morgan('dev'))
app.use(express.json())
app.use(cors())
readdirSync('./routes').map((router) => app.use('/', require('./routes/' + router)));
const port = process.env.PORT || 5000

app.listen(port, () => console.log('server running'))
