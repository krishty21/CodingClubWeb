/**
 * Static site content extracted from the original CodingClubWeb-main project.
 * Used by the seed script to populate the dynamic content tables so the
 * website renders identically to the original out of the box.
 *
 * Super Admins can edit any of this content from the dashboard.
 */

// =========================================================
// SITE SETTINGS (key/value)
// =========================================================
export const SITE_SETTINGS: Record<string, string> = {
  // Brand
  club_name: "Coding Club",
  club_full_name: "Coding Club, NIT Andhra Pradesh",
  club_tagline: "From Code to Creativity, We Build It All",

  // Hero (home page)
  hero_title_line_1: "Coding Club",
  hero_title_line_2: "NIT Andhra Pradesh",
  hero_subtitle: "From Code to Creativity, We Build It All",
  hero_description:
    "Empowering students through technology, innovation, and collaborative learning. Join NIT Andhra Pradesh's premier coding community where passion meets purpose.",
  hero_cta_primary_label: "Explore Projects",
  hero_cta_primary_href: "#domains",
  hero_cta_secondary_label: "Upcoming Events",
  hero_cta_secondary_href: "/events",

  // "Who We Are" section
  who_we_are_badge: "Our Mission & Vision",
  who_we_are_title_pre: "Who ",
  who_we_are_title_highlight: "We Are",
  who_we_are_description:
    "The Coding Club of NIT Andhra Pradesh is a student-driven initiative built for all engineering students — from absolute beginners to advanced coders. We break down barriers and provide a supportive environment where students can explore, build, and grow together.",
  who_we_are_cta_title: "Ready to Start Your Journey?",
  who_we_are_cta_description:
    "Join hundreds of students who are already building the future through code.",
  who_we_are_cta_primary_label: "Join Our Community",
  who_we_are_cta_primary_href: "https://discord.gg/DjHkM7TMDK",
  who_we_are_cta_secondary_label: "View Projects",
  who_we_are_cta_secondary_href: "/resources",

  // Domains section
  domains_title: "Our Domains",
  domains_description:
    "Explore diverse technology domains and find your passion in the ever-evolving world of software development.",

  // Upcoming events section (home)
  upcoming_events_title: "Upcoming Events",
  upcoming_events_description:
    "Join us for exciting workshops, competitions, and tech talks designed to enhance your coding journey.",
  upcoming_events_empty_title: "No Upcoming Events",
  upcoming_events_empty_message: "Stay tuned!! new events will be announced soon!",

  // About page
  about_hero_title_pre: "About ",
  about_hero_title_highlight: "Our Club",
  about_hero_description:
    "The Coding Club of NIT Andhra Pradesh is a student-driven initiative built for all engineering students — from absolute beginners to advanced coders.",
  about_vision_title: "Our Vision",
  about_vision_text:
    "To foster a thriving, inclusive, and innovative tech community at NIT Andhra Pradesh that empowers students to explore, learn, and excel in the ever-evolving world of technology nurturing problem solvers, innovators, and leaders who are globally competent, nationally relevant, and socially responsible.",
  about_vision_card_title: "Tech Community",
  about_vision_card_subtitle: "Creating tomorrow's tech leaders today",
  about_mission_title_pre: "Our ",
  about_mission_title_highlight: "Mission",
  about_mission_intro:
    "We are committed to three core principles that guide everything we do.",
  about_faculty_title_pre: "Faculty ",
  about_faculty_title_highlight: "Advisor",

  // Faculty Advisor
  faculty_advisor_name: "Dr. K. Himabindu",
  faculty_advisor_position: "Faculty Advisor",
  faculty_advisor_department: "Computer Science & Engineering",
  faculty_advisor_image:
    "http://nitandhra.ac.in/faculty/assets/uploads/profile_images/16909.jpg",
  faculty_advisor_bio:
    "Dr. K. Himabindu is an Assistant Professor at NIT Andhra Pradesh, specializing in Artificial Intelligence and Natural Language Processing. With rich experience in academia and industry, she mentors students in cutting-edge technologies, fosters research and innovation, and guides them toward achieving their professional goals.",
  faculty_advisor_email: "himabinduk@nitandhra.ac.in",
  faculty_advisor_expertise: JSON.stringify([
    "Natural Language Processing through Deep Learning",
    "Explainable AI",
    "Few Shot Learning",
    "Educational Data Mining",
  ]),
  faculty_advisor_quote:
    '"The Coding Club represents the spirit of innovation and collaboration that defines our institution. I am proud to guide these talented students as they build the future of technology."',

  // Events page
  events_hero_title: "Events",
  events_hero_description:
    "Join our exciting workshops, contests, and bootcamps designed to enhance your coding skills and connect with fellow developers.",

  // Resources page
  resources_hero_title: "Resources",
  resources_hero_description:
    "Curated learning paths, tools, and projects to accelerate your coding journey and build amazing things.",

  // Blog page
  blog_hero_title: "Blog",
  blog_hero_description:
    "Insights, tutorials, and experiences from our coding community. Learn from fellow developers and share your knowledge.",

  // Team page
  team_hero_title: "Our Team",
  team_hero_description:
    "Meet the passionate leaders driving innovation and entrepreneurship at NIT Andhra Pradesh.",

  // Footer
  footer_description:
    "From Code to Creativity, We Build It All. NIT Andhra Pradesh's premier coding community where innovation meets collaboration.",
  footer_copyright:
    "© 2025 Coding Club, NIT Andhra Pradesh. All rights reserved. Built with ❤️ by the club members.",

  // Action buttons
  discord_url: "https://discord.gg/DjHkM7TMDK",
  get_started_url: "https://discord.gg/DjHkM7TMDK",
  get_started_label: "Get Started",

  // Contact
  contact_address_line_1: "NIT Andhra Pradesh",
  contact_address_line_2: "Tadepalligudem, West Godavari",
  contact_address_line_3: "Andhra Pradesh - 534101",
  contact_email: "coding@nitandhra.ac.in",
}

