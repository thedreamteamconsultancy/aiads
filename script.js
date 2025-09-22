// script.js

// EmailJS Configuration
emailjs.init("6ZgEz_f-lisPLpFO2");
const EMAILJS_SERVICE_ID = "service_1u84afs";
const EMAILJS_TEMPLATE_ID = "template_n5viwsb";
const ADMIN_EMAIL = "thedreamteamconsultancy@gmail.com";

// Authentication state
let isAuthenticated = false;
let currentOTP = null;
let otpExpiry = null;

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthenticationStatus();
});

// Check if user is already authenticated (localStorage for persistence)
function checkAuthenticationStatus() {
    const authSession = localStorage.getItem('isAuthenticated');
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    
    if (authSession === 'true' && sessionExpiry && new Date().getTime() < parseInt(sessionExpiry)) {
        // User is still authenticated
        showMainContent();
    } else {
        // Clear expired session
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('sessionExpiry');
        showLoginModal();
    }
}

// Show login modal
function showLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
    document.getElementById('mainContent').style.display = 'none';
}

// Show main content
function showMainContent() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    isAuthenticated = true;
}

// Logout function
function logout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('sessionExpiry');
    localStorage.removeItem('loginTime');
    clearStoredOTP();
    isAuthenticated = false;
    showLoginModal();
    
    // Reset login form
    document.getElementById('otpInput').value = '';
    document.getElementById('verifySection').style.display = 'none';
    document.getElementById('otpSentMessage').style.display = 'none';
    document.getElementById('otpError').style.display = 'none';
}

// Generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Store OTP in localStorage with expiry
function storeOTP(otp, expiryTime) {
    const otpData = {
        otp: otp,
        expiry: expiryTime,
        created: new Date().getTime()
    };
    localStorage.setItem('admin_otp', JSON.stringify(otpData));
}

// Get OTP from localStorage
function getStoredOTP() {
    const otpDataString = localStorage.getItem('admin_otp');
    if (!otpDataString) return null;
    
    try {
        return JSON.parse(otpDataString);
    } catch (error) {
        console.error('Error parsing stored OTP:', error);
        localStorage.removeItem('admin_otp');
        return null;
    }
}

// Clear stored OTP
function clearStoredOTP() {
    localStorage.removeItem('admin_otp');
}

// Send OTP function
async function sendOTP() {
    const sendBtn = document.getElementById('sendOtpBtn');
    const loading = document.getElementById('loginLoading');
    const sentMessage = document.getElementById('otpSentMessage');
    const verifySection = document.getElementById('verifySection');
    
    try {
        sendBtn.disabled = true;
        loading.style.display = 'block';
        sentMessage.style.display = 'none';
        
        // Generate new OTP
        currentOTP = generateOTP();
        otpExpiry = new Date().getTime() + (5 * 60 * 1000); // 5 minutes from now
        
        // Store OTP in localStorage
        storeOTP(currentOTP, otpExpiry);
        
        // Send email using EmailJS
        const emailParams = {
            // Multiple parameter names to ensure compatibility
            to_email: ADMIN_EMAIL,
            user_email: ADMIN_EMAIL,
            email: ADMIN_EMAIL,
            recipient_email: ADMIN_EMAIL,
            to: ADMIN_EMAIL,
            
            // Content parameters
            to_name: 'Admin',
            user_name: 'Admin',
            from_name: 'Telugu Ad Generator',
            otp_code: currentOTP,
            otp: currentOTP,
            code: currentOTP,
            message: `Your OTP code is: ${currentOTP}. This code will expire in 5 minutes.`,
            reply_to: ADMIN_EMAIL
        };
        
        console.log('Sending OTP to:', ADMIN_EMAIL);
        console.log('Email parameters:', emailParams);
        
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, emailParams);
        
        // Show success message and verify section
        sentMessage.style.display = 'block';
        verifySection.style.display = 'block';
        
        // Auto-expire OTP display after 5 minutes
        setTimeout(() => {
            currentOTP = null;
            otpExpiry = null;
            clearStoredOTP();
        }, 5 * 60 * 1000);
        
    } catch (error) {
        console.error('Error sending OTP:', error);
        alert('Failed to send OTP. Please try again.');
    } finally {
        sendBtn.disabled = false;
        loading.style.display = 'none';
    }
}

// Verify OTP function
async function verifyOTP() {
    const otpInput = document.getElementById('otpInput');
    const verifyBtn = document.getElementById('verifyOtpBtn');
    const errorDiv = document.getElementById('otpError');
    const loading = document.getElementById('loginLoading');
    
    const enteredOTP = otpInput.value.trim();
    
    if (enteredOTP.length !== 6) {
        showError('Please enter a 6-digit OTP');
        return;
    }
    
    try {
        verifyBtn.disabled = true;
        loading.style.display = 'block';
        errorDiv.style.display = 'none';
        
        // Get OTP from localStorage
        const otpData = getStoredOTP();
        
        if (!otpData) {
            showError('No OTP found. Please request a new OTP.');
            return;
        }
        
        const currentTime = new Date().getTime();
        
        // Check if OTP is expired
        if (currentTime > otpData.expiry) {
            showError('OTP has expired. Please request a new OTP.');
            // Delete expired OTP
            clearStoredOTP();
            return;
        }
        
        // Check if OTP matches
        if (enteredOTP === otpData.otp) {
            // OTP is valid
            
            // Delete used OTP
            clearStoredOTP();
            
            // Set persistent session (expires in 24 hours)
            const sessionExpiry = new Date().getTime() + (24 * 60 * 60 * 1000);
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('sessionExpiry', sessionExpiry.toString());
            localStorage.setItem('loginTime', new Date().toLocaleString());
            
            // Show main content
            showMainContent();
            
        } else {
            showError('Invalid OTP. Please try again.');
        }
        
    } catch (error) {
        console.error('Error verifying OTP:', error);
        showError('Failed to verify OTP. Please try again.');
    } finally {
        verifyBtn.disabled = false;
        loading.style.display = 'none';
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('otpError');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// Event listeners for login functionality
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('sendOtpBtn').addEventListener('click', sendOTP);
    document.getElementById('verifyOtpBtn').addEventListener('click', verifyOTP);
    
    // Logout button event listener
    document.getElementById('logoutBtn').addEventListener('click', logout);
    
    // Allow Enter key to verify OTP
    document.getElementById('otpInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verifyOTP();
        }
    });
    
    // Format OTP input (numbers only)
    document.getElementById('otpInput').addEventListener('input', function(e) {
        e.target.value = e.target.value.replace(/\D/g, '');
    });
});

const API_KEY = 'AIzaSyCKHL5EEPBtd7frlFD2fLUsVWKm5--_DEM';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

