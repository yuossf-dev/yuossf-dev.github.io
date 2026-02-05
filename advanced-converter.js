// Advanced Converter JavaScript
let currentTool = null;
let uploadedFile = null;
let ffmpegInstance = null;

// Select tool
function selectTool(toolId) {
    currentTool = toolId;
    
    // Update UI
    document.querySelectorAll('.tool-card').forEach(card => {
        card.classList.remove('active');
    });
    event.target.closest('.tool-card').classList.add('active');
    
    // Show conversion area
    document.getElementById('conversionArea').classList.remove('hidden');
    
    // Update title
    const titles = {
        'image-resize': 'Resize Image',
        'image-compress': 'Compress Image',
        'image-to-pdf': 'Image to PDF',
        'jpg-to-png': 'JPG to PNG',
        'png-to-jpg': 'PNG to JPG',
        'image-rotate': 'Rotate Image',
        'image-flip': 'Flip Image',
        'image-crop': 'Crop Image',
        'video-to-gif': 'Video to GIF',
        'video-to-mp3': 'Video to MP3',
        'gif-to-video': 'GIF to Video',
        'audio-to-video': 'Audio to Video with Waveform',
        'html-to-pdf': 'HTML to PDF',
        'text-to-pdf': 'Text to PDF',
        'merge-images': 'Merge Images',
        'screenshot-to-pdf': 'Screenshot to PDF'
    };
    
    document.getElementById('toolTitle').textContent = titles[toolId] || 'File Converter';
    
    // Show appropriate options
    showToolOptions(toolId);
    
    // Reset areas
    document.getElementById('progressArea').classList.add('hidden');
    document.getElementById('resultArea').classList.add('hidden');
    
    // Scroll to conversion area
    document.getElementById('conversionArea').scrollIntoView({ behavior: 'smooth' });
}

// Show tool-specific options
function showToolOptions(toolId) {
    const optionsArea = document.getElementById('optionsArea');
    const allOptions = ['gifOptions', 'mp3Options', 'videoOptions', 'waveOptions'];
    
    // Hide all options first
    allOptions.forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    
    // Show relevant options
    if (toolId === 'video-to-gif') {
        optionsArea.classList.remove('hidden');
        document.getElementById('gifOptions').classList.remove('hidden');
    } else if (toolId === 'video-to-mp3') {
        optionsArea.classList.remove('hidden');
        document.getElementById('mp3Options').classList.remove('hidden');
    } else if (toolId === 'gif-to-video') {
        optionsArea.classList.remove('hidden');
        document.getElementById('videoOptions').classList.remove('hidden');
    } else if (toolId === 'audio-to-video') {
        optionsArea.classList.remove('hidden');
        document.getElementById('waveOptions').classList.remove('hidden');
    } else {
        optionsArea.classList.add('hidden');
    }
}

// File input handling
document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        uploadedFile = file;
        startConversion();
    }
});

// Drag and drop
const uploadZone = document.getElementById('uploadZone');
uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('border-purple-500');
});

uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('border-purple-500');
});

uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('border-purple-500');
    const file = e.dataTransfer.files[0];
    if (file) {
        uploadedFile = file;
        startConversion();
    }
});

