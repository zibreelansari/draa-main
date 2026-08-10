const CourseContentModel = require('../Models/CourseConjtent');
const TeacherModel = require('../Models/TeacherModel');

const courseContentDetails = async (req, res) => {
    try {
        const id = req.params.id;
        const content = await CourseContentModel.findById(id)
            .populate('student','name email avatar Status');

        if (!content) {
            return res.status(404).json({ message:"Content not found" });
        }

        // Resolve author info
        let authorInfo = {
            name:"Draa Editorial",
            type:"editorial",
            avatar: null,
        };

        if (content.student) {
            // Student-written content
            authorInfo = {
                name: content.student.name ||"Student",
                type:"student",
                avatar: content.student.avatar || null,
            };
        } else if (content.author) {
            // Only try teacher lookup if author looks like a valid ObjectId
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(content.author);
            if (isObjectId) {
                const teacher = await TeacherModel.findById(content.author).select('tname temail tphn tphoto');
                if (teacher) {
                    authorInfo = {
                        name: teacher.tname,
                        type:"teacher",
                        avatar: teacher.tphoto || null,
                    };
                }
            } else {
                // Plain string author name (e.g."Mainak Bhattacherjee")
                authorInfo = {
                    name: content.author,
                    type:"teacher",
                    avatar: null,
                };
            }
        }

        res.status(200).json({
            message:"Content found",
            contents: content,
            authorInfo,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message:"Internal Server Error" });
    }
};

module.exports = courseContentDetails;