let selectedVO = null;
let selectedVODuration = null;
let currentVariations = [];

// Dynamic Business Analysis and Visual Theme System
async function analyzeBusinessAndCreateVisualTheme(companyName, businessInfo) {
    console.log('🔍 Starting dynamic visual theme analysis for:', companyName);
    
    try {
        // Use AI to dynamically analyze business and create appropriate visual theme
        const themeAnalysisPrompt = `
DYNAMIC VISUAL THEME ANALYSIS FOR COMMERCIAL ADVERTISEMENT

Company Name: ${companyName}
Business Information: ${businessInfo}

As a world-class creative director, analyze this business information and create a premium, aspirational visual theme that would work perfectly for a high-end Telugu commercial advertisement.

ANALYSIS REQUIREMENTS:
1. Understand the core business type and industry
2. Research current visual trends in this industry globally
3. Consider what would appeal to Telugu audience while maintaining international quality
4. Create themes that suggest success, trust, and aspiration
5. Ensure visual coherence with the specific business type

GENERATE A PROFESSIONAL VISUAL THEME WITH THESE EXACT COMPONENTS:

**BUSINESS_TYPE:** [Identify the specific business category - be precise]

**SETTING:** [Describe the perfect location/environment for this business type - luxurious, modern, and aspirational. Should match industry standards and create desire]

**ANCHOR_ATTIRE:** [The anchor's attire must dynamically match the business concept and industry. Examples:
• Banking/Finance → formal business suit or professional saree in sober colors
• Jewelry/Fashion → elegant saree or lehenga with appropriate jewelry
• IT/Tech/Corporate → western formal wear or smart casuals
• Travel/Tourism → comfortable, stylish, professional travel attire (not saree unless contextually appropriate)
• Hospitality/Restaurants → neat uniforms or elegant formal wear
• Healthcare/Hospitals → professional doctor/nurse coat or formal medical attire
• Real Estate → smart business attire suggesting trust and success
• Education → professional teacher/academic attire
Describe the specific attire that best represents this industry and creates trust with the target audience]

**BACKGROUND:** [Detailed description of background elements, props, and environment that immediately communicate the business type and quality]

**MOOD:** [The emotional atmosphere that should be conveyed - professional, trustworthy, aspirational, etc.]

**COLORS:** [Specific color palette that works for this industry and creates the right psychological impact]

**PROPS:** [Specific items, furniture, equipment, or decorative elements that reinforce the business type and quality level]

CRITICAL REQUIREMENTS:
- Create themes that rival international commercial standards
- Ensure every element supports the specific business type
- Make it aspirational and premium regardless of business size
- Consider Telugu cultural preferences while maintaining global appeal
- Focus on visual coherence and professional credibility

Provide ONLY the required components in the exact format above.`;

        const response = await fetch(API_URL + '?key=' + API_KEY, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: themeAnalysisPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.8,
                    maxOutputTokens: 2048,
                }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to analyze business theme: ' + response.statusText);
        }

        const data = await response.json();
        const analysisResult = data.candidates[0].content.parts[0].text;
        
        // Parse the AI response to extract theme components
        const visualTheme = parseVisualThemeFromAI(analysisResult);
        
        console.log('✅ Dynamic theme analysis completed:', visualTheme);
        
        return {
            businessType: visualTheme.businessType || 'custom',
            visualTheme: {
                setting: visualTheme.setting,
                anchorAttire: visualTheme.anchorAttire,
                background: visualTheme.background,
                mood: visualTheme.mood,
                colors: visualTheme.colors,
                props: visualTheme.props
            },
            companyName,
            businessInfo,
            source: 'dynamic_ai_analysis' // Flag to indicate this is dynamically generated
        };

    } catch (error) {
        console.error('❌ Error in dynamic theme analysis:', error);
        
        // Fallback to basic analysis if dynamic analysis fails
        return getFallbackTheme(companyName, businessInfo);
    }
}

// Function to parse AI-generated visual theme analysis
function parseVisualThemeFromAI(analysisText) {
    const theme = {};
    
    // Extract business type
    const businessTypeMatch = analysisText.match(/\*\*BUSINESS_TYPE:\*\*\s*(.+)/i);
    theme.businessType = businessTypeMatch ? businessTypeMatch[1].trim() : 'custom';
    
    // Extract setting
    const settingMatch = analysisText.match(/\*\*SETTING:\*\*\s*([\s\S]*?)(?=\*\*[A-Z_]+:|$)/i);
    theme.setting = settingMatch ? settingMatch[1].trim() : 'Professional modern space with elegant contemporary design';
    
    // Extract anchor attire
    const attireMatch = analysisText.match(/\*\*ANCHOR_ATTIRE:\*\*\s*([\s\S]*?)(?=\*\*[A-Z_]+:|$)/i);
    theme.anchorAttire = attireMatch ? attireMatch[1].trim() : 'Professional attire appropriate for the business domain';
    
    // Extract background
    const backgroundMatch = analysisText.match(/\*\*BACKGROUND:\*\*\s*([\s\S]*?)(?=\*\*[A-Z_]+:|$)/i);
    theme.background = backgroundMatch ? backgroundMatch[1].trim() : 'Contemporary professional environment with modern elements';
    
    // Extract mood
    const moodMatch = analysisText.match(/\*\*MOOD:\*\*\s*([\s\S]*?)(?=\*\*[A-Z_]+:|$)/i);
    theme.mood = moodMatch ? moodMatch[1].trim() : 'Professional, trustworthy, aspirational';
    
    // Extract colors
    const colorsMatch = analysisText.match(/\*\*COLORS:\*\*\s*([\s\S]*?)(?=\*\*[A-Z_]+:|$)/i);
    theme.colors = colorsMatch ? colorsMatch[1].trim() : 'Professional color palette with warm and confident tones';
    
    // Extract props
    const propsMatch = analysisText.match(/\*\*PROPS:\*\*\s*([\s\S]*?)(?=\*\*[A-Z_]+:|$)/i);
    theme.props = propsMatch ? propsMatch[1].trim() : 'Professional elements and modern furnishings';
    
    return theme;
}

