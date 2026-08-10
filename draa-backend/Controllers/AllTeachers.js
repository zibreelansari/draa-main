const express =require('express');
const TeacherModel =require('../Models/TeacherModel');

const teachers=async (req,res)=>{
    try {
        const teachers = await TeacherModel.find();
        res.status(200).json({ message:"Successfully Fetched", teachers: teachers });
        console.log(teachers);
      } catch (error) {
        res.status(500).json({ message:"Error Occurred", error: error.message });
      }
}   

module.exports=teachers;