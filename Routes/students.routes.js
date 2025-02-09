import express from "express";
import {
    addStudents,
    deleteStudentById,
    getAllStudentsInRound,
    getOneStudentUsingStuID,
    updateStudentByStudentID,
    updateStudents,
} from "../Controllers/student.Controller.js";
import {
    protectedRoutes,
    restrictToAdminOrSuperAdmin,
} from "../Middlewares/auth.middleware.js";
import { studentsFile } from "../Middlewares/uploadFile.js";
import { validation } from "../Middlewares/Vaidation.middleware.js";
import { studentValidate } from "../Validation/student.validation.js";
let studentRouter = express.Router();

// Handle Middleware if the user upload file skip the validation
const validateDataAfterUploadFile = (req, res, next) => {
    if (!req.file) {
        return validation(studentValidate)(req, res, next);
    }
    next();
};

// Get One Student Using His ID
studentRouter.route("/:id").get(getOneStudentUsingStuID);

studentRouter.use(protectedRoutes);

studentRouter
    .route("/add-student")
    .post(studentsFile.single("file"), validateDataAfterUploadFile, addStudents);

studentRouter
    .route("/update-student/:studentId")
    .patch(updateStudentByStudentID);

studentRouter
    .route("/update-all")
    .patch(studentsFile.single("file"), updateStudents);

studentRouter.route("/get-students/:round").get(getAllStudentsInRound);

studentRouter.use(restrictToAdminOrSuperAdmin);
studentRouter.route("/:studentId").delete(deleteStudentById);

export default studentRouter;
