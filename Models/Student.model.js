import mongoose from "mongoose";



let studentSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Types.ObjectId, ref: "User"},
        roundId: { type: mongoose.Types.ObjectId, ref: "Round"},
        round: { type: String,},
        studentID : {type : Number , unique : true , required : true , trim : true},
        name: { type: String, trim: true, required: true },
        email: { type: String, trim: true },
        phone: { type: String, trim: true, required: true, },
        age: { type: String, trim: true },
        total: { type: String, trim: true, required: true },
        rank: { type: String, trim: true, required: true },
    },
    {
        timestamps: true,
        collection: "Students",
    }
);

// Pre-save hook to convert all string fields to lowercase
studentSchema.pre('save', function (next) {
    // Loop through each field in the schema
        for (let key in this.toObject()) {
            if (typeof this[key] === 'string') {
                this[key] = this[key].toLowerCase();
            }
        }
        next();
});

let Students = mongoose.model("Students", studentSchema);
export default Students;
