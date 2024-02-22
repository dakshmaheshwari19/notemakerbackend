import {Note} from "../models/note.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const loadNotes = asyncHandler(async(req,res)=>{
    const {userId} =req.body

    const arrayOfNotes = await Note.find({owner:userId})
    res.status(201).json({arrayOfNotes})
})

const addNewNote = asyncHandler(async(req,res)=>{
    // take req 
    // catch the user
    //push it into user notes

    const {userId,title,description}=req.body
     
    if(!userId){
        throw new ApiError(400,"User ID is required")
    }

    if(!title && !description){
        throw new ApiError(401,"Either title or description is required");
    }

    const newNote = new Note({
        owner:userId,
        title,
        description
      });
  
      await newNote.save();
  
      res.status(201).json({ newNote,message: 'Note added successfully' });

    
})

const deleteNote = asyncHandler(async(req,res)=>{
    //catch noteId 
    // delete note
    const {noteId}=req.body
     
    await Note.findByIdAndDelete(noteId);

    res.status(201).json({ message: 'Note deleted successfully' });
})

const editNote = asyncHandler(async(req,res)=>{
    const {noteId,title,description}=req.body

    await Note.findByIdAndUpdate(
        noteId,
        {title,description}
    )

    res.status(201).json({ message: 'Note edited successfully' });

})

const changeState = asyncHandler(async(req,res)=>{
    const {noteId,starred,archived,trashed}=req.body

    await Note.findByIdAndUpdate(
        noteId,
        {starred,archived,trashed}
    )

    res.status(201).json({ message: 'state changed successfully' });

})

export {addNewNote,deleteNote,editNote,changeState,loadNotes}