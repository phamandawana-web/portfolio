# mockData.js URL Update Guide

## 🎯 After downloading assets to your local server, update these URLs:

### Profile Section

**Line ~13 - Profile Image:**
```javascript
// OLD
profileImage: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/k1emhgqc_prince-photo.jpg",

// NEW
profileImage: "/assets/photos/prince-photo.jpg",
```

**Line ~14 - CV:**
```javascript
// OLD
cv: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/9rjns1an_CV%20Prince%20Hamandawana%20%281%29.pdf",

// NEW
cv: "/assets/pdfs/CV-Prince-Hamandawana.pdf",
```

**Line ~16 - Google Scholar (Keep as-is):**
```javascript
googleScholar: "https://scholar.google.com/citations?user=adgtAm8AAAAJ",  // Don't change this
```

### Teaching Section

**Line ~27 - Teaching Philosophy PDF:**
```javascript
// OLD
statementPdf: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/29cvi982_Prince%20Hamandawana%20Teaching%20Phylosophy.pdf"

// NEW
statementPdf: "/assets/pdfs/Teaching-Philosophy.pdf"
```

### Lab Members Section

**Line ~237 - Prof. Tae-Sun Chung:**
```javascript
// OLD
image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/femlxl8q_Prof.%20Tae-Sun%20Chung.jpg",

// NEW
image: "/assets/photos/prof-taesun-chung.jpg",
```

**Line ~245 - Prof. Sung-Soo Kim:**
```javascript
// OLD
image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/bsjf6zex_Prof.%20Sung-Soo%20Kim.jpg",

// NEW
image: "/assets/photos/prof-sungsoo-kim.jpg",
```

**Line ~253 - Prof. Prince Hamandawana:**
```javascript
// OLD
image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/pl0k33yz_Prof.%20Prince%20Hamandawana.jpg",

// NEW
image: "/assets/photos/prof-prince-hamandawana.jpg",
```

**Line ~261 - Prof. Xiaohan Ma:**
```javascript
// OLD
image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/xdc8nxe0_Prof.%20Xiaohan%20Ma.jpg",

// NEW
image: "/assets/photos/prof-xiaohan-ma.jpg",
```

**Line ~269 - Dr. Preethika Kasu:**
```javascript
// OLD
image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/aor9q3j9_Dr.%20Preethika%20Kasu.jpg",

// NEW
image: "/assets/photos/dr-preethika-kasu.jpg",
```

**Line ~277 - Han Seung-Hyun:**
```javascript
// OLD
image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/lci9tq52_Han%20Seung-Hyun%20%28%ED%95%9C%EC%8A%B9%ED%98%84%29.jpg",

// NEW
image: "/assets/photos/han-seunghyun.jpg",
```

**Line ~285 - Joo Jae-Hong:**
```javascript
// OLD
image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/b2y32y5r_Joo%20Jae-Hong%20%28%EC%A3%BC%EC%9E%AC%ED%99%8D%29.jpg",

// NEW
image: "/assets/photos/joo-jaehong.jpg",
```

**Line ~293 - Sim Young-Ju:**
```javascript
// OLD
image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/lxy4da57_Sim%20Young-Ju%20%28%EC%8B%AC%EC%98%81%EC%A3%BC%29.png",

// NEW
image: "/assets/photos/sim-youngju.png",
```

**Line ~301 - Xu Meng:**
```javascript
// OLD
image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/wkkd7h8o_Xu%20Meng.png",

// NEW
image: "/assets/photos/xu-meng.png",
```

**Line ~309 - Saqib Ali Haidery:**
```javascript
// OLD
image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/d3gtjn7o_Saqib%20Ali%20Haidery.png",

// NEW
image: "/assets/photos/saqib-ali-haidery.png",
```

**Line ~317 - Chen Zekang:**
```javascript
// OLD
image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/fmyhn3tn_Chen%20Zekang.png",

// NEW
image: "/assets/photos/chen-zekang.png",
```

**Line ~325 - Ahmad Ishaq:**
```javascript
// OLD
image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/1ql9ew8h_Ahmad%20Ishaq.png",

// NEW
image: "/assets/photos/ahmad-ishaq.png",
```