// Start conversion
async function startConversion() {
    if (!currentTool || !uploadedFile) return;
    
    // Show progress
    document.getElementById('progressArea').classList.remove('hidden');
    document.getElementById('resultArea').classList.add('hidden');
    
    try {
        let result;
        
        switch(currentTool) {
            case 'image-resize':
                result = await resizeImage();
                break;
            case 'image-compress':
                result = await compressImage();
                break;
            case 'image-to-pdf':
                result = await imageToPDF();
                break;
            case 'jpg-to-png':
                result = await convertImageFormat('png');
                break;
            case 'png-to-jpg':
                result = await convertImageFormat('jpg');
                break;
            case 'image-rotate':
                result = await rotateImage();
                break;
            case 'image-flip':
                result = await flipImage();
                break;
            case 'image-crop':
                result = await cropImage();
                break;
            case 'video-to-gif':
                result = await videoToGIF();
                break;
            case 'video-to-mp3':
                result = await videoToMP3();
                break;
            case 'gif-to-video':
                result = await gifToVideo();
                break;
            case 'audio-to-video':
                result = await audioToVideo();
                break;
            case 'html-to-pdf':
                result = await htmlToPDF();
                break;
            case 'text-to-pdf':
                result = await textToPDF();
                break;
            case 'merge-images':
                result = await mergeImages();
                break;
            case 'screenshot-to-pdf':
                result = await screenshotToPDF();
                break;
            default:
                throw new Error('Conversion not implemented yet');
        }
        
        // Show result
        showResult(result);
        
    } catch (error) {
        console.error('Conversion error:', error);
        updateProgress(0, `Conversion failed: ${error.message}`);
        setTimeout(() => {
            document.getElementById('progressArea').classList.add('hidden');
        }, 3000);
    }
}

// Update progress
function updateProgress(percent, message) {
    document.getElementById('progressBar').style.width = percent + '%';
    document.getElementById('statusText').textContent = message;
}

// Show result
function showResult(result) {
    document.getElementById('progressArea').classList.add('hidden');
    document.getElementById('resultArea').classList.remove('hidden');
    
    if (result.preview) {
        document.getElementById('previewArea').innerHTML = result.preview;
    }
    
    if (result.url) {
        document.getElementById('resultInfo').textContent = `File ready: ${result.filename} (${formatBytes(result.size)})`;
        document.getElementById('downloadBtn').onclick = () => {
            const a = document.createElement('a');
            a.href = result.url;
            a.download = result.filename;
            a.click();
        };
        document.getElementById('downloadBtn').classList.remove('hidden');
    } else {
        document.getElementById('downloadBtn').classList.add('hidden');
    }
}

// Format bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// ==================== CONVERSION FUNCTIONS ====================

// Resize Image
async function resizeImage() {
    updateProgress(30, 'Loading image...');
    
    const img = await loadImage(uploadedFile);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Default to 50% of original size
    canvas.width = img.width * 0.5;
    canvas.height = img.height * 0.5;
    
    updateProgress(60, 'Resizing...');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    updateProgress(90, 'Creating file...');
    const blob = await canvasToBlob(canvas);
    const url = URL.createObjectURL(blob);
    
    return {
        url: url,
        filename: 'resized_' + uploadedFile.name,
        size: blob.size,
        preview: `<img src="${url}" class="max-w-full h-auto rounded shadow-lg">`
    };
}

// Compress Image
async function compressImage() {
    updateProgress(30, 'Loading image...');
    
    const img = await loadImage(uploadedFile);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = img.width;
    canvas.height = img.height;
    
    updateProgress(60, 'Compressing...');
    ctx.drawImage(img, 0, 0);
    
    updateProgress(90, 'Creating file...');
    const blob = await canvasToBlob(canvas, 'image/jpeg', 0.7);
    const url = URL.createObjectURL(blob);
    
    const reduction = ((uploadedFile.size - blob.size) / uploadedFile.size * 100).toFixed(1);
    
    return {
        url: url,
        filename: 'compressed_' + uploadedFile.name.replace(/\.[^/.]+$/, '.jpg'),
        size: blob.size,
        preview: `
            <div class="space-y-4">
                <img src="${url}" class="max-w-full h-auto rounded shadow-lg">
                <div class="bg-green-100 p-4 rounded">
                    <p class="font-bold text-green-800">Compression Result:</p>
                    <p class="text-green-700">Original: ${formatBytes(uploadedFile.size)}</p>
                    <p class="text-green-700">Compressed: ${formatBytes(blob.size)}</p>
                    <p class="text-green-700 font-bold">Saved: ${reduction}%</p>
                </div>
            </div>
        `
    };
}

