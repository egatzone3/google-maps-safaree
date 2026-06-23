// ==========================================
// 1. ระบบควบคุม UI, Theme และ Search / Filter
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // อ้างอิง Elements ของ Modals
    const contactModal = document.getElementById('contactFormModal');
    const reportModal = document.getElementById('reportPoleModal');
    const driveModal = document.getElementById('driveLinksModal');
    const loginModal = document.getElementById('loginModal');
    const adminModal = document.getElementById('adminModal');
    const infoModal = document.getElementById('infoModal');

    // ระบบเปิด/ปิด Modal ติดต่อแอดมิน
    document.getElementById('floatingButton').addEventListener('click', () => contactModal.classList.remove('hidden'));
    document.getElementById('closeButton').addEventListener('click', () => contactModal.classList.add('hidden'));

    // ระบบเปิด/ปิด Modal รายงานเสาไฟฟ้า
    document.getElementById('reportButton').addEventListener('click', () => reportModal.classList.remove('hidden'));
    document.getElementById('closeReportModal').addEventListener('click', () => reportModal.classList.add('hidden'));

    // ระบบเปิด/ปิด Modal Google Drive Links
    document.getElementById('driveLinkButton').addEventListener('click', () => {
        loadDriveLinks();
        driveModal.classList.remove('hidden');
    });
    document.getElementById('closeDriveModal').addEventListener('click', () => driveModal.classList.add('hidden'));

    // ปุ่มปิด Modals อื่นๆ
    document.getElementById('closeModalBtn').addEventListener('click', () => infoModal.classList.add('hidden'));
    document.getElementById('closeAdminModalBtn').addEventListener('click', () => adminModal.classList.add('hidden'));
    document.getElementById('closeLoginModalBtn').addEventListener('click', () => loginModal.classList.add('hidden'));

    // ระบบสลับโหมด Dark / Light Theme
    const themeToggleBtn = document.getElementById('themeToggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('bg-gray-900');
        document.body.classList.toggle('text-gray-100');
        document.body.classList.toggle('bg-gray-100');
        document.body.classList.toggle('text-gray-900');
        
        sunIcon.classList.toggle('hidden');
        moonIcon.classList.toggle('hidden');

        document.querySelectorAll('input, textarea, select').forEach(el => {
            el.classList.toggle('bg-gray-500');
            el.classList.toggle('bg-white');
            el.classList.toggle('text-gray-900');
        });
    });

    // เรียกฟังก์ชันแสดงผลเริ่มต้น (ถ้าข้อมูลตัวแปร data ถูกโหลดมาแล้วใน index.html)
    if (typeof data !== 'undefined') {
        renderMainContent(data);
        renderFilterButtons(data);
        renderMapButtons(data);
    }
    
    loadNewsContent();

    // ระบบค้นหาแนวสายส่ง (Search Bar)
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            if (typeof data === 'undefined') return;
            const keyword = e.target.value.toLowerCase().trim();
            if (!keyword) {
                renderMainContent(data);
                return;
            }

            const filteredData = data.map(item => {
                const matchesUnit = item.unit.toLowerCase().includes(keyword);
                const filteredLines = item.responsibleLines.filter(line => 
                    line.lineName.toLowerCase().includes(keyword) || 
                    line.responsibleArea.toLowerCase().includes(keyword)
                );

                if (matchesUnit || filteredLines.length > 0) {
                    return { ...item, responsibleLines: matchesUnit ? item.responsibleLines : filteredLines };
                }
                return null;
            }).filter(item => item !== null);

            renderMainContent(filteredData);
        });
    }
});

