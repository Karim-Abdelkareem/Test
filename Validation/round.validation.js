import joi from 'joi'

export const roundValidate = joi.object({
    name : joi.string().min(2).max(15).trim().lowercase().required(),
    
})