// Function to provide dynamic attire suggestions based on business type
function getBusinessAppropriateAttire(businessInfo, businessType) {
    const businessLower = (businessInfo + ' ' + businessType).toLowerCase();
    
    if (businessLower.includes('bank') || businessLower.includes('finance') || businessLower.includes('insurance')) {
        return 'formal business suit or professional saree in sober colors (navy, black, or dark grey)';
    } else if (businessLower.includes('jewelry') || businessLower.includes('fashion') || businessLower.includes('wedding')) {
        return 'elegant saree or lehenga with appropriate jewelry showcasing the business aesthetic';
    } else if (businessLower.includes('tech') || businessLower.includes('it') || businessLower.includes('software') || businessLower.includes('corporate')) {
        return 'western formal wear, smart business casuals, or modern professional attire';
    } else if (businessLower.includes('travel') || businessLower.includes('tourism') || businessLower.includes('hotel')) {
        return 'comfortable, stylish, professional travel attire or hospitality uniform';
    } else if (businessLower.includes('restaurant') || businessLower.includes('food') || businessLower.includes('hospitality')) {
        return 'neat professional uniform or elegant formal wear appropriate for hospitality industry';
    } else if (businessLower.includes('hospital') || businessLower.includes('medical') || businessLower.includes('health') || businessLower.includes('clinic')) {
        return 'professional doctor coat, nurse uniform, or formal medical attire suggesting healthcare expertise';
    } else if (businessLower.includes('real estate') || businessLower.includes('property')) {
        return 'smart business attire (suit or professional saree) suggesting trust and success in real estate';
    } else if (businessLower.includes('education') || businessLower.includes('school') || businessLower.includes('college')) {
        return 'professional teacher/academic attire - formal yet approachable';
    } else if (businessLower.includes('beauty') || businessLower.includes('salon') || businessLower.includes('spa')) {
        return 'elegant, stylish attire showcasing beauty and personal care expertise';
    } else {
        return 'professional attire that dynamically matches the specific business type and industry standards';
    }
}

// Fallback theme function for when dynamic analysis fails
function getFallbackTheme(companyName, businessInfo) {
    const suggestedAttire = getBusinessAppropriateAttire(businessInfo, 'general');
    
    return {
        businessType: 'custom',
        visualTheme: {
            setting: 'Professional modern space with elegant interiors, excellent lighting, and contemporary design that suggests success and reliability',
            anchorAttire: suggestedAttire,
            background: 'Contemporary business environment with modern furnishings, professional atmosphere, and elements that support credibility',
            mood: 'Professional, trustworthy, successful, aspirational',
            colors: 'Professional color palette with confident blues, warm whites, and subtle premium accents',
            props: 'Modern professional elements, quality furnishings, business materials, and trust-building elements'
        },
        companyName,
        businessInfo,
        source: 'fallback_theme'
    };
}

// Meta prompts based on pattern analysis
const META_PROMPTS = {
    voiceOver: `Generate exactly 5 variations of natural Telugu voice-over scripts for commercial advertisement.

Company Name: {companyName}
Business Information: {businessInfo}
Total Duration: {duration} seconds

CRITICAL INSTRUCTIONS:
1. Write EVERYTHING in Telugu script only - no English words should appear in the final output
2. Use natural, conversational Telugu as spoken in Andhra Pradesh 2025
3. For English words commonly used, write them in Telugu script (transliterated)
4. Each variation should be EXACTLY {duration} seconds when spoken naturally
5. If duration is more than 8 seconds, divide the script into 8-second segments
6. Use simple, impactful language that connects emotionally with Telugu audience
7. Include company name prominently and naturally in Telugu script
8. Make it persuasive, engaging, and memorable like professional ads
9. Focus on benefits and emotional appeal, not just features
10. End with strong call-to-action using natural Telugu flow

**TELUGU SCRIPT ONLY REQUIREMENT:**
- Write ALL content in Telugu script (తెలుగు లిపి)
- Convert English words to Telugu script phonetically
- NO English words should appear in the final script
- Use Telugu equivalents where possible, Telugu script for borrowed words

**TRANSLITERATION EXAMPLES:**
- call → కాల్
- service → సర్వీస్ 
- quality → క్వాలిటీ
- offer → ఆఫర్
- discount → డిస్కౌంట్
- experience → ఎక్స్పీరియన్స్
- thank you → థాంక్ యూ
- free → ఫ్రీ
- consultation → కన్సల్టేషన్
- opportunity → అవకాశం (use Telugu word)
- don't miss → వదులుకోవద్దు (use Telugu phrase)

**COMPANY NAME HANDLING:**
Convert {companyName} to Telugu script: {companyNameInTelugu}

**LANGUAGE STYLE EXAMPLES (CORRECT FORMAT):**
- "మీ ఫ్యామిలీ కి బెస్ట్ క్వాలిటీ ఇన్షూర్ చేస్తాం"
- "థాంక్ యూ! మా సర్వీస్ ట్రై చేయండి"
- "స్పెషల్ ఆఫర్! లిమిటెడ్ టైమ్ లో వచ్చేసి ఎక్స్పీరియన్స్ చేయండి"
- "ట్రస్ట్ చేయండి, సెటిస్ఫాక్షన్ గ్యారంటీ"

Format each variation like this:
Variation [number]:
[If more than 8 seconds, label as]
Segment 1 (0-8 sec): [Complete Telugu script only]
Segment 2 (8-16 sec): [Complete Telugu script only]
[etc.]
[If 8 seconds or less, just provide the complete Telugu script]

IMPORTANT: Generate scripts with ONLY Telugu script - no English words, no brackets, no transliterations shown. Pure Telugu output that anchors can read directly.

Generate 5 complete variations in pure Telugu script:`,

    sceneGeneration: `CREATE WORLD-CLASS COMMERCIAL AD SCENES - PROFESSIONAL AD AGENCY LEVEL

You are a top-tier creative director at a prestigious advertising agency. Create cinematic, professional commercial scenes that rival international ad campaigns.

BUSINESS CONTEXT:
Company: {companyName}
Business: {businessInfo}
Voice-Over: {voiceOver}
Duration: {selectedDuration} seconds

VISUAL THEME ANALYSIS:
Business Type: {businessType}
Setting: {setting}
Anchor Styling: {anchorAttire}
Background: {background}
Mood: {mood}
Color Palette: {colors}
Props & Elements: {props}

PROFESSIONAL AD AGENCY REQUIREMENTS:
1. Create CINEMATIC, HIGH-PRODUCTION VALUE scenes
2. Every element must PERFECTLY MATCH the business concept
3. Anchor appearance, attire, and setting must be COHESIVE with business type
4. Use PREMIUM, ASPIRATIONAL visuals that sell the brand lifestyle
5. Perfect synchronization with Telugu voice-over emotions and timing
6. Create scenes that look like they cost lakhs to produce

Generate detailed scene instructions for each 8-second segment:

**SEGMENT [Number] (0-{segmentEnd} seconds): "{TITLE}"**

**CINEMATIC VISION:**
[2-3 sentences describing the overall cinematic feel - think Bollywood commercial meets international ad campaign quality]

**CAMERA WORK (Cinematography):**
- **Opening Shot:** [Specific shot type, angle, distance]
- **Camera Movement:** [Smooth dolly, elegant pan, dynamic zoom - be specific about speed and direction]  
- **Transitions:** [How camera moves between focal points]
- **Closing Shot:** [Final frame composition]

**STAR ANCHOR (Leading Lady):**
- **Appearance:** Beautiful, professional Indian woman embodying the brand
- **Attire:** MUST dynamically match the business segment (see business info for context). Gemini decides attire contextually; do not assume saree unless industry makes it appropriate. Examples:
  • Banking/Finance → formal business suit or professional saree in sober colors
  • Jewelry/Fashion → elegant saree or lehenga with jewelry
  • IT/Tech/Corporate → western formal wear or smart casuals
  • Travel/Tourism → comfortable, stylish, professional travel attire
  • Hospitality/Restaurants → neat uniforms or elegant formal wear
  • Healthcare/Hospitals → professional doctor/nurse coat or formal medical attire
- **Expressions:** [Specific facial expressions synchronized with Telugu phrases - confident, trustworthy, etc.]
- **Gestures:** [Precise hand movements, body language that enhances the message]
- **Interaction:** [How she interacts with products/environment naturally]

**PREMIUM SETTING & PRODUCTION DESIGN:**
- **Location:** {setting}
- **Background Details:** {background}
- **Color Scheme:** {colors}
- **Props & Products:** {props}
- **Atmosphere:** {mood}

**LIGHTING (Cinematography):**
- **Key Lighting:** [Professional lighting setup - where lights are positioned]
- **Mood Lighting:** [How lighting creates the desired emotional atmosphere]
- **Product Lighting:** [Special lighting for any products/elements]

**AUDIO DESIGN:**
- **Background Music:** [Style matching business type and emotional tone]
- **Voice-Over Delivery:** [Specific emotional delivery style for Telugu script]
- **Sound Effects:** [Subtle audio elements that enhance the scene]

**SYNCHRONIZED VOICE-OVER:**
Telugu Script: "[Exact Telugu script for this segment]"
**Delivery Notes:** [How the anchor should deliver each phrase - timing, emotion, emphasis]

**BRAND INTEGRATION:**
[How company name/concept is naturally woven into the visual narrative]

**ATTIRE_SUMMARY (JSON):**
{
  "subject_anchor": {
    "attire": "[Specific attire choice made for this business type]",
    "reasoning": "[Brief explanation of why this attire suits the business]"
  }
}

---

CRITICAL REQUIREMENTS:
✓ Every scene must look like it was shot by a top advertising agency
✓ Anchor attire must DYNAMICALLY match the specific business type - never default to saree unless contextually appropriate
✓ Consider the business domain when choosing anchor attire (corporate = suits, traditional businesses = saree, tech = smart casuals, etc.)
✓ Background and props must be 100% relevant to the business
✓ Create aspirational, premium feel regardless of business type
✓ Perfect lip-sync and emotional synchronization with Telugu voice-over
✓ Each segment should seamlessly flow into the next
✓ Minimum 250 words per segment for detailed production value

CREATE PROFESSIONAL, COHESIVE, BUSINESS-SPECIFIC SCENES NOW:`
};