// ฟังก์ชัน Render การแสดงผลการ์ดข้อมูลของแต่ละ บสส.
function renderMainContent(items) {
    const container = document.getElementById('mainContent');
    if (!container) return;
    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-400">❌ ไม่พบข้อมูลที่ค้นหา</p>';
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = `p-6 rounded-xl shadow-xl bg-gray-800 border border-gray-700 transition-all`;
        
        let linesHtml = item.responsibleLines.map(l => `
            <div class="flex justify-between text-sm py-1 border-b border-gray-700">
                <span class="text-blue-400 font-semibold">${l.lineName}</span>
                <span class="text-gray-400">${l.responsibleArea} (${l.length} กม.)</span>
            </div>
        `).join('');

        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <h3 class="text-xl font-bold text-white">${item.unit}</h3>
                <span class="px-2 py-1 text-xs font-bold rounded text-white bg-indigo-600">กม.สะสม: ${item.additionalDetails?.circuitKmCount || '0'}</span>
            </div>
            <div class="space-y-2 mb-4">
                ${linesHtml}
            </div>
            <div class="flex flex-wrap gap-2 pt-2">
                <button onclick="showDetails('${item.unit}', ${JSON.stringify(item.responsibleLines).replace(/"/g, '&quot;')}, ${JSON.stringify(item.additionalDetails)}, [])" class="px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transition">🔍 ดูข้อมูลเชิงลึก</button>
                <button onclick="showContactInfo('${item.unit}', '${item.emergencyContact.phone}', '${item.emergencyContact.line}')" class="px-3 py-1.5 text-xs font-semibold bg-red-600 text-white rounded hover:bg-red-700 transition">📞 ติดต่อฉุกเฉิน</button>
                <button onclick="window.open('${item.mapUrl}', '_blank')" class="px-3 py-1.5 text-xs font-semibold bg-green-600 text-white rounded hover:bg-green-700 transition">🗺️ เปิดแผนที่</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// ฟังก์ชันสร้างปุ่มกรองตาม บสส.
function renderFilterButtons(items) {
    const btnContainer = document.getElementById('filterButtons');
    if (!btnContainer) return;
    btnContainer.innerHTML = `<button class="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">ทั้งหมด</button>`;
    
    btnContainer.firstChild.addEventListener('click', () => renderMainContent(data));

    items.forEach(item => {
        const btn = document.createElement('button');
        btn.className = "px-4 py-2 text-sm bg-gray-800 border border-gray-700 text-gray-300 rounded-lg font-semibold hover:bg-gray-700 transition";
        btn.textContent = item.unit.replace("หน่วย ", "");
        btn.addEventListener('click', () => renderMainContent([item]));
        btnContainer.appendChild(btn);
    });
}

// ฟังก์ชันสร้างปุ่มเลือกแผนที่รวมด้านล่าง
function renderMapButtons(items) {
    const container = document.getElementById('mapButtons');
    if (!container) return;
    container.innerHTML = '';
    
    items.forEach((item) => {
        const btn = document.createElement('button');
        btn.className = "px-3 py-1.5 text-xs font-semibold bg-gray-700 text-white rounded hover:bg-blue-600 transition";
        btn.textContent = `แผนที่ ${item.unit.replace("หน่วย บสส.", "")}`;
        btn.addEventListener('click', () => {
            document.getElementById('combinedMap').src = item.mapUrl;
        });
        container.appendChild(btn);
    });
}


// ==========================================
// 2. ระบบติดต่อ และส่งข้อมูล Firebase
// ==========================================

// ส่งฟอร์มติดต่อแอดมิน
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const statusMsg = document.getElementById('statusMessage');
        statusMsg.classList.remove('hidden');
        statusMsg.className = "mt-4 text-center text-blue-400";
        statusMsg.textContent = "กำลังส่งข้อมูล...";

        try {
            await firebase.firestore().collection('contacts').add({
                senderName: document.getElementById('senderName').value,
                message: document.getElementById('message').value,
                contactInfo: document.getElementById('contactInfo').value,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            statusMsg.className = "mt-4 text-center text-green-400";
            statusMsg.textContent = "ส่งข้อความสำเร็จแล้ว!";
            contactForm.reset();
            setTimeout(() => { 
                document.getElementById('contactFormModal').classList.add('hidden'); 
                statusMsg.classList.add('hidden'); 
            }, 2000);
        } catch (error) {
            statusMsg.className = "mt-4 text-center text-red-400";
            statusMsg.textContent = "เกิดข้อผิดพลาด: " + error.message;
        }
    });
}

