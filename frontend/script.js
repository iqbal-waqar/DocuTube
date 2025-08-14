function getApiUrl(path) {
    // Use relative path for API calls (works for same-origin)
    return path;
}

// FAQ functionality
document.addEventListener('DOMContentLoaded', () => {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            // Close all other FAQs
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current FAQ
            item.classList.toggle('active');
        });
    });
});

function showSection(section) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => {
        s.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(section);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update sidebar navigation
    document.querySelectorAll('.nav-item').forEach(li => li.classList.remove('active'));
    document.querySelectorAll('.nav-subitem').forEach(li => li.classList.remove('active'));
    
    // Update navbar navigation
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-section') === section) {
            link.classList.add('active');
        }
    });
    
    const navItems = document.querySelectorAll('.nav-item');
    if(section === 'home' && navItems[0]) navItems[0].classList.add('active');
    if(section === 'upload' && navItems[1]) navItems[1].classList.add('active');
    if(section === 'chat' && navItems[2]) navItems[2].classList.add('active');
    if(section === 'youtube' && navItems[3]) navItems[3].classList.add('active');
    if(section === 'faq' && navItems[4]) navItems[4].classList.add('active');
    
    // Handle history sections
    if(section.includes('history')) {
        if(navItems[4]) navItems[4].classList.add('active'); // History dropdown
        
        // Ensure dropdown is open
        const dropdown = document.querySelector('.nav-dropdown');
        const submenuContainer = document.getElementById('historySubmenuContainer');
        if(dropdown && submenuContainer) {
            dropdown.classList.add('active');
            submenuContainer.classList.add('active');
        }
        
        // Highlight specific history subsection
        const subItems = document.querySelectorAll('.nav-subitem');
        if(section === 'document-history' && subItems[0]) subItems[0].classList.add('active');
        if(section === 'chat-history' && subItems[1]) subItems[1].classList.add('active');
        if(section === 'youtube-history' && subItems[2]) subItems[2].classList.add('active');
    }
    
    // Update navbar links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('onclick');
        if (href && href.includes(`'${section}'`)) {
            link.classList.add('active');
        }
    });
    
    // Close mobile sidebar when navigating
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.remove('open');
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

let currentUploadController = null;

function uploadDocument() {
    const fileInput = document.getElementById('fileInput');
    const statusDiv = document.getElementById('uploadStatus');
    const uploadBtn = document.querySelector('.upload-btn');
    const progressWrap = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const cancelBtn = document.getElementById('cancelUploadBtn');
    const fileDetails = document.getElementById('fileDetails');

    if (!fileInput.files.length) {
        showUploadStatus('Please select a file first.', 'error');
        return;
    }

    // Show file details
    const file = fileInput.files[0];
    const nameEl = document.getElementById('fileName');
    const subEl = document.getElementById('fileInfoSub');
    if (nameEl) nameEl.textContent = file.name;
    if (subEl) subEl.textContent = `${(file.size/1024/1024).toFixed(2)} MB • ${file.type || 'Document'}`;
    if (fileDetails) fileDetails.style.display = 'block';

    // Prepare UI
    showUploadStatus('Uploading your document...', 'loading');
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Uploading...</span>';
    if (progressWrap) progressWrap.style.display = 'block';
    if (progressBar) progressBar.style.width = '0%';
    if (progressText) progressText.textContent = 'Starting...';
    if (cancelBtn) cancelBtn.style.display = 'inline-flex';

    const formData = new FormData();
    formData.append('file', file);

    // Use XMLHttpRequest to get real upload progress
    const xhr = new XMLHttpRequest();
    currentUploadController = xhr; // store to allow cancel

    xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            if (progressBar) progressBar.style.width = percent + '%';
            if (progressText) progressText.textContent = percent < 100 ? `Uploading... ${percent}%` : 'Processing...';
        } else {
            if (progressText) progressText.textContent = 'Uploading...';
        }
    });

    xhr.addEventListener('load', () => {
        try {
            const data = JSON.parse(xhr.responseText || '{}');
            showUploadStatus(`✅ Upload successful! Status: ${data.processing_status || 'Processing'}`, 'success');
        } catch (err) {
            showUploadStatus('✅ Upload complete. Processing...', 'success');
        }
        if (progressBar) progressBar.style.width = '100%';
        if (progressText) progressText.textContent = 'Completed';
        // Reset input but keep details visible until next selection
        fileInput.value = '';
    });

    xhr.addEventListener('error', () => {
        showUploadStatus('❌ Upload failed. Please try again.', 'error');
        if (progressText) progressText.textContent = 'Failed';
    });

    xhr.addEventListener('abort', () => {
        showUploadStatus('⏹️ Upload canceled.', 'error');
        if (progressText) progressText.textContent = 'Canceled';
        if (progressBar) progressBar.style.width = '0%';
    });

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '<i class="fas fa-upload"></i><span>Upload Document</span>';
            if (cancelBtn) cancelBtn.style.display = 'none';
        }
    };

    xhr.open('POST', getApiUrl('/documents/upload'));
    xhr.send(formData);

    // Wire cancel button
    if (cancelBtn) {
        cancelBtn.onclick = function() {
            if (currentUploadController) {
                currentUploadController.abort();
                currentUploadController = null;
            }
        };
    }
}

function clearSelectedFile() {
    const fileInput = document.getElementById('fileInput');
    const uploadZone = document.getElementById('uploadZone');
    const fileDetails = document.getElementById('fileDetails');
    if (fileInput) fileInput.value = '';
    if (fileDetails) fileDetails.style.display = 'none';
    if (uploadZone) {
        const uploadIcon = uploadZone.querySelector('.upload-icon');
        const uploadText = uploadZone.querySelector('h3');
        const uploadSubtext = uploadZone.querySelector('p');
        if (uploadIcon) uploadIcon.innerHTML = '<i class="fas fa-cloud-upload-alt"></i>';
        if (uploadText) uploadText.textContent = 'Drag & Drop your files here';
        if (uploadSubtext) uploadSubtext.textContent = 'or click to browse';
        uploadZone.style.borderColor = '';
        uploadZone.style.backgroundColor = '';
    }
}

