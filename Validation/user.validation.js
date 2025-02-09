import joi from 'joi'

export const registerValidate = joi.object({
    username : joi.string().min(2).max(15).trim().lowercase().required(),
    email : joi.string().email().trim().lowercase().required(),
    password : joi.string().min(8).required(),
    role : joi.string().optional(),
    resetCode : joi.string().optional(),
})
export const loginValidate = joi.object({
    email : joi.string().email().trim().lowercase().required(),
    password : joi.string().min(8).required(),
})