// =========================================================
// HERO STATS
// =========================================================
export const HERO_STATS = [
  {
    iconName: "Users",
    value: "30+",
    label: "Active Members",
    description: "Growing community",
    gradient: "from-blue-500 to-blue-600",
    displayOrder: 0,
  },
  {
    iconName: "Calendar",
    value: "4+",
    label: "Events Hosted",
    description: "This academic year",
    gradient: "from-purple-500 to-purple-600",
    displayOrder: 1,
  },
  {
    iconName: "Trophy",
    value: "10+",
    label: "Projects Built",
    description: "Open source & personal",
    gradient: "from-green-500 to-emerald-600",
    displayOrder: 2,
  },
]

// =========================================================
// PILLARS (Who We Are)
// =========================================================
export const PILLARS = [
  {
    title: "Competitive Programming",
    description:
      "Master algorithms and data structures through contests and practice sessions. Join our weekly coding challenges.",
    iconName: "Code",
    colorFrom: "from-primary",
    colorTo: "to-blue-600",
    features: JSON.stringify(["Weekly contests", "Algorithm workshops", "Interview prep"]),
    displayOrder: 0,
  },
  {
    title: "Open Source Development",
    description:
      "Contribute to real-world projects and build your developer portfolio. Collaborate with industry professionals.",
    iconName: "Github",
    colorFrom: "from-green-500",
    colorTo: "to-emerald-600",
    features: JSON.stringify(["Real projects", "Industry mentorship", "Portfolio building"]),
    displayOrder: 1,
  },
  {
    title: "Machine Learning & AI",
    description:
      "Explore cutting-edge AI/ML technologies and build intelligent applications that solve real problems.",
    iconName: "Brain",
    colorFrom: "from-accent",
    colorTo: "to-purple-600",
    features: JSON.stringify(["AI workshops", "Research projects", "Industry applications"]),
    displayOrder: 2,
  },
]

// =========================================================
// DOMAINS
// =========================================================
export const DOMAINS = [
  {
    title: "Web Development",
    description: "Full-stack web applications using modern frameworks like React, Next.js, and Node.js",
    iconName: "Code",
    color: "#4A90E2",
    displayOrder: 0,
  },
  {
    title: "Mobile Development",
    description: "Cross-platform mobile apps with React Native and Flutter for iOS and Android",
    iconName: "Smartphone",
    color: "#50C878",
    displayOrder: 1,
  },
  {
    title: "AI & Machine Learning",
    description: "Cutting-edge AI solutions, deep learning models, and data science projects",
    iconName: "Brain",
    color: "#FF6B6B",
    displayOrder: 2,
  },
  {
    title: "Competitive Programming",
    description: "Algorithm mastery, contest participation, and problem-solving excellence",
    iconName: "Trophy",
    color: "#FFD93D",
    displayOrder: 3,
  },
  {
    title: "Open Source",
    description: "Contributing to global projects and building tools for the developer community",
    iconName: "Globe",
    color: "#9B59B6",
    displayOrder: 4,
  },
  {
    title: "Backend & DevOps",
    description: "Scalable server architectures, cloud deployment, and system design",
    iconName: "Database",
    color: "#E67E22",
    displayOrder: 5,
  },
]