function showUploadStatus(message, type) {
    const statusDiv = document.getElementById('uploadStatus');
    statusDiv.textContent = message;
    statusDiv.className = `upload-status ${type}`;
    statusDiv.style.display = 'block';
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 5000);
    }
}

function getTimeString() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

let chatHistory = [];
let typingTimeout = null;

function renderChat() {
    const chatBox = document.getElementById('chatBox');
    
    // Keep welcome message if no chat history
    if (chatHistory.length === 0) {
        const welcomeMsg = chatBox.querySelector('.welcome-message');
        if (!welcomeMsg) {
            chatBox.innerHTML = `
                <div class="welcome-message">
                    <div class="ai-avatar">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div class="message-content">
                        <h4>Hello! I'm your AI assistant</h4>
                        <p>I can help you understand and analyze your uploaded documents. Ask me anything!</p>
                    </div>
                </div>
            `;
        }
    } else {
        // Clear welcome message when chat starts
        chatBox.innerHTML = '';
    }
    
    // Render chat messages
    for (const msg of chatHistory) {
        const isUser = msg.sender === 'user';
        const bubbleClass = isUser ? 'chat-bubble user' : 'chat-bubble llm';
        const avatarUrl = isUser
            ? 'https://api.dicebear.com/7.x/identicon/svg?seed=user&backgroundColor=3b82f6'
            : 'https://api.dicebear.com/7.x/bottts/svg?seed=llm&backgroundColor=8b5cf6';
        
        const content = isUser
            ? `<div class='chat-msg-content'>${escapeHtml(msg.text)}</div>`
            : `<div class='chat-msg-content'>${marked.parse(msg.text)}</div>`;
            
        const messageElement = document.createElement('div');
        messageElement.className = bubbleClass;
        messageElement.innerHTML = `
            <img class='chat-avatar' src='${avatarUrl}' alt='${isUser ? 'User' : 'AI'} avatar'>
            ${content}
            <span class='chat-timestamp'>${msg.time || ''}</span>
        `;
        
        chatBox.appendChild(messageElement);
    }
    
    // Typing animation
    if (typingTimeout) {
        const typingElement = document.createElement('div');
        typingElement.className = 'typing-bubble';
        typingElement.innerHTML = `
            <div class="ai-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="typing-content">
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
                <span>AI is thinking...</span>
            </div>
        `;
        chatBox.appendChild(typingElement);
    }
    
    // Smooth scroll to bottom
    chatBox.scrollTo({
        top: chatBox.scrollHeight,
        behavior: 'smooth'
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.querySelector('.send-btn');
    const msg = chatInput.value.trim();
    
    if (!msg) return;
    
    // Add user message
    chatHistory.push({ sender: 'user', text: msg, time: getTimeString() });
    renderChat();
    chatInput.value = '';
    
    // Disable input and button during processing
    chatInput.disabled = true;
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    
    // Show typing animation
    typingTimeout = setTimeout(() => renderChat(), 100);
    
    fetch(getApiUrl('/chat/ask'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: msg })
    })
    .then(res => {
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }
        return res.json();
    })
    .then(data => {
        clearTimeout(typingTimeout);
        typingTimeout = null;
        chatHistory.push({ 
            sender: 'llm', 
            text: data.answer || 'I apologize, but I couldn\'t generate a response. Please try again.', 
            time: getTimeString() 
        });
        renderChat();
    })
    .catch(err => {
        clearTimeout(typingTimeout);
        typingTimeout = null;
        chatHistory.push({ 
            sender: 'llm', 
            text: `❌ Sorry, I encountered an error: ${err.message || err}. Please try again.`, 
            time: getTimeString() 
        });
        renderChat();
    })
    .finally(() => {
        // Re-enable input and button
        chatInput.disabled = false;
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
        chatInput.focus();
    });
}

// This functionality is now handled in the main DOMContentLoaded event listener below

let lastMetaData = null;
let metaCardVisible = false;

function toggleMetaCard() {
    const detailsSection = document.getElementById('ytDetailsSection');
    const btn = document.getElementById('showMetaBtn');
    if (!lastMetaData || !detailsSection) return;
    metaCardVisible = !metaCardVisible;
    if (metaCardVisible) {
        detailsSection.style.display = 'block';
        btn.innerHTML = '<i class="fas fa-eye-slash"></i><span>Hide Details</span>';
    } else {
        detailsSection.style.display = 'none';
        btn.innerHTML = '<i class="fas fa-info-circle"></i><span>Show Details</span>';
    }
}

function summarizeYoutube() {
    const ytUrl = document.getElementById('ytUrl').value.trim();
    const ytSummaryMeta = document.getElementById('ytSummaryMeta');
    const youtubeResults = document.getElementById('youtubeResults');
    const showMetaBtn = document.getElementById('showMetaBtn');
    
    if (!ytUrl) {
        ytSummaryMeta.innerText = 'Please enter a YouTube URL.';
        if (youtubeResults) youtubeResults.style.display = 'none';
        if (showMetaBtn) showMetaBtn.style.display = 'none';
        return;
    }
    
    ytSummaryMeta.innerHTML = showYouTubeLoading();
    if (youtubeResults) youtubeResults.style.display = 'none';
    if (showMetaBtn) showMetaBtn.style.display = 'none';
    fetch(getApiUrl('/youtube/summarize'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: ytUrl })
    })
    .then(res => res.json())
    .then(data => {
        lastMetaData = data;
        metaCardVisible = false;
        ytSummaryMeta.innerHTML =
            `<div class='yt-summary-meta'><span class='meta-title'>${data.title || ''}</span><br>
            <span class='meta-channel'>by ${data.author || ''}</span></div>`;
        
        // Populate the new beautiful cards
        populateYouTubeResults(data);
        
        // Show the results section
        if (youtubeResults) {
            youtubeResults.style.display = 'block';
            // Scroll to results
            setTimeout(() => {
                youtubeResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 200);
        }
    })
    .catch(err => {
        ytSummaryMeta.innerHTML = `<span style='color:#f43f5e;font-weight:700;'>Error:</span> ${err}`;
        if (youtubeResults) youtubeResults.style.display = 'none';
        if (showMetaBtn) showMetaBtn.style.display = 'none';
    });
}

