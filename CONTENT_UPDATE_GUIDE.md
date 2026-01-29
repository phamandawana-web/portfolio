# Academic Website - Content Update Guide

This guide will help you update all the content on your academic website.

## 📋 Quick Start

All your website content is stored in **`/app/frontend/src/mockData.js`**. This single file contains all the information displayed on your website.

## 🔧 How to Update Content

### 1. Profile Information (Hero Section)

Edit the `profileData` object in `mockData.js`:

```javascript
export const profileData = {
  name: "Dr. Your Full Name",
  title: "Associate Professor",
  department: "Department of Computer Science",
  university: "Your University Name",
  email: "your.email@university.edu",
  officeHours: "Tuesday & Thursday, 2:00 PM - 4:00 PM",
  office: "Engineering Building, Room 305",
  bio: "Your professional bio goes here...",
  profileImage: "URL_TO_YOUR_PHOTO",
  cv: "/path/to/your-cv.pdf",
  socialLinks: {
    googleScholar: "https://scholar.google.com/citations?user=YOUR_ID",
    researchGate: "https://www.researchgate.net/profile/YOUR_PROFILE",
    linkedin: "https://www.linkedin.com/in/YOUR_PROFILE",
    github: "https://github.com/YOUR_USERNAME"
  }
};
```

### 2. Teaching Information

#### Teaching Philosophy
Update in the `teachingData.philosophy` section:

```javascript
philosophy: {
  title: "Teaching Philosophy",
  content: "Your teaching philosophy...",
  statementPdf: "/path/to/teaching-statement.pdf"
}
```

#### Courses
Add or modify courses in the `teachingData.courses` array:

```javascript
{
  id: 1,
  title: "Course Name",
  code: "CS 601",
  level: "Graduate" or "Undergraduate",
  description: "Course description...",
  topics: ["Topic 1", "Topic 2", "Topic 3"],
  tools: ["Python", "TensorFlow", "PyTorch"],
  syllabus: "/path/to/syllabus.pdf"
}
```

#### Student Projects
Update `teachingData.studentProjects`:

```javascript
{
  id: 1,
  title: "Project Title",
  student: "Student Name",
  year: "2024",
  type: "MS Thesis" or "PhD Dissertation" or "Capstone Project",
  description: "Project description...",
  link: "URL_TO_PROJECT"
}
```

### 3. Research Information

#### Research Overview
Edit `researchData.overview`:

```javascript
overview: "Your research overview describing problems you study..."
```

#### Research Areas
Update `researchData.areas`:

```javascript
{
  id: 1,
  title: "Research Area Name",
  description: "Description of this research area...",
  methods: ["Method 1", "Method 2"],
  publications: [1, 2, 3]  // IDs referencing publications
}
```

#### Ongoing Projects
Edit `researchData.ongoingProjects`:

```javascript
{
  id: 1,
  title: "Project Title",
  funding: "NSF Grant #12345",
  collaborators: ["Dr. Collaborator 1", "Dr. Collaborator 2"],
  description: "Project description...",
  expectedCompletion: "2025"
}
```

### 4. Publications

#### Option A: Manual Update (Current)
Edit `researchData.publications` in `mockData.js`:

```javascript
{
  id: 1,
  type: "journal" or "conference" or "preprint",
  title: "Paper Title",
  authors: "Author1, Author2, Your Name",
  venue: "Journal/Conference Name",
  year: 2024,
  links: {
    pdf: "URL_TO_PDF",
    arxiv: "URL_TO_ARXIV",
    code: "URL_TO_CODE",
    dataset: "URL_TO_DATASET"
  }
}
```

#### Option B: Automatic Google Scholar Integration

**The backend system is already set up!** To enable automatic publication fetching:

1. Find your Google Scholar ID:
   - Go to your Google Scholar profile
   - Copy the ID from the URL: `https://scholar.google.com/citations?user=YOUR_ID_HERE`

2. Update the Scholar ID in `/app/frontend/src/components/Publications.jsx`:
   ```javascript
   const SCHOLAR_ID = 'YOUR_ACTUAL_SCHOLAR_ID';  // Line ~14
   ```