// ส่งฟอร์มรายงานเสาไฟฟ้า
const reportPoleForm = document.getElementById('reportPoleForm');
if (reportPoleForm) {
    reportPoleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const statusMsg = document.getElementById('reportStatusMessage');
        statusMsg.classList.remove('hidden');
        statusMsg.textContent = "กำลังบันทึกรายงาน...";

        try {
            await firebase.firestore().collection('pole_reports').add({
                reportType: document.getElementById('reportType').value,
                lineName: document.getElementById('lineName').value,
                googleMapLink: document.getElementById('googleMapLink').value,
                otherInfo: document.getElementById('otherInfo').value,
                reporterName: document.getElementById('reporterName').value,
                reporterUnit: document.getElementById('reporterUnit').value,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            statusMsg.className = "mt-4 text-center text-green-400";
            statusMsg.textContent = "ส่งรายงานเรียบร้อยแล้ว ขอบคุณครับ!";
            reportPoleForm.reset();
            setTimeout(() => { 
                document.getElementById('reportPoleModal').classList.add('hidden'); 
                statusMsg.classList.add('hidden'); 
            }, 2000);
        } catch (error) {
            statusMsg.className = "mt-4 text-center text-red-400";
            statusMsg.textContent = "ล้มเหลว: " + error.message;
        }
    });
}

// ดึงลิงก์จาก Google Drive มาแสดง
async function loadDriveLinks() {
    const container = document.getElementById('driveLinksContainer');
    if (!container) return;
    container.innerHTML = '<p class="text-gray-500 text-center py-4">กำลังโหลดข้อมูลไดรฟ์...</p>';
    
    try {
        const snapshot = await firebase.firestore().collection('drive_links').get();
        if (snapshot.empty) {
            container.innerHTML = '<p class="text-gray-400 text-center py-4">ไม่มีข้อมูลลิงก์ในระบบ</p>';
            return;
        }
        container.innerHTML = '';
        snapshot.forEach(doc => {
            const linkData = doc.data();
            const linkEl = document.createElement('a');
            linkEl.href = linkData.url;
            linkEl.target = "_blank";
            linkEl.className = "block p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg hover:bg-green-100 font-medium text-center transition shadow-sm";
            linkEl.textContent = `📁 ${linkData.title || 'ดาวน์โหลดเอกสารข้อมูล'}`;
            container.appendChild(linkEl);
        });
    } catch (err) {
        container.innerHTML = '<p class="text-red-400 text-center">โหลดข้อมูลล้มเหลว</p>';
    }
}


// ==========================================
// 3. ระบบยืนยันตัวตนและการจัดการกระดานข่าว (Admin)
// ==========================================

const adminLoginBtn = document.getElementById('adminLoginBtn');
const manageNewsBtn = document.getElementById('manageNewsBtn');

if (adminLoginBtn) {
    adminLoginBtn.addEventListener('click', () => {
        if (firebase.auth().currentUser) {
            firebase.auth().signOut().then(() => {
                alert('ออกจากระบบผู้ดูแลเรียบร้อย');
                location.reload();
            });
        } else {
            document.getElementById('loginModal').classList.remove('hidden');
        }
    });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            await firebase.auth().signInWithEmailAndPassword(email, password);
            document.getElementById('loginModal').classList.add('hidden');
            alert('เข้าสู่ระบบแอดมินสำเร็จ!');
        } catch (error) {
            alert('อีเมลหรือรหัสผ่านไม่ถูกต้อง: ' + error.message);
        }
    });
}

// เฝ้าติดตามสถานะล็อกอิน
firebase.auth().onAuthStateChanged((user) => {
    if (!adminLoginBtn || !manageNewsBtn) return;
    if (user) {
        adminLoginBtn.textContent = "ออกจากระบบ";
        adminLoginBtn.className = "bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors";
        manageNewsBtn.classList.remove('hidden');
    } else {
        adminLoginBtn.textContent = "ผู้ดูแล";
        adminLoginBtn.className = "bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors";
        manageNewsBtn.classList.add('hidden');
    }
});

if (manageNewsBtn) {
    manageNewsBtn.addEventListener('click', () => {
        loadAdminNewsList();
        document.getElementById('adminModal').classList.remove('hidden');
    });
}

