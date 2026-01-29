# Quick Setup Instructions

## 🚀 Your Academic Website is Ready!

Your professional academic website has been built with a modern minimalist design and includes automatic Google Scholar integration.

## ✅ What's Already Working

- ✓ Modern, clean design with teal accent colors
- ✓ All sections: Home, Teaching, Research, Publications, Lab, Service, Contact
- ✓ Smooth navigation and mobile-responsive layout
- ✓ Backend API for Google Scholar integration
- ✓ 24-hour caching to prevent rate limiting
- ✓ Fallback to manual publications if Scholar is unavailable

## 📝 Next Steps (5 Minutes)

### Step 1: Update Your Basic Information

Open `/app/frontend/src/mockData.js` and update:

1. **Your name and title** (line 5-8)
2. **Your email and office info** (line 9-11)
3. **Your bio** (line 12)
4. **Your photo URL** (line 13) - Upload your photo somewhere and paste the URL

### Step 2: Enable Google Scholar Auto-Sync

1. Go to your Google Scholar profile
2. Copy your Scholar ID from the URL:
   - URL looks like: `https://scholar.google.com/citations?user=ABC123XYZ`
   - Copy just the `ABC123XYZ` part

3. Open `/app/frontend/src/components/Publications.jsx`
4. Find line 14 and replace:
   ```javascript
   const SCHOLAR_ID = 'YOUR_SCHOLAR_ID_HERE';
   ```
   with:
   ```javascript
   const SCHOLAR_ID = 'ABC123XYZ';  // Your actual ID
   ```

5. Save the file - publications will load automatically!

### Step 3: Add Your Courses & Research

Edit `/app/frontend/src/mockData.js`:

- **Courses**: Update the `teachingData.courses` array
- **Research areas**: Update the `researchData.areas` array
- **Student projects**: Update the `teachingData.studentProjects` array

## 📚 Detailed Guide

For complete instructions on updating all content, see:
**`/app/CONTENT_UPDATE_GUIDE.md`**

This guide covers:
- How to update all sections (Teaching, Research, Lab, Service, etc.)
- Adding photos and PDFs
- Customizing colors
- Troubleshooting

## 🔗 Important Files

- **Main content**: `/app/frontend/src/mockData.js`
- **Scholar ID**: `/app/frontend/src/components/Publications.jsx` (line 14)
- **Full guide**: `/app/CONTENT_UPDATE_GUIDE.md`

## 🎨 Current Design

- **Color scheme**: Teal (#06b6d4) accents on white/slate backgrounds
- **Typography**: Inter font family for clean, professional look
- **Layout**: Card-based with generous whitespace
- **Style**: Modern minimalist academic

## 🌐 How the Google Scholar Integration Works

When configured:
1. **Automatically fetches** your publications from Google Scholar
2. **Shows metrics**: Total citations, h-index, i10-index
3. **Displays links**: PDF, arXiv, Code, Dataset links from Scholar
4. **Caches results**: Stores data for 24 hours to avoid rate limits
5. **Refresh button**: Manually update when you publish new papers
6. **Fallback**: Uses manual data from mockData.js if Scholar is unavailable

## 🆘 Need Help?

Common issues:

1. **Scholar not loading**: Verify your Scholar ID is correct
2. **Changes not showing**: Hard refresh browser (Ctrl+F5 / Cmd+Shift+R)
3. **Images not loading**: Check if image URLs are publicly accessible

## ✨ Features Overview

### Backend API Endpoints
- `GET /api/publications/scholar/{scholar_id}` - Fetch publications
- `DELETE /api/publications/scholar/cache/{scholar_id}` - Clear cache

### Frontend Features
- Smooth scroll navigation
- Filterable publications (by type and year)
- Loading states and error handling
- Responsive design for all devices
- Hover effects and transitions

---

**You're all set!** Just update your information in `mockData.js` and optionally add your Scholar ID for automatic publications. Your website is live and ready to showcase your academic work.
