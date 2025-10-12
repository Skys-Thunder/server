import express from "express";
import https from "https";
import fs from "fs";
import cookieParser from "cookie-parser";
import path from "path";
import {fileURLToPath} from "url";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

dotenv.config();
const dirname=path.dirname(fileURLToPath(import.meta.url));
const app=express();
const supabase=createClient("https://vmpwfhgwhzwhlauhpwzh.supabase.co",process.env.supabase_key);
const sha256=(n)=>crypto.createHash("sha256").update(n).digest("hex");

async function islogin(req){
    const sessionid=req.cookies.sessionid;
    if(!sessionid) return {islogin:false};
    const dt=(await supabase.from("users").select("*").eq("sessionid",sessionid).limit(1)).data[0];
    if(!dt) return {islogin:false};
    if((Date.now()-new Date(dt.expire))/1000>60*60*24) return {islogin:false};
    return {islogin:true,profile:dt};
}

app.set("view engine","ejs");
app.use(express.static(path.join(dirname,"public")));
app.use(express.json());
app.use(rateLimit({windowMs:60/**1000*/,limit:60*5,message:"Too many requests!",standardHeaders:true}));
app.use(cookieParser());
app.use(async(req,res,next)=>{
    console.log(`${new Date().toLocaleString()} page:${req.url}`);
    // ipアクセス制限 console.log(req.ip);
    const lgdt=await islogin(req);
    res.locals.islogin=lgdt.islogin;
    if(lgdt.islogin){
        res.locals.username=lgdt.profile.username;
        res.locals.role=lgdt.profile.role;
    }
    next();
});
app.get("/",(req,res)=>{
    res.render("index");
});
app.get("/contact",(req,res)=>{
    res.render("contact");
})
app.post("/api/login",async(req,res)=>{
    const {username,password}=req.body;
    console.log(`${username} Login trying`);
    if(username.length>1000||password.length>1000) return res.status(413).json({success:false});
    const dt=(await supabase.from("users").select("*").eq("username",username).limit(1)).data[0];
    if(!dt) return res.status(403).json({success:false});
    if(dt.password==sha256(password)){
        const sessionid=crypto.randomBytes(16).toString("hex");
        await supabase.from("users").update({sessionid,expire:new Date().toISOString()}).eq("username",username);
        res.cookie("sessionid",sessionid,{httpOnly:true,secure:true,maxAge:24*60*60*1000});
        res.status(200).json({success:true,role:dt.role});
        console.log(`${username} Login succeeded!`);
    }
    else res.status(403).json({success:false});
});
app.get("/api/contact",async(req,res)=>{
    const lgdt=await islogin(req);
    if(!lgdt.islogin) return res.status(403).end();
    console.log(await supabase.from("contact").select("*"));
});
app.post("/api/contact",async(req,res)=>{
    const {email,message}=req.body;
    if(email.length>1000||message.length>1000) return res.status(413).json({success:false});
    await supabase.from("contact").insert([{email,message,date:new Date().toISOString()}]);
    res.status(200).json({success:true});
});
app.get("/login",(req,res)=>{
    // ログイン完了後、元のページに戻す実装をする！
    res.render("login");
})
app.get("/panel",async(req,res)=>{
    const logdt=await islogin(req);
    if(!logdt.islogin) return res.redirect("/login?redirect=/panel");
    if(logdt.profile.role!="admin") return res.status(403).end();
    res.render("panel");
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