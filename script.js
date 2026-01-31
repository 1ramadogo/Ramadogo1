// === 1. MFUMO WA USALAMA (LOGIN) ===
function checkPass() {
    const enteredPass = document.getElementById('admin-pass').value;
    let currentPassword = localStorage.getItem('admin_password') || "Ramadhan12";

    if (enteredPass === currentPassword) {
        document.getElementById('admin-auth').style.display = 'none';
        document.getElementById('admin-content').style.display = 'block';
        sessionStorage.setItem('isAdmin', 'true');
        displayAdminItems();
        updateDashboardStats();
    } else {
        alert("Password Sio Sahihi!");
    }
}

// === 2. KAZI YA KUBADILI LINK KUWA PLAYER (SMART PLAYER) ===
function getMediaHTML(item) {
    const url = item.mediaUrl || "";
    
    // A: KAMA NI VIDEO
    if (item.type === 'video') {
        // 1. YouTube Logic
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            let videoId = url.split('v=')[1] || url.split('/').pop();
            if(videoId.includes('&')) videoId = videoId.split('&')[0];
            return `<iframe width="100%" height="210" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="border-radius:8px 8px 0 0;"></iframe>`;
        }
        
        // 2. Google Drive Logic
        if (url.includes('drive.google.com')) {
            let driveId = url.split('/d/')[1].split('/')[0];
            return `<iframe src="https://drive.google.com/file/d/${driveId}/preview" width="100%" height="210" allow="autoplay" style="border-radius:8px 8px 0 0;"></iframe>`;
        }

        // 3. Direct MP4 Link
        return `<video controls poster="${item.image}" style="width:100%; aspect-ratio:16/9; background:#000; border-radius:8px 8px 0 0;">
                    <source src="${url}" type="video/mp4">
                </video>`;
    }

    // B: KAMA NI AUDIO (MP3)
    if (item.type === 'audio') {
        return `
            <div style="background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url('${item.image}') center/cover; height:200px; display:flex; align-items:flex-end; border-radius:8px 8px 0 0;">
                <audio controls style="width:100%; filter: sepia(100%) saturate(300%) hue-rotate(10deg); outline:none;">
                    <source src="${url}" type="audio/mpeg">
                </audio>
            </div>`;
    }

    // C: KAMA NI IMAGE TU (MOVIES)
    return `<img src="${item.image}" alt="${item.title}" style="width:100%; aspect-ratio:2/3; object-fit:cover; border-radius:8px 8px 0 0;">`;
}

// === 3. KUONYESHA MAUDHUI KWENYE KURASA (DISPLAY) ===
function displayItems() {
    const container = document.querySelector('.container');
    if (!container || window.location.pathname.includes('admin.html')) return;

    const items = JSON.parse(localStorage.getItem('ramadogo_items')) || [];
    container.innerHTML = '<div class="grid" id="content-grid"></div>';
    const grid = document.getElementById('content-grid');

    const path = window.location.pathname;
    let filter = "";
    if (path.includes('movies.html')) filter = "movies";
    else if (path.includes('videos.html')) filter = "videos";
    else if (path.includes('islamic.html')) filter = "islamic";

    const filteredItems = filter ? items.filter(i => i.category === filter) : items;

    filteredItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            ${getMediaHTML(item)}
            <div class="card-content" style="padding:15px;">
                <h3 style="color:var(--accent); margin-bottom:5px;">${item.title}</h3>
                <p style="font-size:12px; color:var(--text-dim); line-height:1.4;">${item.desc || ''}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

// === 4. MFUMO WA ADMIN (UPLOAD & DELETE) ===
const uploadForm = document.getElementById('upload-form');
if (uploadForm) {
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const newItem = {
            id: Date.now(),
            title: document.getElementById('title').value,
            type: document.getElementById('media-type').value,
            category: document.getElementById('category').value,
            image: document.getElementById('image-url').value,
            mediaUrl: document.getElementById('media-url').value,
            desc: document.getElementById('desc').value
        };
        let items = JSON.parse(localStorage.getItem('ramadogo_items')) || [];
        items.push(newItem);
        localStorage.setItem('ramadogo_items', JSON.stringify(items));
        alert('Imepakiwa!');
        uploadForm.reset();
        displayAdminItems();
        updateDashboardStats();
    });
}

