import Students from "../Models/Student.model.js";
import Round from "../Models/Round.model.js";
import ApiError from "./../Utills/ApiError.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url"; // To work with ES Modules

// Function to convert object values to lowercase
const toLowerCaseObject = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      typeof value === "string" ? value.toLowerCase() : value,
    ])
  );
};

export const addStudents = async (req, res, next) => {
  try {
    let data = req.body;

    // Handle File Upload State
    if (req.file) {
      console.log(req.file);

      const filePath = path.join(process.cwd(), req.file.path);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const allDataInFile = JSON.parse(fileContent);

      // Validate JSON format
      if (!Array.isArray(allDataInFile) || allDataInFile.length === 0) {
        fs.unlinkSync(filePath); // Delete the file
        return res
          .status(400)
          .json({
            status: "fail",
            data: "Invalid JSON format, expected an array",
          });
      }

      // Convert round names to lowercase in the uploaded data
      allDataInFile.forEach((student) => {
        if (student.round) {
          student.round = student.round.toLowerCase();
        }
      });

      // Validation Errors And Duplicate Data In JSON File
      const errors = [];
      const studentIDsSet = new Set();

      allDataInFile.forEach((student, index) => {
        if (
          !student.name ||
          !student.phone ||
          !student.total ||
          !student.rank ||
          !student.studentID ||
          !student.round
        ) {
          errors.push({ index, message: "Missing required fields" });
        }
        if (studentIDsSet.has(student.studentID)) {
          errors.push({ index, message: "Duplicate Student ID in file" });
        } else {
          studentIDsSet.add(student.studentID);
        }
      });

      // Stop if there are validation errors
      if (errors.length > 0) {
        fs.unlinkSync(filePath); // Delete the file
        return res.status(400).json({ message: "Validation errors", errors });
      }

      // Validate The Student ID In The Database
      const studentsIdInData = allDataInFile.map(
        (student) => student.studentID
      );
      const existingStudents = await Students.find({
        studentID: { $in: studentsIdInData },
      });

      if (existingStudents.length > 0) {
        // Find the duplicate IDs
        const duplicateIDs = existingStudents.map(
          (student) => student.studentID
        );
        fs.unlinkSync(filePath); // Delete the file
        return res
          .status(404)
          .json({
            status: "fail",
            data: "Duplicate Students ID found In Database",
            duplicateIDs,
          });
      }

      // Validate Rounds Existence (Using Case-Insensitive Search)
      const roundNames = [
        ...new Set(allDataInFile.map((student) => student.round)),
      ];
      const existingRounds = await Round.find({
        name: { $in: roundNames.map((round) => new RegExp(`^${round}$`, "i")) }, // Case-insensitive search
      });

      const existingRoundNamesSet = new Set(
        existingRounds.map((round) => round.name.toLowerCase())
      );
      const invalidRounds = allDataInFile
        .filter((student) => !existingRoundNamesSet.has(student.round))
        .map((student) => student.round);

      if (invalidRounds.length > 0) {
        fs.unlinkSync(filePath); // Delete the file
        return res
          .status(400)
          .json({
            status: "fail",
            data: `Invalid rounds found: ${[...new Set(invalidRounds)].join(
              ", "
            )}`,
          });
      }

      // Map round names to their IDs
      const roundMap = {};
      existingRounds.forEach((round) => {
        roundMap[round.name.toLowerCase()] = round._id;
      });

      // Add userId and roundId to each student object
      const studentsWithUserId = allDataInFile.map((student) => ({
        ...toLowerCaseObject(student),
        userId: req._id,
        roundId: roundMap[student.round],
      }));

      // Insert students into the database
      let students = await Students.insertMany(studentsWithUserId);

      // Delete the file after successful insertion
      fs.unlinkSync(filePath);

      return res.status(201).json({ status: "success", data: students });
    } else {
      // Validate Single Student Data (Without File)
      const studentData = toLowerCaseObject(data);

      studentData.round = studentData.round.toLowerCase(); // Convert input round name to lowercase

      // Check if student already exists by ID or phone
      const existedStudentId = await Students.findOne({
        studentID: studentData.studentID,
      });
      if (existedStudentId) {
        return res
          .status(400)
          .json({
            status: "fail",
            data: `This Student already exists with ID: ${studentData.studentID}`,
          });
      }

      // const existedStudentPhone = await Students.findOne({ phone: studentData.phone });
      // if (existedStudentPhone) {
      //     return res.status(400).json({ status: "fail", data: `This Student already exists with phone: ${studentData.phone}` });
      // }

      // Check if round exists using case-insensitive query
      const roundData = await Round.findOne({
        name: new RegExp(`^${studentData.round}$`, "i"),
      });
      if (!roundData) {
        return res
          .status(400)
          .json({
            status: "fail",
            data: `No round found with this name: ${studentData.round}`,
          });
      }

      // Create and save new student
      let newStudent = new Students({
        ...studentData,
        roundId: roundData._id,
        userId: req._id,
      });
      await newStudent.save();

      res.status(201).json({ status: "success", data: newStudent });
    }
  } catch (error) {
    // Delete the file if it exists and an error occurs
    if (req.file) {
      const filePath = path.join(process.cwd(), req.file.path);
      fs.unlinkSync(filePath);
    }

    console.error(error);
    next(new ApiError(`Error in Add Students: ${error.message}`, 500));
  }
};

