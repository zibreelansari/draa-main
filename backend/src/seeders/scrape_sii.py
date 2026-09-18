import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def fetch_institutes():
    print("Fetching institutes...")
    try:
        url = "https://studyinindia.gov.in/Courses/exploreallcoruses/?handler=InstituteListServerSide&Cpage=1&pageSize=500"
        with urllib.request.urlopen(url, context=ctx) as response:
            data = json.loads(response.read().decode('utf-8'))
        print(f"Fetched {len(data['aaData'])} of {data['iTotalRecords']} institutes.")
        with open("institutes_data.json", "w", encoding="utf-8") as f:
            json.dump(data["aaData"], f, indent=2)
    except Exception as e:
        print("Institute error:", e)

def fetch_courses():
    print("Fetching courses...")
    try:
        url = "https://studyinindia.gov.in/Courses/exploreallcoruses/?handler=CoursesListServerSide&Cpage=1&pageSize=2000"
        with urllib.request.urlopen(url, context=ctx) as response:
            data = json.loads(response.read().decode('utf-8'))
        print(f"Fetched {len(data['aaData'])} of {data['iTotalRecords']} courses.")
        with open("courses_data.json", "w", encoding="utf-8") as f:
            json.dump(data["aaData"], f, indent=2)
    except Exception as e:
        print("Course error:", e)

if __name__ == "__main__":
    fetch_institutes()
    fetch_courses()
