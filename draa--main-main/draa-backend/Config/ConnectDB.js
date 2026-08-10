const mongoose = require('mongoose');
const { colors } = require('colors');
require('dotenv').config();

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`.bgGreen);

        // Ensure sparse index on teachers.tphn by dropping the old non-sparse one
        try {
            await mongoose.connection.db.collection('teachers').dropIndex('tphn_1');
            console.log('Dropped old non-sparse tphn_1 index on teachers'.yellow);
        } catch (indexErr) {
            // Index might not exist or already be sparse, safe to ignore
        }
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

module.exports = connectDB;