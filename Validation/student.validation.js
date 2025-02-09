import joi from 'joi';

export const studentValidate = joi.object({
    userId : joi.string().trim().lowercase(),
    round : joi.string().min(2).max(25).trim().lowercase().required(),
    name : joi.string().min(2).trim().lowercase().required(),
    email : joi.string().email().trim().lowercase().optional(),
    phone : joi.string().trim().lowercase().required(),
    age : joi.number().optional(),
    total : joi.number().required(),
    rank : joi.number().required(),
    studentID : joi.string().trim().lowercase().required(),
    
})