// DOM Elements
const companyNameInput = document.getElementById('companyName');
const businessInfoInput = document.getElementById('businessInfo');
const durationSelect = document.getElementById('duration');
const customDurationInput = document.getElementById('customDuration');
const visualThemePreview = document.getElementById('visualThemePreview');
const themeDetails = document.getElementById('themeDetails');
const generateVOBtn = document.getElementById('generateVO');
const refreshVOBtn = document.getElementById('refreshVO');
const voResults = document.getElementById('voResults');
const voVariations = document.getElementById('voVariations');
const sceneSection = document.querySelector('.scene-section');
const selectedVODisplay = document.getElementById('selectedVODisplay');
const generateScenesBtn = document.getElementById('generateScenes');
const sceneResults = document.getElementById('sceneResults');
const sceneDescriptions = document.getElementById('sceneDescriptions');
const copyAllBtn = document.getElementById('copyAll');
const loading = document.getElementById('loading');

// Event Listeners
durationSelect.addEventListener('change', (e) => {
    if (e.target.value === 'custom') {
        customDurationInput.style.display = 'block';
    } else {
        customDurationInput.style.display = 'none';
    }
});

generateVOBtn.addEventListener('click', generateVoiceOvers);
refreshVOBtn.addEventListener('click', () => generateVoiceOvers(true));
generateScenesBtn.addEventListener('click', generateScenes);
copyAllBtn.addEventListener('click', copyAllScenes);

// Functions
function showThemeAnalysisLoading() {
    themeDetails.innerHTML = `
        <div class="theme-loading">
            <div class="loading-spinner"></div>
            <p>🔍 Analyzing business and researching visual themes...</p>
            <small>Creating custom theme based on your business type</small>
        </div>
    `;
    visualThemePreview.style.display = 'block';
}

function hideThemeAnalysisLoading() {
    if (themeDetails.querySelector('.theme-loading')) {
        visualThemePreview.style.display = 'none';
    }
}

function displayVisualTheme(businessAnalysis) {
    const { businessType, visualTheme, source } = businessAnalysis;
    
    // Show source indicator
    const sourceIndicator = source === 'dynamic_ai_analysis' 
        ? '<span class="theme-source dynamic">🌐 Dynamically Researched</span>'
        : '<span class="theme-source fallback">⚡ Fallback Theme</span>';
    
    themeDetails.innerHTML = `
        <div class="theme-header">
            <span class="theme-title">Detected Visual Theme</span>
            ${sourceIndicator}
        </div>
        <div class="theme-item">
            <span class="theme-label">Business Type:</span>
            <span class="theme-value">${businessType.charAt(0).toUpperCase() + businessType.slice(1)}</span>
        </div>
        <div class="theme-item">
            <span class="theme-label">Setting:</span>
            <span class="theme-value">${visualTheme.setting}</span>
        </div>
        <div class="theme-item">
            <span class="theme-label">Anchor Style:</span>
            <span class="theme-value">${visualTheme.anchorAttire}</span>
        </div>
        <div class="theme-item">
            <span class="theme-label">Mood:</span>
            <span class="theme-value">${visualTheme.mood}</span>
        </div>
    `;
    
    visualThemePreview.style.display = 'block';
}

