const express = require('express');
const cors = require('cors');
const {connect} = require('mongoose');
require('dotenv').config();
const app = express();
const mongoose = require('mongoose')
const userRoutes = require('./routes/userRoutes')
app.use(express.json());
app.use(cors());


app.use('/api/users' , userRoutes);

app.use('/', (req,res)=>{
    res.send("Hello World")
})





mongoose.connect(process.env.MONGO_URI).then(app.listen(process.env.PORT || 5000 , () =>{
    console.log(`Server started on port ${process.env.PORT}`)})).catch(error => console.log(error))

