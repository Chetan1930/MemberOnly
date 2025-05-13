require('dotenv').config();
const path = require('path');
const express = require('express');
const app = express();
const routepath= require('./routes/index');
const { urlencoded } = require('body-parser');


const connectDB = require('./db/mongo'); // Import MongoDB connection
connectDB(); 

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({extended:true}));

// Route handler
app.use('/',routepath);

const PORT= process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
