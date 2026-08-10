const express=require('express');

const courseContent=require('../Models/CourseConjtent');


const deleteCourseContent=async(req,res)=>{
    try{
        const {id}=req.params;
        const content=await courseContent.findByIdAndDelete(id);
        if(!content){
            return res.status(404).json({message:'Course Content not found'});
        }
        return res.status(200).json({message:'Course Content deleted successfully'});
    }catch(err){
        console.error(err);
        return res.status(500).json({message:'Internal server error'});
    }
}

module.exports=deleteCourseContent;