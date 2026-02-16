#!/bin/bash

# Asset Download Script for Local Deployment
# This script downloads all photos and PDFs from Emergent servers to your local machine

set -e  # Exit on error

echo "========================================"
echo "Academic Website - Asset Download Script"
echo "========================================"
echo ""

# Check if wget is installed
if ! command -v wget &> /dev/null; then
    echo "Error: wget is not installed. Please install it first:"
    echo "  Ubuntu/Debian: sudo apt install wget"
    echo "  MacOS: brew install wget"
    exit 1
fi

# Get destination path
read -p "Enter destination path for assets (default: ./public/assets): " DEST_PATH
DEST_PATH=${DEST_PATH:-./public/assets}

# Create directories
echo "Creating directories..."
mkdir -p "$DEST_PATH/photos"
mkdir -p "$DEST_PATH/pdfs"

echo ""
echo "Downloading assets to: $DEST_PATH"
echo ""

# Download Profile Photos
echo "=== Downloading Profile Photos ==="
wget -O "$DEST_PATH/photos/prince-photo.jpg" \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/k1emhgqc_prince-photo.jpg" \
  && echo "✓ Downloaded: prince-photo.jpg"

# Download PDFs
echo ""
echo "=== Downloading PDFs ==="
wget -O "$DEST_PATH/pdfs/CV-Prince-Hamandawana.pdf" \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/9rjns1an_CV%20Prince%20Hamandawana%20%281%29.pdf" \
  && echo "✓ Downloaded: CV-Prince-Hamandawana.pdf"

wget -O "$DEST_PATH/pdfs/Teaching-Philosophy.pdf" \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/29cvi982_Prince%20Hamandawana%20Teaching%20Phylosophy.pdf" \
  && echo "✓ Downloaded: Teaching-Philosophy.pdf"

# Download Lab Member Photos
echo ""
echo "=== Downloading Lab Member Photos ==="

wget -O "$DEST_PATH/photos/prof-taesun-chung.jpg" \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/femlxl8q_Prof.%20Tae-Sun%20Chung.jpg" \
  && echo "✓ Downloaded: prof-taesun-chung.jpg"

wget -O "$DEST_PATH/photos/prof-sungsoo-kim.jpg" \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/bsjf6zex_Prof.%20Sung-Soo%20Kim.jpg" \
  && echo "✓ Downloaded: prof-sungsoo-kim.jpg"

wget -O "$DEST_PATH/photos/prof-prince-hamandawana.jpg" \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/pl0k33yz_Prof.%20Prince%20Hamandawana.jpg" \
  && echo "✓ Downloaded: prof-prince-hamandawana.jpg"

wget -O "$DEST_PATH/photos/prof-xiaohan-ma.jpg" \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/xdc8nxe0_Prof.%20Xiaohan%20Ma.jpg" \
  && echo "✓ Downloaded: prof-xiaohan-ma.jpg"

wget -O "$DEST_PATH/photos/dr-preethika-kasu.jpg" \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/aor9q3j9_Dr.%20Preethika%20Kasu.jpg" \
  && echo "✓ Downloaded: dr-preethika-kasu.jpg"

wget -O "$DEST_PATH/photos/han-seunghyun.jpg" \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/lci9tq52_Han%20Seung-Hyun%20%28%ED%95%9C%EC%8A%B9%ED%98%84%29.jpg" \
  && echo "✓ Downloaded: han-seunghyun.jpg"

wget -O "$DEST_PATH/photos/joo-jaehong.jpg" \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/b2y32y5r_Joo%20Jae-Hong%20%28%EC%A3%BC%EC%9E%AC%ED%99%8D%29.jpg" \
  && echo "✓ Downloaded: joo-jaehong.jpg"

wget -O "$DEST_PATH/photos/sim-youngju.png" \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/lxy4da57_Sim%20Young-Ju%20%28%EC%8B%AC%EC%98%81%EC%A3%BC%29.png" \
  && echo "✓ Downloaded: sim-youngju.png"

wget -O "$DEST_PATH/photos/xu-meng.png" \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/wkkd7h8o_Xu%20Meng.png" \
  && echo "✓ Downloaded: xu-meng.png"

wget -O "$DEST_PATH/photos/saqib-ali-haidery.png" \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/d3gtjn7o_Saqib%20Ali%20Haidery.png" \
  && echo "✓ Downloaded: saqib-ali-haidery.png"

wget -O "$DEST_PATH/photos/chen-zekang.png" \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/fmyhn3tn_Chen%20Zekang.png" \
  && echo "✓ Downloaded: chen-zekang.png"

wget -O "$DEST_PATH/photos/ahmad-ishaq.png" \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/1ql9ew8h_Ahmad%20Ishaq.png" \
  && echo "✓ Downloaded: ahmad-ishaq.png"

wget -O "$DEST_PATH/photos/zhang-zhen.jpg" \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/zcwyhdx8_Zhang%20Zhen.jpg" \
  && echo "✓ Downloaded: zhang-zhen.jpg"

wget -O "$DEST_PATH/photos/kudzai-nevanji.png" \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/mbqn1ukr_Nevanji%20Kudzai.png" \
  && echo "✓ Downloaded: kudzai-nevanji.png"

wget -O "$DEST_PATH/photos/kao-seavpinh.png" \
  "https://customer-assets.emergentagent.com/job_acadprofile-2/artifacts/8n0qwf6p_Kao%20Seavpinh.png" \
  && echo "✓ Downloaded: kao-seavpinh.png"

echo ""
echo "========================================"
echo "✅ All assets downloaded successfully!"
echo "========================================"
echo ""
echo "Location: $DEST_PATH"
echo ""
echo "File count:"
echo "  Photos: $(ls -1 $DEST_PATH/photos | wc -l)"
echo "  PDFs: $(ls -1 $DEST_PATH/pdfs | wc -l)"
echo ""
echo "Next steps:"
echo "1. Update asset URLs in mockData.js to use local paths"
echo "2. Example: profileImage: '/assets/photos/prince-photo.jpg'"
echo "3. See LOCAL_DEPLOYMENT_GUIDE.md for complete instructions"
echo ""
