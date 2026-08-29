const PROFILE = {
  name: "Hi, I'm Aditya.",
  tagline: "Trying my best (to survive)",
  bio: "Current sophomore at South Asian University with a keen interest in cybersecurity. Follow me on my journey.",
  photo: "assets/profile.jpg", 
  resume: "assets/resume.pdf",     
  promptHost: "aditya@adhikari"
};

const EDUCATION = [
  {
    title: "B.Tech in Computer Science",
    org: "South Asian University, New Delhi",
    period: "2024 — 2028",
    desc: "Recipient of Presidential Scholarship due to academic excellence"
  },
  {
    title: "A - Levels",
    org: "Headstart School, Islamabad",
    period: "2020 - 2024",
    desc: "Completed my A - Levels in Biology, Chemistry, Mathematics and Physics"
  }
];

const EXPERIENCE = [
  {
    title: "Social Media Internship",
    org: "Glimpse Markets",
    period: "Jun 2025 - April 2026",
    desc: "Uploading engaging viral meme content specifically designed to market and promote Bitcoin",
    learned: ["Content creation", "Digital marketing", "Social media management", "Copywriting", "Video editing", "Photo editing"]
  },
  {
    title: "Intern",
    org: "Engineering General Consultants (Pvt) Ltd",
    period: "Oct 2023 - November 2023",
    desc: "Worked directly under professionals to gain insight into engineering",
    learned: ["Technical documentation", "Site observation", "Teamwork", "Professional communication"]
  }
];

const CERTIFICATIONS = [
  { title: "Pre Security (SEC0) Certificate", org: "TryHackMe", period: "2026-2029", desc: "Technical Understanding of Cybersecurity" },
  { title: "Security 101 (SEC1)", org: "TryHackMe", period: "2026-2029", desc: "Foundations of Cybersecurity" },
  { title: "TBA", org: "TBA", period: "", desc: "TBA" }
];

const SKILLS = [
  { label: "languages", items: ["Python", "C", "Bash", "SQL", "PowerShell"] },
  { label: "tools",     items: ["Linux", "Wireshark", "VirtualBox", "Git", "Metasploit"] },
  { label: "defensive", items: ["Wazuh SIEM", "Sysmon", "Log Analysis", "Detection Engineering", "MITRE ATT&CK"] },
  { label: "spoken",    items: ["English", "Nepali", "Hindi", "German"] }
];

const PROJECTS = [
  {
    title: "SOC Home Lab - Wazuh SIEM",
    desc: "Wazuh SIEM for a Windows endpoint",
    href: "https://github.com/AdhikariAditya/SOC-Home-Lab",
    hrefLabel: "View GitHub",
    learned: ["Wazuh SIEM", "Sysmon", "Log Analysis", "MITRE ATT&CK", "Windows internals"]
  },
  {
    title: "File Integrity Monitor",
    desc: "Tool to monitor any changes in files you have",
    href: "https://github.com/AdhikariAditya/FileIntegrityManager",
    hrefLabel: "View GitHub",
    learned: ["Python", "hashlib", "pathlib", "argparse", "json", "sys"]
  },
  {
    title: "Under Construction",
    desc: "Updates Coming Soon",
    href: "https://github.com/adhikariaditya",
    hrefLabel: "GitHub Soon",
    learned: []
  }
];

const BLOGS = [
  { date: "16-09-2026", title: "CTF: Pickle Rick", tag: "ctf", slug: "pickle-rick" }
];

const CONTACT = [
  { label: "linkedin", value: "in/adhikari-aditya",              href: "https://www.linkedin.com/in/adhikari-aditya/" },
  { label: "github",   value: "@adhikariaditya",                 href: "https://github.com/adhikariaditya" }
];

const CONTACT_FORM = {
  endpoint: "https://formspree.io/f/mjybqazj",
  subject:  "New message from adhikariaditya.github.io"
};

function onWeb(list)  { return (list || []).filter(x => !x.show || x.show === 'both' || x.show === 'web'); }
function onTerm(list) { return (list || []).filter(x => !x.show || x.show === 'both' || x.show === 'term'); }
