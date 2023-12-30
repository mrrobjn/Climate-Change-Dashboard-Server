import express from "express";
// import AuthController from "../app/controllers/AuthController.js";
import { body } from "express-validator";

const router = express.Router();

// router.post(
//   "/signup",
//   body("email").notEmpty().isEmail(),
//   body("password").notEmpty(),
//   body("name").notEmpty(),
//   AuthController.signUp
// );
// router.post(
//   "/signin",
//   body("email").notEmpty().isEmail(),
//   body("password").notEmpty(),
//   AuthController.signIn
// );
// router.post("/signout", AuthController.signOut);
// router.post("/profile", AuthController.profile);

export default router;