// Function to populate YouTube results with real API data
function populateYouTubeResults(data) {
    if (!data) {
        console.error('No data provided to populateYouTubeResults');
        return;
    }
    
    // Debug: Log the data structure
    console.log('YouTube API Response:', data);
    
    // Extract video ID from URL for thumbnail
    const videoId = extractVideoId(data.url || '');
    const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';
    
    // Populate video details with null checks
    const videoThumbnail = document.getElementById('videoThumbnail');
    const videoDuration = document.getElementById('videoDuration');
    const videoTitle = document.getElementById('videoTitle');
    const videoChannel = document.getElementById('videoChannel');
    const videoViews = document.getElementById('videoViews');
    const videoLikes = document.getElementById('videoLikes');
    const videoPublished = document.getElementById('videoPublished');
    const videoDescription = document.getElementById('videoDescription');
    const videoTags = document.getElementById('videoTags');
    
    if (videoThumbnail && thumbnailUrl) videoThumbnail.src = thumbnailUrl;
    if (videoDuration && data.duration) videoDuration.textContent = data.duration;
    if (videoTitle) videoTitle.textContent = data.title || 'Untitled Video';
    if (videoChannel) videoChannel.textContent = data.author || 'Unknown Channel';
    if (videoViews && data.view_count) videoViews.innerHTML = `<i class="fas fa-eye"></i> ${data.view_count} views`;
    if (videoLikes && data.like_count) videoLikes.innerHTML = `<i class="fas fa-thumbs-up"></i> ${data.like_count} likes`;
    if (videoPublished && data.publish_date) videoPublished.innerHTML = `<i class="fas fa-calendar"></i> ${data.publish_date}`;
    // Populate description tab content instead of the video description section
    const videoDescriptionContent = document.getElementById('videoDescriptionContent');
    if (videoDescriptionContent && data.description) {
        const formattedDescription = data.description
            .replace(/(\d+:\d+:\d+|\d+:\d+)/g, '<strong>$1</strong>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
            .trim();
        videoDescriptionContent.innerHTML = `<div class="description-text"><p>${formattedDescription}</p></div>`;
    }
    
    // Populate tags
    if (videoTags && data.topics && Array.isArray(data.topics)) {
        videoTags.innerHTML = data.topics.map(tag => `<span class="tag">${tag}</span>`).join('');
    }
    
    // Populate summary content
    const quickSummary = document.getElementById('quickSummary');
    if (quickSummary) {
        if (data.summary) {
            // Clean and format the summary text
            let summaryText = data.summary.trim();
            
            // Use marked.parse if available, otherwise format manually
            let summaryHtml;
            if (typeof marked !== 'undefined' && marked.parse) {
                summaryHtml = marked.parse(summaryText);
            } else {
                // Manual formatting for better display
                summaryHtml = summaryText
                    .replace(/\n\n+/g, '</p><p>')  // Multiple newlines become paragraph breaks
                    .replace(/\n/g, '<br>')        // Single newlines become line breaks
                    .replace(/^\s*/, '<p>')        // Add opening paragraph tag
                    .replace(/\s*$/, '</p>')       // Add closing paragraph tag
                    .replace(/<p>\s*<\/p>/g, '')   // Remove empty paragraphs
                    .replace(/<br>\s*<br>/g, '<br>'); // Remove double line breaks
            }
            
            quickSummary.innerHTML = `<div class="summary-text">${summaryHtml}</div>`;
        } else {
            quickSummary.innerHTML = `
                <div class="no-content-message">
                    <i class="fas fa-file-text"></i>
                    <p>No summary available.</p>
                    <p>The AI summary will appear here once the video is processed.</p>
                </div>
            `;
        }
    }
    

    
    // Populate timestamps
    const timestampedSummary = document.getElementById('timestampedSummary');
    if (timestampedSummary) {
        let timestampsHtml = '';
        
        // First try to extract timestamps from description
        let extractedTimestamps = [];
        if (data.description) {
            // Look for timestamp patterns in description like "0:00:00 Introduction" or "1:26:20 Outro"
            // Handle the format: "Timestamps:0:00:00 Introduction0:00:36 What is String?"
            let timestampText = data.description;
            
            // If there's a "Timestamps:" section, extract it
            const timestampSection = timestampText.match(/Timestamps?:(.+?)(?=\n\n|\n[A-Z]|$)/s);
            if (timestampSection) {
                timestampText = timestampSection[1];
            }
            
            // Extract individual timestamps - handle both formats
            const timestampMatches = timestampText.match(/(\d{1,2}:\d{2}:\d{2}|\d{1,2}:\d{2})\s*([^0-9]+?)(?=\d{1,2}:\d{2}|$)/g);
            if (timestampMatches) {
                extractedTimestamps = timestampMatches.map(match => {
                    const timestampMatch = match.match(/(\d{1,2}:\d{2}:\d{2}|\d{1,2}:\d{2})\s*(.+)/);
                    if (timestampMatch) {
                        const time = timestampMatch[1];
                        const description = timestampMatch[2].trim();
                        return { time, description };
                    }
                    return null;
                }).filter(Boolean);
            }
        }
        
        // If we found timestamps in description, use those
        if (extractedTimestamps.length > 0) {
            timestampsHtml = extractedTimestamps.map(({ time, description }) => `
                <div class="timestamp-item">
                    <div class="timestamp">${time}</div>
                    <div class="timestamp-text">${description}</div>
                </div>
            `).join('');
        }
        // Otherwise, try the timestamps array from API
        else if (data.timestamps && Array.isArray(data.timestamps) && data.timestamps.length > 0) {
            timestampsHtml = data.timestamps.map(timestamp => {
                // Extract time and description from timestamp string
                const match = timestamp.match(/(\d+:\d+:\d+|\d+:\d+)\s*-?\s*(.*)/);
                if (match) {
                    const [, time, description] = match;
                    return `
                        <div class="timestamp-item">
                            <div class="timestamp">${time}</div>
                            <div class="timestamp-text">${description.trim()}</div>
                        </div>
                    `;
                }
                return `
                    <div class="timestamp-item">
                        <div class="timestamp">--:--</div>
                        <div class="timestamp-text">${timestamp}</div>
                    </div>
                `;
            }).join('');
        } else {
            // Fallback content
            timestampsHtml = `
                <div class="no-content-message">
                    <i class="fas fa-clock"></i>
                    <p>No timestamps available for this video.</p>
                    <p>Timestamps will appear here when the video has chapter markers or time-based content.</p>
                </div>
            `;
        }
        
        timestampedSummary.innerHTML = timestampsHtml;
    }
    
    // Populate insights (generate from available data)
    const aiInsights = document.getElementById('aiInsights');
    if (aiInsights) {
        let insightsHtml = '';
        
        if (data.duration) {
            insightsHtml += `
                <div class="insight-item">
                    <div class="insight-title"><i class="fas fa-clock"></i> Duration Analysis</div>
                    <div class="insight-text">This video is ${data.duration} long, providing ${getDurationInsight(data.duration)} content coverage.</div>
                </div>
            `;
        }
        
        if (data.view_count && data.like_count) {
            const engagement = calculateEngagement(data.view_count, data.like_count);
            insightsHtml += `
                <div class="insight-item">
                    <div class="insight-title"><i class="fas fa-chart-line"></i> Engagement</div>
                    <div class="insight-text">This video has ${engagement} engagement with ${data.like_count} likes from ${data.view_count} views.</div>
                </div>
            `;
        }
        
        if (data.topics && data.topics.length > 0) {
            insightsHtml += `
                <div class="insight-item">
                    <div class="insight-title"><i class="fas fa-tags"></i> Content Focus</div>
                    <div class="insight-text">The video covers ${data.topics.length} main topics: ${data.topics.slice(0, 3).join(', ')}${data.topics.length > 3 ? ' and more' : ''}.</div>
                </div>
            `;
        }
        
        if (data.summary) {
            const wordCount = data.summary.split(' ').length;
            insightsHtml += `
                <div class="insight-item">
                    <div class="insight-title"><i class="fas fa-file-text"></i> Content Depth</div>
                    <div class="insight-text">The AI generated a ${wordCount}-word summary, indicating ${getContentDepth(wordCount)} content complexity.</div>
                </div>
            `;
        }
        
        // Add general insights if no specific data available
        if (!insightsHtml) {
            insightsHtml = `
                <div class="insight-item">
                    <div class="insight-title"><i class="fas fa-brain"></i> AI Analysis</div>
                    <div class="insight-text">This video has been processed by our AI system for content analysis and summarization.</div>
                </div>
                <div class="insight-item">
                    <div class="insight-title"><i class="fas fa-video"></i> Content Type</div>
                    <div class="insight-text">Educational or informational video content suitable for learning and reference.</div>
                </div>
            `;
        }
        
        aiInsights.innerHTML = insightsHtml;
    }
}

// Helper functions
function extractVideoId(url) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
}