// Image to PDF
async function imageToPDF() {
    updateProgress(30, 'Loading image...');
    
    const { jsPDF } = window.jspdf;
    const img = await loadImage(uploadedFile);
    
    updateProgress(60, 'Creating PDF...');
    
    const pdf = new jsPDF({
        orientation: img.width > img.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [img.width, img.height]
    });
    
    pdf.addImage(img, 'JPEG', 0, 0, img.width, img.height);
    
    updateProgress(90, 'Finalizing...');
    const pdfBlob = pdf.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    
    return {
        url: url,
        filename: uploadedFile.name.replace(/\.[^/.]+$/, '.pdf'),
        size: pdfBlob.size,
        preview: `<div class="text-center p-8">
            <i class="fas fa-file-pdf text-red-500 text-6xl mb-4"></i>
            <p class="text-lg font-bold">PDF Created Successfully!</p>
        </div>`
    };
}

// Convert Image Format
async function convertImageFormat(format) {
    updateProgress(30, 'Loading image...');
    
    const img = await loadImage(uploadedFile);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = img.width;
    canvas.height = img.height;
    
    updateProgress(60, `Converting to ${format.toUpperCase()}...`);
    ctx.drawImage(img, 0, 0);
    
    updateProgress(90, 'Creating file...');
    const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
    const blob = await canvasToBlob(canvas, mimeType);
    const url = URL.createObjectURL(blob);
    
    return {
        url: url,
        filename: uploadedFile.name.replace(/\.[^/.]+$/, '.' + format),
        size: blob.size,
        preview: `<img src="${url}" class="max-w-full h-auto rounded shadow-lg">`
    };
}

// Rotate Image
async function rotateImage() {
    updateProgress(30, 'Loading image...');
    
    const img = await loadImage(uploadedFile);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Rotate 90 degrees
    canvas.width = img.height;
    canvas.height = img.width;
    
    updateProgress(60, 'Rotating...');
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(90 * Math.PI / 180);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    
    updateProgress(90, 'Creating file...');
    const blob = await canvasToBlob(canvas);
    const url = URL.createObjectURL(blob);
    
    return {
        url: url,
        filename: 'rotated_' + uploadedFile.name,
        size: blob.size,
        preview: `<img src="${url}" class="max-w-full h-auto rounded shadow-lg">`
    };
}

// Flip Image
async function flipImage() {
    updateProgress(30, 'Loading image...');
    
    const img = await loadImage(uploadedFile);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = img.width;
    canvas.height = img.height;
    
    updateProgress(60, 'Flipping...');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(img, 0, 0);
    
    updateProgress(90, 'Creating file...');
    const blob = await canvasToBlob(canvas);
    const url = URL.createObjectURL(blob);
    
    return {
        url: url,
        filename: 'flipped_' + uploadedFile.name,
        size: blob.size,
        preview: `<img src="${url}" class="max-w-full h-auto rounded shadow-lg">`
    };
}

// Crop Image
async function cropImage() {
    updateProgress(30, 'Loading image...');
    
    const img = await loadImage(uploadedFile);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Crop to center square
    const size = Math.min(img.width, img.height);
    const x = (img.width - size) / 2;
    const y = (img.height - size) / 2;
    
    canvas.width = size;
    canvas.height = size;
    
    updateProgress(60, 'Cropping...');
    ctx.drawImage(img, x, y, size, size, 0, 0, size, size);
    
    updateProgress(90, 'Creating file...');
    const blob = await canvasToBlob(canvas);
    const url = URL.createObjectURL(blob);
    
    return {
        url: url,
        filename: 'cropped_' + uploadedFile.name,
        size: blob.size,
        preview: `<img src="${url}" class="max-w-full h-auto rounded shadow-lg">`
    };
}

// Video to GIF - Browser Compatible Version
async function videoToGIF() {
    return showComingSoon('Video to GIF', 'This feature requires FFmpeg for video processing');
}

// Video to MP3 - Browser Compatible Version
async function videoToMP3() {
    return showComingSoon('Video to MP3', 'This feature requires FFmpeg for audio extraction');
}

