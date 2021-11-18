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

const {spawn} = require('child_process');

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
    res.status(200).render(path.join(__dirname,'/views/userdashboard.ejs'),{message:null})
})

app.get('/view',isSet, (req,res) =>{
    connection.query('SELECT * FROM messages WHERE email_to = ?', [req.session.userId] , (error, rows, fields)=>{
        if (error){
            return res.status(403).render(path.join(__dirname,'/views/userdashboard.ejs'),{message:"Some SQL error!"})
        }
        // console.log(rows)
        connection.query('SELECT * FROM public_key WHERE email = ?', [req.session.userId] , (error1, rows1, fields1)=>{
            if (error1){
                return res.status(403).render(path.join(__dirname,'/views/userdashboard.ejs'),{message:"Some SQL error!"})
            }
            else{
                const process = spawn('python', [path.join(__dirname,'/programs/srnnDecrypt.py'), JSON.stringify(rows) ,rows1[0].n,rows1[0].e,rows1[0].ua,rows1[0].d,rows1[0].a,rows1[0].u,rows1[0].r]);
                process.stdout.on('data', function (data) {

                    const result = JSON.parse(data);
                    return res.status(200).render(path.join(__dirname,'/views/inbox.ejs'),{messageSet:result});
                })
                process.stderr.on('data', function(data){
                    console.log("error: ",data.toString())
                });
            }
        })
    })
})

app.get('/send',isSet, (req,res) =>{
    res.status(200).render(path.join(__dirname,'/views/compose.ejs'))
})

app.post('/send',isSet, (req,res) =>{
    recipient = req.body.recipient
    message = req.body.text
    connection.query('SELECT email FROM login WHERE email = ?', [recipient] , (error, rows, fields)=>{
        if (error){
            return res.status(403).render(path.join(__dirname,'/views/userdashboard.ejs'),{message:"Some SQL error!"})
        }
        if((!(recipient===req.session.userId)) && (recipient===rows[0].email)){
            connection.query('SELECT * FROM public_key WHERE email = ?', [recipient] , (error, rows, fields)=>{
                const process = spawn('python', [path.join(__dirname,'/programs/srnnEncrypt.py'), message,rows[0].n,rows[0].e,rows[0].ua]);
                process.stdout.on('data', function (data) {
                    encryptedMsg = data.toString();
                    encryptedMsg = encryptedMsg.replace(/(\r\n|\n|\r)/gm, "");
                    connection.query('INSERT INTO messages(email_from, email_to, message) VALUES (?, ?, ?)', [req.session.userId,recipient,encryptedMsg] , (error, rows, fields)=>{
                        if (error){
                            console.log(error)
                            return res.status(403).render(path.join(__dirname,'/views/userdashboard.ejs'),{message:"Some SQL error!"})
                        }
                        return res.status(200).render(path.join(__dirname,'/views/userdashboard.ejs'),{message:"Message sent successfully!"})
                    })
                });
                process.stderr.on('data', function(data){
                    console.log("error: ",data.toString())
                })
            })
        }
        else{
            return res.status(200).render(path.join(__dirname,'/views/userdashboard.ejs'),{message:"Wrong recipient! Try again!"})
        }           
    })

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
