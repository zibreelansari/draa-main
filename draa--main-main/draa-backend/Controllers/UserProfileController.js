const express = require('express');
const Users=require('../Models/UserModel'); 

const userProfileController = async (req, res) => {
    try {
        const userId = req.params.id; // Assuming you're passing the user ID in the URL
        const user = await Users.findById(userId)
        // res.send(user);
        if (!user) {
            return res.status(404).json({ message:'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message:'Server error' });
    }
}

module.exports = userProfileController;