function displayAdminItems() {
    const adminContainer = document.querySelector('.admin-container');
    if (!adminContainer) return;

    let listDiv = document.getElementById('admin-list') || document.createElement('div');
    listDiv.id = 'admin-list';
    adminContainer.appendChild(listDiv);

    const items = JSON.parse(localStorage.getItem('ramadogo_items')) || [];
    let html = '<h3 style="color:var(--accent); margin:20px 0;">DHIBITI MAUDHUI</h3>';
    items.forEach(item => {
        html += `
            <div style="display:flex; justify-content:space-between; background:#111; padding:10px; margin-bottom:5px; border-radius:5px; align-items:center;">
                <span style="font-size:14px;">${item.title} <small style="color:var(--accent);">(${item.type})</small></span>
                <button onclick="deleteItem(${item.id})" style="background:#ff4444; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Futa</button>
            </div>`;
    });
    listDiv.innerHTML = html;
}

function deleteItem(id) {
    if(confirm("Je, una uhakika wa kufuta?")) {
        let items = JSON.parse(localStorage.getItem('ramadogo_items')) || [];
        items = items.filter(i => i.id !== id);
        localStorage.setItem('ramadogo_items', JSON.stringify(items));
        displayAdminItems();
        updateDashboardStats();
    }
}

function updateDashboardStats() {
    const items = JSON.parse(localStorage.getItem('ramadogo_items')) || [];
    if(document.getElementById('count-movies')) {
        document.getElementById('count-movies').innerText = items.filter(i => i.category === 'movies').length;
        document.getElementById('count-videos').innerText = items.filter(i => i.category === 'videos').length;
        document.getElementById('count-islamic').innerText = items.filter(i => i.category === 'islamic').length;
    }
}

// === 5. SEARCH LOGIC ===
const searchInput = document.getElementById('main-search');
if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('.card').forEach(card => {
            const title = card.querySelector('h3').innerText.toLowerCase();
            card.style.display = title.includes(query) ? 'block' : 'none';
        });
    });
}

// === ANZISHA WEBSITE ===
document.addEventListener('DOMContentLoaded', () => {
    displayItems();
    if (sessionStorage.getItem('isAdmin') === 'true') {
        if(document.getElementById('admin-auth')) document.getElementById('admin-auth').style.display = 'none';
        if(document.getElementById('admin-content')) document.getElementById('admin-content').style.display = 'block';
        displayAdminItems();
        updateDashboardStats();
    }
});
// === MFUMO WA SUBSCRIPTION ===
const subForm = document.getElementById('subscribe-form');
if (subForm) {
    subForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('sub-email').value;
        
        let subscribers = JSON.parse(localStorage.getItem('ramadogo_subscribers')) || [];
        
        if (subscribers.includes(email)) {
            alert("Email hii imeshajiandikisha tayari!");
        } else {
            subscribers.push(email);
            localStorage.setItem('ramadogo_subscribers', JSON.stringify(subscribers));
            alert("Asante! Umejiunga kikamilifu na RAMADOGO.");
            subForm.reset();
        }
    });
}

