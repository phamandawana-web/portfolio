// Mock data structure for the academic website
// Update this file with your actual content

export const profileData = {
  name: "Dr. [Your Name]",
  title: "Associate Professor",
  department: "Department of [Your Department]",
  university: "[Your University]",
  email: "your.email@university.edu",
  officeHours: "Tuesday & Thursday, 2:00 PM - 4:00 PM",
  office: "Building Name, Room 123",
  bio: "Brief bio about your research interests and teaching philosophy. Update this with your actual information.",
  profileImage: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop",
  cv: "/path/to/cv.pdf",
  socialLinks: {
    googleScholar: "#",
    researchGate: "#",
    linkedin: "#",
    github: "#"
  }
};

export const teachingData = {
  philosophy: {
    title: "Teaching Philosophy",
    content: "Your teaching philosophy goes here. Describe how you approach learning, balance theory vs practice, and mentor students. This should be 1-2 compelling paragraphs that showcase your pedagogical approach.",
    statementPdf: "/path/to/teaching-statement.pdf"
  },
  courses: [
    {
      id: 1,
      title: "Advanced Machine Learning",
      code: "CS 601",
      level: "Graduate",
      description: "Comprehensive course covering advanced machine learning techniques including deep learning, reinforcement learning, and probabilistic models.",
      topics: ["Neural Networks", "Deep Learning", "Reinforcement Learning", "Bayesian Methods"],
      tools: ["Python", "TensorFlow", "PyTorch"],
      syllabus: "/path/to/syllabus-cs601.pdf"
    },
    {
      id: 2,
      title: "Data Structures and Algorithms",
      code: "CS 301",
      level: "Undergraduate",
      description: "Fundamental course on data structures, algorithm design, and complexity analysis.",
      topics: ["Trees", "Graphs", "Dynamic Programming", "Complexity Analysis"],
      tools: ["Python", "Java"],
      syllabus: "/path/to/syllabus-cs301.pdf"
    },
    {
      id: 3,
      title: "Introduction to Artificial Intelligence",
      code: "CS 401",
      level: "Undergraduate",
      description: "Introduction to AI concepts including search algorithms, knowledge representation, and basic machine learning.",
      topics: ["Search Algorithms", "Knowledge Representation", "Machine Learning Basics"],
      tools: ["Python", "MATLAB"],
      syllabus: "/path/to/syllabus-cs401.pdf"
    }
  ],
  studentProjects: [
    {
      id: 1,
      title: "Project Title 1",
      student: "Student Name",
      year: "2024",
      type: "MS Thesis",
      description: "Brief description of the project and its outcomes.",
      link: "#"
    },
    {
      id: 2,
      title: "Project Title 2",
      student: "Student Name",
      year: "2023",
      type: "Capstone Project",
      description: "Brief description of the project and its outcomes.",
      link: "#"
    },
    {
      id: 3,
      title: "Project Title 3",
      student: "Student Name",
      year: "2023",
      type: "PhD Dissertation",
      description: "Brief description of the project and its outcomes.",
      link: "#"
    }
  ]
};

