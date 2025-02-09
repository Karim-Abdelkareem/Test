import mongoose from "mongoose";
import bcryptjs from 'bcryptjs'


let userSchema = new mongoose.Schema(
    {
        username: { type: String },
        email: { type: String },
        password: { type: String },
        role : {type : String , enum : ['user' , 'admin' , 'super-admin'] , default : "user" },
        resetCode : {type : String }
    },
    { timestamps: true, collection: "User" }
);


// Hash Password
userSchema.pre('save' , async function (next){
    let user = this 
    if (! user.isModified('password' )){
        return next()
    }
    user.password = await bcryptjs.hash(user.password , 8)
    next()
} )

let User = mongoose.model('User' , userSchema)
export default User   