// Function ya kuona subscribers kwenye Admin (Ongeza hii kwenye Admin display)
function displaySubscribers() {
    const subs = JSON.parse(localStorage.getItem('ramadogo_subscribers')) || [];
    console.log("Wafuasi waliojiunga:", subs);
    // Unaweza kuongeza kodi hapa ili listi ionekane kwenye Admin Panel
}
// === 1. KUONYESHA ORODHA YA SUBSCRIBERS ===
function displaySubscribers() {
    const listDiv = document.getElementById('subscribers-list');
    if (!listDiv) return;

    // Chota email kutoka localStorage
    const subscribers = JSON.parse(localStorage.getItem('ramadogo_subscribers')) || [];
    
    if (subscribers.length === 0) {
        listDiv.innerHTML = '<p style="color: gray; font-size: 13px;">Hakuna mtu aliyejiunga bado.</p>';
        return;
    }

    // Tengeneza listi ya kuonekana
    let html = '<ul style="list-style: none; padding: 0;">';
    subscribers.forEach((email, index) => {
        html += `<li style="color: white; font-size: 14px; padding: 5px 0; border-bottom: 1px solid #222;">
                    ${index + 1}. ${email}
                 </li>`;
    });
    html += '</ul>';
    listDiv.innerHTML = html;
}

// === 2. COPY EMAIL ZOTE KWA MARA MOJA ===
function copySubscribers() {
    const subscribers = JSON.parse(localStorage.getItem('ramadogo_subscribers')) || [];
    
    if (subscribers.length === 0) {
        alert("Hakuna email za kucopy!");
        return;
    }

    // Unganisha email zote kwa koma (comma) ili uweze kuzipaste Gmail kwa urahisi
    const allEmails = subscribers.join(", ");
    
    navigator.clipboard.writeText(allEmails).then(() => {
        alert("Email zote zimecopiwa! Unaweza kwenda kuzipaste kwenye Gmail yako.");
    });
}

// === 3. SASISHA DOMCONTENTLOADED ===
// Hakikisha unaita displaySubscribers() ndani ya DOMContentLoaded iliyopo
document.addEventListener('DOMContentLoaded', () => {
    // ... kodi zako za awali ...
    if (sessionStorage.getItem('isAdmin') === 'true') {
        displaySubscribers(); // Pakia listi ya subscribers admin akiwa login
    }
});
function updateDashboardStats() {
    // 1. Pata data kutoka localStorage
    const items = JSON.parse(localStorage.getItem('ramadogo_items')) || [];
    const subscribers = JSON.parse(localStorage.getItem('ramadogo_subscribers')) || [];

    // 2. Chura idadi kwa kila category
    const moviesCount = items.filter(i => i.category === 'movies').length;
    const videosCount = items.filter(i => i.category === 'videos').length;
    const islamicCount = items.filter(i => i.category === 'islamic').length;

    // 3. Weka namba kwenye HTML (kwenye dashboard ya zamani na mpya)
    const elements = {
        'stat-movies': moviesCount,
        'count-movies': moviesCount,
        'stat-videos': videosCount,
        'count-videos': videosCount,
        'stat-islamic': islamicCount,
        'count-islamic': islamicCount,
        'stat-subs': subscribers.length
    };

    for (let id in elements) {
        const el = document.getElementById(id);
        if (el) el.innerText = elements[id];
    }
}
function renderAnalyticsChart() {
    const ctx = document.getElementById('contentChart');
    if (!ctx) return;

    const items = JSON.parse(localStorage.getItem('ramadogo_items')) || [];

    // Panga data kulingana na miezi (Jan - Dec)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dataPerMonth = new Array(12).fill(0);

    items.forEach(item => {
        const date = new Date(item.id); // Kwa sababu tunatumia Date.now() kama ID
        const monthIndex = date.getMonth();
        dataPerMonth[monthIndex]++;
    });

    // Tengeneza Graph ya Dhahabu (Gold)
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Maudhui Yaliyopakiwa',
                data: dataPerMonth,
                borderColor: '#ffcc00', // Rangi ya Dhahabu (var(--accent))
                backgroundColor: 'rgba(255, 204, 0, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, grid: { color: '#222' }, ticks: { color: '#888' } },
                x: { grid: { display: false }, ticks: { color: '#888' } }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// Hakikisha graph inatokea ukurasa ukifunguka
document.addEventListener('DOMContentLoaded', () => {
    // ... kodi zako nyingine
    if (sessionStorage.getItem('isAdmin') === 'true') {
        renderAnalyticsChart();
    }
});
