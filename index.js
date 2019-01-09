//INCLUDES
const express = require('express');
const session = require('express-session');
const mysql = require('mysql');
const cookieParser = require('cookie-parser');
const MySQLStore = require('express-mysql-session')(session);
const bodyParser = require('body-parser');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const path = require('path');
const fs = require('fs');
const UXscript = require('./public/js/uxscript.js');

const options  = {
  host      :   '127.0.0.1',
  user      :   'root',
  password  :   '',
  //Delete double slash after you do the /createDatabase
  //database  :   'node_db'
};

const db = mysql.createConnection(options);

app.use(cookieParser());
app.use(session({secret:'shhhhhh'}));

db.connect((err) =>  {
  if(err) throw err;
  console.log('Database has been connected.')
});

app.set('view engine','ejs');
app.set('views', path.join(__dirname,'views'));
app.use(express.static(__dirname+'/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended   :  false}));

app.get('/', (req,res) => {
  req.session.destroy();
  res.render('index');
});

//Route for creatin table
//1st route
app.get('/createposttable',(req,res) => {
  let sql = 'CREATE TABLE posts(id int AUTO_INCREMENT, author VARCHAR(255), body VARCHAR(255), PRIMARY KEY (id))';
  db.query(sql, (err,result) => {
    if(err) throw err;
    console.log(result);
    res.send('You have inserted new table');
  });
});

//2nd route
app.get('/createuserstable',(req,res) => {
  let sql = 'CREATE TABLE users_tb(id int AUTO_INCREMENT, login VARCHAR(255), pass VARCHAR(255), email VARCHAR(255), city VARCHAR(255), PRIMARY KEY (id))';
  db.query(sql, (err,result) => {
    if(err) throw err;
    console.log(result);
    res.send('You have inserted new table');
  });
});
//Route for showing current table data
app.get('/show-data', (req,res) =>  {
  let sql = 'SELECT * FROM users_tb';
  db.query(sql, (err, result, fields) => {
    try{
      console.log(result);
      res.send('<h1>Table shown in the console...</h1>')
    }catch(err){
      throw err;
    }
  });
});

//Route for creating Database
app.get('/createDatabase',(req,res)  => {
  let sql = 'CREATE DATABASE node_db';
  db.query(sql,(err,result) =>  {
    if(err) throw err;
    console.log(result);
    res.send('Database has been created.');
  });
});


//Route for inserting data to the table
app.post('/insert',(req,res) =>  {

  let login = req.body.login.toLowerCase();
  let pass = req.body.password;
  let email = req.body.email.toLowerCase();
  let city = req.body.city.toLowerCase();


    let sqlCheck = "SELECT * FROM users_tb WHERE login = ? OR email = ?";

      db.query(sqlCheck,[login,email],(err,result)  =>  {
        if(err) throw err;
        if(result.length!=0){
                res.send('<h1>The user with this login/email exist</h1>');
        }else{
                let sqlInsert = "INSERT INTO users_tb(`login`,`pass`,`email`,`city`) VALUES (?,?,?,?)";
                db.query(sqlInsert,[login,pass,email,city],(err,result)  =>  {
                  if(err) throw err;
                  res.render('registration-complete');
                  console.log('You have inserted values');
                });
        }
      });

});

app.post('/login', (req,res)  =>  {

  let login = req.body.username;
  let password = req.body.pass;

  let sqlCheckExist = "SELECT * FROM users_tb WHERE login = ?";

    db.query(sqlCheckExist,[login],(err,result)  =>  {
      if(err)    throw err;
      if(result.length==0){
        res.send('<h1>The user with this nickname does not exist in the database</h1>');
      }else{
            let sqlCheckValidity = "SELECT * FROM users_tb WHERE login = ? AND pass = ?";
            db.query(sqlCheckValidity,[login,password],(err,result)   =>   {
              if(err)   throw err;
                  if(result.length!=0){
                      req.session.user = login;
                      req.session.msg = 'Drink wise, to not sober twice!';
                    res.redirect('/user-protected');
                  }else{
                    res.send('<h1>Invalid credentials. </h1>');
                  }
        });
      }
    });
});

app.get('/user-protected',(req,res) =>  {
  let sql = "SELECT * FROM users_tb WHERE login = ?";
  let login = req.session.user;

    if(login){
      db.query(sql,[login],(err,result)  =>   {
                      if(result.length!=0){
                                  let email = result[0].email;
                                        res.render('user-panel',{
                                          welcomeMsg : UXscript.sayHello(),
                                          username : login,
                                          email : email,
                                          msg : req.session.msg
                                        });
                        }else{
                          res.send('User data error');
                        }
        });
    }else{
      console.log('No user detected');
      res.redirect('/');
    }
});

app.get('/draw-chat', (req,res) =>  {
  let token = req.session.user;
  if(token){
    res.render('draw-room',{
      username        :   token,
      msgBackground   :   UXscript.pickColor()
    });
  }else{
    res.send('Please login in order to enter chat room');
  }
});

http.listen('3000',function(){
  console.log('App is running on port: 3000');
});

//sockets and chat room

let connections = [];

io.on('connection', function(socket){

  socket.on('chat msg', function(msg,username,color,time){
    io.emit('chat msg',msg,username,color,time);
  });
  socket.on('user join', function(user){
    connections.push(socket);
    io.emit('user join', user, connections.length);
  });
  socket.on('disconnect', function(user, data){
    connections.splice(connections.indexOf(socket), 1);
    io.emit('user left', user, connections.length);
  });

  //paintroom
  socket.on('draw',function(shape){
    io.emit('draw',shape);
  });
  /*
  socket.on('typing', function(user){
    io.emit('user typing',user);
    socket.on('stop typing', function(user){
      io.emit('user stop typing',user);
    });
  });
  */
});


app.get('/chat-room',(req,res)  =>  {
  let token = req.session.user;
  if(token){
    res.render('chat-room',{
      username        :   token,
      msgBackground   :   UXscript.pickColor()
    });
  }else{
    res.send('Please login in order to enter chat room');
  }
});

//sockets