async function generateVoiceOvers(refresh = false) {
    const companyName = companyNameInput.value.trim();
    const businessInfo = businessInfoInput.value.trim();
    
    if (!companyName || !businessInfo) {
        alert('Please enter company name and business information');
        return;
    }
    
    // Show loading for theme analysis
    showThemeAnalysisLoading();
    
    try {
        // Analyze business and show visual theme dynamically
        const businessAnalysis = await analyzeBusinessAndCreateVisualTheme(companyName, businessInfo);
        displayVisualTheme(businessAnalysis);
        
        let duration = durationSelect.value;
        if (duration === 'custom') {
            duration = customDurationInput.value;
            if (!duration || duration < 8) {
                alert('Please enter a valid duration (minimum 8 seconds)');
                return;
            }
        }
        
        // Generate Telugu transliteration for company name
        const companyNameInTelugu = generateTeluguTransliteration(companyName);
        
        const prompt = META_PROMPTS.voiceOver
            .replace('{companyName}', companyName)
            .replace('{companyNameInTelugu}', companyNameInTelugu)
            .replace('{businessInfo}', businessInfo)
            .replace(/{duration}/g, duration)
            .replace('{anchorDetails}', ''); // Not needed anymore
        
        if (refresh) {
            const strengthenedPrompt = prompt + '\n\nIMPORTANT: Generate completely different variations from before. Be more creative, emotional, and impactful. Use different approaches and messaging angles with natural Telugu-English mix and proper transliterations.';
            await callGeminiAPI(strengthenedPrompt, 'voiceOver');
        } else {
            await callGeminiAPI(prompt, 'voiceOver');
        }
    } catch (error) {
        console.error('Error in voice-over generation:', error);
        alert('Error generating voice-overs: ' + error.message);
        hideThemeAnalysisLoading();
    }
}

// Function to generate Telugu transliteration for company names
function generateTeluguTransliteration(englishText) {
    // Enhanced transliteration mapping for common business terms and sounds
    let telugu = englishText.toLowerCase()
        // Complete business terms
        .replace(/dream\s*team/gi, 'డ్రీమ్ టీమ్')
        .replace(/service/gi, 'సర్వీస్')
        .replace(/services/gi, 'సర్వీసెస్')
        .replace(/solutions/gi, 'సొల్యూషన్స్')
        .replace(/technologies/gi, 'టెక్నాలజీస్')
        .replace(/consulting/gi, 'కన్సల్టింగ్')
        .replace(/consultation/gi, 'కన్సల్టేషన్')
        .replace(/enterprises/gi, 'ఎంటర్ప్రైసెస్')
        .replace(/international/gi, 'ఇంటర్నేషనల్')
        .replace(/software/gi, 'సాఫ్ట్వేర్')
        .replace(/hardware/gi, 'హార్డ్వేర్')
        .replace(/systems/gi, 'సిస్టమ్స్')
        .replace(/digital/gi, 'డిజిటల్')
        .replace(/online/gi, 'ఆన్లైన్')
        .replace(/mobile/gi, 'మోబైల్')
        .replace(/express/gi, 'ఎక్స్ప్రెస్')
        .replace(/logistics/gi, 'లాజిస్టిక్స్')
        .replace(/marketing/gi, 'మార్కెటింగ్')
        .replace(/advertising/gi, 'అడ్వర్టైసింగ్')
        
        // Common business words
        .replace(/quality/gi, 'క్వాలిటీ')
        .replace(/premium/gi, 'ప్రీమియం')
        .replace(/royal/gi, 'రాయల్')
        .replace(/grand/gi, 'గ్రాండ్')
        .replace(/elite/gi, 'ఎలైట్')
        .replace(/super/gi, 'సూపర్')
        .replace(/mega/gi, 'మేగా')
        .replace(/ultra/gi, 'అల్ట్రా')
        .replace(/smart/gi, 'స్మార్ట్')
        .replace(/quick/gi, 'క్విక్')
        .replace(/fast/gi, 'ఫాస్ట్')
        .replace(/speed/gi, 'స్పీడ్')
        .replace(/power/gi, 'పవర్')
        .replace(/energy/gi, 'ఎనర్జీ')
        .replace(/health/gi, 'హెల్త్')
        .replace(/care/gi, 'కేర్')
        .replace(/beauty/gi, 'బ్యూటీ')
        .replace(/fashion/gi, 'ఫ్యాషన్')
        .replace(/style/gi, 'స్టైల్')
        .replace(/design/gi, 'డిజైన్')
        
        // Colors and materials
        .replace(/gold/gi, 'గోల్డ్')
        .replace(/silver/gi, 'సిల్వర్')
        .replace(/diamond/gi, 'డైమండ్')
        .replace(/platinum/gi, 'ప్లాటినం')
        .replace(/crystal/gi, 'క్రిస్టల్')
        
        // Places and concepts
        .replace(/center/gi, 'సెంటర్')
        .replace(/centre/gi, 'సెంటర్')
        .replace(/plaza/gi, 'ప్లాజా')
        .replace(/mall/gi, 'మాల్')
        .replace(/market/gi, 'మార్కెట్')
        .replace(/store/gi, 'స్టోర్')
        .replace(/shop/gi, 'షాప్')
        .replace(/home/gi, 'హోమ్')
        .replace(/auto/gi, 'ఆటో')
        .replace(/clinic/gi, 'క్లినిక్')
        .replace(/hospital/gi, 'హాస్పిటల్')
        .replace(/school/gi, 'స్కూల్')
        .replace(/college/gi, 'కాలేజ్')
        .replace(/institute/gi, 'ఇన్స్టిట్యూట్')
        .replace(/academy/gi, 'అకాడమీ')
        
        // Business entities
        .replace(/group/gi, 'గ్రూప్')
        .replace(/company/gi, 'కంపెనీ')
        .replace(/corporation/gi, 'కార్పొరేషన్')
        .replace(/corp/gi, 'కార్ప్')
        .replace(/limited/gi, 'లిమిటెడ్')
        .replace(/ltd/gi, 'లిమిటెడ్')
        .replace(/private/gi, 'ప్రైవేట్')
        .replace(/pvt/gi, 'ప్రైవేట్')
        .replace(/incorporated/gi, 'ఇన్కార్పొరేటెడ్')
        .replace(/inc/gi, 'ఇంక్')
        
        // Action words
        .replace(/pro/gi, 'ప్రో')
        .replace(/max/gi, 'మాక్స్')
        .replace(/plus/gi, 'ప్లస్')
        .replace(/advance/gi, 'అడ్వాన్స్')
        .replace(/expert/gi, 'ఎక్స్పర్ట్')
        .replace(/master/gi, 'మాస్టర్')
        .replace(/chief/gi, 'చీఫ్')
        .replace(/star/gi, 'స్టార్')
        .replace(/top/gi, 'టాప్')
        .replace(/best/gi, 'బెస్ట్')
        .replace(/first/gi, 'ఫస్ట్')
        .replace(/new/gi, 'న్యూ')
        .replace(/modern/gi, 'మాడర్న్')
        
        // Numbers
        .replace(/one/gi, 'వన్')
        .replace(/two/gi, 'టూ')
        .replace(/three/gi, 'త్రీ')
        .replace(/four/gi, 'ఫోర్')
        .replace(/five/gi, 'ఫైవ్')
        .replace(/six/gi, 'సిక్స్')
        .replace(/seven/gi, 'సెవన్')
        .replace(/eight/gi, 'ఎయిట్')
        .replace(/nine/gi, 'నైన్')
        .replace(/ten/gi, 'టెన్')
        
        // Common single letters and sounds
        .replace(/ch/g, 'చ్')
        .replace(/sh/g, 'ష్')
        .replace(/th/g, 'త్')
        .replace(/ph/g, 'ఫ్')
        .replace(/ck/g, 'క్')
        .replace(/x/g, 'క్స్')
        .replace(/qu/g, 'క్వ్')
        
        // Single letter conversions (only if not already converted)
        .replace(/(?<![\u0C00-\u0C7F])k(?![\u0C00-\u0C7F])/g, 'క్')
        .replace(/(?<![\u0C00-\u0C7F])b(?![\u0C00-\u0C7F])/g, 'బ్')
        .replace(/(?<![\u0C00-\u0C7F])d(?![\u0C00-\u0C7F])/g, 'డ్')
        .replace(/(?<![\u0C00-\u0C7F])f(?![\u0C00-\u0C7F])/g, 'ఫ్')
        .replace(/(?<![\u0C00-\u0C7F])g(?![\u0C00-\u0C7F])/g, 'గ్')
        .replace(/(?<![\u0C00-\u0C7F])j(?![\u0C00-\u0C7F])/g, 'జ్')
        .replace(/(?<![\u0C00-\u0C7F])l(?![\u0C00-\u0C7F])/g, 'ల్')
        .replace(/(?<![\u0C00-\u0C7F])m(?![\u0C00-\u0C7F])/g, 'మ్')
        .replace(/(?<![\u0C00-\u0C7F])n(?![\u0C00-\u0C7F])/g, 'న్')
        .replace(/(?<![\u0C00-\u0C7F])p(?![\u0C00-\u0C7F])/g, 'ప్')
        .replace(/(?<![\u0C00-\u0C7F])r(?![\u0C00-\u0C7F])/g, 'ర్')
        .replace(/(?<![\u0C00-\u0C7F])s(?![\u0C00-\u0C7F])/g, 'స్')
        .replace(/(?<![\u0C00-\u0C7F])t(?![\u0C00-\u0C7F])/g, 'ట్')
        .replace(/(?<![\u0C00-\u0C7F])v(?![\u0C00-\u0C7F])/g, 'వ్')
        .replace(/(?<![\u0C00-\u0C7F])w(?![\u0C00-\u0C7F])/g, 'వ్')
        .replace(/(?<![\u0C00-\u0C7F])y(?![\u0C00-\u0C7F])/g, 'య్')
        .replace(/(?<![\u0C00-\u0C7F])z(?![\u0C00-\u0C7F])/g, 'జ్');
    
    // Clean up and return with proper capitalization
    return telugu.charAt(0).toUpperCase() + telugu.slice(1);
}

