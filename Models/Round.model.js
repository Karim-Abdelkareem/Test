import mongoose from "mongoose";

let roundSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            unique : true,
        },
        userId: {
            type: mongoose.Types.ObjectId,
            ref: "User",
        },
        totalOfStudents : {type : Number},
    },
    { timestamps: true, collection: "Round" }
);

let Round = mongoose.model('Round' , roundSchema)
export default Round 