// โหลดข่าวแสดงที่หน้าหลักของผู้ใช้ทั่วไป
async function loadNewsContent() {
    const newsContainer = document.getElementById('newsContent');
    if (!newsContainer) return;
    newsContainer.innerHTML = '<p class="text-gray-400">กำลังดาวน์โหลดข้อมูลข่าวล่าสุด...</p>';

    firebase.firestore().collection('news').orderBy('timestamp', 'desc').onSnapshot((snapshot) => {
        if (snapshot.empty) {
            newsContainer.innerHTML = '<p class="text-gray-500">ไม่มีข่าวสารประชาสัมพันธ์ในขณะนี้</p>';
            return;
        }
        newsContainer.innerHTML = '';
        snapshot.forEach(doc => {
            const news = doc.data();
            const div = document.createElement('div');
            div.className = "p-4 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg shadow-sm";
            
            let actionBtn = '';
            if (news.link) {
                actionBtn = `
                    <div class="mt-3 flex gap-2">
                        <a href="${news.link}" target="_blank" class="text-xs bg-indigo-600 text-white px-2.5 py-1.5 rounded hover:bg-indigo-700 transition">🔗 อ่านข่าวเต็ม</a>
                        <button onclick="summarizeNews('${news.link}')" class="text-xs bg-green-600 text-white px-2.5 py-1.5 rounded hover:bg-green-700 transition">✨ ให้ AI สรุปข่าว</button>
                    </div>
                `;
            }

            div.innerHTML = `
                <h4 class="text-lg font-bold text-blue-400">${news.title}</h4>
                <p class="text-gray-300 text-sm mt-1 whitespace-pre-wrap">${news.text}</p>
                ${actionBtn}
            `;
            newsContainer.appendChild(div);
        });
    });
}

// แอดมินเพิ่มหรืออัปเดตข่าว
const newsForm = document.getElementById('newsForm');
if (newsForm) {
    newsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('newsId').value;
        const title = document.getElementById('newsTitle').value;
        const text = document.getElementById('newsText').value;
        const link = document.getElementById('newsLink').value;

        const newsData = {
            title, text, link,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        try {
            if (id) {
                await firebase.firestore().collection('news').doc(id).update(newsData);
                alert('แก้ไขข่าวสำเร็จ');
            } else {
                await firebase.firestore().collection('news').add(newsData);
                alert('เพิ่มข่าวสารใหม่เรียบร้อย');
            }
            newsForm.reset();
            document.getElementById('newsId').value = '';
            loadAdminNewsList();
        } catch (error) {
            alert('เกิดข้อผิดพลาดในการบันทึก: ' + error.message);
        }
    });
}

// โหลดรายการข่าวในหน้าต่างจัดการของแอดมิน
function loadAdminNewsList() {
    const listContainer = document.getElementById('newsList');
    if (!listContainer) return;
    listContainer.innerHTML = '<p class="text-gray-400">กำลังโหลดข่าว...</p>';

    firebase.firestore().collection('news').orderBy('timestamp', 'desc').get().then((snapshot) => {
        listContainer.innerHTML = '';
        snapshot.forEach(doc => {
            const data = doc.data();
            const item = document.createElement('div');
            item.className = "p-3 bg-gray-700 rounded flex justify-between items-center text-sm";
            item.innerHTML = `
                <div>
                    <p class="font-bold text-white">${data.title}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="editNewsField('${doc.id}', '${data.title}', '${data.text.replace(/\n/g, '\\n')}', '${data.link || ''}')" class="text-blue-400 hover:underline">แก้ไข</button>
                    <button onclick="deleteNewsField('${doc.id}')" class="text-red-400 hover:underline">ลบ</button>
                </div>
            `;
            listContainer.appendChild(item);
        });
    });
}

window.editNewsField = (id, title, text, link) => {
    document.getElementById('newsId').value = id;
    document.getElementById('newsTitle').value = title;
    document.getElementById('newsText').value = text;
    document.getElementById('newsLink').value = link;
};

window.deleteNewsField = async (id) => {
    if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข่าวสารชิ้นนี้?')) {
        try {
            await firebase.firestore().collection('news').doc(id).delete();
            alert('ลบเรียบร้อยแล้ว');
            loadAdminNewsList();
        } catch (err) {
            alert('ลบไม่สำเร็จ: ' + err.message);
        }
    }
};

const cancelEditBtn = document.getElementById('cancelEditBtn');
if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
        newsForm.reset();
        document.getElementById('newsId').value = '';
    });
}