export const researchData = {
  overview: "Your research overview goes here. Describe the problems you study, why they matter, and how your work is distinct. Keep it accessible to non-specialists while showing depth.",
  areas: [
    {
      id: 1,
      title: "Research Area 1",
      description: "Description of this research area, key problems, and your approach.",
      methods: ["Method 1", "Method 2", "Method 3"],
      publications: [1, 2, 3]
    },
    {
      id: 2,
      title: "Research Area 2",
      description: "Description of this research area, key problems, and your approach.",
      methods: ["Method 1", "Method 2"],
      publications: [4, 5]
    },
    {
      id: 3,
      title: "Research Area 3",
      description: "Description of this research area, key problems, and your approach.",
      methods: ["Method 1", "Method 2", "Method 3"],
      publications: [6, 7, 8]
    }
  ],
  publications: [
    {
      id: 1,
      type: "journal",
      title: "Title of Your Journal Paper",
      authors: "Author1, Author2, Your Name",
      venue: "Journal Name",
      year: 2024,
      links: {
        pdf: "#",
        arxiv: "#",
        code: "#",
        dataset: "#"
      }
    },
    {
      id: 2,
      type: "conference",
      title: "Title of Your Conference Paper",
      authors: "Your Name, Author2, Author3",
      venue: "Conference Name (CONF 2024)",
      year: 2024,
      links: {
        pdf: "#",
        arxiv: "#",
        code: "#"
      }
    },
    {
      id: 3,
      type: "journal",
      title: "Another Journal Publication",
      authors: "Author1, Your Name, Author3",
      venue: "Journal Name",
      year: 2023,
      links: {
        pdf: "#",
        arxiv: "#"
      }
    },
    {
      id: 4,
      type: "conference",
      title: "Conference Paper Title",
      authors: "Your Name, Author2",
      venue: "Conference Name (CONF 2023)",
      year: 2023,
      links: {
        pdf: "#"
      }
    },
    {
      id: 5,
      type: "preprint",
      title: "Preprint Title",
      authors: "Author1, Your Name, Author3, Author4",
      venue: "arXiv",
      year: 2024,
      links: {
        arxiv: "#"
      }
    },
    {
      id: 6,
      type: "journal",
      title: "Earlier Journal Work",
      authors: "Your Name, Author2",
      venue: "Journal Name",
      year: 2022,
      links: {
        pdf: "#"
      }
    },
    {
      id: 7,
      type: "conference",
      title: "Conference Contribution",
      authors: "Author1, Author2, Your Name",
      venue: "Conference Name (CONF 2022)",
      year: 2022,
      links: {
        pdf: "#",
        code: "#"
      }
    },
    {
      id: 8,
      type: "journal",
      title: "Foundational Work",
      authors: "Your Name, Author2, Author3",
      venue: "Journal Name",
      year: 2021,
      links: {
        pdf: "#"
      }
    }
  ],
  ongoingProjects: [
    {
      id: 1,
      title: "Ongoing Project Title 1",
      funding: "NSF Grant #12345",
      collaborators: ["Collaborator 1", "Collaborator 2"],
      description: "Description of the ongoing project and expected outcomes.",
      expectedCompletion: "2025"
    },
    {
      id: 2,
      title: "Ongoing Project Title 2",
      funding: "Industry Partner",
      collaborators: ["Collaborator 3"],
      description: "Description of the ongoing project and expected outcomes.",
      expectedCompletion: "2024"
    }
  ]
};

export const labData = {
  mission: "Our lab focuses on [research focus]. We aim to [lab goals and mission statement].",
  currentMembers: [
    {
      id: 1,
      name: "PhD Student 1",
      role: "PhD Student",
      interests: "Research interests",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
      website: "#"
    },
    {
      id: 2,
      name: "PhD Student 2",
      role: "PhD Student",
      interests: "Research interests",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop",
      website: "#"
    },
    {
      id: 3,
      name: "MS Student 1",
      role: "MS Student",
      interests: "Research interests",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop",
      website: "#"
    },
    {
      id: 4,
      name: "MS Student 2",
      role: "MS Student",
      interests: "Research interests",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop",
      website: "#"
    }
  ],
  alumni: [
    {
      name: "Alumni Name 1",
      degree: "PhD, 2023",
      currentPosition: "Assistant Professor at University X"
    },
    {
      name: "Alumni Name 2",
      degree: "MS, 2023",
      currentPosition: "Research Scientist at Company Y"
    },
    {
      name: "Alumni Name 3",
      degree: "PhD, 2022",
      currentPosition: "Postdoctoral Researcher at University Z"
    },
    {
      name: "Alumni Name 4",
      degree: "MS, 2022",
      currentPosition: "Software Engineer at Tech Company"
    }
  ],
  activities: [
    "Weekly reading group on Fridays at 3 PM",
    "Bi-weekly lab meetings",
    "Annual lab retreat",
    "Guest speaker series"
  ]
};

export const serviceData = {
  reviewing: [
    "Journal Name 1",
    "Journal Name 2",
    "Conference Name 1",
    "Conference Name 2",
    "Conference Name 3"
  ],
  programCommittees: [
    {
      role: "Program Committee Member",
      venue: "Conference Name",
      year: "2024"
    },
    {
      role: "Area Chair",
      venue: "Conference Name",
      year: "2023"
    },
    {
      role: "Organizing Committee",
      venue: "Workshop Name",
      year: "2023"
    }
  ],
  editorial: [
    {
      role: "Associate Editor",
      venue: "Journal Name",
      period: "2023 - Present"
    }
  ],
  departmental: [
    "Graduate Admissions Committee",
    "Curriculum Committee",
    "Diversity & Inclusion Committee"
  ]
};

export const newsData = [
  {
    id: 1,
    date: "March 2024",
    title: "New paper accepted at Conference Name",
    description: "Our paper on [topic] has been accepted."
  },
  {
    id: 2,
    date: "February 2024",
    title: "Student won best poster award",
    description: "Congratulations to [student name] for winning the best poster award."
  },
  {
    id: 3,
    date: "January 2024",
    title: "New NSF grant awarded",
    description: "Received NSF grant for research on [topic]."
  }
];