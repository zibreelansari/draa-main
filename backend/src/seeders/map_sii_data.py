import json
import re

def slugify(text):
    if not text:
        return ""
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def map_level(sii_level):
    if not sii_level:
        return 'UNDERGRADUATE'
    sl = sii_level.lower()
    if 'post graduate' in sl or 'masters' in sl or 'm.tech' in sl or 'pg' in sl:
        return 'POSTGRADUATE'
    if 'phd' in sl or 'doctor' in sl:
        return 'DOCTORAL'
    if 'certificate' in sl or 'diploma' in sl:
        return 'CERTIFICATE'
    return 'UNDERGRADUATE'

def map_mode(m):
    if not m:
        return 'OFFLINE'
    m = m.upper()
    if m in ['OFFLINE', 'BLENDED', 'ONLINE']:
        return m
    return 'OFFLINE'

def map_course_type(ct):
    if not ct:
        return 'REGULAR'
    if 'short' in ct.lower():
        return 'SHORT_TERM'
    return 'REGULAR'

def process():
    with open('institutes_data.json', 'r', encoding='utf-8') as f:
        inst_data = json.load(f)
    
    with open('courses_data.json', 'r', encoding='utf-8') as f:
        course_data = json.load(f)
        
    mapped_institutes = []
    seen_inst_slugs = set()
    
    for row in inst_data:
        name = row.get('instituteName') or ''
        if not name:
            continue
        slug = row.get('instituteID') or slugify(name)
        if slug in seen_inst_slugs:
            continue
        seen_inst_slugs.add(slug)
        
        mapped_institutes.append({
            "name": name,
            "slug": slug,
            "city": row.get('location') or 'Unknown',
            "state": row.get('stateName') or 'Unknown',
            "type": row.get('instituteType') or 'University',
            "description": f"Institution located in {row.get('location', 'Unknown')}, {row.get('stateName', 'Unknown')}.",
            "imageUrl": "/media/campus-1.jpg",
            "status": "PUBLISHED"
        })
        
    mapped_courses = []
    seen_course_slugs = set()
    
    for row in course_data:
        title = row.get('qualification') or ''
        if not title:
            continue
            
        inst_id = row.get('instituteID')
        if not inst_id or inst_id not in seen_inst_slugs:
            # Maybe the institute wasn't in the 500 we fetched, skip or create dummy
            continue
            
        slug = slugify(inst_id + "-" + title)
        if slug in seen_course_slugs:
            continue
        seen_course_slugs.add(slug)
        
        duration = row.get('courseDurations')
        try:
            duration_months = int(duration)
        except:
            duration_months = 12
            
        fee = row.get('totalCost')
        try:
            fee_num = int(float(fee))
        except:
            fee_num = 0
            
        mapped_courses.append({
            "instituteSlug": inst_id,
            "title": title,
            "slug": slug,
            "discipline": row.get('disciplineName') or 'General',
            "level": map_level(row.get('programLevelD')),
            "durationMonths": duration_months,
            "tuitionFee": fee_num,
            "currency": row.get('currency') or 'USD',
            "mode": map_mode(row.get('mode')),
            "courseType": map_course_type(row.get('courseType')),
            "scholarshipAvailable": True if row.get('hasScholarship') else False,
            "eligibility": "Confirm programme-specific requirements with the institution.",
            "status": "PUBLISHED"
        })

    with open('mapped_institutes.json', 'w', encoding='utf-8') as f:
        json.dump(mapped_institutes, f, indent=2)
        
    with open('mapped_courses.json', 'w', encoding='utf-8') as f:
        json.dump(mapped_courses, f, indent=2)
        
    print(f"Mapped {len(mapped_institutes)} institutes and {len(mapped_courses)} courses.")

if __name__ == '__main__':
    process()
