// Mock data structure for the academic website
// Update this file with your actual content

export const profileData = {
  name: "Dr. Prince Hamandawana",
  title: "Assistant Professor",
  department: "Department of Software & Computer Engineering",
  university: "Ajou University, Suwon, South Korea",
  email: "phamandawana@ajou.ac.kr",
  officeHours: "Monday & Friday, 10:00 AM - 6:00 PM",
  office: "Industry-University Cooperation Building, Office 822",
  bio: "I am a dedicated and goal driven computer systems researcher, with the desire to fully utilize my technical skills, knowledge and research experiences in order to unlock and realize positive research outcomes. Equipped with a calculated and methodical approach to problem solving, my main drive is to play a pivotal role towards the attainment of targeted research contributions in all projects that I take lead and those I participate in.",
  profileImage: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/k1emhgqc_prince-photo.jpg",
  cv: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/9rjns1an_CV%20Prince%20Hamandawana%20%281%29.pdf",
  socialLinks: {
    googleScholar: "https://scholar.google.com/citations?user=adgtAm8AAAAJ",
    researchGate: "#",
    linkedin: "#",
    github: "#"
  }
};

export const teachingData = {
  philosophy: {
    title: "Teaching Philosophy",
    content: "I view teaching as a collaborative learning process where students actively build understanding through engagement, discussion, and hands-on practice. My approach emphasizes inclusivity and clear structure, recognizing that students come from diverse backgrounds and learn at different paces. Using an Inclusive Trickled-Down Engagement (ITDE) approach, I guide students from fundamental concepts to practical implementation, real-world systems, and independent problem-solving. By combining theory with case studies, implementation-focused activities, and continuous feedback, I aim to create an accessible learning environment that builds confidence, curiosity, and long-term learning skills.",
    statementPdf: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/29cvi982_Prince%20Hamandawana%20Teaching%20Phylosophy.pdf"
  },
  courses: [
    {
      id: 1,
      title: "Data Structures - Ajou University",
      code: "SCE 205",
      level: "Undergraduate",
      description: "This is a comprehensive course covering fundamental and advanced data structures, including arrays, linked lists, trees, graphs, hashing, and their applications in efficient algorithm design.",
      topics: ["Performance Analysis", "Arrays, Structs and Unions", "Stacks and Queues", "Linked Lists",  "Trees", "Graphs", "Sorting", "Hashing", "Search Structure, AVL and Red-black Trees" ],
      tools: ["All coding assignments in C Programming Language"],
      syllabus: "/path/to/syllabus-sce205.pdf"
    },
    {
      id: 2,
      title: "Algorithms - Ajou University",
      code: "SCE 231",
      level: "Undergraduate",
      description: "This is a comprehensive course covering core algorithm design paradigms, efficiency analysis, and problem-solving techniques for real-world computational challenges.",
      topics: ["Recursive and Iterative Analysis", "Divide and Conquer", "Dynamic Programming", "Greedy algorithms", "Backtracking", "Branch and Bound", "Lower Bound of Searching and Sorting", "Intractable Problems (NP Theory)"],
      tools: ["C", "C++"],
      syllabus: "/path/to/syllabus-sce231.pdf"
    },
    {
      id: 3,
      title: "Operating Systems - Ajou University",
      code: "CS 401",
      level: "Undergraduate",
      description: "This course explores core operating system principles, including process management, concurrency, memory management, file systems, and CPU scheduling.",
      topics: ["OS Structure", "Processes", "Threads and Concurrency", "scheduling", "Syncronization", "Memory Management", "Virtual Memory", "Secondary Storage", "IO and File system"],
      tools: ["Python", "MATLAB"],
      syllabus: "/path/to/syllabus-cs401.pdf"
    },
    {
      id: 4,
      title: "Deep Learning - Soongsil University" ,
      code: "CS 602",
      level: "Graduate",
      description: "This course explores advanced principles of computer vision and deep learning, including neural network architectures, optimization techniques, transfer learning, NLP, reinforcement learning, Transformers, ResNets, model interpretability, ethical considerations, and real-world projects.",
      topics: ["Neural Networks", "Model Optimization Techniques", "Reinforcement Learning", "Transfer Learning", "Natural Language Processing (NLP)", "Advanced Architectures", "explainable AI (XAI): Grad-CAM", "Real-World Projects"],
      tools: ["Python", "TensorFlow", "PyTorch"],
      syllabus: "/path/to/syllabus-cs602.pdf"
    }
  ],
  studentProjects: [
    {
      id: 1,
      title: " Multi-Grade Brain Tumor Detection",
      student: "Ahmad Ishaq",
      year: "2025",
      type: "PhD Project",
      description: "We developed an enhanced EfficientNet-based deep learning model for automated multigrade brain tumor detection and classification from MRI images, enabling us to accurately distinguish four tumor types: glioma, meningioma, pituitary tumor, and non-tumor. To improve interpretability, we integrated Grad-CAM, and our approach combines data augmentation, transfer learning, and additional optimization layers, achieving an average accuracy of 98.6% on standard datasets.",
      link: " https://www.mdpi.com/2079-9292/14/4/710 "
    },
    {
      id: 2,
      title: "Korean Call Content Vishing dataset",
      student: "Milandu Keith Moussavou Boussougou",
      year: "2025",
      type: "PhD Project",
      description: "We developed an enhanced version of the Korean Call Content Vishing (KorCCVi v2) dataset, including both original and augmented data, to address challenges of data imbalance in Korean voice phishing detection. By applying multilingual back-translation (using English, Chinese, and Japanese) and SMOTE, we created a robust dataset that supports machine learning and deep learning research in NLP and cybersecurity.",
      link: "https://ieee-dataport.org/documents/korean-voice-phishing-detection-dataset-multilingual-back-translation-and-smote"
    },
    {
      id: 3,
      title: "FaceDisentGAN",
      student: "Meng Xu",
      year: "2025",
      type: "PhD Project",
      description: "We developed FaceDisentGAN, a novel GAN-based framework for precise and controllable facial attribute editing. By addressing attribute entanglement through a disentanglement module with orthogonal channel attention, and employing a two-stage training strategy, we improved identity preservation and image quality. We also introduced two evaluation metrics, OPS and PMR, to assess editing fidelity, achieving state-of-the-art performance on the CelebA-HQ dataset.",
      link: "https://www.sciencedirect.com/science/article/abs/pii/S0925231225023781"
    }
  ]
};

