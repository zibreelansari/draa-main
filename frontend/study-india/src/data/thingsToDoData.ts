export interface HeritageLandmark {
  id: string;
  title: string;
  subtitle: string;
  category: "unesco" | "spiritual" | "nature" | "festivals" | "culinary";
  categoryName: string;
  region: "north" | "south" | "west" | "east";
  regionName: string;
  location: string;
  state: string;
  isUnesco: boolean;
  bestSeason: string;
  idealDuration: string;
  studentBudgetInr: string;
  studentBudgetUsd: string;
  nearestHubs: string;
  image: string;
  caption: string;
  description: string;
  highlights: string[];
  studentTip: string;
  etiquette: string;
  howToReach: string;
  mustTryFood: string;
}

export const HERITAGE_LANDMARKS: HeritageLandmark[] = [
  {
    id: "taj-mahal",
    title: "Taj Mahal & Agra Fort",
    subtitle: "The Crown of Mughal Architecture & UNESCO World Wonder",
    category: "unesco",
    categoryName: "UNESCO World Heritage",
    region: "north",
    regionName: "North India",
    location: "Agra",
    state: "Uttar Pradesh",
    isUnesco: true,
    bestSeason: "October to March",
    idealDuration: "Day Trip or 1 Night",
    studentBudgetInr: "₹1,200 - ₹2,500",
    studentBudgetUsd: "$14 - $30",
    nearestHubs: "Delhi NCR (1.5 hrs by Gatimaan/Vande Bharat Express)",
    image: "/media/real-india-taj.jpg",
    caption: "The majestic ivory-white marble Taj Mahal reflected in the central lotus pool at sunrise",
    description:
      "Commissioned in 1632 by Mughal Emperor Shah Jahan to house the tomb of his favorite wife Mumtaz Mahal, the Taj Mahal is globally celebrated for its flawless marble symmetry, semiprecious stone pietra dura inlay, and serene Yamuna riverfront setting. Paired with the massive red sandstone Agra Fort nearby, it offers international students an unforgettable immersion into royal Indian history.",
    highlights: [
      "Walk through the Great Gate (Darwaza-i-rauza) at sunrise for magical amber lighting and fewest crowds.",
      "Explore Agra Fort's Jahangiri Mahal and Musamman Burj where Shah Jahan spent his final years overlooking the Taj.",
      "Witness intricate Pietra Dura stone craftsmanship practiced by direct descendants of the original 17th-century artisans."
    ],
    studentTip: "Carry your university student ID card! International students enrolled in recognized Indian institutions get subsidized domestic admission fees (₹50 vs ₹1,100 tourist rate).",
    etiquette: "Shoe covers are mandatory on the upper marble mausoleum platform. Photography inside the inner burial crypt is strictly prohibited.",
    howToReach: "Board the Gatimaan Express or Vande Bharat Express from Hazrat Nizamuddin Station (Delhi); journey takes just 100 minutes directly to Agra Cantt.",
    mustTryFood: "Authentic Agra Petha (crystallized ash gourd sweet) and Bedmi Puri with spicy aloo sabzi."
  },
  {
    id: "golden-temple",
    title: "Harmandir Sahib (The Golden Temple)",
    subtitle: "Sanctuary of Spiritual Equality, Golden Splendor & Living Community Service",
    category: "spiritual",
    categoryName: "Spiritual & Living Heritage",
    region: "north",
    regionName: "North India",
    location: "Amritsar",
    state: "Punjab",
    isUnesco: false,
    bestSeason: "October to March",
    idealDuration: "Weekend Trip (2 Days)",
    studentBudgetInr: "₹1,500 - ₹3,000",
    studentBudgetUsd: "$18 - $36",
    nearestHubs: "Chandigarh (4 hrs train) · Delhi (6 hrs Swarna Shatabdi Express)",
    image: "/media/heritage/golden-temple.jpg",
    caption: "The glistening Harmandir Sahib adorned with 500kg of gold leaf glowing over the sacred Amrit Sarovar",
    description:
      "The preeminent spiritual sanctuary of Sikhism, the Golden Temple welcomes visitors of all religions, nationalities, and backgrounds without distinction. Built around a sacred pool (Amrit Sarovar), its sanctum is overlaid with genuine gold foil. It houses Guru Ram Das Langar, the world's largest free community kitchen, where over 100,000 pilgrims and students are fed warm, nutritious meals daily by selfless volunteers.",
    highlights: [
      "Witness the Palki Sahib ceremony at 4:30 AM or 10:00 PM as the sacred Guru Granth Sahib is carried in a golden palanquin.",
      "Volunteer for 30 minutes in the Langar hall rolling rotis or washing dishes—a deeply humbling lesson in community seva.",
      "Visit the Partition Museum and historic Jallianwala Bagh located just 5 minutes walk from the temple complex."
    ],
    studentTip: "Head coverings (bandanas/scarves) are mandatory for all visitors; free clean headscarves are provided at the entrance shoe-room.",
    etiquette: "Remove shoes and socks at the complimentary cloakroom, wash feet in the shallow cleansing pool before entering, and dress conservatively.",
    howToReach: "Direct high-speed Vande Bharat and Shatabdi trains link New Delhi with Amritsar Junction daily; Sri Guru Ram Dass Jee International Airport has frequent flights.",
    mustTryFood: "Authentic Amritsari Kulcha with spicy chole, fresh pinni sweets, and thick lassi in brass tumblers."
  },
  {
    id: "hampi-ruins",
    title: "Hampi Monumental Complex",
    subtitle: "The Surreal Boulder-Strewn Granite Capital of the Medieval Vijayanagara Empire",
    category: "unesco",
    categoryName: "UNESCO World Heritage",
    region: "south",
    regionName: "South India",
    location: "Ballari District",
    state: "Karnataka",
    isUnesco: true,
    bestSeason: "November to February",
    idealDuration: "3 Days / 2 Nights",
    studentBudgetInr: "₹2,000 - ₹4,000",
    studentBudgetUsd: "$24 - $48",
    nearestHubs: "Bengaluru (7 hrs overnight train) · Hyderabad (8 hrs train)",
    image: "/media/heritage/hampi-stone-chariot.jpg",
    caption: "The legendary monolithic Stone Chariot at the 16th-century Vijaya Vittala Temple complex",
    description:
      "Spread over 4,100 hectares along the banks of the Tungabhadra River, Hampi is an open-air wonderland of ruined palaces, temples, royal baths, and colossal monolithic statues nestled among golden granite boulder hills. In the 15th century, Vijayanagara was the second largest city on Earth after Beijing. Renting a bicycle here to pedal between monolithic stone chariots and ancient aqueducts is a student rite of passage.",
    highlights: [
      "Marvel at the Vittala Temple's famous stone chariot and acoustic musical stone pillars that resonate with tonal frequencies.",
      "Climb Matanga Hill before 6:00 AM for a 360-degree panorama of ancient ruins emerging from morning mist.",
      "Cross the Tungabhadra River on a traditional circular coracle boat to explore the laid-back hippie island side and cafe trails."
    ],
    studentTip: "Rent a bicycle or geared e-moped (₹150 - ₹400/day) at Hampi Bazaar to navigate between the Sacred Centre and Royal Enclosure at your own pace.",
    etiquette: "Virupaksha Temple remains an active worship sanctuary; remove shoes before entering the sanctum.",
    howToReach: "Take the Hampi Express overnight train from KSR Bengaluru to Hosapete Junction (HPT), then take a 20-minute local bus or auto to Hampi.",
    mustTryFood: "South Indian thali on fresh banana leaves, Paddu (crispy rice balls), and fresh coconut water."
  },
  {
    id: "varanasi-ghats",
    title: "Ghats & Living Heritage of Varanasi",
    subtitle: "The Oldest Inhabited City on Earth & Living Center of Indian Knowledge Systems",
    category: "spiritual",
    categoryName: "Spiritual & Living Heritage",
    region: "north",
    regionName: "North India",
    location: "Varanasi (Kashi)",
    state: "Uttar Pradesh",
    isUnesco: false,
    bestSeason: "October to March",
    idealDuration: "3 Days / 2 Nights",
    studentBudgetInr: "₹1,800 - ₹3,500",
    studentBudgetUsd: "$22 - $42",
    nearestHubs: "Lucknow (4 hrs train) · Patna (4 hrs) · Delhi (8 hrs Vande Bharat)",
    image: "/media/heritage/varanasi-ghats.jpg",
    caption: "Historic tiered stone ghats along the sacred Ganges river with morning meditation and prayers",
    description:
      "Dating back more than 3,000 years, Varanasi (Kashi) is recognized by UNESCO as a Creative City of Music. 84 historic stone ghats line the crescent curve of the holy Ganges. Here, students witness living philosophy, Sanskrit scholars reciting Vedic verses, classical sitar maestros performing at dawn, and centuries-old silk weaving workshops humming in the narrow ancient labyrinth alleys.",
    highlights: [
      "Attend the theatrical sunset Ganga Aarti at Dashashwamedh Ghat featuring brass oil lamps, conch shells, and incense.",
      "Take a sunrise wooden rowing boat from Assi Ghat to Manikarnika Ghat to view the riverfront awakening.",
      "Visit Sarnath (10 km away) where Gautama Buddha gave his very first sermon after attaining enlightenment under the Bodhi tree."
    ],
    studentTip: "Stay in student guesthouses near Assi Ghat for a peaceful, arts-friendly atmosphere close to Banaras Hindu University (BHU).",
    etiquette: "Do not photograph funeral ceremonies at cremation ghats (Manikarnika and Harishchandra) out of solemn cultural respect.",
    howToReach: "Vande Bharat Express links Delhi to Varanasi Junction in under 8 hours; Lal Bahadur Shastri International Airport has direct flights from all metro cities.",
    mustTryFood: "Kashi Chaat Bhandar's Tamatar Chaat, creamy Malaiyo (winter saffron milk foam), and Banarasi Paan."
  },
  {
    id: "rajasthan-forts",
    title: "Hill Forts & Palaces of Rajasthan",
    subtitle: "Amber Fort, Hawa Mahal & Desert Sandstone Architecture",
    category: "unesco",
    categoryName: "UNESCO World Heritage",
    region: "west",
    regionName: "West & Central",
    location: "Jaipur & Jodhpur",
    state: "Rajasthan",
    isUnesco: true,
    bestSeason: "October to March",
    idealDuration: "Weekend (2-3 Days)",
    studentBudgetInr: "₹2,000 - ₹4,500",
    studentBudgetUsd: "$24 - $54",
    nearestHubs: "Delhi NCR (3.5 hrs by Vande Bharat / Superfast Express)",
    image: "/media/heritage/jaipur-hawa-mahal.jpg",
    caption: "The pink honeycomb lattice facade of Hawa Mahal (Palace of Winds) with 953 carved jharokhas",
    description:
      "Rajasthan's UNESCO-inscribed Hill Forts represent medieval military architecture blended with opulent Rajput courtyards. Jaipur's Amber Fort, perched above Maota Lake, boasts the dazzling Sheesh Mahal (Palace of Mirrors), while the five-story honeycomb Hawa Mahal features 953 lattice windows engineered to circulate cool breeze during desert summers.",
    highlights: [
      "Marvel at the Sheesh Mahal in Amber Fort where a single candle illuminates millions of imported Belgian mirrors.",
      "Explore Jantar Mantar, the world's largest stone astronomical observatory built in 1734 with functioning sundials.",
      "Wander through Johari Bazaar and Bapu Bazaar for handcrafted blue pottery, silver jewelry, and block-printed textiles."
    ],
    studentTip: "Buy the Jaipur Composite Ticket (₹40 - ₹100 with student ID) which grants admission to Amber Fort, Hawa Mahal, Jantar Mantar, Nahargarh, and Albert Hall Museum for 2 days.",
    etiquette: "Dress comfortably with sturdy walking shoes as exploring Amber Fort and Mehrangarh involves walking up sloping stone ramparts.",
    howToReach: "Ajmer Shatabdi or Vande Bharat Express from New Delhi reaches Jaipur Junction in under 4 hours.",
    mustTryFood: "Traditional Dal Baati Churma, Pyaaz Kachori at Rawat Mishtan Bhandar, and Ghewar dessert."
  },
  {
    id: "kerala-backwaters",
    title: "Kerala Backwaters & Tropical Eco-Trails",
    subtitle: "Alleppey Houseboats, Coconut Palm Lagoons & Ayurvedic Heritage",
    category: "nature",
    categoryName: "Nature & Escapes",
    region: "south",
    regionName: "South India",
    location: "Alleppey (Alappuzha) & Kochi",
    state: "Kerala",
    isUnesco: false,
    bestSeason: "September to March",
    idealDuration: "3 Days / 2 Nights",
    studentBudgetInr: "₹2,200 - ₹5,000",
    studentBudgetUsd: "$26 - $60",
    nearestHubs: "Kochi (1.5 hrs train) · Trivandrum (2.5 hrs) · Bengaluru (overnight train)",
    image: "/media/heritage/kerala-backwaters.jpg",
    caption: "A traditional wooden kettuvallam houseboat gliding peacefully through palm-fringed emerald lagoons",
    description:
      "Kerala's backwaters comprise an intricate 900-kilometer labyrinth of natural canals, brackish lagoons, and five immense lakes fed by 38 rivers. Historic kettuvallams (giant thatched wooden boats constructed without a single metal nail) glide past coir-spinning villages, paddy fields cultivated below sea level, and migratory bird sanctuaries, offering the ultimate peaceful escape from exam stress.",
    highlights: [
      "Take a shared public ferry boat from Alleppey to Kottayam for just ₹25 ($0.30 USD)—the world's most scenic budget transit.",
      "Visit Fort Kochi to witness 600-year-old Chinese Fishing Nets, colonial spice godowns, and contemporary art biennales.",
      "Experience an authentic Kalaripayattu martial arts demonstration and Kathakali classical dance story-telling."
    ],
    studentTip: "Opt for government-run Kerala State Water Transport Department (SWTD) ferries or a group canoe safari instead of expensive private houseboats to save 80% on budget.",
    etiquette: "Respect village residents living along the canal banks; avoid littering and maintain calm in peaceful eco-zones.",
    howToReach: "Cochin International Airport (COK) is the primary gateway; Alappuzha Railway Station (ALLP) is connected with all major South Indian metros.",
    mustTryFood: "Kerala Appam with vegetable stew, Malabar Parotta, Karimeen Pollichathu, and sweet banana fritters (Pazham Pori)."
  },
  {
    id: "qutub-minar-delhi",
    title: "Qutub Minar & Historic Delhi Monuments",
    subtitle: "73-Meter Tower of Victory, Iron Pillar & Ancient Sultanate Architecture",
    category: "unesco",
    categoryName: "UNESCO World Heritage",
    region: "north",
    regionName: "North India",
    location: "New Delhi",
    state: "Delhi NCR",
    isUnesco: true,
    bestSeason: "October to April",
    idealDuration: "Half Day to Full Day",
    studentBudgetInr: "₹300 - ₹800",
    studentBudgetUsd: "$4 - $10",
    nearestHubs: "Directly located on Delhi Metro Yellow Line (Qutab Minar Station)",
    image: "/media/heritage/delhi-qutub-minar.jpg",
    caption: "The soaring 73-meter fluted sandstone minaret of Qutub Minar rising against a crisp Delhi blue sky",
    description:
      "Built in 1192 by Qutb-ud-din Aibak, the Qutub Minar stands as the world's tallest brick minaret at 72.5 meters. The surrounding archaeological park preserves centuries of history including the mysterious 1,600-year-old rust-resistant Gupta Empire Iron Pillar, the ornate Quwwat-ul-Islam Mosque, and peaceful landscaped green lawns where university scholars gather to study.",
    highlights: [
      "Examine the 4th-century metallurgical marvel: the 7-meter Iron Pillar of Chandragupta II which has resisted rust for 1,600 years.",
      "Photograph the intricate geometric Arabesque bands and Quranic inscriptions carved into alternating fluted sandstone columns.",
      "Explore nearby Mehrauli Archaeological Park containing over 100 historic monuments dating from the Khalji, Tughlaq, and Mughal eras."
    ],
    studentTip: "Book tickets online via the ASI portal or PayTM to skip entrance queues and get a ₹5 discount. Delhi Metro tokens/smart cards make transit effortless.",
    etiquette: "Stay on designated paved walkways; climbing or sitting on ancient ruined stonework is prohibited by the Archaeological Survey of India.",
    howToReach: "Take Delhi Metro Yellow Line to Qutab Minar station, followed by a 5-minute electric auto ride (₹20).",
    mustTryFood: "South Delhi street momos, rolled Kathi rolls at Khan Market, or Chhole Bhature at nearby Green Park."
  },
  {
    id: "ellora-ajanta-caves",
    title: "Ajanta & Ellora Rock-Cut Cave Temples",
    subtitle: "Monolithic Marvels Carved by Hand from Living Basalt Cliffs",
    category: "unesco",
    categoryName: "UNESCO World Heritage",
    region: "west",
    regionName: "West & Central",
    location: "Chhatrapati Sambhajinagar (Aurangabad)",
    state: "Maharashtra",
    isUnesco: true,
    bestSeason: "July to March",
    idealDuration: "2 Days (1 Day Ellora, 1 Day Ajanta)",
    studentBudgetInr: "₹1,800 - ₹3,600",
    studentBudgetUsd: "$22 - $44",
    nearestHubs: "Pune (4.5 hrs train/bus) · Mumbai (6 hrs train)",
    image: "/media/heritage/ellora-caves.jpg",
    caption: "The monolithic Kailasa Temple (Cave 16) at Ellora carved entirely top-down from a single basalt cliff",
    description:
      "Ellora features 34 monumental rock-cut monasteries and temples spanning Buddhist, Hindu, and Jain traditions carved side by side between the 6th and 10th centuries. Cave 16—the Kailasa Temple—is the largest monolithic rock excavation on planet Earth, where ancient sculptors chiseled over 200,000 tonnes of basalt rock top-to-bottom with absolute mathematical precision.",
    highlights: [
      "Stand in awe inside the monolithic Kailasa Temple: a double-story stone temple complex carved from a single mountain spur.",
      "Visit Ajanta Caves (100 km north) to view world-famous 2,000-year-old Buddhist fresco tempera paintings of Jataka tales.",
      "Observe the harmonious coexistence of three major world philosophies carved alongside each other along a 2-kilometer cliff."
    ],
    studentTip: "Ajanta is closed on Mondays, and Ellora is closed on Tuesdays. Plan your itinerary so you can explore both across a long weekend.",
    etiquette: "No flash photography inside painted caves at Ajanta to preserve the ancient natural vegetable pigments.",
    howToReach: "Fly or take an express train (Devagiri Express or Vande Bharat) from Mumbai or Pune to Aurangabad (AWB) railway station.",
    mustTryFood: "Naan Qalia (aromatic mutton/vegetable curry with spiced clay-oven naan) and sweet Imarti."
  },
  {
    id: "mysore-palace",
    title: "Mysore Royal Palace (Amba Vilas)",
    subtitle: "Indo-Saracenic Architecture Illuminated by 100,000 Brilliant Bulbs",
    category: "unesco",
    categoryName: "Royal Heritage",
    region: "south",
    regionName: "South India",
    location: "Mysuru (Mysore)",
    state: "Karnataka",
    isUnesco: false,
    bestSeason: "September to March",
    idealDuration: "Day Trip or Weekend",
    studentBudgetInr: "₹1,000 - ₹2,500",
    studentBudgetUsd: "$12 - $30",
    nearestHubs: "Bengaluru (1.5 hrs by high-speed Vande Bharat Express)",
    image: "/media/heritage/mysore-palace.jpg",
    caption: "The grand facade of Mysore Palace featuring rose-pink marble domes, granite archways, and manicured lawns",
    description:
      "The official residence of the Wadiyar dynasty who ruled the Kingdom of Mysore for over 500 years, this Indo-Saracenic masterpiece fuses Hindu, Muslim, Rajput, and Gothic architectural styles. Its interiors showcase stained-glass ceilings from Scotland, cast-iron pillars from Glasgow, solid silver doors, and mosaic peacock courts. On Sunday evenings, the entire palace is illuminated by nearly 100,000 bulbs.",
    highlights: [
      "Be there at 7:00 PM on Sunday or public holidays to watch the breathtaking illumination of the palace accompanied by classical brass band music.",
      "Walk through the Gombe Thotti (Doll's Pavilion) and Kalyana Mantapa (Octagonal Marriage Pavilion) with stained-glass skylights.",
      "Visit Devaraja Market nearby—a vibrant 120-year-old bazaar overflowing with fragrant Mysore Jasmine, sandalwood, and spices."
    ],
    studentTip: "University student ID cards give access to concessions. Audio guides in English, French, German, and Spanish are available at the entrance kiosk.",
    etiquette: "Footwear must be deposited at the free counter outside the main entrance; indoor photography requires a nominal permit.",
    howToReach: "Frequent express trains (including 3 Vande Bharat services) connect Bengaluru City (SBC) to Mysuru Junction in just 90-100 minutes.",
    mustTryFood: "Mouth-melting Mysore Pak sweet, authentic crispy Mysore Masala Dosa with red chili-garlic chutney, and filter coffee."
  },
  {
    id: "rishikesh-himalayas",
    title: "Rishikesh: Yoga, Adventure & Holy Ganges",
    subtitle: "Yoga Capital of the World & Gateway to the Garhwal Himalayas",
    category: "spiritual",
    categoryName: "Spiritual & Living Heritage",
    region: "north",
    regionName: "North India",
    location: "Rishikesh",
    state: "Uttarakhand",
    isUnesco: false,
    bestSeason: "September to May",
    idealDuration: "Weekend (2-3 Days)",
    studentBudgetInr: "₹1,500 - ₹3,500",
    studentBudgetUsd: "$18 - $42",
    nearestHubs: "Dehradun (45 mins) · Delhi (4 hrs Jan Shatabdi / Highway)",
    image: "/media/heritage/rishikesh-yoga-ganga.jpg",
    caption: "Crystal-clear emerald waters of the Ganges flowing through the Himalayan foothills at Lakshman Jhula",
    description:
      "Tucked where the sacred Ganges emerges from the snow-capped Himalayan valleys onto the northern plains, Rishikesh is universally acclaimed as the Yoga Capital of the World. From the Beatles Ashram where 1960s pop icons studied transcendental meditation to serene Ayurvedic centers, white-water river rafting, and sunset devotional aarti ceremonies, Rishikesh is an ideal rejuvenation retreat for university students.",
    highlights: [
      "Attend the serene Ganga Aarti at Parmarth Niketan Ashram as twilight descends over the Himalayan mountains.",
      "Explore the Beatles Ashram (Chaurasi Kutia) in Rajaji Tiger Reserve, adorned with international student graffiti murals.",
      "Experience grade III and IV white-water river rafting from Shivpuri through Himalayan gorges with certified river guides."
    ],
    studentTip: "Rishikesh is an officially vegetarian and alcohol-free holy town. Try the organic vegan student cafes overlooking the river in Tapovan.",
    etiquette: "Maintain quiet demeanor during morning yoga meditation classes at ashrams; respect riverfront prayer sanctity.",
    howToReach: "Take the Vande Bharat or Jan Shatabdi Express from New Delhi to Haridwar or Yog Nagari Rishikesh railway station.",
    mustTryFood: "Ayurvedic herbal teas, organic smoothie bowls in Tapovan, Garhwali Kafuli, and hot Jalebis at Triveni Ghat."
  },
  {
    id: "ladakh-himalayas",
    title: "Ladakh: High-Altitude Himalayan Monasteries",
    subtitle: "Pangong Tso, Hemis Monastery & Khardung La Mountain Passes",
    category: "nature",
    categoryName: "Nature & Escapes",
    region: "north",
    regionName: "Himalayas & North",
    location: "Leh & Nubra Valley",
    state: "Ladakh",
    isUnesco: false,
    bestSeason: "May to September",
    idealDuration: "5-7 Days (Semester Break)",
    studentBudgetInr: "₹6,000 - ₹12,000",
    studentBudgetUsd: "$70 - $145",
    nearestHubs: "Leh Kushok Bakula Rimpochee Airport (IXL)",
    image: "/media/heritage/ladakh-himalayas.jpg",
    caption: "The surreal cobalt blue waters of Pangong Tso Lake set against arid, jagged Himalayan mountain ranges",
    description:
      "Known as the 'Land of High Passes', Ladakh sits in the rain shadow of the mighty Himalayas at an elevation exceeding 3,500 meters. Tibetan Buddhist monasteries (gompas) like Thiksey and Hemis cling dramatically to barren cliff faces, while high-altitude salt lakes like Pangong Tso change color from emerald green to deep azure under pristine starlit mountain skies.",
    highlights: [
      "Visit Thiksey Monastery at 6:00 AM to hear monks chanting morning prayers accompanied by long Tibetan trumpets.",
      "Camp near the shores of 134-km long Pangong Tso Lake and gaze at the Milky Way galaxy in one of the world's best dark-sky preserves.",
      "Drive across Khardung La (5,359 m), recognized among the highest motorable roads on the planet."
    ],
    studentTip: "Altitude sickness (AMS) is real! You MUST rest completely for your first 36-48 hours in Leh before undertaking any trekking or day trips.",
    etiquette: "Always walk around stupas (chortens) and prayer wheels in a clockwise direction. Ask permission before photographing monks.",
    howToReach: "Daily flights connect New Delhi (DEL) to Leh (IXL) in 80 minutes; adventurous road trips run via Manali-Leh Highway between June and September.",
    mustTryFood: "Steaming Tibetan Momos, Thukpa noodle soup, butter tea (Gur Gur Chai), and fresh apricot juice."
  },
  {
    id: "darjeeling-toy-train",
    title: "Darjeeling Himalayan Railway & Tea Plantations",
    subtitle: "UNESCO Mountain Steam Train & Sunrises over Mt. Kanchenjunga",
    category: "nature",
    categoryName: "Nature & Escapes",
    region: "east",
    regionName: "East & Northeast",
    location: "Darjeeling",
    state: "West Bengal",
    isUnesco: true,
    bestSeason: "March to May & October to December",
    idealDuration: "3 Days / 2 Nights",
    studentBudgetInr: "₹2,500 - ₹5,000",
    studentBudgetUsd: "$30 - $60",
    nearestHubs: "Siliguri / New Jalpaiguri (3 hrs) · Kolkata (overnight train)",
    image: "/media/heritage/darjeeling-tea-himalaya.jpg",
    caption: "Verdant terraced tea gardens with mist rolling across valleys toward the snow-clad peaks of Kanchenjunga",
    description:
      "The Darjeeling Himalayan Railway, opened in 1881, is a UNESCO World Heritage engineering feat. Tiny vintage steam locomotives known affectionately as 'Toy Trains' zigzag up steep mountain loops to an altitude of 2,258 meters at Ghum. Rolling emerald tea gardens produce the world's most aromatic muscatel teas beneath the dramatic backdrop of Mount Kanchenjunga, the world's 3rd highest mountain.",
    highlights: [
      "Take the vintage two-foot narrow-gauge Toy Train steam joyride from Darjeeling to the Batasia Loop and Ghum railway station.",
      "Watch the first rays of sunlight illuminate the snow peaks of Mount Kanchenjunga in fiery gold from Tiger Hill (4:00 AM).",
      "Tour the Happy Valley Tea Estate established in 1854 to understand the artisan process of plucking and fermenting world-famous orthodox tea."
    ],
    studentTip: "Book the Darjeeling Toy Train joyride 2-3 weeks in advance on the IRCTC portal, especially during October and spring holidays.",
    etiquette: "Carry warm layers even during summer evenings as mountain temperatures drop rapidly once the sun sets.",
    howToReach: "Take an overnight train from Kolkata to New Jalpaiguri (NJP) or fly to Bagdogra Airport (IXB), then take a shared jeep up the mountain road.",
    mustTryFood: "Tibetan shaphalay (crispy stuffed meat/vegetable pie), churpee cheese, and first-flush Darjeeling black tea."
  },
  {
    id: "diwali-holi-festivals",
    title: "Festivals of Lights & Colors (Diwali & Holi)",
    subtitle: "Immersive Living Cultural Traditions Celebrated Across Every University Campus",
    category: "festivals",
    categoryName: "Festivals & Cultural Life",
    region: "north",
    regionName: "All India",
    location: "Celebrated Nationwide",
    state: "All States & Union Territories",
    isUnesco: false,
    bestSeason: "October/November (Diwali) & March (Holi)",
    idealDuration: "3-4 Days Festival Season",
    studentBudgetInr: "₹500 - ₹1,500",
    studentBudgetUsd: "$6 - $18",
    nearestHubs: "Celebrated on all university campuses across India",
    image: "/media/heritage/diwali-celebration.jpg",
    caption: "Earthen terracotta diya oil lamps illuminating traditional geometric floral rangoli patterns",
    description:
      "India's vibrant festivals are living, interactive cultural experiences that bring university dormitories and cities together. During Diwali (the Festival of Lights), homes, campuses, and temples are decorated with thousands of clay oil lamps (diyas), rangoli floor art, and joyful sweet exchanges. During Holi (the Festival of Colors), students and faculty take to the grounds dancing to folk drums while playfully throwing organic powdered colors.",
    highlights: [
      "Join student hostel celebrations where international scholars dress in traditional kurtas and sarees for festival feasts.",
      "Witness massive illuminated temple processions and fireworks displays in major heritage cities like Varanasi, Jaipur, and Ayodhya.",
      "Experience university campus Holi gatherings with eco-friendly herbal gulal colors, festive gujiya sweets, and traditional music."
    ],
    studentTip: "Wear inexpensive white cotton clothes during Holi that you don't mind discarding; apply a light layer of coconut oil to your skin and hair before playing.",
    etiquette: "Always ask consent before applying gulal colors to strangers or elders; respect those who prefer not to participate.",
    howToReach: "Held everywhere! Most universities organize dedicated international student cultural festival programs on campus.",
    mustTryFood: "Festive Gujiyas, Kaju Katli, Motichoor Laddoos, and Thandai."
  },
  {
    id: "indian-street-food-culture",
    title: "Street Food Capitals & Night Bazaars",
    subtitle: "From Old Delhi Chandni Chowk to Mumbai Khau Gallis & Kolkata Chaat Trails",
    category: "culinary",
    categoryName: "Culinary & Night Bazaars",
    region: "north",
    regionName: "All Regions",
    location: "Delhi, Mumbai, Kolkata, Lucknow",
    state: "Multiple Metro Hubs",
    isUnesco: false,
    bestSeason: "Year-Round (Best Oct - Mar)",
    idealDuration: "Evening Food Trails",
    studentBudgetInr: "₹200 - ₹600 per trail",
    studentBudgetUsd: "$2.50 - $7",
    nearestHubs: "Walking distance from university metro stations in all major cities",
    image: "/media/heritage/street-food-culture.jpg",
    caption: "Sizzling iron tawa pans, fragrant ground spices, and mouth-watering street delicacies",
    description:
      "Indian cuisine is an endless journey of regional spices, aromas, and historical influences. Each city possesses its famous food lanes: Chandni Chowk and Majnu-ka-Tilla in Delhi, Mohammad Ali Road and Ghatkopar Khau Galli in Mumbai, Dacre Lane in Kolkata, and Hazratganj in Lucknow. International scholars find that exploring evening food bazaars is the quickest way to bond with local classmates.",
    highlights: [
      "Savor crispy, hollow Golgappas (Pani Puri) filled with spiced potatoes and tangy minted tamarind water served by street vendors.",
      "Taste century-old recipe butter-dripping Parathas in Old Delhi's historic Paranthe Wali Gali established in the 1870s.",
      "Enjoy authentic wood-fired Hyderabadi Dum Biryani served with spiced mirchi ka salan and cooling raita."
    ],
    studentTip: "Eat where you see long queues of local university students—high food turnover guarantees maximum freshness and hygiene!",
    etiquette: "Always ask vendors for 'less spicy' (Kam Mirchi) when you are first adjusting your palate to authentic Indian spice levels.",
    howToReach: "Easily accessible via city metro networks; use Chawri Bazar or Chandni Chowk metro stations in Delhi, or Churchgate in Mumbai.",
    mustTryFood: "Crispy Dosa, Pani Puri, Pav Bhaji, Chhole Bhature, Masala Chai in earthen clay kulhad cups."
  }
];