async function generateScenes() {
    if (!selectedVO) {
        alert('Please select a voice-over first');
        return;
    }
    
    if (!selectedVODuration) {
        alert('Selected voice-over duration not available. Please select a voice-over again.');
        return;
    }
    
    const companyName = companyNameInput.value.trim();
    const businessInfo = businessInfoInput.value.trim();
    
    try {
        // Analyze business and create visual theme dynamically
        const businessAnalysis = await analyzeBusinessAndCreateVisualTheme(companyName, businessInfo);
        const { businessType, visualTheme } = businessAnalysis;
        
        const prompt = META_PROMPTS.sceneGeneration
            .replace('{voiceOver}', selectedVO)
            .replace('{companyName}', companyName)
            .replace('{businessInfo}', businessInfo)
            .replace('{selectedDuration}', selectedVODuration)
            .replace('{businessType}', businessType)
            .replace('{setting}', visualTheme.setting)
            .replace('{anchorAttire}', visualTheme.anchorAttire)
            .replace('{background}', visualTheme.background)
            .replace('{mood}', visualTheme.mood)
            .replace('{colors}', visualTheme.colors)
            .replace('{props}', visualTheme.props);
        
        await callGeminiAPI(prompt, 'scene');
    } catch (error) {
        console.error('Error in scene generation:', error);
        alert('Error generating scenes: ' + error.message);
    }
}

async function callGeminiAPI(prompt, type) {
    loading.style.display = 'block';
    
    try {
        const response = await fetch(API_URL + '?key=' + API_KEY, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 8192,
                }
            })
        });
        
        if (!response.ok) {
            throw new Error('API request failed: ' + response.statusText);
        }
        
        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const generatedText = data.candidates[0].content.parts[0].text;
            
            if (type === 'voiceOver') {
                displayVOResults(generatedText);
            } else if (type === 'scene') {
                displaySceneResults(generatedText);
            }
        } else {
            throw new Error('Invalid response structure');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error generating content: ' + error.message);
    } finally {
        loading.style.display = 'none';
    }
}

function displayVOResults(text) {
    currentVariations = parseVOVariations(text);
    
    voVariations.innerHTML = '';
    currentVariations.forEach((variation, index) => {
        const div = document.createElement('div');
        div.className = 'vo-variation';
        div.innerHTML = `
            <div class="variation-header">
                <span class="variation-number">Variation ${index + 1}</span>
                <span class="variation-duration">${calculateDuration(variation)} seconds</span>
            </div>
            <div class="variation-text">${variation}</div>
        `;
        
        div.addEventListener('click', () => selectVariation(variation, div));
        voVariations.appendChild(div);
    });
    
    voResults.style.display = 'block';
    refreshVOBtn.style.display = 'inline-block';
}

function parseVOVariations(text) {
    const variations = [];
    // Handle both English and Telugu variation labels
    const regex = /(Variation|వైవిధ్యం)\s+\d+:?\s*([\s\S]*?)(?=(Variation|వైవిధ్యం)\s+\d+:|$)/gi;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
        variations.push(match[2].trim());
    }
    
    return variations.length > 0 ? variations : [text];
}

function calculateDuration(text) {
    // Check for Telugu segment labels
    const teluguSegments = text.match(/(విభాగం|Segment)\s+\d+/g);
    if (teluguSegments) {
        return teluguSegments.length * 8;
    }
    
    // Check for time ranges
    const timeRanges = text.match(/\d+-\d+\s*(సెకన్లు|sec)/g);
    if (timeRanges) {
        return timeRanges.length * 8;
    }
    
    return 8;
}