export const researchData = {
  overview: "Our research focuses on the design and implementation of scalable storage and data transfer systems for data-intensive and compute-intensive workloads, as well as intelligent machine learning systems. We study these problems from both theoretical and practical perspectives, with an emphasis on building real, deployable system prototypes. Our work explores cluster-wide inline deduplication, compute–storage co-design, CPU/GPU resource orchestration, hierarchical and deduplication-aware caching for machine learning workloads, and high-performance object-based data transfer with end-to-end data integrity guarantees. In parallel, we develop intelligent machine learning systems spanning facial editing, natural language processing, and medical image analysis, and we support these applications through efficient system and storage designs. Through full-system prototyping and large-scale evaluation, we aim to deliver practical solutions that improve performance, space efficiency, reliability, and intelligence in modern computing systems.",
  areas: [
    {
      id: 1,
      title: "Research Area 1: Distributed HPC Storage-Compute Systems Optimizations",
      description: "We focus on the design and optimization of scalable storage systems for data-intensive and compute-intensive workloads. Our research explores cluster-wide inline deduplication, content fingerprinting, and metadata management in shared-nothing storage architectures, with particular emphasis on minimizing performance overheads introduced by deduplication. We develop resource-aware frameworks that orchestrate heterogeneous compute resources, including CPUs and GPUs, to accelerate fingerprinting and other storage-side computations under dynamic workloads. In addition, we investigate hierarchical caching and deduplication-aware storage designs to improve the performance of machine learning and deep learning applications on large-scale storage clusters. Overall, our work bridges storage systems and computing resource orchestration to deliver high performance, space efficiency, and scalability in modern distributed storage platforms.",
      methods: ["Cluster-wide deduplication", "Content fingerprinting", "Inline deduplication",  "DIstributed Metadata sharding",  "Hash-based placement",  "Hierarchical Caching",   "Cache Orchestration", "GPU Acceleration", "COmpute-Storage co-design", "Performance Modelling", "Large-scale evaluation",  "System Prototyping"],
      publications: [1, 2, 3]
    },
    {
      id: 3,
      title: "Research Area 2: End-to-End Data Integrity for Large-Scale Data Transfer Systems",
      description: "We investigate efficient end-to-end data integrity verification mechanisms for large-scale, object-based data transfer systems operating in distributed and high-performance computing environments. Our research focuses on ensuring data correctness across storage, memory, and network components while minimizing computational, memory, and storage overhead. By leveraging probabilistic data structures and multi-level integrity verification, we design scalable frameworks that accurately detect and recover from data corruption at object, file, and dataset levels, even under out-of-order and highly parallel data transfer scenarios.",
      methods: ["Bloom Filters", "Probabilistic Harshing", "Cross Referencing filters", "False positives elimination", "Layout-Aware verification", "Error handling"],
      publications: [6, 7, 8]
    },
    {
      id: 3,
      title: "Research Area 3: Applied Deep Learning for Vision, Language, and Security",
      description: "We conduct research on advanced machine learning and deep learning methods that emphasize efficiency, interpretability, and robustness across visual, textual, and multimodal data. Our work spans medical image analysis, generative modeling, and cybersecurity applications, with a common goal of designing scalable and trustworthy AI systems. We develop parameter-efficient convolutional and generative architectures for tasks such as multi-grade brain tumor classification and controllable facial attribute editing, incorporating explainable AI and disentanglement mechanisms to improve transparency and semantic control. In parallel, we investigate natural language processing techniques for detecting social engineering and voice phishing attacks, leveraging data augmentation and hybrid machine learning frameworks to handle real-world data imbalance and linguistic variability. Through these efforts, we aim to advance practical, interpretable, and application-driven AI solutions that bridge methodological innovation with real-world impact.",
      methods: ["CNNs",  "Transfer Learning", "Data Augmentation", "Grad-CAM", "GANs", "Cross-Channel Attention", "Semantic Allignment", "Image Synthesis", "Text classification", "Feature Engineering", "Word Ebedding", "Back-Translation", "NLP"],
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
    
  ]
};

export const labData = {
  mission: "Database and Dependable Computing (DBDC) laboratory with the vision and goal of, future ICT technology research, is conducting the research and development of new ICT technologies with the aim of supporting the current big data trends and database revolution.  Our current work mainly focuses on Natural Language Processing for Question Answering, NLP for Sentiment Analysis, Big data technologies such as fault-tolerance, scheduling techniques, Flash memory database, Location-based query processing, and Education systems.",
  currentMembers: [
    {
      id: 1,
      name: "Prof. Tae-Sun Chung",
      role: "Head of DBDC",
      interests: "Flash memory storage, XML databases, database systems, and deep learning engineering.",
      image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/femlxl8q_Prof.%20Tae-Sun%20Chung.jpg",
      website: "#"
    },
    {
      id: 2,
      name: "Prof. Sung-Soo Kim",
      role: "Collaborating Professor",
      interests: "Dependable system and networks, autonomic computing, and ubiquitous computing and networks",
      image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/bsjf6zex_Prof.%20Sung-Soo%20Kim.jpg",
      website: "#"
    },
    {
      id: 3,
      name: "Prof. Prince Hamandawana",
      role: "Graduate Students Supervision",
      interests: "distributed and parallel storage systems, Applied Machine Learning, Medical Image Analysis, Generative Modelling, Computer Vision. ",
      image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/pl0k33yz_Prof.%20Prince%20Hamandawana.jpg",
      website: "#"
    },
    {
      id: 4,
      name: "Prof. Xiaohan Ma",
      role: "Graduate Students Supervision",
      interests: "Machine learning, generative models, and the innovative application of these technologies in sign language and image generation.",
      image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/xdc8nxe0_Prof.%20Xiaohan%20Ma.jpg",
      website: "#"
    },
    {
      id: 5,
      name: "Dr. Preethika Kasu",
      role: "Post-Doctoral Fellow",
      interests: "distributed systems, High-performance data transfer, Fault tolerance and recovery.",
      image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/aor9q3j9_Dr.%20Preethika%20Kasu.jpg",
      website: "#"
    },
    {
      id: 6,
      name: "Han Seung-Hyun (한승현)",
      role: "PhD Student",
      interests: "distributed and parallel storage systems, Applied Machine Learning, Medical Image Analysis, Generative Modelling, Computer Vision. ",
      image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/lci9tq52_Han%20Seung-Hyun%20%28%ED%95%9C%EC%8A%B9%ED%98%84%29.jpg",
      website: "#"
    },
    {
      id: 7,
      name: "Joo Jae-Hong (주재홍)",
      role: "PhD Student",
      interests: "distributed and parallel storage systems, Applied Machine Learning, Medical Image Analysis, Generative Modelling, Computer Vision. ",
      image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/b2y32y5r_Joo%20Jae-Hong%20%28%EC%A3%BC%EC%9E%AC%ED%99%8D%29.jpg",
      website: "#"
    },
    {
      id: 8,
      name: "Sim Young-Ju (심영주)",
      role: "PhD Student",
      interests: "Machine learning, generative models, and the innovative application of these technologies in sign language and image generation.",
      image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/lxy4da57_Sim%20Young-Ju%20%28%EC%8B%AC%EC%98%81%EC%A3%BC%29.png",
      website: "#"
    },
    {
      id: 9,
      name: "Xu Meng",
      role: "PhD Student",
      interests: "distributed systems, High-performance data transfer, Fault tolerance and recovery.",
      image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/wkkd7h8o_Xu%20Meng.png",
      website: "#"
    },
    {
      id: 10,
      name: "Saqib Ali Haidery",
      role: "PhD Student",
      interests: "distributed and parallel storage systems, Applied Machine Learning, Medical Image Analysis, Generative Modelling, Computer Vision. ",
      image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/d3gtjn7o_Saqib%20Ali%20Haidery.png",
      website: "#"
    },
    {
      id: 11,
      name: "Chen Zekang",
      role: "PhD Student",
      interests: "distributed and parallel storage systems, Applied Machine Learning, Medical Image Analysis, Generative Modelling, Computer Vision. ",
      image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/fmyhn3tn_Chen%20Zekang.png",
      website: "#"
    },
    {
      id: 12,
      name: "Ahmad Ishaq",
      role: "PhD Student",
      interests: "Machine learning, generative models, and the innovative application of these technologies in sign language and image generation.",
      image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/1ql9ew8h_Ahmad%20Ishaq.png",
      website: "#"
    },
      {
      id: 13,
      name: "Zhang Zhen",
      role: "PhD Student",
      interests: "distributed systems, High-performance data transfer, Fault tolerance and recovery.",
      image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/zcwyhdx8_Zhang%20Zhen.jpg",
      website: "#"
    },
    {
      id: 14,
      name: "Kudzai Nevanji",
      role: "MS Student",
      interests: "distributed and parallel storage systems, Applied Machine Learning, Medical Image Analysis, Generative Modelling, Computer Vision. ",
      image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/mbqn1ukr_Nevanji%20Kudzai.png",
      website: "#"
    },
    {
      id: 15,
      name: "Kao Seavpinh",
      role: "PhD Student",
      interests: "distributed and parallel storage systems, Applied Machine Learning, Medical Image Analysis, Generative Modelling, Computer Vision. ",
      image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/8n0qwf6p_Kao%20Seavpinh.png",
      website: "#"
    }
  ],
  alumni: [
    {
      name: "Siwonde Blessing James  ",
      degree: "MS, 2025",
      currentPosition: "TBA"
    },
    {
      name: "Sajjadian Seyedeh Elaheh",
      degree: "MS, 2024",
      currentPosition: "Software Engineer"
    }
  ],
  activities: [
    "Weekly research groups meetings on Fridays",
    "Weekly lab meetings",
    "Weekly individual students' meetings"
  ]
};

export const serviceData = {
  reviewing: [
    "IEEE Transactions on Computers",
    "Cluster Computing",
    "Applied Sciences",
    "IEEE Access",
    "Electronics"
  ],
  programCommittees: [
    {
      role: "",
      venue: "",
      year: ""
    }
  ],
  editorial: [
    {
      role: "",
      venue: "",
      period: ""
    }
  ],
  departmental: [
    "Undergraduate Student Counselling",
    "Software deoartment",
    "Counselling and guidance to students on academic warning list"
  ]
};

export const newsData = [
  {
    id: 1,
    date: "February 2026",
    title: "Journal accepted in IEEE Access",
    description: "Our paper titled Cross-Layer Caching for High-Performance Computing: Experimental Analysis of Alluxio, Ceph Tiering, and Hybrid Designs Using HACC-IO Traces."
  },
   {
    id: 2,
    date: "December 2025",
    title: "Conference paper accepted at HiPC 2025",
    description: "Our paper titled Latency-Aware Deduplication for Efficient Object-Based Big Data Transfers in Heterogeneous Networks has been accepted."
  },
  {
    id: 3,
    date: "October 2025",
    title: "Journal accepted in Neurocomputing",
    description: "Our paper titled FaceDisentGAN: Disentangled facial editing with targeted semantic alignment has been accepted in the Journal of Neurocomputing."
  }
];