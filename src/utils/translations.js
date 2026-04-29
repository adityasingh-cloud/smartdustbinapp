export const translations = {
  en: {
    // Nav
    home: 'Home',
    camera: 'Scan',
    map: 'Map',
    coins: 'EcoCoins',
    me: 'Profile',

    // Home Screen
    welcomeBack: 'Welcome back',
    smartbinActive: 'SmartBin Active',
    totalScans: 'Total Scans',
    ecoCoins: 'EcoCoins',
    co2Saved: 'CO₂ Saved',
    kg: 'kg',
    recentActivity: 'Recent Activity',
    noActivity: 'No activity yet. Start scanning waste!',
    binStatus: 'Bin Fill Status',
    dry: 'Dry',
    wet: 'Wet',
    metal: 'Metal',
    full: 'Full',
    loading: 'Loading...',
    alertFull: 'Bin is almost full!',
    yourCoins: 'Your EcoCoins',
    ecoWarrior: 'Eco Warrior',
    level: 'Level',

    // Camera
    scanWaste: 'Scan Waste',
    analyzing: 'Analyzing...',
    result: 'Detected',
    confidence: 'Confidence',
    downloadPDF: 'Download PDF',
    disposalTip: 'Disposal Tip',
    openCamera: 'Capture Photo',
    uploadingImage: 'Uploading...',
    tapToCapture: 'Tap Scan to Start',

    // PDF Report
    officialDisposalReport: 'Official Disposal Report',
    reportId: 'Report ID',
    disposalDetails: 'Disposal Details',
    itemDetected: 'Item Detected',
    wasteCategory: 'Waste Category',
    pointsEarned: 'Points Earned',
    recyclableStatus: 'Recyclable Status',
    aiGeneratedReport: 'This is an AI-generated report from SmartBin Platform.',
    thankYouPlanet: 'Thank you for contributing to a cleaner planet!',
    user: 'User',
    date: 'Date',

    // Profile
    profileUpdated: 'Profile updated successfully!',
    updateFailed: 'Update failed',
    save: 'Save Changes',
    cancel: 'Cancel',
    name: 'Name',
    phone: 'Phone',
    email: 'Email',
    state: 'State',
    city: 'City',
    pincode: 'Pincode',
    dob: 'Date of Birth',
    logout: 'Sign Out',
    notifications: 'Notifications',
    darkMode: 'Dark Mode',

    // Rewards
    rewardStore: 'Reward Store',
    points: 'Points',
    redeemNow: 'Redeem Now',
    insufficientCoins: 'Insufficient Coins',
    redeemSuccess: 'Reward redeemed successfully!',
    howToEarn: 'How to earn more?',
    scanAndEarn: 'Every scan earns you 5-20 EcoCoins.',
    available: 'Available Balance',
    confirm: 'Confirm',

    // Map
    binLocations: 'Bin Locations',
    nearbyBins: 'Nearby Bins',
    lastUpdated: 'Updated 2m ago',
    getDirections: 'Get Directions',
  },
  hi: {
    home: 'होम',
    camera: 'स्कैन',
    map: 'मैप',
    coins: 'इको-कॉइन्स',
    me: 'प्रोफ़ाइल',
    welcomeBack: 'स्वागत है',
    smartbinActive: 'स्मार्टबिन सक्रिय',
    totalScans: 'कुल स्कैन',
    ecoCoins: 'इको-कॉइन्स',
    co2Saved: 'CO₂ बचाई गई',
    kg: 'किग्रा',
    recentActivity: 'हाल की गतिविधि',
    noActivity: 'अभी तक कोई गतिविधि नहीं।',
    binStatus: 'बिन भरने की स्थिति',
    dry: 'सूखा',
    wet: 'गीला',
    metal: 'धातु',
    full: 'भरा हुआ',
    loading: 'लोड हो रहा है...',
    scanWaste: 'कचरा स्कैन करें',
    analyzing: 'विश्लेषण कर रहा है...',
    downloadPDF: 'पीडीएफ डाउनलोड करें',
    save: 'सहेजें',
    cancel: 'रद्द करें',
    name: 'नाम',
    phone: 'फ़ोन',
    email: 'ईमेल',
    logout: 'लॉग आउट',
    darkMode: 'डार्क मोड',
    getDirections: 'दिशा-निर्देश प्राप्त करें',
  }
}

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'ml', name: 'മലയാളം' },
  { code: 'mr', name: 'मराठी' },
]

export const t = (lang, key) => {
  if (!translations[lang]) lang = 'en';
  return translations[lang][key] || translations['en'][key] || key;
}