function selectVariation(variation, element) {
    selectedVO = variation;
    selectedVODuration = calculateDuration(variation);
    
    document.querySelectorAll('.vo-variation').forEach(el => {
        el.classList.remove('selected');
    });
    element.classList.add('selected');
    
    selectedVODisplay.innerHTML = `
        <div class="variation-text">${variation}</div>
        <div class="duration-info">Selected Duration: ${selectedVODuration} seconds</div>
    `;
    sceneSection.style.display = 'block';
    sceneSection.scrollIntoView({ behavior: 'smooth' });
}

function displaySceneResults(text) {
    sceneDescriptions.innerHTML = '';
    
    // First, try to parse by SEGMENT keyword with more precise regex
    let segments = [];
    
    // Look for SEGMENT [Number] pattern and capture everything until the next SEGMENT or end
    const segmentRegex = /\*\*SEGMENT\s+(\d+)\s*\([^)]+\):\s*"[^"]*"\*\*([\s\S]*?)(?=\*\*SEGMENT\s+\d+|\*\*$|$)/gi;
    let match;
    
    while ((match = segmentRegex.exec(text)) !== null) {
        const segmentNumber = match[1];
        const segmentContent = match[2].trim();
        
        // Extract segment title if available
        const titleMatch = text.match(new RegExp(`\\*\\*SEGMENT\\s+${segmentNumber}\\s*\\([^)]+\\):\\s*"([^"]*)"\\*\\*`, 'i'));
        const segmentTitle = titleMatch ? titleMatch[1] : `Scene ${segmentNumber}`;
        
        // Only include if content is substantial (more than just intro text)
        if (segmentContent.length > 200 && 
            (segmentContent.includes('CINEMATIC VISION') || 
             segmentContent.includes('CAMERA WORK') || 
             segmentContent.includes('STAR ANCHOR') ||
             segmentContent.includes('PREMIUM SETTING'))) {
            segments.push({
                number: segmentNumber,
                title: segmentTitle,
                content: segmentContent
            });
        }
    }
    
    // If no segments found with SEGMENT keyword, try alternative patterns
    if (segments.length === 0) {
        // Try to find segments by looking for key section headers
        const altSegmentRegex = /\*\*([^*]+)\s*\([0-9]+-[0-9]+\s*seconds?\):\s*"([^"]*)"\*\*([\s\S]*?)(?=\*\*[^*]+\s*\([0-9]+-[0-9]+\s*seconds?\)|\*\*$|$)/gi;
        
        while ((match = altSegmentRegex.exec(text)) !== null) {
            const segmentTitle = match[1].trim();
            const segmentSubtitle = match[2] || '';
            const segmentContent = match[3].trim();
            
            if (segmentContent.length > 200 && 
                (segmentContent.includes('CINEMATIC VISION') || 
                 segmentContent.includes('CAMERA WORK') || 
                 segmentContent.includes('STAR ANCHOR'))) {
                segments.push({
                    number: segments.length + 1,
                    title: segmentSubtitle || segmentTitle,
                    content: segmentContent
                });
            }
        }
    }
    
    // Create dropdown with all segments and display area
    if (segments.length > 0) {
        // Create segment selector dropdown
        const selectorHTML = `
            <div class="segment-selector">
                <h3>🎬 Generated Scene Segments</h3>
                <div class="dropdown-container">
                    <label for="segmentDropdown">Select Segment to View:</label>
                    <select id="segmentDropdown" onchange="showSelectedSegment(this.value)">
                        <option value="">-- Choose a Segment --</option>
                        ${segments.map((segment, index) => 
                            `<option value="${index}">Segment ${segment.number}: ${segment.title}</option>`
                        ).join('')}
                        <option value="all">📋 View All Segments</option>
                    </select>
                </div>
                <button class="copy-all-segments-btn" onclick="copyAllSegmentsFromDropdown()">📋 Copy All Segments</button>
            </div>
            <div id="selectedSegmentDisplay" class="selected-segment-display" style="display: none;">
                <!-- Selected segment content will appear here -->
            </div>
            <div id="allSegmentsDisplay" class="all-segments-display" style="display: none;">
                <!-- All segments content will appear here -->
            </div>
        `;
        
        sceneDescriptions.innerHTML = selectorHTML;
        
        // Store segments globally for dropdown functionality
        window.currentSceneSegments = segments;
        
    } else {
        // Fallback: split by any pattern that looks like a segment header
        const fallbackSegments = text.split(/(?=\*\*[A-Z\s]+\([0-9]+-[0-9]+)/i).filter(s => {
            const trimmed = s.trim();
            return trimmed.length > 200 && 
                   (trimmed.includes('CINEMATIC') || 
                    trimmed.includes('CAMERA') || 
                    trimmed.includes('ANCHOR') ||
                    trimmed.includes('SETTING'));
        });
        
        if (fallbackSegments.length > 0) {
            const fallbackSegmentObjects = fallbackSegments.map((segment, index) => ({
                number: index + 1,
                title: `Scene ${index + 1}`,
                content: segment
            }));
            
            // Create dropdown for fallback segments
            const selectorHTML = `
                <div class="segment-selector">
                    <h3>🎬 Generated Scene Segments</h3>
                    <div class="dropdown-container">
                        <label for="segmentDropdown">Select Segment to View:</label>
                        <select id="segmentDropdown" onchange="showSelectedSegment(this.value)">
                            <option value="">-- Choose a Segment --</option>
                            ${fallbackSegmentObjects.map((segment, index) => 
                                `<option value="${index}">Segment ${segment.number}: ${segment.title}</option>`
                            ).join('')}
                            <option value="all">📋 View All Segments</option>
                        </select>
                    </div>
                    <button class="copy-all-segments-btn" onclick="copyAllSegmentsFromDropdown()">📋 Copy All Segments</button>
                </div>
                <div id="selectedSegmentDisplay" class="selected-segment-display" style="display: none;">
                    <!-- Selected segment content will appear here -->
                </div>
                <div id="allSegmentsDisplay" class="all-segments-display" style="display: none;">
                    <!-- All segments content will appear here -->
                </div>
            `;
            
            sceneDescriptions.innerHTML = selectorHTML;
            window.currentSceneSegments = fallbackSegmentObjects;
        } else {
            // Last resort: display as single content but only if it contains actual scene content
            if (text.includes('CINEMATIC VISION') || text.includes('CAMERA WORK') || text.includes('STAR ANCHOR')) {
                const singleSegment = [{
                    number: 1,
                    title: 'Complete Scene',
                    content: text
                }];
                
                const selectorHTML = `
                    <div class="segment-selector">
                        <h3>🎬 Generated Scene Content</h3>
                        <div class="dropdown-container">
                            <label for="segmentDropdown">Select Content to View:</label>
                            <select id="segmentDropdown" onchange="showSelectedSegment(this.value)">
                                <option value="">-- Choose Content --</option>
                                <option value="0">Complete Scene Description</option>
                            </select>
                        </div>
                        <button class="copy-all-segments-btn" onclick="copyAllSegmentsFromDropdown()">📋 Copy Content</button>
                    </div>
                    <div id="selectedSegmentDisplay" class="selected-segment-display" style="display: none;">
                        <!-- Selected content will appear here -->
                    </div>
                `;
                
                sceneDescriptions.innerHTML = selectorHTML;
                window.currentSceneSegments = singleSegment;
            } else {
                // Show error message if no proper scene content found
                sceneDescriptions.innerHTML = `
                    <div class="error-message">
                        <h4>⚠️ Scene Parsing Issue</h4>
                        <p>The generated content doesn't appear to contain properly formatted scene segments. Please try generating scenes again.</p>
                        <div class="raw-content">${formatSceneContent(text)}</div>
                    </div>
                `;
            }
        }
    }
    
    sceneResults.style.display = 'block';
}

