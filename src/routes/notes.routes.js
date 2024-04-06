import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { addNewNote,changeState,deleteNote,editNote,loadNotes } from "../controllers/notes.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/loadNotes").post(verifyJWT,loadNotes)
router.route("/addNote").post(verifyJWT,addNewNote)
router.route("/deleteNote").post(deleteNote)
router.route("/editNote").post(editNote)
router.route("/changeState").post(changeState)

export default router