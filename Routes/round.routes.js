import express from "express";
import {
    createRound,
    deleteStudentsInRound,
    getallRound,
    getOneRound,
    getRoundIDAndTotal,
} from "../Controllers/round.controller.js";
import {
    protectedRoutes,
    restrictedTo,
    restrictToAdminOrSuperAdmin,
} from "../Middlewares/auth.middleware.js";
import { validation } from "../Middlewares/Vaidation.middleware.js";
import { roundValidate } from "../Validation/round.validation.js";

let RoundRouter = express.Router();

// Get Round Using Name
RoundRouter.route("/").get(getRoundIDAndTotal);

// Get All Round In Database
RoundRouter.route("/all-data").get(getallRound);

// Get Round Using Id In Params
RoundRouter.route("/:id").get(getOneRound);

RoundRouter.use(protectedRoutes);
RoundRouter.use(restrictToAdminOrSuperAdmin);
RoundRouter.route("/create-round").post(validation(roundValidate), createRound);


RoundRouter.use(restrictToAdminOrSuperAdmin);
RoundRouter.route("/:roundId").delete(deleteStudentsInRound);

export default RoundRouter;