// New function to copy individual segments
function copySegment(button) {
    const segmentContainer = button.closest('.scene-segment-container');
    const sceneContent = segmentContainer.querySelector('.scene-content');
    const textToCopy = sceneContent.innerText;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        const originalText = button.innerText;
        button.innerText = '✓ Copied!';
        button.style.background = '#4CAF50';
        setTimeout(() => {
            button.innerText = originalText;
            button.style.background = '';
        }, 2000);
    }).catch(err => {
        alert('Failed to copy: ' + err);
    });
}

// Function to show selected segment from dropdown
function showSelectedSegment(selectedIndex) {
    const selectedDisplay = document.getElementById('selectedSegmentDisplay');
    const allDisplay = document.getElementById('allSegmentsDisplay');
    
    // Hide all display first
    selectedDisplay.style.display = 'none';
    allDisplay.style.display = 'none';
    
    if (selectedIndex === '') {
        return; // Nothing selected
    }
    
    if (selectedIndex === 'all') {
        // Show all segments
        if (window.currentSceneSegments && window.currentSceneSegments.length > 0) {
            const allSegmentsHTML = window.currentSceneSegments.map((segment, index) => `
                <div class="scene-segment-container">
                    <div class="segment-header">
                        <h4>🎬 Segment ${segment.number} (${index * 8}-${(index + 1) * 8} seconds)</h4>
                        <span class="segment-title">${segment.title}</span>
                        <button class="copy-segment-btn" onclick="copySegmentContent(${index})">📋 Copy Segment</button>
                    </div>
                    <div class="scene-content">${formatSceneContent(segment.content)}</div>
                </div>
            `).join('');
            
            allDisplay.innerHTML = `
                <div class="all-segments-header">
                    <h3>📋 All Generated Segments</h3>
                </div>
                ${allSegmentsHTML}
            `;
            allDisplay.style.display = 'block';
        }
    } else {
        // Show selected segment
        const segmentIndex = parseInt(selectedIndex);
        if (window.currentSceneSegments && window.currentSceneSegments[segmentIndex]) {
            const segment = window.currentSceneSegments[segmentIndex];
            
            selectedDisplay.innerHTML = `
                <div class="scene-segment-container">
                    <div class="segment-header">
                        <h4>🎬 Segment ${segment.number} (${segmentIndex * 8}-${(segmentIndex + 1) * 8} seconds)</h4>
                        <span class="segment-title">${segment.title}</span>
                        <button class="copy-segment-btn" onclick="copySegmentContent(${segmentIndex})">📋 Copy Segment</button>
                    </div>
                    <div class="scene-content">${formatSceneContent(segment.content)}</div>
                </div>
            `;
            selectedDisplay.style.display = 'block';
        }
    }
}

// Function to copy specific segment content
function copySegmentContent(segmentIndex) {
    if (window.currentSceneSegments && window.currentSceneSegments[segmentIndex]) {
        const segment = window.currentSceneSegments[segmentIndex];
        const textToCopy = `SEGMENT ${segment.number}: ${segment.title}\n\n${segment.content}`;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            // Find all copy buttons for this segment and update them
            const copyButtons = document.querySelectorAll(`[onclick="copySegmentContent(${segmentIndex})"]`);
            copyButtons.forEach(button => {
                const originalText = button.innerText;
                button.innerText = '✓ Copied!';
                button.style.background = '#4CAF50';
                setTimeout(() => {
                    button.innerText = originalText;
                    button.style.background = '';
                }, 2000);
            });
        }).catch(err => {
            alert('Failed to copy: ' + err);
        });
    }
}

// Function to copy all segments from dropdown
function copyAllSegmentsFromDropdown() {
    if (window.currentSceneSegments && window.currentSceneSegments.length > 0) {
        const allSegmentsText = window.currentSceneSegments.map((segment, index) => 
            `SEGMENT ${segment.number}: ${segment.title}\n(${index * 8}-${(index + 1) * 8} seconds)\n\n${segment.content}`
        ).join('\n\n' + '='.repeat(50) + '\n\n');
        
        navigator.clipboard.writeText(allSegmentsText).then(() => {
            const copyButton = document.querySelector('.copy-all-segments-btn');
            if (copyButton) {
                const originalText = copyButton.innerText;
                copyButton.innerText = '✓ All Copied!';
                copyButton.style.background = '#4CAF50';
                setTimeout(() => {
                    copyButton.innerText = originalText;
                    copyButton.style.background = '';
                }, 2000);
            }
        }).catch(err => {
            alert('Failed to copy all segments: ' + err);
        });
    }
}

function formatSceneContent(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>')
        .trim();
}

function copyAllScenes() {
    const allSegments = Array.from(document.querySelectorAll('.scene-segment-container .scene-content'))
        .map((el, index) => `SEGMENT ${index + 1}:\n${el.innerText}`)
        .join('\n\n' + '='.repeat(50) + '\n\n');
    
    navigator.clipboard.writeText(allSegments).then(() => {
        const originalText = copyAllBtn.innerText;
        copyAllBtn.innerText = '✓ All Copied!';
        copyAllBtn.style.background = '#4CAF50';
        setTimeout(() => {
            copyAllBtn.innerText = originalText;
            copyAllBtn.style.background = '';
        }, 2000);
    }).catch(err => {
        alert('Failed to copy: ' + err);
    });
}