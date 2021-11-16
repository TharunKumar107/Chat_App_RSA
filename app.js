require('dotenv').config();

const express = require('express');
const app = express();


const session = require('express-session');

// path module

const path = require('path');

// body parser

const bodyParser= require('body-parser');

// bcrypt hash

const bcrypt = require('bcrypt');
const saltRounds = 10;

// url parser

const urlencodedParser = bodyParser.urlencoded({ extended: true });
app.use(bodyParser.json()); 

app.disable('x-powered-by');

app.use('/',express.static(path.join(__dirname,'views')));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname,'views'));
app.use(bodyParser.urlencoded({ extended: false }));


//session init
const IN_PROD = process.env.NODE_ENV === 'production'
app.use(session({
	name: process.env.SESS_NAME,
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESS_SECRET,
    proxy : true,
    cookie:{
        path: '/',
        maxAge: Number(process.env.SESS_LIFETIME),
        sameSite: true,
        secure: IN_PROD
    }
}));

// mySQL database connection

const mysql = require('mysql');

let connection = mysql.createConnection({
	host     : process.env.MYSQL_URL,
	user     : process.env.MYSQL_USERNAME,
	password : process.env.MYSQL_PASSWORD,
	database : process.env.MYSQL_DATABASE_ACC,
    typeCast: false
});


connection.connect((error) => {
    if(error){
        console.log(error);
    }
    else{
        console.log('Database Connected Sucessfully! [/]');
    }
});

// middle ware

const isSet = (req, res, next) =>{
    if (req.session.userId){
        next();
    }
    else{
        res.status(403).render(path.join(__dirname,'/views/index.ejs'),{error:'Unauthorized access!'});
    }
}


// redirectors

app.get('/', (req,res) =>{
    res.status(200).render(path.join(__dirname,'/views/index.ejs'),{error:null});
});

app.post('/', (req,res) =>{
    email = req.body.email
    password = req.body.pass, saltRounds;
    
    connection.query('SELECT password FROM login WHERE email = ?', [email] , (error, rows, fields)=>{
        if (error){
            return res.status(403).render(path.join(__dirname,'/views/index.ejs'),{error:"Some SQL error!"})
        }
        if (rows.length == 1){
            if(bcrypt.compareSync(password, rows[0].password)){
                
                req.session.userId = email;
                res.redirect('/dashboard');
            }
            else{
                res.status(403).render(path.join(__dirname,'/views/index.ejs'),{error:"Wrong username and/or password!"});
            }
        }else {
            res.status(403).render(path.join(__dirname,'/views/index.ejs'),{error:"Wrong username and/or password!"});
        }	

    })
});

app.get('/dashboard',isSet, (req,res) =>{
    res.status(200).render(path.join(__dirname,'/views/userdashboard.ejs'))
})

app.get('/view',isSet, (req,res) =>{
    res.status(200).render(path.join(__dirname,'/views/inbox.ejs'))
})

app.get('/send',isSet, (req,res) =>{
    res.status(200).render(path.join(__dirname,'/views/compose.ejs'))
})

app.post('/logout',isSet ,(req,res)=>{
    req.session.destroy(err => {
        if (err){
            return res.redirect('/dashboard');
        }
        res.clearCookie(process.env.SESS_NAME)
        res.status(200).render(path.join(__dirname,'/views/index.ejs'),{error:"You have been logged out successfully!"}); 
    })  
});



module.exports.app=app
// listener
const server = app.listen(process.env.PORT, ()=> console.log(`Listening on port ${process.env.PORT}...   http://localhost:${process.env.PORT}`)); 

process.on('SIGTERM', () => {
    server.close(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  })