function getDurationInsight(duration) {
    if (!duration) return 'standard';
    const minutes = parseDuration(duration);
    if (minutes < 5) return 'brief';
    if (minutes < 15) return 'concise';
    if (minutes < 30) return 'moderate';
    if (minutes < 60) return 'comprehensive';
    return 'extensive';
}

function parseDuration(duration) {
    if (!duration || typeof duration !== 'string') return 0;
    const parts = duration.split(':').map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return 0;
}

function calculateEngagement(views, likes) {
    if (!views || !likes) return 'standard';
    
    // Convert to string first, then remove commas and parse
    const viewsStr = String(views).replace(/,/g, '');
    const likesStr = String(likes).replace(/,/g, '');
    
    const viewsNum = parseInt(viewsStr);
    const likesNum = parseInt(likesStr);
    
    if (isNaN(viewsNum) || isNaN(likesNum) || viewsNum === 0) return 'standard';
    
    const ratio = likesNum / viewsNum;
    if (ratio > 0.05) return 'excellent';
    if (ratio > 0.02) return 'good';
    if (ratio > 0.01) return 'average';
    return 'low';
}

function getContentDepth(wordCount) {
    if (wordCount < 100) return 'basic';
    if (wordCount < 300) return 'moderate';
    if (wordCount < 500) return 'detailed';
    return 'comprehensive';
}

function toggleSidebar() {
    console.log('toggleSidebar called'); // Debug log
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('sidebarToggleBtn');
    
    if (!sidebar) {
        console.error('Sidebar element not found');
        return;
    }
    
    sidebar.classList.toggle('collapsed');
    const isCollapsed = sidebar.classList.contains('collapsed');
    console.log('Sidebar collapsed:', isCollapsed); // Debug log
    
    // Update toggle button icon
    if (toggleBtn) {
        const icon = toggleBtn.querySelector('i');
        if (icon) {
            icon.className = isCollapsed ? 'fas fa-chevron-right' : 'fas fa-bars';
        }
    }
    
    // Close dropdown when collapsing sidebar
    if (isCollapsed) {
        const dropdown = document.querySelector('.nav-dropdown');
        const submenuContainer = document.getElementById('historySubmenuContainer');
        if (dropdown && submenuContainer) {
            dropdown.classList.remove('active');
            submenuContainer.classList.remove('active');
        }
    }
}

function toggleMobileSidebar() {
    console.log('toggleMobileSidebar called'); // Debug log
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) {
        console.error('Sidebar element not found');
        return;
    }
    
    sidebar.classList.toggle('open');
    console.log('Mobile sidebar open:', sidebar.classList.contains('open')); // Debug log
    
    // Close dropdown when closing mobile sidebar
    if (!sidebar.classList.contains('open')) {
        const dropdown = document.querySelector('.nav-dropdown');
        const submenuContainer = document.getElementById('historySubmenuContainer');
        if (dropdown && submenuContainer) {
            dropdown.classList.remove('active');
            submenuContainer.classList.remove('active');
        }
    }
}

function toggleHistoryDropdown(event) {
    event.stopPropagation();
    const sidebar = document.getElementById('sidebar');
    
    // Don't allow dropdown when sidebar is collapsed
    if (sidebar.classList.contains('collapsed')) {
        return;
    }
    
    const dropdown = document.querySelector('.nav-dropdown');
    const submenuContainer = document.getElementById('historySubmenuContainer');
    
    dropdown.classList.toggle('active');
    submenuContainer.classList.toggle('active');
}

