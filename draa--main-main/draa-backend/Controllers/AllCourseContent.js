const CourseContent = require('../Models/CourseConjtent');

const allCourse = async (req, res) => {
    try {
        const { teacherId, creatorId } = req.query;
        let filter = {};

        if (teacherId) {
            filter.createdBy = teacherId;
        } else if (creatorId) {
            filter.createdBy = creatorId;
        }

        const result = await CourseContent.find(filter).sort({ createdAt: -1 });
        if (result.length === 0) {
            return res.status(404).json({ message: 'No course content found' });
        }
        res.status(200).json({ message: 'Course content retrieved successfully', result });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// const updateStaus = async (req, res) => {
//     try {
//         const id = req.params.id;
//         const resp = await CourseContent.findByIdAndUpdate(
//             id,
//             { approved: true },
//             { new: true, runValidators: true }
//         );
//         if (!resp) {
//             return res.status(404).json({ message:'Course content not found' });
//         }
//         console.log("Course ID:", req.params.id);
//         res.status(200).json({ message:'Course content updated successfully', resp });
//     } catch (error) {
//         res.status(500).json({ message:'Internal server error' });
//     }
// }

module.exports = allCourse;