// GIF to Video - Browser Compatible Version
async function gifToVideo() {
    return showComingSoon('GIF to Video', 'This feature requires FFmpeg for video encoding');
}

// Audio to Video - WORKING VERSION with MediaRecorder
async function audioToVideo() {
    updateProgress(10, 'Loading audio file...');
    
    try {
        // Get options
        const waveColor = document.getElementById('waveColor').value;
        const bgColor = document.getElementById('waveBgColor').value;
        
        // Create audio context
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const arrayBuffer = await uploadedFile.arrayBuffer();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        
        updateProgress(30, 'Analyzing waveform...');
        
        // Get audio data
        const channelData = audioBuffer.getChannelData(0);
        const duration = audioBuffer.duration;
        const sampleRate = audioBuffer.sampleRate;
        
        // Canvas setup
        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 720;
        const ctx = canvas.getContext('2d');
        
        // Calculate bars
        const barCount = 100;
        const barWidth = canvas.width / barCount;
        const samplesPerBar = Math.floor(channelData.length / barCount);
        
        updateProgress(50, 'Creating video frames...');
        
        // Create video stream
        const stream = canvas.captureStream(30); // 30 FPS
        const mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9',
            videoBitsPerSecond: 2500000
        });
        
        const chunks = [];
        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
                chunks.push(e.data);
            }
        };
        
        // Promise to wait for recording
        const recordingComplete = new Promise((resolve) => {
            mediaRecorder.onstop = () => resolve(chunks);
        });
        
        mediaRecorder.start();
        
        // Create audio source and destination
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        const dest = audioCtx.createMediaStreamDestination();
        source.connect(dest);
        source.connect(audioCtx.destination);
        
        // Animation variables
        const fps = 30;
        const totalFrames = Math.floor(duration * fps);
        let currentFrame = 0;
        
        updateProgress(60, 'Rendering animation...');
        
        // Animation function
        function drawFrame() {
            const progress = currentFrame / totalFrames;
            const currentSample = Math.floor(progress * channelData.length);
            
            // Clear canvas
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw waveform bars
            for (let i = 0; i < barCount; i++) {
                const startSample = i * samplesPerBar;
                const endSample = startSample + samplesPerBar;
                
                // Calculate RMS (Root Mean Square) for this segment
                let sum = 0;
                for (let j = startSample; j < endSample && j < channelData.length; j++) {
                    sum += channelData[j] * channelData[j];
                }
                const rms = Math.sqrt(sum / samplesPerBar);
                const barHeight = rms * canvas.height * 2;
                
                // Highlight current position
                if (i === Math.floor(progress * barCount)) {
                    ctx.fillStyle = '#ffffff';
                } else {
                    ctx.fillStyle = waveColor;
                }
                
                const x = i * barWidth;
                const y = (canvas.height - barHeight) / 2;
                
                ctx.fillRect(x, y, barWidth - 2, barHeight);
            }
            
            // Draw progress line
            const progressX = progress * canvas.width;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(progressX, 0);
            ctx.lineTo(progressX, canvas.height);
            ctx.stroke();
            
            // Draw time
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 32px Arial';
            ctx.textAlign = 'center';
            const currentTime = (progress * duration).toFixed(1);
            const totalTime = duration.toFixed(1);
            ctx.fillText(`${currentTime}s / ${totalTime}s`, canvas.width / 2, canvas.height - 30);
            
            currentFrame++;
            
            if (currentFrame < totalFrames) {
                setTimeout(drawFrame, 1000 / fps);
                const percent = 60 + (currentFrame / totalFrames) * 30;
                updateProgress(percent, `Rendering: ${Math.floor((currentFrame / totalFrames) * 100)}%`);
            } else {
                mediaRecorder.stop();
            }
        }
        
        // Start audio and animation
        source.start();
        drawFrame();
        
        // Wait for recording to complete
        const recordedChunks = await recordingComplete;
        
        updateProgress(95, 'Finalizing video...');
        
        // Create video blob
        const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(videoBlob);
        
        // Clean up
        audioCtx.close();
        
        return {
            url: url,
            filename: uploadedFile.name.replace(/\.[^/.]+$/, '') + '_visualized.webm',
            size: videoBlob.size,
            preview: `
                <video controls class="w-full max-w-2xl mx-auto rounded-lg shadow-lg">
                    <source src="${url}" type="video/webm">
                </video>
                <p class="text-center text-sm text-gray-600 mt-4">
                    ✅ Video created with waveform visualization!<br>
                    Duration: ${duration.toFixed(1)}s | Size: ${formatBytes(videoBlob.size)}
                </p>
            `
        };
        
    } catch (error) {
        console.error('Audio to Video error:', error);
        throw new Error('Audio visualization failed: ' + error.message);
    }
}