function toggleTheme() {
    const body = document.body;
    const btn = document.querySelector('.theme-btn');
    
    body.classList.toggle('dark');
    const isDark = body.classList.contains('dark');
    
    // Update button content
    if (btn) {
        btn.innerHTML = isDark 
            ? '<i class="fas fa-sun"></i>'
            : '<i class="fas fa-moon"></i>';
    }
    
    // Save preference
    localStorage.setItem('docutube-theme', isDark ? 'dark' : 'light');
    
    // Add smooth transition effect
    body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    setTimeout(() => {
        body.style.transition = '';
    }, 300);
}



// Enhanced initialization
document.addEventListener('DOMContentLoaded', function() {
    // Set theme from localStorage
    const theme = localStorage.getItem('docutube-theme');
    const body = document.body;
    const themeBtn = document.querySelector('.theme-btn');
    
    if (theme === 'dark') {
        body.classList.add('dark');
        if (themeBtn) {
            themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
        }
    } else {
        if (themeBtn) {
            themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }
    
    // Add event listener for sidebar toggle button
    const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Sidebar toggle button clicked via event listener'); // Debug log
            toggleSidebar();
        });
        console.log('Sidebar toggle event listener added');
    } else {
        console.error('Sidebar toggle button not found');
    }
    
    // Add event listener for mobile menu button
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Mobile menu button clicked'); // Debug log
            toggleMobileSidebar();
        });
        console.log('Mobile menu event listener added');
    } else {
        console.error('Mobile menu button not found');
    }
    
    // Initialize drag and drop for file upload
    initializeDragAndDrop();
    
    // Initialize chat input
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
    
    // Default to home section
    showSection('home');
    
    // Close mobile sidebar when clicking outside
    document.addEventListener('click', function(e) {
        const sidebar = document.getElementById('sidebar');
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        
        if (sidebar && sidebar.classList.contains('open')) {
            // Check if click is outside sidebar and not on mobile menu button
            if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        }
    });
    
    // Add smooth scrolling to all internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Drag and drop functionality for file upload
function initializeDragAndDrop() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('fileInput');
    
    if (!uploadZone || !fileInput) return;
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    uploadZone.addEventListener('drop', handleDrop, false);
    
    // Handle click to browse
    uploadZone.addEventListener('click', (e) => {
        if (e.target === fileInput) return; // Don't trigger if clicking the input itself
        fileInput.click();
    });
    
    // Handle file input change
    fileInput.addEventListener('change', handleFileSelect);
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    function highlight() {
        uploadZone.classList.add('dragover');
    }
    
    function unhighlight() {
        uploadZone.classList.remove('dragover');
    }
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            fileInput.files = files;
            handleFileSelect();
        }
    }
    
    function handleFileSelect() {
        const files = fileInput.files;
        if (files.length > 0) {
            const file = files[0];
            const fileName = file.name;
            const fileSizeNum = file.size;
            const fileSize = (fileSizeNum / 1024 / 1024).toFixed(2); // MB
            
            // Update upload zone to show selected file
            const uploadIcon = uploadZone.querySelector('.upload-icon');
            const uploadText = uploadZone.querySelector('h3');
            const uploadSubtext = uploadZone.querySelector('p');
            
            if (uploadIcon) uploadIcon.innerHTML = '<i class="fas fa-file-alt"></i>';
            if (uploadText) uploadText.textContent = fileName;
            if (uploadSubtext) uploadSubtext.textContent = `${fileSize} MB - Click to change file`;
            
            // Show file details panel
            const fileDetails = document.getElementById('fileDetails');
            const nameEl = document.getElementById('fileName');
            const subEl = document.getElementById('fileInfoSub');
            if (nameEl) nameEl.textContent = fileName;
            if (subEl) subEl.textContent = `${fileSize} MB • ${file.type || 'Document'}`;
            if (fileDetails) fileDetails.style.display = 'block';
            
            // Size validation (25MB)
            const MAX = 25 * 1024 * 1024;
            if (fileSizeNum > MAX) {
                uploadZone.style.borderColor = 'var(--error)';
                uploadZone.style.backgroundColor = 'var(--error)/10';
                showUploadStatus('File is too large. Max allowed size is 25MB.', 'error');
            } else {
                uploadZone.style.borderColor = 'var(--success)';
                uploadZone.style.backgroundColor = 'var(--success)/10';
                showUploadStatus('Ready to upload. Click the button when ready.', 'loading');
            }
        }
    }
}

// Add loading animation for YouTube processing
function showYouTubeLoading() {
    return `
        <div class="yt-loading-anim">
            <div class="yt-spinner"></div>
            <span class="yt-loading-text">Processing your YouTube video...</span>
        </div>
    `;
}

// Utility function to format numbers
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Add intersection observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.feature-card, .stat-item, .floating-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
    
    // Load histories when page loads
    setTimeout(() => {
        loadDocumentHistory();
        loadChatHistory();
        loadYouTubeHistory();
    }, 1000);
});

