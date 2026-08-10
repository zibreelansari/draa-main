const express=require('express');
const Users=require('../Models/UserModel');

const updateStudentController=async(req,res)=>{ 
    try {
        const userId = req.params.id; // Assuming you're passing the user ID in the URL
        const updateStatus = req.body; // Get the updated data from the request body

        // Find the user by ID and update their information
        const updatedUser = await Users.findByIdAndUpdate(userId, updatedData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message:'User not found' });
        }

        res.status(200).json({ message:'User updated successfully', user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message:'Server error' });
    }
}