// =========================================================
// EVENTS
// =========================================================
export const EVENTS = [
  {
    title: "Web Development Workshop",
    description: "Learn modern web development with React and Next.js",
    date: "2024-02-15",
    time: "10:00 AM",
    location: "Computer Lab 1",
    type: "Workshop",
    status: "upcoming",
    image: "/web-development-workshop.png",
    registrations: 45,
    maxRegistrations: 60,
    displayOrder: 0,
  },
  {
    title: "Competitive Programming Contest",
    description: "Test your algorithmic skills in this exciting contest",
    date: "2024-02-20",
    time: "2:00 PM",
    location: "Main Auditorium",
    type: "Contest",
    status: "upcoming",
    image: "/competitive-programming-contest.png",
    registrations: 120,
    maxRegistrations: 150,
    displayOrder: 1,
  },
  {
    title: "AI/ML Bootcamp",
    description: "Dive deep into machine learning fundamentals",
    date: "2024-02-25",
    time: "9:00 AM",
    location: "Seminar Hall",
    type: "Bootcamp",
    status: "upcoming",
    image: "/ai-machine-learning-bootcamp.png",
    registrations: 80,
    maxRegistrations: 100,
    displayOrder: 2,
  },
  {
    title: "Hackathon 2024",
    description: "24-hour coding marathon with amazing prizes",
    date: "2024-01-20",
    time: "9:00 AM",
    location: "Innovation Lab",
    type: "Hackathon",
    status: "past",
    image: "/hackathon-coding-event.png",
    registrations: 200,
    maxRegistrations: 200,
    displayOrder: 3,
  },
]

// =========================================================
// ABOUT PAGE MISSION CARDS
// =========================================================
export const MISSION_CARDS = [
  {
    title: "Structured Learning Pathways",
    description:
      "Provide accessible pathways for students of all skill levels to gain hands-on coding experience, explore diverse tech domains, and apply knowledge in real-world projects.",
    iconName: "Target",
    displayOrder: 0,
  },
  {
    title: "Collaborative Environment",
    description:
      "Build a collaborative environment where peer-to-peer learning, healthy competition, and mentorship between juniors, seniors, and alumni drive personal and professional growth.",
    iconName: "Users",
    displayOrder: 1,
  },
  {
    title: "Industry Connections",
    description:
      "Connect students with industry, research opportunities, and impactful resources, enabling them to solve relevant problems and prepare for global careers in technology.",
    iconName: "Award",
    displayOrder: 2,
  },
]

// =========================================================
// RESOURCE ITEMS
// =========================================================
export const RESOURCE_ROADMAPS = [
  {
    title: "Frontend Development 2024",
    description: "Complete roadmap from HTML/CSS to React and beyond",
    difficulty: "Beginner to Advanced",
    duration: "3-6 months",
    topics: ["HTML/CSS", "JavaScript", "React", "Next.js", "TypeScript"],
    url: "#",
  },
  {
    title: "Backend Development",
    description: "Server-side development with Node.js and databases",
    difficulty: "Intermediate",
    duration: "4-8 months",
    topics: ["Node.js", "Express", "MongoDB", "PostgreSQL", "APIs"],
    url: "#",
  },
  {
    title: "Data Structures & Algorithms",
    description: "Master DSA for competitive programming and interviews",
    difficulty: "Beginner to Expert",
    duration: "6-12 months",
    topics: ["Arrays", "Trees", "Graphs", "Dynamic Programming", "Greedy"],
    url: "#",
  },
  {
    title: "Machine Learning Path",
    description: "From basics to advanced ML and deep learning",
    difficulty: "Intermediate to Advanced",
    duration: "8-12 months",
    topics: ["Python", "NumPy", "Pandas", "Scikit-learn", "TensorFlow"],
    url: "#",
  },
]