// Coming Soon Message
function showComingSoon(toolName, reason) {
    return {
        url: null,
        filename: '',
        size: 0,
        preview: `
            <div class="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-400 rounded-lg p-8 text-center">
                <div class="text-6xl mb-4">🚧</div>
                <h3 class="text-2xl font-bold text-gray-800 mb-4">${toolName} - Coming Soon!</h3>
                <div class="bg-white rounded-lg p-6 mb-4">
                    <p class="text-gray-700 mb-3"><strong>⚠️ Technical Limitation:</strong></p>
                    <p class="text-gray-600 mb-3">${reason}. GitHub Pages doesn't support the required server headers (SharedArrayBuffer) for FFmpeg.wasm.</p>
                    
                    <p class="text-gray-700 mb-2 mt-4"><strong>💡 What's needed:</strong></p>
                    <ul class="list-disc list-inside text-gray-600 space-y-1">
                        <li>FFmpeg.js requires special CORS headers</li>
                        <li>SharedArrayBuffer security requirements</li>
                        <li>Backend server for processing</li>
                    </ul>
                    
                    <p class="text-gray-700 mb-2 mt-4"><strong>✨ Alternative Solutions:</strong></p>
                    <ul class="list-disc list-inside text-gray-600 space-y-1">
                        <li>Use CloudConvert.com for video/audio conversions</li>
                        <li>Try desktop software like HandBrake</li>
                        <li>Use mobile apps like Video Converter</li>
                    </ul>
                </div>
                <p class="text-sm text-gray-500">Your file: <strong>${uploadedFile.name}</strong> (${formatBytes(uploadedFile.size)})</p>
            </div>
        `
    };
}

// HTML to PDF
async function htmlToPDF() {
    updateProgress(30, 'Processing HTML...');
    
    const text = await readFileAsText(uploadedFile);
    
    updateProgress(60, 'Creating PDF...');
    
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    
    // Simple text rendering
    const lines = pdf.splitTextToSize(text, 180);
    pdf.text(lines, 10, 10);
    
    updateProgress(90, 'Finalizing...');
    const pdfBlob = pdf.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    
    return {
        url: url,
        filename: uploadedFile.name.replace(/\.[^/.]+$/, '.pdf'),
        size: pdfBlob.size,
        preview: `<div class="text-center p-8">
            <i class="fas fa-file-pdf text-red-500 text-6xl mb-4"></i>
            <p class="text-lg font-bold">PDF Created Successfully!</p>
        </div>`
    };
}

// Text to PDF
async function textToPDF() {
    return await htmlToPDF(); // Same logic
}

// Merge Images
async function mergeImages() {
    return showComingSoon('Merge Images', 'Please select multiple images first');
}

// Screenshot to PDF
async function screenshotToPDF() {
    return showComingSoon('Screenshot Tool', 'This requires screen capture API permissions');
}

// ==================== HELPER FUNCTIONS ====================

function loadImage(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

function canvasToBlob(canvas, type = 'image/png', quality = 0.95) {
    return new Promise(resolve => {
        canvas.toBlob(resolve, type, quality);
    });
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}
