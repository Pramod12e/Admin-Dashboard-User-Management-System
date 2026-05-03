const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const express = require("express");
const app = express();
const path=require("path");
const{v4:uuidv4}=require('uuid');
const methodOverride = require("method-override");
const session = require("express-session");
const bcrypt = require("bcrypt");
const cors = require("cors");

app.use(cors({
  origin: "http://127.0.0.1:5500",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));
app.use(express.static(path.join(__dirname,"public")));

app.use(session({
  secret:"secretkey",
  resave: false,
  saveUninitialized: false
}));

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'delta_app',
  password:'Pramod123i',
});

// //insertion of new data:
// let getRandomUser=()=> {
//   return [ faker.string.uuid(),
//      faker.internet.username(),
//      faker.internet.email(),
//      faker.internet.password(),
//   ];
    
// };

// let q = "insert into user(id,username,emal,password) values ?";
// let data=[];
// for(let i=1;i<=100;i++){
//   data.push(getRandomUser());//100 fake users database
// }

// try{
//     connection.query(q,(err,result)=>{
//         if(err) throw err;
//         console.log(result[0]["count(*)"]); 
//         res.send(result[0]["count(*)"]); 
//     });
//   }catch(err){
//       console.log(err);
//       res.send("some error in db");
//   }

//connection.end();


///signup route:
  app.post("/signup",async(req,res)=>{
    const{emal,username,password}=req.body;
    let id=uuidv4();
    let role="admin";
    console.log(req.body);
    const hashedPassword = await bcrypt.hash(password, 10);
        
    let q=`insert into user values("${id}","${username}","${emal}","${hashedPassword}","${role}")`;
    try{  
        connection.query(q,(err,result)=>{
           if (err) throw err;
            console.log(result);

          });
      } catch (err) {
        res.send("Email already exists or error");
      }
  });

///login:
app.post("/login",(req,res,)=>{
  const{emal, password}=req.body;
  console.log(req.body);
  const q=`select * from user where emal="${emal}"`;
  connection.query(q,async(err,result)=>{
    console.log(err);
    console.log(result);
    if(err || result.length===0){
      return res.json({ success: false, message: "User not found" });
    }
    const user = result[0];
    const match = await bcrypt.compare(password, user.password) 
    if (!match) {
       return res.json({ success: false, message: "Wrong password" });
    }
    if (user.role !== "admin") {
      return res.json({ success: false, message: "Not admin" });
    }

    // store session
    req.session.user = {
      id: user.id,
      emal: user.emal,
      role: user.role
    };
    res.json({success:true,emal: user.emal });
  });
});


////count
app.get("/count",(req,res)=>{
  const q =`select count(*) as total from user`;
  try{
    connection.query(q,(err,result)=>{
        if(err) throw err;
        res.json({ success: true, count: result[0].total }); 
    });
  }catch(err){
      console.log(err);
      return res.json({ success: false });
  }
  //no need to write connection.end();
});

//for home section count:
//admin count
app.get("/admin-count", (req, res) => {
  const q = "SELECT COUNT(*) AS total FROM user WHERE role='admin'";
  connection.query(q, (err, result) => {
    if (err) return res.json({ success: false });
    res.json({ success: true, count: result[0].total });
  });
});
//user count:
app.get("/user-count", (req, res) => {
  const q = "SELECT COUNT(*) AS total FROM user WHERE role='user'";
  connection.query(q, (err, result) => {
    if (err) return res.json({ success: false });
    res.json({ success: true, count: result[0].total });
  });
});

///show route
app.get("/user",(req,res)=>{
  let q=`select * from user`;
  try{
    connection.query(q,(err,result)=>{
        if(err) throw err;
        res.render("showuser.ejs",{result});
    });
  }catch(err){
      console.log(err);
      res.send("some error in db");
  }
});


//update(db) rout:
app.patch("/user/:id",(req,res)=>{
  let {id}=req.params;
  let {password:formPass,username:newUsername}=req.body;
  let q=`select * from user where id='${id}'`;
  try{
    connection.query(q,(err,result)=>{
        if(err) throw err;
        let user=result[0];
        if(formPass !=user.password){
          res.send("wrong password");
        }
        else{
          let q2=`update user set username='${newUsername}' where id='${id}'`;
          connection.query(q2,(err,result)=>{
            if(err) throw err;
            res.redirect("/user");
          })
        }
        
    });
  }catch(err){
      console.log(err);
      res.send("some error in db");
  }
 
});

//add user(form):
app.get("/user/new",(req,res)=>{
  res.render("new.ejs");
});

app.post("/user",(req,res)=>{
  let id=uuidv4();
  let {emal,username,password}=req.body;
  console.log(req.body);
  let q=`insert into user (id,username,emal,password) values("${id}","${username}","${emal}","${password}")`;

  try{
    connection.query(q,(err,result)=>{
        if(err) throw err;
        res.redirect("/user");
    });
  }catch(err){
      console.log(err);
      res.send("some error in db");
  }
});


//delete user:
app.delete("/user/:id",(req,res)=>{
  let{id}=req.params;
  let{password:enter_password}=req.body;
  let q=`select * from user where id='${id}'`;
  try{
    connection.query(q,(err,result)=>{
        if(err) throw err;
        let user=result[0];
        if(enter_password !=user.password){
          res.send("wrong password");
        }
        else{
          let q2=`delete from user where id='${id}'`;
          connection.query(q2,(err,result)=>{
            if(err) throw err;
            res.redirect("/user");
            console.log("delete sucessfully")
          })
        }
        
    });
  }catch(err){
      console.log(err);
      res.send("some error in db");
  }
 
});

//search user:
app.get("/search-user", (req, res) => {
  const emal = req.query.emal;

  const q = "SELECT * FROM user WHERE emal = ?";

  connection.query(q, [emal], (err, result) => {
    if (err || result.length === 0) {
      return res.json({ success: false });
    }

    res.json({ success: true, user: result[0] });
  });
});

///show admin:
app.get("/admin",(req,res)=>{
  let q=`select * from user where role="admin"`;
  try{
    connection.query(q,(err,result)=>{
        if(err) throw err;
        res.render("showadmin.ejs",{result});
    });
  }catch(err){
      console.log(err);
      res.send("some error in db");
  }
});





app.listen("3000",()=>{
  console.log("server is running");
})

// "c:\Program Files\MySql\MySql Server 8.0\bin\mysql.exe" -u root -p//use in sql in cls