export const RESOURCE_TOOLKITS = [
  {
    title: "Web Development Starter Kit",
    description: "Everything you need to start web development",
    tools: ["VS Code", "Git", "Node.js", "Chrome DevTools", "Figma"],
    toolkitCategory: "Development",
    downloads: 1250,
  },
  {
    title: "Competitive Programming Setup",
    description: "Optimized environment for competitive coding",
    tools: ["C++ Compiler", "Code Templates", "Fast I/O", "Debugging Tools"],
    toolkitCategory: "Programming",
    downloads: 890,
  },
  {
    title: "AI/ML Research Kit",
    description: "Tools and libraries for machine learning projects",
    tools: ["Jupyter", "Anaconda", "Google Colab", "Kaggle", "Papers"],
    toolkitCategory: "AI/ML",
    downloads: 670,
  },
  {
    title: "Mobile Development Bundle",
    description: "Cross-platform mobile development essentials",
    tools: ["React Native", "Flutter", "Android Studio", "Xcode", "Firebase"],
    toolkitCategory: "Mobile",
    downloads: 540,
  },
]

export const RESOURCE_PROJECTS = [
  {
    title: "E-Commerce Platform",
    description: "Full-stack e-commerce with React and Node.js",
    tech: ["React", "Node.js", "MongoDB", "Stripe"],
    author: "Arjun Sharma",
    stars: 45,
    github: "https://github.com",
  },
  {
    title: "Chat Application",
    description: "Real-time chat app with Socket.io",
    tech: ["React", "Socket.io", "Express", "MongoDB"],
    author: "Priya Patel",
    stars: 32,
    github: "https://github.com",
  },
  {
    title: "Task Management System",
    description: "Kanban-style project management tool",
    tech: ["Next.js", "TypeScript", "Prisma", "PostgreSQL"],
    author: "Rahul Kumar",
    stars: 28,
    github: "https://github.com",
  },
  {
    title: "Weather Prediction ML",
    description: "Machine learning model for weather forecasting",
    tech: ["Python", "TensorFlow", "Pandas", "Matplotlib"],
    author: "Ananya Gupta",
    stars: 38,
    github: "https://github.com",
  },
]

export const RESOURCE_LINK_CATEGORIES = [
  {
    title: "Documentation & References",
    resources: [
      { name: "MDN Web Docs", url: "https://developer.mozilla.org", description: "Complete web development reference" },
      { name: "React Documentation", url: "https://react.dev", description: "Official React docs and tutorials" },
      { name: "Node.js Docs", url: "https://nodejs.org/docs", description: "Server-side JavaScript documentation" },
      { name: "Python.org", url: "https://python.org", description: "Official Python documentation" },
    ],
  },
  {
    title: "Learning Platforms",
    resources: [
      { name: "freeCodeCamp", url: "https://freecodecamp.org", description: "Free coding bootcamp with certificates" },
      { name: "Coursera", url: "https://coursera.org", description: "University-level courses online" },
      { name: "Udemy", url: "https://udemy.com", description: "Practical skills courses" },
      { name: "YouTube Channels", url: "#", description: "Curated list of best coding channels" },
    ],
  },
  {
    title: "Practice Platforms",
    resources: [
      { name: "LeetCode", url: "https://leetcode.com", description: "Coding interview preparation" },
      { name: "HackerRank", url: "https://hackerrank.com", description: "Programming challenges and contests" },
      { name: "Codeforces", url: "https://codeforces.com", description: "Competitive programming platform" },
      { name: "GeeksforGeeks", url: "https://geeksforgeeks.org", description: "DSA tutorials and practice" },
    ],
  },
]

// =========================================================
// FOOTER
// =========================================================
export const FOOTER_SOCIAL_LINKS = [
  { platform: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/company/codingclubnitanp", iconName: "Linkedin", displayOrder: 0 },
  { platform: "email", label: "Email", url: "mailto:coding@nitandhra.ac.in", iconName: "Mail", displayOrder: 1 },
  { platform: "instagram", label: "Instagram", url: "https://www.instagram.com/codingclubnitanp", iconName: "Instagram", displayOrder: 2 },
]

export const FOOTER_QUICK_LINKS = [
  { label: "About", href: "/about", displayOrder: 0 },
  { label: "Events", href: "/events", displayOrder: 1 },
  { label: "Team", href: "/team", displayOrder: 2 },
  { label: "Resources", href: "/resources", displayOrder: 3 },
  { label: "Blog", href: "/blog", displayOrder: 4 },
]

export const FOOTER_CONTACTS = [
  {
    label: "Address",
    value: "NIT Andhra Pradesh\nTadepalligudem, West Godavari\nAndhra Pradesh - 534101",
    iconName: "MapPin",
    displayOrder: 0,
  },
  {
    label: "Email",
    value: "coding@nitandhra.ac.in",
    iconName: "Mail",
    displayOrder: 1,
  },
]
