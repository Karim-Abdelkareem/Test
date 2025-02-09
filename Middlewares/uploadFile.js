import multer from 'multer'
import path from 'path'
let fileStorage = multer.diskStorage({
    destination : function (req , file , cb){
        cb(null , 'public/')
    },
    
})

export let studentsFile = multer({
    storage : fileStorage , 
    fileFilter : (req , file , cb )=>{
        // console.log(file);
        
        if (file.mimetype === 'application/json')
            cb(null , true)
        else {
            cb(new Error(`Must Upload JSON File !`) , null)
        }
    }
})

