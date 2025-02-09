import User from "../Models/User.model.js";
import ApiError from "../Utills/ApiError.js";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";

export const register = async (req, res, next) => {
  try {
    let user = req.body;
    console.log(user);
    let deplicatedEmail = await User.findOne({ email: user.email });
    if (deplicatedEmail)
      return res
        .status(404)
        .json({
          status: "fail",
          data: `This Email (${user.email}) Is Daplicated !`,
        });

    user.username = user.username.toLowerCase();
    let newUser = new User(user);
    await newUser.save();
    res.status(201).json({ status: "success", data: newUser });
  } catch (error) {
    console.log(error);
    next(new ApiError(`Error From Register `, 500));
  }
};

export const login = async (req, res, next) => {
  try {
    let { email, password } = req.body;

    if ((!email, !password))
      return res
        .status(404)
        .json({ status: "fail", data: `Must Provide Email And Password` });

    let user = await User.findOne({ email: email });
    if (!user)
      return res
        .status(404)
        .json({ status: "fail", data: `Incorrect Email or Password !` });

    let comparedPassword = await bcryptjs.compare(password, user.password);
    if (!comparedPassword)
      return res
        .status(404)
        .json({ status: "fail", data: `Incorrect Email or Password !` });

    const token = jwt.sign(
      {
        _id: user._id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_KEY,
      { expiresIn: "1d" }
    );

    res.status(200).json({ status: "success", token: `Bearer ${token}` , userId : user._id });

    
  } catch (error) {
    console.log(error);
    next(new ApiError(`Error From Login `, 500));
  }
};

export const logOut = async (req, res, next) => {
    res.cookie("jwt", null, {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });

    res.status(200).json({
        status: "success",
        message: "Successfully logged out",
    });
};

// (Protected Controllers)

export const getALLUsers = async (req, res, next) => {
  try {
    let users = await User.find();
    if (!users)
      return res
        .status(404)
        .json({ status: "fail", data: `No Users In Database !` });

    res.status(200).json({ status: "success", data: users });
  } catch (error) {
    console.log(error);
    next(new ApiError(`Error From Get All Users `, 500));
  }
};

export const getOneUser = async (req, res, next) => {
  try {
    let { id } = req.params;
    let user = await User.findById(id);

    if (!user)
      return res
        .status(404)
        .json({ status: "fail", data: `No User With This ID : ${id}` });

    res.status(200).json({ status: "success", data: user });
  } catch (error) {
    next(new ApiError(`Error From Get One User`, 500));
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validate the role value
    const validRoles = ["user", "admin", "super-admin"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        status: "fail",
        message: `Invalid role. Allowed roles are: ${validRoles.join(", ")}`,
      });
    }

    // Find the user by ID and update their role
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role }, // Update only the role field
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: "fail",
        message: `User with ID ${id} not found`,
      });
    }

    res.status(200).json({
      status: "success",
      message: "User role updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    let { id } = req.params;
    let user = await User.findById(id);
    if (!user)
      return res
        .status(404)
        .json({ status: "fail", data: `No User With This Id : ${id}` });

    await User.findByIdAndDelete(id);
    res
      .status(200)
      .json({
        status: "success",
        data: `User With This ID : ${id} Deleted Successfully `,
      });
  } catch (error) {
    next(new ApiError(`Error From Delete User `, 500));
  }
};