// History loading functions
async function loadDocumentHistory() {
    const historyList = document.getElementById('documentHistoryList');
    const loadingState = document.getElementById('documentHistoryLoading');
    
    // Simulate loading delay
    setTimeout(() => {
        if (loadingState) loadingState.style.display = 'none';
        
        // Mock document history data based on actual files in temp folder
        const documents = [
            {
                id: "doc-1",
                filename: "Strategy Management.pdf",
                file_type: "pdf",
                file_size: 2516582, // ~2.4 MB
                upload_date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                status: "completed"
            },
            {
                id: "doc-2", 
                filename: "rohail-iqbal-resume.pdf",
                file_type: "pdf",
                file_size: 838860, // ~0.8 MB
                upload_date: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
                status: "completed"
            },
            {
                id: "doc-3",
                filename: "programming.pdf",
                file_type: "pdf", 
                file_size: 5452800, // ~5.2 MB
                upload_date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                status: "completed"
            },
            {
                id: "doc-4",
                filename: "HUM102_Lecture_02_2.pdf",
                file_type: "pdf",
                file_size: 1992294, // ~1.9 MB
                upload_date: new Date(Date.now() - 26 * 60 * 60 * 1000), // 1 day ago
                status: "processing"
            },
            {
                id: "doc-5",
                filename: "Midterm Practical (2023).pdf",
                file_type: "pdf",
                file_size: 3251200, // ~3.1 MB
                upload_date: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
                status: "failed"
            },
            {
                id: "doc-6",
                filename: "WAQAR_S_RESUME-3 (1).pdf",
                file_type: "pdf",
                file_size: 1024000, // ~1 MB
                upload_date: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
                status: "completed"
            }
        ];
        
        if (documents.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>No documents uploaded yet. Upload your first document to get started!</p>
                </div>
            `;
        } else {
            historyList.innerHTML = documents.map(doc => `
                <div class="history-item">
                    <div class="history-item-icon">
                        <i class="fas fa-file-${getFileIcon(doc.file_type)}"></i>
                    </div>
                    <div class="history-item-content">
                        <h3 class="history-item-title">${doc.filename}</h3>
                        <p class="history-item-meta">
                            <span class="file-size">${formatFileSize(doc.file_size)}</span>
                            <span class="upload-date">${formatDate(doc.upload_date)}</span>
                        </p>
                        <div class="history-item-status ${doc.status}">
                            <i class="fas fa-${getStatusIcon(doc.status)}"></i>
                            ${doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                        </div>
                    </div>
                    <div class="history-item-actions">
                        <button onclick="chatWithDocument('${doc.id}')" class="action-btn" title="Chat with document">
                            <i class="fas fa-comments"></i>
                        </button>
                        <button onclick="deleteDocument('${doc.id}')" class="action-btn delete-btn" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }, 800);
}

async function loadChatHistory() {
    const historyList = document.getElementById('chatHistoryList');
    const loadingState = document.getElementById('chatHistoryLoading');
    
    // Simulate loading delay
    setTimeout(() => {
        if (loadingState) loadingState.style.display = 'none';
        
        // Mock chat history data
        const chats = [
            {
                id: "chat-1",
                title: "Strategy Management Discussion",
                last_message: "Can you explain the key concepts of strategic planning?",
                message_count: 12,
                last_updated: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
                document_name: "Strategy Management.pdf"
            },
            {
                id: "chat-2",
                title: "Resume Review Session",
                last_message: "What improvements can I make to my resume?",
                message_count: 8,
                last_updated: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
                document_name: "rohail-iqbal-resume.pdf"
            },
            {
                id: "chat-3",
                title: "Programming Concepts",
                last_message: "Explain object-oriented programming principles",
                message_count: 15,
                last_updated: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
                document_name: "programming.pdf"
            },
            {
                id: "chat-4",
                title: "Humanities Lecture Notes",
                last_message: "What are the main themes discussed in this lecture?",
                message_count: 6,
                last_updated: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                document_name: "HUM102_Lecture_02_2.pdf"
            },
            {
                id: "chat-5",
                title: "Exam Preparation",
                last_message: "Help me understand the practical exam requirements",
                message_count: 20,
                last_updated: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
                document_name: "Midterm Practical (2023).pdf"
            }
        ];
        
        if (chats.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-comments"></i>
                    <p>No conversations yet. Start chatting with your AI assistant!</p>
                </div>
            `;
        } else {
            historyList.innerHTML = chats.map(chat => `
                <div class="history-item" onclick="loadChatSession('${chat.id}')">
                    <div class="history-item-icon">
                        <i class="fas fa-comments"></i>
                    </div>
                    <div class="history-item-content">
                        <h3 class="history-item-title">${chat.title}</h3>
                        <p class="history-item-preview">${chat.last_message}</p>
                        <p class="history-item-meta">
                            <span class="document-name"><i class="fas fa-file-pdf"></i> ${chat.document_name}</span>
                            <span class="message-count">${chat.message_count} messages</span>
                            <span class="chat-date">${formatDate(chat.last_updated)}</span>
                        </p>
                    </div>
                    <div class="history-item-actions">
                        <button onclick="event.stopPropagation(); continueChatSession('${chat.id}')" class="action-btn" title="Continue chat">
                            <i class="fas fa-play"></i>
                        </button>
                        <button onclick="event.stopPropagation(); deleteChatSession('${chat.id}')" class="action-btn delete-btn" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }, 600);
}

async function loadYouTubeHistory() {
    const historyList = document.getElementById('youtubeHistoryList');
    const loadingState = document.getElementById('youtubeHistoryLoading');
    
    // Simulate loading delay
    setTimeout(() => {
        if (loadingState) loadingState.style.display = 'none';
        
        // Mock YouTube history data
        const videos = [
            {
                id: "video-1",
                title: "Complete Python Tutorial for Beginners",
                channel: "Programming with Mosh",
                thumbnail: "https://img.youtube.com/vi/kqtD5dpn9C8/maxresdefault.jpg",
                duration: "6:14:07",
                url: "https://www.youtube.com/watch?v=kqtD5dpn9C8",
                view_count: "2.1M",
                analyzed_date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                summary_preview: "Comprehensive Python tutorial covering variables, functions, classes..."
            },
            {
                id: "video-2",
                title: "React JS Full Course 2024",
                channel: "freeCodeCamp.org",
                thumbnail: "https://img.youtube.com/vi/bMknfKXIFA8/maxresdefault.jpg",
                duration: "11:55:35",
                url: "https://www.youtube.com/watch?v=bMknfKXIFA8",
                view_count: "1.8M",
                analyzed_date: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
                summary_preview: "Complete React course covering components, hooks, state management..."
            },
            {
                id: "video-3",
                title: "Machine Learning Explained",
                channel: "3Blue1Brown",
                thumbnail: "https://img.youtube.com/vi/aircAruvnKk/maxresdefault.jpg",
                duration: "19:13",
                url: "https://www.youtube.com/watch?v=aircAruvnKk",
                view_count: "8.2M",
                analyzed_date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                summary_preview: "Introduction to neural networks and deep learning concepts..."
            },
            {
                id: "video-4",
                title: "Web Development Roadmap 2024",
                channel: "Traversy Media",
                thumbnail: "https://img.youtube.com/vi/VfGW0Qiy2I0/maxresdefault.jpg",
                duration: "1:23:47",
                url: "https://www.youtube.com/watch?v=VfGW0Qiy2I0",
                view_count: "956K",
                analyzed_date: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
                summary_preview: "Complete roadmap for becoming a web developer in 2024..."
            },
            {
                id: "video-5",
                title: "Database Design Tutorial",
                channel: "Database Star",
                thumbnail: "https://img.youtube.com/vi/ztHopE5Wnpc/maxresdefault.jpg",
                duration: "45:32",
                url: "https://www.youtube.com/watch?v=ztHopE5Wnpc",
                view_count: "423K",
                analyzed_date: new Date(Date.now() - 72 * 60 * 60 * 1000), // 3 days ago
                summary_preview: "Learn database design principles and normalization..."
            }
        ];
        
        if (videos.length === 0) {
            historyList.innerHTML = `
                <div class="empty-state">
                    <i class="fab fa-youtube"></i>
                    <p>No videos analyzed yet. Paste a YouTube URL to get started!</p>
                </div>
            `;
        } else {
            historyList.innerHTML = videos.map(video => `
                <div class="history-item">
                    <div class="history-item-thumbnail">
                        <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                        <div class="video-duration">${video.duration}</div>
                    </div>
                    <div class="history-item-content">
                        <h3 class="history-item-title">${video.title}</h3>
                        <p class="history-item-channel"><i class="fas fa-user"></i> ${video.channel}</p>
                        <p class="history-item-preview">${video.summary_preview}</p>
                        <p class="history-item-meta">
                            <span class="analysis-date">${formatDate(video.analyzed_date)}</span>
                            <span class="video-views"><i class="fas fa-eye"></i> ${video.view_count} views</span>
                        </p>
                    </div>
                    <div class="history-item-actions">
                        <button onclick="viewVideoSummary('${video.id}')" class="action-btn" title="View Summary">
                            <i class="fas fa-file-text"></i>
                        </button>
                        <button onclick="openYouTubeVideo('${video.url}')" class="action-btn" title="Watch Video">
                            <i class="fab fa-youtube"></i>
                        </button>
                        <button onclick="deleteVideoHistory('${video.id}')" class="action-btn delete-btn" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('');
        }
    }, 1000);
}

// Helper functions
function getFileIcon(fileType) {
    const icons = {
        'pdf': 'pdf',
        'txt': 'file-alt',
        'docx': 'file-word',
        'doc': 'file-word',
        'default': 'file'
    };
    return icons[fileType] || icons.default;
}

function getStatusIcon(status) {
    const icons = {
        'completed': 'check-circle',
        'processing': 'spinner fa-spin',
        'failed': 'exclamation-circle',
        'pending': 'clock'
    };
    return icons[status] || 'question-circle';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
}

// Action handler functions
function chatWithDocument(docId) {
    console.log('Starting chat with document:', docId);
    showSection('chat');
    // You can add logic here to pre-select the document for chat
}

function deleteDocument(docId) {
    if (confirm('Are you sure you want to delete this document?')) {
        console.log('Deleting document:', docId);
        // Add delete logic here
        loadDocumentHistory(); // Refresh the list
    }
}

function loadChatSession(chatId) {
    console.log('Loading chat session:', chatId);
    showSection('chat');
    // Add logic to load specific chat session
}

function continueChatSession(chatId) {
    console.log('Continuing chat session:', chatId);
    showSection('chat');
    // Add logic to continue specific chat session
}

function deleteChatSession(chatId) {
    if (confirm('Are you sure you want to delete this chat session?')) {
        console.log('Deleting chat session:', chatId);
        // Add delete logic here
        loadChatHistory(); // Refresh the list
    }
}

function viewVideoSummary(videoId) {
    console.log('Viewing video summary:', videoId);
    // Add logic to show video summary in a modal or new section
    alert('Video summary feature will be implemented here');
}

function openYouTubeVideo(url) {
    window.open(url, '_blank');
}

function deleteVideoHistory(videoId) {
    if (confirm('Are you sure you want to delete this video from history?')) {
        console.log('Deleting video history:', videoId);
        // Add delete logic here
        loadYouTubeHistory(); // Refresh the list
    }
}

// YouTube Cards Functions
function toggleCard(cardType) {
    const content = document.getElementById(cardType + 'Content');
    const toggle = content.parentElement.querySelector('.card-toggle');
    
    if (content.classList.contains('collapsed')) {
        content.classList.remove('collapsed');
        toggle.classList.remove('collapsed');
    } else {
        content.classList.add('collapsed');
        toggle.classList.add('collapsed');
    }
}

function showSummaryTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Add active class to clicked button
    event.target.classList.add('active');
}

function copySummary() {
    const activeTab = document.querySelector('.tab-content.active');
    const summaryText = activeTab.textContent || activeTab.innerText;
    
    navigator.clipboard.writeText(summaryText).then(() => {
        // Show success message
        showNotification('Summary copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Failed to copy summary:', err);
        showNotification('Failed to copy summary', 'error');
    });
}

function downloadSummary() {
    const activeTab = document.querySelector('.tab-content.active');
    const summaryText = activeTab.textContent || activeTab.innerText;
    const videoTitle = document.getElementById('videoTitle').textContent || 'YouTube Summary';
    
    const blob = new Blob([summaryText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${videoTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_summary.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    showNotification('Summary downloaded!', 'success');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Hide and remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Mock function to populate YouTube results with sample data
function showMockYouTubeResults() {
    const resultsSection = document.getElementById('youtubeResults');
    resultsSection.style.display = 'block';
    
    // Mock video data
    const mockData = {
        thumbnail: 'https://img.youtube.com/vi/kqtD5dpn9C8/maxresdefault.jpg',
        title: 'Complete Python Tutorial for Beginners - Learn Python in 6 Hours',
        channel: 'Programming with Mosh',
        duration: '6:14:07',
        views: '2,156,789',
        likes: '89,234',
        published: '2 months ago',
        description: 'This comprehensive Python tutorial covers everything you need to know to get started with Python programming. From basic syntax to advanced concepts, this course will take you from beginner to intermediate level. Topics covered include variables, data types, functions, classes, modules, file handling, error handling, and much more.',
        tags: ['Python', 'Programming', 'Tutorial', 'Beginner', 'Coding', 'Software Development']
    };
    
    // Populate video details
    document.getElementById('videoThumbnail').src = mockData.thumbnail;
    document.getElementById('videoDuration').textContent = mockData.duration;
    document.getElementById('videoTitle').textContent = mockData.title;
    document.getElementById('videoChannel').textContent = mockData.channel;
    document.getElementById('videoViews').innerHTML = `<i class="fas fa-eye"></i> ${mockData.views} views`;
    document.getElementById('videoLikes').innerHTML = `<i class="fas fa-thumbs-up"></i> ${mockData.likes} likes`;
    document.getElementById('videoPublished').innerHTML = `<i class="fas fa-calendar"></i> ${mockData.published}`;
    document.getElementById('videoDescription').textContent = mockData.description;
    
    // Populate tags
    const tagsContainer = document.getElementById('videoTags');
    tagsContainer.innerHTML = mockData.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
    
    // Populate summary content
    document.getElementById('quickSummary').innerHTML = `
        <div class="summary-text">
            <p>This comprehensive Python tutorial is designed for complete beginners who want to learn programming from scratch. The 6-hour course covers fundamental concepts including:</p>
            <ul>
                <li>Python syntax and basic programming concepts</li>
                <li>Variables, data types, and operators</li>
                <li>Control structures (if statements, loops)</li>
                <li>Functions and modules</li>
                <li>Object-oriented programming basics</li>
                <li>File handling and error management</li>
            </ul>
            <p>The instructor uses practical examples and hands-on exercises to help students understand each concept thoroughly. This tutorial is perfect for anyone looking to start their programming journey with Python.</p>
            <p>Throughout the course, you'll build practical projects that reinforce the concepts learned. The tutorial progresses from basic syntax to more advanced topics like object-oriented programming, making it suitable for complete beginners while providing enough depth to reach an intermediate level.</p>
        </div>
    `;
    
    // Populate description content
    document.getElementById('videoDescriptionContent').innerHTML = `
        <div class="description-text">
            <p>Learn Python programming from scratch in this comprehensive 6-hour tutorial. This course is designed for complete beginners who want to master Python fundamentals and start their programming journey.</p>
            
            <p><strong>What you'll learn:</strong></p>
            <ul>
                <li>Python installation and setup</li>
                <li>Variables, data types, and operators</li>
                <li>Control structures (if statements, loops)</li>
                <li>Functions and modules</li>
                <li>Object-oriented programming concepts</li>
                <li>File handling and error management</li>
                <li>Best practices and coding standards</li>
            </ul>
            
            <p><strong>Course Structure:</strong><br>
            This tutorial is structured to take you from absolute beginner to intermediate level. Each section builds upon the previous one, with practical examples and hands-on exercises.</p>
            
            <p><strong>Prerequisites:</strong><br>
            No prior programming experience required. Just bring your enthusiasm to learn!</p>
            
            <p><strong>Timestamps:</strong><br>
            <strong>0:00:00</strong> Introduction<br>
            <strong>0:15:30</strong> Python Installation<br>
            <strong>0:32:45</strong> Variables and Data Types<br>
            <strong>1:12:20</strong> Control Structures<br>
            <strong>2:45:10</strong> Functions<br>
            <strong>4:20:30</strong> Object-Oriented Programming<br>
            <strong>5:30:15</strong> File Handling<br>
            <strong>5:45:00</strong> Final Project</p>
        </div>
    `;
    
    // Populate timestamps
    document.getElementById('timestampedSummary').innerHTML = `
        <div class="timestamp-item">
            <div class="timestamp">00:00</div>
            <div class="timestamp-text">Introduction to Python and course overview</div>
        </div>
        <div class="timestamp-item">
            <div class="timestamp">15:30</div>
            <div class="timestamp-text">Installing Python and setting up development environment</div>
        </div>
        <div class="timestamp-item">
            <div class="timestamp">32:45</div>
            <div class="timestamp-text">Variables, data types, and basic operations</div>
        </div>
        <div class="timestamp-item">
            <div class="timestamp">1:12:20</div>
            <div class="timestamp-text">Control structures: if statements and loops</div>
        </div>
        <div class="timestamp-item">
            <div class="timestamp">2:05:15</div>
            <div class="timestamp-text">Functions and parameter passing</div>
        </div>
        <div class="timestamp-item">
            <div class="timestamp">3:20:40</div>
            <div class="timestamp-text">Lists, tuples, and dictionaries</div>
        </div>
        <div class="timestamp-item">
            <div class="timestamp">4:15:30</div>
            <div class="timestamp-text">Object-oriented programming concepts</div>
        </div>
        <div class="timestamp-item">
            <div class="timestamp">5:30:10</div>
            <div class="timestamp-text">File handling and error management</div>
        </div>
    `;
    
    // Populate insights
    document.getElementById('aiInsights').innerHTML = `
        <div class="insight-item">
            <div class="insight-title"><i class="fas fa-lightbulb"></i> Learning Approach</div>
            <div class="insight-text">The tutorial follows a hands-on approach with practical examples, making it easier for beginners to grasp complex concepts.</div>
        </div>
        <div class="insight-item">
            <div class="insight-title"><i class="fas fa-target"></i> Target Audience</div>
            <div class="insight-text">Perfect for complete programming beginners, students, and professionals looking to add Python to their skill set.</div>
        </div>
        <div class="insight-item">
            <div class="insight-title"><i class="fas fa-chart-line"></i> Skill Level</div>
            <div class="insight-text">Takes you from absolute beginner to intermediate level, covering both basic syntax and advanced concepts like OOP.</div>
        </div>
        <div class="insight-item">
            <div class="insight-title"><i class="fas fa-clock"></i> Time Investment</div>
            <div class="insight-text">At 6+ hours, this is a comprehensive course that requires dedicated time but provides thorough coverage of Python fundamentals.</div>
        </div>
    `;
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}
