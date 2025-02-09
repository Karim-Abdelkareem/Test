// Create Students Data By Uploads File
export const addStudentsToRound = async (req, res, next) => {
  try {
    let { roundName } = req.body;
    roundName = roundName.toLowerCase();

    let roundData = await Round.findOne({ name: roundName });

    if (!roundData)
      return res.status(400).json({
        status: "fail",
        data: `This Round: ${roundName} is not available in the database.`,
      });

    if (!req.file)
      return res.status(400).json({
        status: "fail",
        data: "Must provide a JSON file of student data.",
      });

    // Handle file upload
    const filepath = path.join(process.cwd(), req.file.path);
    const fileContent = fs.readFileSync(filepath, "utf8");
    const allData = JSON.parse(fileContent);

    // Validate the content of the file
    if (!Array.isArray(allData) || allData.length === 0)
      return res.status(400).json({
        status: "fail",
        data: "Student data must be an array of objects and not empty!",
      });

    // Format the student data to match the schema
    const formattedData = allData.map((student) => ({
      studentName: student.studentName,
      email: student.email || "",
      phone: student.phone,
      age: student.age || "",
      total: student.total,
      rank: student.rank,
    }));

    // Check if round already has student records
    let stuRecords = await Students.findOne({ roundId: roundData._id });

    if (stuRecords) {
      stuRecords.studentRecords.push(...formattedData);
      stuRecords.totalOfStudent = stuRecords.studentRecords.length;
    } else {
      stuRecords = new Students({
        roundId: roundData._id,
        userId: req._id,
        roundName: roundData.name,
        studentRecords: formattedData, // Ensure the structure matches the model
        totalOfStudent: formattedData.length,
      });
    }

    // Remove file after reading data
    fs.unlinkSync(filepath);

    await stuRecords.save();

    // Update the Round model
    roundData.studentsNumber = stuRecords.totalOfStudent;
    roundData.studentInRound.push(...formattedData);
    await roundData.save();

    res.status(201).json({ status: "success", data: stuRecords });
  } catch (error) {
    console.log(error);
    next(new ApiError("Error from creating student", 500));
  }
};

