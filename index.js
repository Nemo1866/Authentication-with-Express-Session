const express=require("express")
const app=express()
const session=require("express-session")
const mongoose=require("mongoose")
const mongoDBConnect=require("connect-mongodb-session")(session)
const userModel=require("./model/users")
const bcrypt=require('bcrypt')

let uri="mongodb://127.0.0.1:27017/session"

app.use(express.json())

mongoose.connect(uri,()=>{
    console.log("Mongo DB is connected Sucessfully");
})

let store=new mongoDBConnect({
    uri:uri,
    collection:"mySessions"
})

app.use(session({
    secret:"This is my first session app",
    saveUninitialized:false,
    resave:false,
    store:store
}))


app.get("/",checkSession,(req,res)=>{
 
    res.send("Hello")
 
})

app.post("/api/register",(req,res)=>{
   const {username,email,password}=req.body
   let hashPassword=bcrypt.hashSync(password,10)
   let user=new userModel({
    username,
    email,
    password:hashPassword
   })
   user.save((err=>{
    if(!err){
        return res.json({
            message:"Sucessfully Saved in Database"
        })
    }else{
        res.json({
            message:"User With this email Already Exist"
        })
    }
   }))
})

app.post("/api/login",async (req,res)=>{
    const {email,password}=req.body

    let user=await userModel.findOne({email})
    if(!user){
        return res.json({
            message:"Invalid email or password, Please check and try again"
        })
    }
    let comparePassword=await bcrypt.compare(password,user.password)
    if(!comparePassword){
        return res.json({
            message:"Invalid email or password, Please check and try again"
        })
    }else{
        req.session.isAuth=true
        let id=req.session.id
        res.json({
            message:"User Login Sucessfully ",
            
            id:id
        })
    }

})
function checkSession(req,res,next){
   let id=req.session.isAuth
    if(id){
        next()
    }else{
        res.json({
            message:"Permission Denied"
        })
    }
}
app.delete("/",(req,res)=>{
    req.session.destroy(err=>{
        if(err){
           return res.json({
            
                message:"Cannot delete the session"
            })
        }else{
            return res.json({
                message:"Sucessfully deleted the session"
            })
        }
    })
})

app.listen(3000,()=>{
    console.log("Server is running on http://localhost:3000");
})