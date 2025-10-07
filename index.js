import express from "express";
import https from "https";
import fs from "fs";
import cookieParser from "cookie-parser";
import path from "path";
import {fileURLToPath} from "url";
import crypto from "crypto";
import sqlite3 from "sqlite3";

const dirname=path.dirname(fileURLToPath(import.meta.url));
const app=express();
const db=new sqlite3.Database("data.sqlite3");
const sha256=(n)=>crypto.createHash("sha256").update(n).digest("hex");

function islogin(req){
    return new Promise(resolve=>{
        const sessionid=req.cookies.sessionid;
        if(!sessionid) return resolve({islogin:false});
        db.get("select * from users where sessionid = ?",[sessionid],(err,dt)=>{
            if(!dt) return resolve({islogin:false});
            if((Date.now()-dt.expire)/1000>60*60*24) return resolve({islogin:false});
            return resolve({islogin:true,profile:dt});
        })
    });
}

app.set("view engine","ejs");
app.use(express.static(path.join(dirname,"public")));
app.use(express.json());
app.use(cookieParser());
app.use(async(req,res,next)=>{
    console.log(`${new Date().toLocaleString()} page:${req.url}`);
    const lgdt=await islogin(req);
    res.locals.islogin=lgdt.islogin;
    if(lgdt.islogin){
        res.locals.username=lgdt.profile.username;
        res.locals.role=lgdt.profile.role;
    }
    next();
});
app.get("/",(req,res)=>{
    res.render("index.ejs");
});
app.post("/api/login",(req,res)=>{
    const {username,password}=req.body;
    db.serialize(()=>{
        db.get("select * from users where username = ?",[username],(err,dt)=>{
            console.log(`${username} Login trying`);
            if(!dt) return res.status(403).json({success:false});
            if(dt.password==sha256(password)){
                const sessionid=crypto.randomBytes(16).toString("hex");
                res.cookie("sessionid",sessionid,{httpOnly:true,secure:true,maxAge:24*60*60*1000});
                res.status(200).json({success:true,role:dt.role});
                db.run("update users set sessionid = ?, expire = ? where username = ?",[sessionid,Date.now(),username]);
                console.log(`${dt.username} Login succeed!`);
            }
            else res.status(403).json({sucess:false});
        })
    });
});
app.get("/login",(req,res)=>{
    // ログイン完了後、元のページに戻す実装をする！
    res.render("login");
})
app.get("/panel",async(req,res)=>{
    const logdt=await islogin(req);
    if(!logdt.islogin) return res.redirect("/login");
    if(logdt.profile.role!="admin") return res.status(403).end();
    res.render("panel.ejs");
});
app.get("/article/:slug",(req,res)=>{
    console.log(req.params.slug);
    res.send(req.params.slug);
})
app.use((req,res)=>{
    res.status(404).render("404");
});
app.listen(process.env.port||443,()=>{
    console.log("STARTED");
});
//https.createServer({key:fs.readFileSync("certificate/privkey.pem"),cert:fs.readFileSync("certificate/fullchain.pem")},app).listen(443,()=>{
//    console.log("STARTED");
//});