export const addOneStudent = async (req, res, next) => {
  try {
    let reqData = req.body;
    reqData.roundName = reqData.roundName.toLowerCase();

    let roundData = await Round.findOne({ name: reqData.roundName });
    if (!roundData)
      return res.status(400).json({
        status: "fail",
        data: `This Round : ${reqData.roundName}  Is Not Avaliable In Database`,
      });

    let studentobject = {
      studentName: reqData.studentName,
      email: reqData.email || "",
      phone: reqData.phone,
      age: reqData.age || "",
      total: reqData.total,
      rank: reqData.rank,
    };

    const stuArr = [studentobject];

    let studentData = await Students.findOne({ roundId: roundData._id });
    if (studentData) {
      studentData.studentRecords.push(...stuArr);
      studentData.totalOfStudent += stuArr.length;
    } else {
      studentData = new Students({
        userId: req._id,
        roundId: roundData._id,
        roundName: roundData.name,
        studentRecords: stuArr,
        totalOfStudent: stuArr.length,
      });
    }

    await studentData.save();
    // Update The Round Model
    roundData.studentsNumber = studentData.totalOfStudent;
    roundData.studentInRound.push(...stuArr);
    await roundData.save();

    res.status(201).json({ status: "fail", data: studentData });
  } catch (error) {
    console.log(error);
    next(new ApiError(`Error From Add One Student`, 500));
  }
};

    // try {
    //     let data = req.body;

    //     // Handle File Upload State
    //     if (req.file) {
    //         const filePath = path.join(process.cwd(), req.file.path);
    //         const fileContent = fs.readFileSync(filePath, "utf8");
    //         const allDataInFile = JSON.parse(fileContent);

    //         if (!Array.isArray(allDataInFile) || allDataInFile.length == 0 )  {
    //             return res.status(400).json({ status : "fail" , data: 'Invalid JSON format, expected an array' });
    //         }


    //         // Validation Errors And Duplicate Data The JSON File
    //         const errors = [];
    //         const phoneNumbersSet = new Set(); 
    //         const studentIDsSet = new Set();
    //         allDataInFile.forEach((student, index) => {
    //             if (!student.name || !student.phone || !student.total || !student.rank || !student.studentID || !student.round) {
    //                     errors.push({ index, message: 'Missing required fields' });
    //             }

    //             if (phoneNumbersSet.has(student.phone) ) {
    //                     errors.push({ index, message: 'Duplicate phone number in file' });
    //             } 
    //             else if (studentIDsSet.has(student.studentID)){
    //               errors.push({index , message : "Duplicate Student ID in file"})
    //             }
    //             else {
    //                     phoneNumbersSet.add(student.phone);
    //                     studentIDsSet.add(student.studentID)
    //             }
    //         });

    //         // Stop if there are validation errors
    //         if (errors.length > 0) {
    //             return res.status(400).json({ message: 'Validation errors', errors });
    //         }

    //         // Validate The Phone Number In The Database
    //         const studentsIdInData = allDataInFile.map(student => student.studentID);
    //         const existingStudents = await Students.find({ studentID: { $in: studentsIdInData } });

    //         if (existingStudents.length > 0) {
    //         // Find the duplicate Ids 
    //             const duplicateIDs = existingStudents.map(student => student.studentID);
    //             return res.status(400).json({ status : "fail" , data: 'Duplicate Students Id found In Database', duplicateIDs });
    //         }

    //         // Round Validate
    //         const roundNames = allDataInFile.map(student => student.round.toLowerCase());
    //         console.log(roundNames);
            
    //         const existingRounds = await Round.find({ name: { $in: roundNames } });

    //         const existingRoundNamesSet = new Set(existingRounds.map(round => round.name));

    //         const invalidRounds = allDataInFile
    //             .filter(student => !existingRoundNamesSet.has(student.round))
    //             .map(student => student.round);

    //         if (invalidRounds.length > 0) {
    //             return res.status(400).json({ status: "fail", data: `Invalid rounds found: ${[...new Set(invalidRounds)].join(", ")}` });
    //         }

    //          // Map round names to their IDs
    //         const roundMap = {};
    //         existingRounds.forEach(round => {
    //             roundMap[round.name] = round._id;
    //         });

    //          // Add userId and roundId to each student object
    //         const studentsWithUserId = allDataInFile.map(student => ({
    //             ...toLowerCaseObject(student),
    //             userId: req._id,
    //             roundId: roundMap[student.round]
    //         }));

    //          // Insert students into the database
    //         let students = await Students.insertMany(studentsWithUserId);
    //         return res.status(201).json({ status: "success", data: students });






    //         // // Add userId to each student object
    //         // const studentsWithUserId = allDataInFile.map((student) => ({
    //         //     ...toLowerCaseObject(student),
    //         //     userId: req._id,
    //         // }));
    //         // // console.log(studentsWithUserId);
            
    //         // let students = await Students.insertMany(studentsWithUserId);
    //         // res.status(201).json({ status: "success", data: students });
    //     }
        
    //     else {
    //         // Validate The Body 
    //         const studentData = toLowerCaseObject(data)
    //         // Add One Student To Database
    //         const existedStudentId = await Students.findOne({studentID : studentData.studentID})
    //         if (existedStudentId)
    //           return res.status(400).json({status : 'fail' , data : `This Student Was Founded In Database With This ID :${studentData.studentID}`})
            
    //         const existedStudentPhone = await Students.findOne({phone : studentData.phone})
    //         if (existedStudentPhone)
    //           return res.status(400).json({status : 'fail' , data : `This Student Was Founded In Database With This Phone :${studentData.phone}`})
            
    //         const roundData = await Round.findOne({name : studentData.round})
    //         if (! roundData)
    //           return res.status(400).json({status : "fail" , data : `No Round Name With This Name :${studentData.round}`})

    //         let newStudent = new Students({...studentData  , roundId : roundData._id , userId : req._id} )
    //         await newStudent.save()
    //         res.status(201).json({status : "success" , data : newStudent})
    //     }
    // } catch (error) {
    //         console.log(error);
    //         next(new ApiError(`Error From Add Students <br> ${error}`, 500));
    // }
  