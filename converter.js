// File Converter - Client-side JavaScript

let selectedFiles = [];
let currentTool = '';

// Drag and drop support
const uploadArea = document.getElementById('uploadArea');
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('border-purple-500', 'bg-purple-50');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('border-purple-500', 'bg-purple-50');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('border-purple-500', 'bg-purple-50');
    handleFiles(e.dataTransfer.files);
});

// Select tool
function selectTool(tool) {
    currentTool = tool;
    
    // Highlight selected tool
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('ring-4', 'ring-purple-300');
    });
    event.target.closest('.tool-btn').classList.add('ring-4', 'ring-purple-300');
    
    // Show/hide options
    document.getElementById('resizeOpts').classList.add('hidden');
    document.getElementById('compressOpts').classList.add('hidden');
    
    if (tool === 'resize') {
        document.getElementById('resizeOpts').classList.remove('hidden');
        document.getElementById('toolOptions').classList.remove('hidden');
    } else if (tool === 'compress') {
        document.getElementById('compressOpts').classList.remove('hidden');
        document.getElementById('toolOptions').classList.remove('hidden');
    } else {
        document.getElementById('toolOptions').classList.add('hidden');
    }
    
    // Update file input
    const fileInput = document.getElementById('fileInput');
    fileInput.multiple = (tool === 'image-to-pdf');
}

// Handle file selection
function handleFiles(files) {
    if (!currentTool) {
        showNotification('Please select a conversion type first!', 'error');
        return;
    }
    
    selectedFiles = Array.from(files);
    displayFiles();
    document.getElementById('convertBtn').classList.remove('hidden');
}

// Display selected files
function displayFiles() {
    const fileList = document.getElementById('fileList');
    const previewArea = document.getElementById('previewArea');
    
    if (selectedFiles.length === 0) {
        previewArea.classList.add('hidden');
        return;
    }
    
    previewArea.classList.remove('hidden');
    fileList.innerHTML = selectedFiles.map((file, index) => `
        <div class="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <div class="flex items-center space-x-3">
                <i class="fas fa-file-image text-2xl text-purple-600"></i>
                <div>
                    <p class="font-medium text-sm">${file.name}</p>
                    <p class="text-xs text-gray-500">${formatBytes(file.size)}</p>
                </div>
            </div>
            <button onclick="removeFile(${index})" class="text-red-500 hover:text-red-700">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

// Remove file
function removeFile(index) {
    selectedFiles.splice(index, 1);
    displayFiles();
    if (selectedFiles.length === 0) {
        document.getElementById('convertBtn').classList.add('hidden');
    }
}

// Format bytes
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Perform conversion
async function performConversion() {
    document.getElementById('convertBtn').disabled = true;
    document.getElementById('progress').classList.remove('hidden');
    document.getElementById('resultArea').classList.add('hidden');
    
    try {
        if (currentTool === 'image-to-pdf') {
            await convertImagesToPDF();
        } else if (currentTool === 'resize') {
            await resizeImage();
        } else if (currentTool === 'compress') {
            await compressImage();
        }
    } catch (error) {
        console.error('Conversion error:', error);
        showNotification('Conversion failed. Please try again.', 'error');
        document.getElementById('convertBtn').disabled = false;
        document.getElementById('progress').classList.add('hidden');
    }
}

// Convert images to PDF
async function convertImagesToPDF() {
    updateProgress(10, 'Loading jsPDF...');
    
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    let firstPage = true;
    
    for (let i = 0; i < selectedFiles.length; i++) {
        updateProgress(20 + (i / selectedFiles.length * 70), `Processing image ${i + 1}/${selectedFiles.length}...`);
        
        const file = selectedFiles[i];
        const imageData = await readFileAsDataURL(file);
        
        const img = new Image();
        await new Promise((resolve) => {
            img.onload = resolve;
            img.src = imageData;
        });
        
        // Add new page for each image (except first)
        if (!firstPage) {
            pdf.addPage();
        }
        firstPage = false;
        
        // Calculate dimensions to fit page
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        let imgWidth = img.width;
        let imgHeight = img.height;
        const ratio = imgWidth / imgHeight;
        
        if (imgWidth > pageWidth) {
            imgWidth = pageWidth - 20;
            imgHeight = imgWidth / ratio;
        }
        
        if (imgHeight > pageHeight) {
            imgHeight = pageHeight - 20;
            imgWidth = imgHeight * ratio;
        }
        
        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;
        
        pdf.addImage(imageData, 'JPEG', x, y, imgWidth, imgHeight);
    }
    
    updateProgress(100, 'Preparing download...');
    
    // Download PDF
    const pdfBlob = pdf.output('blob');
    downloadFile(pdfBlob, 'converted.pdf');
    
    showSuccess();
}

// Resize image
async function resizeImage() {
    updateProgress(20, 'Loading image...');
    
    const file = selectedFiles[0];
    const width = parseInt(document.getElementById('resizeWidth').value);
    const height = parseInt(document.getElementById('resizeHeight').value);
    const keepRatio = document.getElementById('keepRatio').checked;
    
    const imageData = await readFileAsDataURL(file);
    
    updateProgress(50, 'Resizing...');
    
    const img = new Image();
    await new Promise((resolve) => {
        img.onload = resolve;
        img.src = imageData;
    });
    
    // Calculate dimensions
    let newWidth = width;
    let newHeight = height;
    
    if (keepRatio) {
        const ratio = img.width / img.height;
        newHeight = Math.round(newWidth / ratio);
    }
    
    // Create canvas and resize
    const canvas = document.createElement('canvas');
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, newWidth, newHeight);
    
    updateProgress(90, 'Preparing download...');
    
    // Convert to blob and download
    canvas.toBlob((blob) => {
        const filename = 'resized_' + file.name;
        downloadFile(blob, filename);
        showSuccess();
    }, file.type, 0.95);
}

// Compress image
async function compressImage() {
    updateProgress(20, 'Loading image...');
    
    const file = selectedFiles[0];
    const quality = parseInt(document.getElementById('quality').value) / 100;
    
    const imageData = await readFileAsDataURL(file);
    
    updateProgress(50, 'Compressing...');
    
    const img = new Image();
    await new Promise((resolve) => {
        img.onload = resolve;
        img.src = imageData;
    });
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    updateProgress(90, 'Preparing download...');
    
    // Convert to blob with compression
    canvas.toBlob((blob) => {
        const filename = 'compressed_' + file.name.replace(/\.[^/.]+$/, '.jpg');
        downloadFile(blob, filename);
        showSuccess();
    }, 'image/jpeg', quality);
}

// Utility functions
function readFileAsDataURL(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
    });
}

function updateProgress(percent, text) {
    document.getElementById('progressBar').style.width = percent + '%';
    document.getElementById('progressText').textContent = text;
}

function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const downloadBtn = document.getElementById('downloadBtn');
    
    downloadBtn.onclick = () => {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
}

function showSuccess() {
    document.getElementById('progress').classList.add('hidden');
    document.getElementById('resultArea').classList.remove('hidden');
    document.getElementById('convertBtn').disabled = false;
}

function showNotification(message, type) {
    alert(message);
}

function resetConverter() {
    selectedFiles = [];
    currentTool = '';
    document.getElementById('fileInput').value = '';
    document.getElementById('previewArea').classList.add('hidden');
    document.getElementById('convertBtn').classList.add('hidden');
    document.getElementById('resultArea').classList.add('hidden');
    document.getElementById('progress').classList.add('hidden');
    document.getElementById('toolOptions').classList.add('hidden');
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.classList.remove('ring-4', 'ring-purple-300');
    });
}