export const updateStudentByStudentID = async (req, res, next) => {
  try {
    let { studentId } = req.params;
    let updatedData = req.body;
    updatedData = toLowerCaseObject(updatedData);

    let existedStudent = await Students.findOne({ studentID: studentId });
    if (!existedStudent)
      return res
        .status(404)
        .json({
          status: "fail",
          data: `No Student With This ID : ${studentId}`,
        });

    console.log(existedStudent._id);
    let stu_id = existedStudent._id;
    const newStudentData = await Students.findByIdAndUpdate(
      stu_id,
      { ...updatedData },
      { new: true, runValidators: true }
    );

    res.status(200).json({ status: "success", data: newStudentData });
  } catch (error) {
    next(ApiError(`Error From Update Student ${error}`, 500));
  }
};

export const updateStudents = async (req, res, next) => {
  try {
    let data = req.body;

    if (!req.file)
      return res
        .status(400)
        .json({ status: "fail", data: `Must Provide Student JSON File` });

    const filePath = path.join(process.cwd(), req.file.path);
    const fileContent = fs.readFileSync(filePath, "utf8");
    const allDataInFile = JSON.parse(fileContent);

    if (!Array.isArray(allDataInFile) || allDataInFile.length === 0) {
      return res
        .status(400)
        .json({
          status: "fail",
          data: "Invalid JSON format, expected an array",
        });
    }

    const errors = [];
    for (const student of allDataInFile) {
      if (!student.studentID) {
        errors.push({
          studentID: student.studentID,
          message: "Missing studentID",
        });
        continue;
      }

      const updatedStudent = await Students.findOneAndUpdate(
        { studentID: student.studentID },
        { $set: toLowerCaseObject(student) },
        { new: true }
      );

      if (!updatedStudent) {
        errors.push({
          studentID: student.studentID,
          message: "Student not found",
        });
      }
    }

    if (errors.length > 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({ status: "fail", errors });
    }

    fs.unlinkSync(filePath);
    return res
      .status(200)
      .json({ status: "success", message: "Students updated successfully" });
  } catch (error) {
    console.log(error);
    next(new ApiError(`Error From Update Students <br> ${error}`, 500));
  }
};
export const getAllStudentsInRound = async (req, res, next) => {
  // Get the directory name in ES Modules
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  try {
    let { round } = req.params;

    // Fetch the students in the specific round
    const studentInRound = await Students.find({ roundId: round });
    if (studentInRound.length === 0) {
      return res.status(404).json({ status: 'fail', data: `No Students in This Round: ${round}` });
    }

    const totalOfStudents = studentInRound.length;

    // Save the data into a JSON file
    const filePath = path.join(__dirname, `../downloads/students_round_${round}.json`);
    const dataToSave = {
      round,
      total: totalOfStudents,
      data: studentInRound,
    };

    fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));

    // Send the file path or URL to the frontend for downloading
    res.status(200).json({
      status: 'success',
      total: totalOfStudents,
      data: studentInRound,
      downloadUrl: `/downloads/students_round_${round}.json`, // This will be the URL the frontend can use
    });
  } catch (error) {
    next(new ApiError(`Error from Get All Students: ${error}`, 500));
  }
};

export const getOneStudentUsingStuID = async (req, res, next) => {
  let { id } = req.params;
  try {
    let student = await Students.findOne({ studentID: id });
    if (!student)
      return res
        .status(404)
        .json({ status: "fail", data: `No Student With This ID : ${id}` });

    res.status(200).json({ status: "success", data: student });
  } catch (error) {
    next(new ApiError(`Error From Get One Student , ${error}  `, 500));
  }
};

export const deleteStudentById = async (req, res, next) => {
  const { studentId } = req.params;
  try {
    let studentData = await Students.findOne({ studentID: studentId });
    if (!studentData)
      return res
        .status(404)
        .json({
          status: "fail",
          data: `No Student With This ID : ${studentId}`,
        });

    await Students.findByIdAndDelete({ _id: studentData._id });
    return res
      .status(200)
      .json({
        status: "success",
        data: `Student Was Deleted Successfully `,
        student: studentData,
      });
  } catch (error) {
    next(ApiError(`Error From Delete Student : ${error}`, 500));
  }
};
