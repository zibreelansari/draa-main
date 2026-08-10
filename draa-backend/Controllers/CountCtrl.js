const UserModel = require('../Models/UserModel');
const TeacherModel = require('../Models/TeacherModel');
const JobsModel = require('../Models/jobsModel');
const SyllabusModel = require('../Models/Syllabus.model');
const CurrentAffairModel = require('../Models/CurrentAffair');
const PYQModel = require('../Models/PYQ.models');
const CourseContentModel = require('../Models/CourseConjtent');

const UserCount = async (req, res) => {
    try {
        const Users = await UserModel.find();
        const userCount = Users.length;
        res.status(201).json({ message:"Successfully Fetched" ,Users:Users || [],userCount});
    } catch (error) {
        res.status(500).json({ message:"Error Occurred", error: error.message });
    }
}

const TeacherCount=async(req,res)=>{
    try {
        const Teachers=await TeacherModel.find();
        const teacherCount = Teachers.length;
        res.status(201).json({ message:"Successfully Fetched",Teachers:Teachers || [],teacherCount,Teacherid:Teachers._id});
    } catch (error) {
        res.status(500).json({ message:"Error Occurred", error: error.message });
    }
}

const ResourceCount = async (req, res) => {
    try {
        const jobsCount = await JobsModel.JobPost.countDocuments();
        const syllabusCount = await SyllabusModel.countDocuments();
        const currentAffairsCount = await CurrentAffairModel.CurrentAffair.countDocuments();
        const pyqCount = await PYQModel.countDocuments();
        const blogsCount = await CourseContentModel.countDocuments();

        res.status(200).json({
            success: true,
            counts: {
'jobs': jobsCount,
'syllabus': syllabusCount,
'current-affairs': currentAffairsCount,
'pyqs': pyqCount,
'blogs': blogsCount
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message:"Error Occurred", error: error.message });
    }
}

module.exports={UserCount,TeacherCount,ResourceCount};