3. The system will:
   - Automatically fetch your publications from Google Scholar
   - Display citation counts, h-index, and i10-index
   - Cache results for 24 hours to avoid rate limiting
   - Update automatically when you click "Refresh from Scholar"

**Note:** If Google Scholar is unavailable, the system will fallback to your manual publications from `mockData.js`.

### 5. Lab & Students

#### Lab Mission
Update `labData.mission`:

```javascript
mission: "Our lab focuses on... We aim to..."
```

#### Current Members
Edit `labData.currentMembers`:

```javascript
{
  id: 1,
  name: "Student Name",
  role: "PhD Student" or "MS Student" or "Postdoc",
  interests: "Research interests...",
  image: "URL_TO_PHOTO",
  website: "URL_TO_PERSONAL_SITE"
}
```

#### Alumni
Update `labData.alumni`:

```javascript
{
  name: "Alumni Name",
  degree: "PhD, 2023",
  currentPosition: "Assistant Professor at University X"
}
```

#### Lab Activities
Edit `labData.activities`:

```javascript
activities: [
  "Weekly reading group on Fridays at 3 PM",
  "Bi-weekly lab meetings",
  "Annual lab retreat"
]
```

### 6. Service & Activities

Update `serviceData`:

```javascript
export const serviceData = {
  reviewing: [
    "Journal Name 1",
    "Conference Name 1"
  ],
  programCommittees: [
    {
      role: "Program Committee Member",
      venue: "Conference Name",
      year: "2024"
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
    "Curriculum Committee"
  ]
};
```

### 7. News & Updates

Edit `newsData`:

```javascript
{
  id: 1,
  date: "March 2024",
  title: "News headline",
  description: "Brief description..."
}
```

## 🖼️ Adding Your Photos

### Profile Photo
1. Upload your photo to a hosting service (Imgur, Dropbox, Google Drive public link, etc.)
2. Update `profileData.profileImage` with the URL

### Lab Member Photos
1. Upload photos
2. Update `labData.currentMembers[].image` with URLs

## 📄 Adding PDF Files

### Option 1: External Hosting
1. Upload PDFs to Google Drive, Dropbox, or your university server
2. Get shareable/public links
3. Update the relevant fields (cv, syllabus, etc.)

### Option 2: Local Hosting
1. Place PDF files in `/app/frontend/public/pdfs/`
2. Reference them as `/pdfs/your-file.pdf`

## 🎨 Customizing Colors

The website uses a teal accent color. To change it:

1. Open `/app/frontend/src/index.css`
2. Find and replace teal colors:
   - `#06b6d4` (teal-600)
   - `#0891b2` (teal-700)
   - `#14b8a6` (alternative teal)

## 🔄 Applying Changes

After making changes to `mockData.js`:

1. **Save the file** - Changes will appear automatically (hot reload enabled)
2. **Refresh your browser** if changes don't appear immediately

## ✅ Quick Checklist

- [ ] Update profile name, title, and bio
- [ ] Add your professional photo
- [ ] Update contact information
- [ ] Add your courses
- [ ] Update research areas
- [ ] Configure Google Scholar ID (optional but recommended)
- [ ] Add lab members
- [ ] Update service activities
- [ ] Add recent news/updates
- [ ] Upload CV and link it
- [ ] Test all links

## 🆘 Need Help?

Common issues:

1. **Changes not showing**: Clear browser cache or hard refresh (Ctrl+F5 / Cmd+Shift+R)
2. **Images not loading**: Check if URLs are publicly accessible
3. **Google Scholar not working**: Verify your Scholar ID is correct
4. **PDF links broken**: Ensure files are uploaded and URLs are correct

## 📝 File Locations Reference

- **Main content**: `/app/frontend/src/mockData.js`
- **Google Scholar config**: `/app/frontend/src/components/Publications.jsx` (line ~14)
- **Colors**: `/app/frontend/src/index.css`
- **Profile photo**: Update URL in mockData.js
- **PDF files**: Upload to cloud or `/app/frontend/public/pdfs/`

---

**Last Updated**: January 2026
