import Round from "../Models/Round.model.js";
import ApiError from './../Utills/ApiError.js';
import Students from "../Models/Student.model.js";

export const createRound = async (req , res , next ) =>{
    try {
        let {name} = req.body
        let data = await Round.findOne({name})
        if (data )
            return res.status(400).json({status : "fail" , data : `This Round Name : ${name} Is Avaliable !`})

        let round = new Round({
            name : name.toLowerCase() , 
            userId : req._id,
            totalOfStudents : 0
        })

        await round.save()
        res.status(201).json({status : "success" , data : round})
    } catch (error) {
        console.log(error);
        next(new ApiError (`Error From Create Round` , 500))
    }
}


export const getallRound = async (req , res , next) =>{
    console.log("Hello");
    
    try {
        let allRounds = await Round.find({})
        console.log(allRounds);
        
        if (allRounds.length == 0)
            return res.status(400).json({status : "fail" , data : `No Round Inserted Yet !`})

        // Update Student Number 
        // Array to store the results
        let results = [];

        // Iterate over each round
        for (let round of allRounds) {
            // Find the number of students in the current round
            let numberOfStudents = await Students.countDocuments({ roundId: round._id });

            // Push the result to the array
            results.push({
                roundName: round.name,
                roundId: round._id,
                totalStudents: numberOfStudents
            });
        }
        res.status(200).json({status : "success" , data  : results})


    } catch (error) {
        next( new ApiError(`Error From Get All Round` , 500))
    }
}

export const getOneRound = async (req , res , next) => {
    try {
        let {id} = req.params
        if (! id)
            return res.status(400).json({status : "fail" , data : "Must Provide Round ID "})
        let round = await Round.findById({_id  : id})
        if ( !round)
            return res.status(400).json({status : "fail" , data : `No Round With This ID : ${id}`})

        let numberofStudents = await Students.find({roundId : round._id})
        

        let result = {
            _id : round._id,
            userId : round.userId,
            name : round.name,
            totalStudent : numberofStudents.length
        }
        res.status(200).json({status : "success" , data : result})
    } catch (error) {
        next( new ApiError(`Error From Get One Round : ${error}` , 500))
    }
}


export const getRoundIDAndTotal = async (req , res , next )=>{
    let {name } = req.body
    try {
        name = name.toLowerCase()
        let roundData  = await Round.findOne({name : name})
        if (!roundData )
            return res.status(404).json({status : "fail" , data : `No Round With This Name : ${name}`})

        let numberofStudents = await Students.find({roundId : roundData._id})
        

        res.status(200).json({status : "success" , RoundID : roundData._id , totalOfStudents : numberofStudents.length} )
    } catch (error) {
        next ( new ApiError(`Error From Get Round ID ${error }`, 500 ))
    }
}



export const deleteStudentsInRound = async (req , res , next)=>{

    let {roundId} = req.params
    try {
        let roundData = await Round.findById({_id : roundId})
        if (! roundData)
            res.status(404).json({status : "fail" , data : `No Round With This ID : ${roundId}`})

        let allStudents = await Students.deleteMany({roundId : roundData._id})

        await Round.findByIdAndDelete({_id : roundData._id})
        
        res.status(200).json({status : "success" , data : `Students In Round ${roundData.name.toUpperCase()} Was Deleted Successfully ` , total : allStudents.deletedCount})
    } catch (error) {
        next(new ApiError(`Error From Delete Round : ${error} ` , 500))
    }
}

export const getTotalStudentInRound = async (req , res , next )=>{
    let {name} = req.body
    let roundData = await Round.findOne({name : name})
    if (! roundData)
        return res.status(404).json({status : "fail" , data : `No Round Name With This Name : ${name}`})

    let numberofStudents = await Students.find({roundId : roundData._id})
    if (numberofStudents.length == 0 )
        return res.status(404).json({status : "fail" , data : `No Students In This Round : ${name}`})

    res.status(200).json({status : "success" , total : numberofStudents.length})
}
// Update Round data and Delete Round and The Sudents in this Round
