import express from "express";
import {
    login,
    register,
    getALLUsers,
    getOneUser,
    updateUserRole,
    deleteUser,
    logOut,
} from "../auth/user.controller.js";
import { validation } from "../Middlewares/Vaidation.middleware.js";
import {
    loginValidate,
    registerValidate,
} from "../Validation/user.validation.js";
import {
    protectedRoutes,
    restrictedTo,
    restrictToAdminOrSuperAdmin,
} from "../Middlewares/auth.middleware.js";

const authRouter = express.Router();

authRouter.route("/register").post(validation(registerValidate), register);
authRouter.route("/login").post(validation(loginValidate), login);

authRouter.route('/get-one/:id').get(getOneUser)
// Protected Routes
authRouter.route("/").get( getALLUsers);

authRouter.use(protectedRoutes);
authRouter.route('/logout').post(logOut)
authRouter.use(restrictToAdminOrSuperAdmin)
authRouter
    .route("/:id")
    .patch( updateUserRole)
    .delete( deleteUser);

export default authRouter;
