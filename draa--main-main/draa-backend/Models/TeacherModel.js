const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Teacher Schema
const TeacherSchema = new mongoose.Schema({
    tname: {
        type: String,
        required: [true,'Please provide a name'],
        trim: true,
        minlength: [2,'Name must be at least 2 characters'],
        maxlength: [50,'Name cannot exceed 50 characters']
    },
    temail: {
        type: String,
        required: [true,'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/,'Please provide a valid email address']
    },
    tphn: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        match: [/^\d{10}$/,'Please provide a valid 10-digit phone number']
    },
    tpassword: {
        type: String,
        minlength: [8,'Password must be at least 8 characters'],
        select: false
    },
    tspecialization: {
        type: String,
        trim: true,
        required: [true,'Please provide specialization']
    },
    texp: {
        type: Number,
        min: [0,'Experience cannot be negative'],
        max: [50,'Experience cannot exceed 50 years']
    },
    tcity: {
        type: String,
        trim: true,
        maxlength: [50,'City name cannot exceed 50 characters']
    },
    tstate: {
        type: String,
        trim: true,
        maxlength: [50,'State name cannot exceed 50 characters'],
        default:''
    },
    tdesc: {
        type: String,
        trim: true,
        minlength: [5,'Description must be at least 5 characters'],
        maxlength: [1000,'Description cannot exceed 1000 characters']
    },
    tqualification: {
        type: String,
        trim: true,
        default:''
    },
    taddress: {
        type: String,
        trim: true,
        default:''
    },
    //  NEW FIELD - Promocode (Optional)
    promocode: {
        type: String,
        trim: true,
        default:'',
        maxlength: [20,'Promocode cannot exceed 20 characters'],
        validate: {
            validator: function (v) {
                // Allow empty string or valid alphanumeric codes
                if (!v || v ==='') return true;
                return /^[A-Za-z0-9]+$/.test(v);
            },
            message:'Promocode can only contain letters and numbers'
        }
    },
    Status: {
        type: String,
        enum: {
            values: ['pending','approved','rejected','suspended'],
            message:'Status must be pending, approved, rejected, or suspended'
        },
        default:'pending'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    tprofile: {
        type: String,
        default:''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'admins',
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },
    rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'admins',
        default: null
    },
    rejectedAt: {
        type: Date,
        default: null
    },
    rejectionReason: {
        type: String,
        trim: true,
        default:''
    },
    lastLogin: {
        type: Date,
        default: null
    },
    googleId: {
        type: String,
        default: null
    },
    authProvider: {
        type: String,
        enum: ["local","google"],
        default:"local"
    },
    avatar: {
        type: String,
        default: null
    },
    tokenVersion: {
        type: Number,
        default: 0
    },
    verifiedAt: {
        type: Date,
        default: null
    },
    permissions: {
        type: [String],
        default: ['Dashboard Overview','My Profile'] // Basic permissions by default
    },
    socialLinks: {
        github: {
            type: String,
            trim: true,
            default: '',
            validate: {
                validator: function(v) {
                    if (!v || v === '') return true;
                    return /^https?:\/\/(www\.)?github\.com\/.+/.test(v);
                },
                message: 'Please provide a valid GitHub URL (e.g. https://github.com/username)'
            }
        },
        linkedin: {
            type: String,
            trim: true,
            default: '',
            validate: {
                validator: function(v) {
                    if (!v || v === '') return true;
                    return /^https?:\/\/(www\.)?linkedin\.com\/.+/.test(v);
                },
                message: 'Please provide a valid LinkedIn URL (e.g. https://linkedin.com/in/username)'
            }
        },
        twitter: {
            type: String,
            trim: true,
            default: '',
            validate: {
                validator: function(v) {
                    if (!v || v === '') return true;
                    return /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/.+/.test(v);
                },
                message: 'Please provide a valid Twitter/X URL (e.g. https://twitter.com/username)'
            }
        }
    }
}, {
    timestamps: true
});

// Compare password method
TeacherSchema.methods.comparePassword = async function (candidatePassword) {
    if (!candidatePassword) return false;
    try {
        return await bcrypt.compare(candidatePassword, this.tpassword);
    } catch (error) {
        throw new Error('Password comparison failed');
    }
};

// Export the model
const Teacher = mongoose.models.Teacher || mongoose.model('Teacher', TeacherSchema);
if (!mongoose.models.teachers) {
    mongoose.model("teachers", TeacherSchema);
}
module.exports = Teacher;