**Line ~333 - Zhang Zhen:**
```javascript
// OLD
image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/zcwyhdx8_Zhang%20Zhen.jpg",

// NEW
image: "/assets/photos/zhang-zhen.jpg",
```

**Line ~341 - Kudzai Nevanji:**
```javascript
// OLD
image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/mbqn1ukr_Nevanji%20Kudzai.png",

// NEW
image: "/assets/photos/kudzai-nevanji.png",
```

**Line ~349 - Kao Seavpinh:**
```javascript
// OLD
image: "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/8n0qwf6p_Kao%20Seavpinh.png",

// NEW
image: "/assets/photos/kao-seavpinh.png",
```

---

## 🔍 Quick Find & Replace

You can use this sed command to replace all URLs at once:

```bash
# Make backup first
cp /path/to/mockData.js /path/to/mockData.js.backup

# Replace all emergentagent URLs with local paths
sed -i 's|https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/k1emhgqc_prince-photo.jpg|/assets/photos/prince-photo.jpg|g' mockData.js

sed -i 's|https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/9rjns1an_CV%20Prince%20Hamandawana%20%281%29.pdf|/assets/pdfs/CV-Prince-Hamandawana.pdf|g' mockData.js

sed -i 's|https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/29cvi982_Prince%20Hamandawana%20Teaching%20Phylosophy.pdf|/assets/pdfs/Teaching-Philosophy.pdf|g' mockData.js

# Lab members photos
sed -i 's|https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/femlxl8q_Prof.%20Tae-Sun%20Chung.jpg|/assets/photos/prof-taesun-chung.jpg|g' mockData.js

sed -i 's|https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/bsjf6zex_Prof.%20Sung-Soo%20Kim.jpg|/assets/photos/prof-sungsoo-kim.jpg|g' mockData.js

sed -i 's|https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/pl0k33yz_Prof.%20Prince%20Hamandawana.jpg|/assets/photos/prof-prince-hamandawana.jpg|g' mockData.js

sed -i 's|https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/xdc8nxe0_Prof.%20Xiaohan%20Ma.jpg|/assets/photos/prof-xiaohan-ma.jpg|g' mockData.js

sed -i 's|https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/aor9q3j9_Dr.%20Preethika%20Kasu.jpg|/assets/photos/dr-preethika-kasu.jpg|g' mockData.js

sed -i 's|https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/lci9tq52_Han%20Seung-Hyun%20%28%ED%95%9C%EC%8A%B9%ED%98%84%29.jpg|/assets/photos/han-seunghyun.jpg|g' mockData.js

sed -i 's|https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/b2y32y5r_Joo%20Jae-Hong%20%28%EC%A3%BC%EC%9E%AC%ED%99%8D%29.jpg|/assets/photos/joo-jaehong.jpg|g' mockData.js

sed -i 's|https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/lxy4da57_Sim%20Young-Ju%20%28%EC%8B%AC%EC%98%81%EC%A3%BC%29.png|/assets/photos/sim-youngju.png|g' mockData.js

sed -i 's|https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/wkkd7h8o_Xu%20Meng.png|/assets/photos/xu-meng.png|g' mockData.js

sed -i 's|https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/d3gtjn7o_Saqib%20Ali%20Haidery.png|/assets/photos/saqib-ali-haidery.png|g' mockData.js

sed -i 's|https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/fmyhn3tn_Chen%20Zekang.png|/assets/photos/chen-zekang.png|g' mockData.js

sed -i 's|https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/1ql9ew8h_Ahmad%20Ishaq.png|/assets/photos/ahmad-ishaq.png|g' mockData.js

sed -i 's|https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/zcwyhdx8_Zhang%20Zhen.jpg|/assets/photos/zhang-zhen.jpg|g' mockData.js

sed -i 's|https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/mbqn1ukr_Nevanji%20Kudzai.png|/assets/photos/kudzai-nevanji.png|g' mockData.js

sed -i 's|https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/8n0qwf6p_Kao%20Seavpinh.png|/assets/photos/kao-seavpinh.png|g' mockData.js
```

---

## ✅ Verification

After making changes, verify:

1. All URLs start with `/assets/` instead of `https://customer-assets.emergentagent.com/`
2. File names match the downloaded files
3. Don't change the Google Scholar URL (keep it as external link)

Then rebuild your frontend:
```bash
cd /path/to/deployment/frontend
yarn build
```
