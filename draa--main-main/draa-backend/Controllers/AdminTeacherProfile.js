const express= require("express"); 
const TeacherModel=require('../Models/TeacherModel')
const AdminModel = require("../Models/AdminModel");

const TeacherOwnProfile=async(req,res)=>{
         
        try {

            const teacherId = req.params.id; // Get the teacher ID from the request parameters
            const teacher = await TeacherModel.findById(teacherId); // Find the teacher by ID   
            if (!teacher) {
                return res.status(404).json({ message:"Teacher not found" });
            }
            res.status(200).json({
                message:"Teacher Found",
                teacher:teacher
            });
            
        } catch (error) {
            res.status(500).json({ message: error.message });
            
        }

}


const AdminOwnProfile=async(req,res)=>{
         
    try {

        const adminId = req.params.id; // Get the adminm ID from the request parameters
        const adminm = await AdminModel.findById(adminId); // Find the adminm by ID   
        if (!adminm) {
            return res.status(404).json({ message:"Admin not found" });
        }
        res.status(200).json({ adminm });  
        
    } catch (error) {
        res.status(500).json({ message: error.message });
        
    }

}

module.exports={TeacherOwnProfile,AdminOwnProfile}