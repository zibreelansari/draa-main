const https = require('https');
const fs = require('fs');

const agent = new https.Agent({  
  rejectUnauthorized: false
});

async function fetchInstitutes() {
    console.log("Fetching institutes...");
    try {
        const response = await fetch('https://studyinindia.gov.in/Courses/exploreallcoruses/?handler=InstituteListServerSide&Cpage=1&pageSize=500', {
            dispatcher: new (require('undici').Agent)({
                connect: { rejectUnauthorized: false }
            })
        });
        const data = await response.json();
        console.log(`Fetched ${data.aaData.length} of ${data.iTotalRecords} institutes.`);
        fs.writeFileSync('institutes_data.json', JSON.stringify(data.aaData, null, 2));
    } catch (e) {
        console.error("Institute error:", e);
    }
}

async function fetchCourses() {
    console.log("Fetching courses...");
    try {
        const response = await fetch('https://studyinindia.gov.in/Courses/exploreallcoruses/?handler=CoursesListServerSide&Cpage=1&pageSize=2000', {
            dispatcher: new (require('undici').Agent)({
                connect: { rejectUnauthorized: false }
            })
        });
        const data = await response.json();
        console.log(`Fetched ${data.aaData.length} of ${data.iTotalRecords} courses.`);
        fs.writeFileSync('courses_data.json', JSON.stringify(data.aaData, null, 2));
    } catch (e) {
        console.error("Course error:", e);
    }
}

async function main() {
    await fetchInstitutes();
    await fetchCourses();
}

main();
