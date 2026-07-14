// 🌐 วาง URL Web App ของคุณที่นี่
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyH8YrZfl7ls-XZYjYK8OuI5OomYS7APplDn3toTzpMcchRe8BNMBNq_LSL1yolC-hL/exec";

let CONFIG_DATA = null;
let teamCounter = 0;

document.addEventListener("DOMContentLoaded", () => {
    fetchConfig();
});

function showPage(pageId) {
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    const target = document.getElementById(pageId);
    if (target) target.classList.add('active');
    window.scrollTo(0, 0);
}

async function fetchConfig() {
    if (WEB_APP_URL === "วาง_URL_เว็บแอปของท่านที่นี่") {
        document.getElementById("footer-version").innerText = "BK Triple Game v3.0.0 (ยังไม่ได้เชื่อม API)";
        return;
    }
    try {
        const res = await fetch(WEB_APP_URL);
        CONFIG_DATA = await res.json();
        document.getElementById("footer-version").innerText = CONFIG_DATA.appVersion;
        // เริ่มต้นด้วยการสร้างฟิลด์ทีมแรกให้ทันที
        addTeamField();
    } catch (err) {
        document.getElementById("footer-version").innerText = "BK Triple Game v3.0.0";
        console.error("โหลด Config ล้มเหลว:", err);
    }
}

function addTeamField() {
    teamCounter++;
    const container = document.getElementById("dynamic-teams-container");
    
    const card = document.createElement("div");
    card.className = "team-card";
    card.id = `team-card-${teamCounter}`;
    
    // สร้างตัวเลือกรายการแข่งขันดรอปดาวน์ดึงมาจาก Config
    let optionsHtml = '<option value="">-- เลือกประเภทการแข่งขัน --</option>';
    if (CONFIG_DATA && CONFIG_DATA.categories) {
        Object.keys(CONFIG_DATA.categories).forEach(cat => {
            optionsHtml += `<option value="${cat}">${cat}</option>`;
        });
    }
    
    card.innerHTML = `
        <div class="team-card-header">
            <strong>ทีมที่ <span class="team-index-label"></span></strong>
            ${teamCounter > 1 ? `<button type="button" class="btn-delete-team" onclick="removeTeamField(${teamCounter})">ลบทีมนี้</button>` : ''}
        </div>
        <div class="form-group">
            <label>ประเภทการแข่งขัน <span class="required">*</span></label>
            <select class="team-category-select" required onchange="renderPlayers(${teamCounter}, this.value)">
                ${optionsHtml}
            </select>
        </div>
        <div id="players-area-${teamCounter}"></div>
        <hr style="margin:20px 0; border:0; border-top:1px solid #cbd5e0;">
        <div class="form-grid">
            <div class="form-group">
                <label>กรอกชื่อครูผู้ฝึกสอน <span class="required">*</span></label>
                <input type="text" class="coach-name-input" required placeholder="กรอกชื่อครูผู้ฝึกสอน">
            </div>
            <div class="form-group">
                <label>กรอกเบอร์โทรศัพท์ครูผู้ฝึกสอน <span class="required">*</span></label>
                <input type="tel" class="coach-phone-input" required placeholder="กรอกเบอร์โทรศัพท์ครูผู้ฝึกสอน" pattern="[0-9]{10}">
            </div>
        </div>
        <div class="form-group">
            <label>อัพโหลดรูปครูผู้ฝึกสอน <span class="required">*</span></label>
            <input type="file" class="coach-pic-input" accept="image/*" required>
        </div>
    `;
    container.appendChild(card);
    reIndexTeams();
    calculateTotalFee();
}

function removeTeamField(id) {
    const card = document.getElementById(`team-card-${id}`);
    if (card) {
        card.remove();
        reIndexTeams();
        calculateTotalFee();
    }
}

function reIndexTeams() {
    const cards = document.querySelectorAll(".team-card");
    cards.forEach((card, idx) => {
        card.querySelector(".team-index-label").innerText = idx + 1;
    });
}

function renderPlayers(teamId, categoryName) {
    const area = document.getElementById(`players-area-${teamId}`);
    area.innerHTML = "";
    
    if (!categoryName || !CONFIG_DATA) {
        calculateTotalFee();
        return;
    }
    
    const teamSize = CONFIG_DATA.categories[categoryName].teamSize;
    
    for (let i = 1; i <= teamSize; i++) {
        const pBox = document.createElement("div");
        pBox.className = "player-box";
        pBox.innerHTML = `
            <h5 style="margin-bottom:10px; color:#4a5568;">ผู้เข้าแข่งขันคนที่ ${i}</h5>
            <div class="form-grid">
                <div class="form-group">
                    <label>กรอกชื่อนักเรียน <span class="required">*</span></label>
                    <input type="text" class="player-name-input" required placeholder="กรอกชื่อนักเรียน">
                </div>
                <div class="form-group">
                    <label>กรอกเบอร์โทรศัพท์นักเรียน <span class="required">*</span></label>
                    <input type="tel" class="player-phone-input" required placeholder="กรอกเบอร์โทรศัพท์นักเรียน" pattern="[0-9]{10}">
                </div>
            </div>
            <div class="form-group" style="margin-bottom:0;">
                <label>อัพโหลดรูปนักเรียน <span class="required">*</span></label>
                <input type="file" class="player-pic-input" accept="image/*" required>
            </div>
        `;
        area.appendChild(pBox);
    }
    calculateTotalFee();
}

function calculateTotalFee() {
    let totalPlayers = 0;
    const cards = document.querySelectorAll(".team-card");
    
    cards.forEach(card => {
        const catSelect = card.querySelector(".team-category-select").value;
        if (catSelect && CONFIG_DATA) {
            totalPlayers += CONFIG_DATA.categories[catSelect].teamSize;
        }
    });
    
    const feePerPlayer = CONFIG_DATA ? CONFIG_DATA.feePerPlayer : 100;
    const totalFee = totalPlayers * feePerPlayer;
    document.getElementById("total-fee-display").innerText = totalFee;
}

function toggleReceiptView() {
    const isVisible = document.getElementById("taxInvoice").value === "รับ";
    document.getElementById("receipt-details-box").style.display = isVisible ? "block" : "none";
    document.getElementById("receivedFrom").required = isVisible;
    document.getElementById("address").required = isVisible;
}

function fileToBase64(file) {
    return new Promise((resolve) => {
        if (!file) resolve("");
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = () => resolve("");
    });
}

function toggleLoading(show, title = "", desc = "") {
    const overlay = document.getElementById("loading-overlay");
    if (show) {
        document.getElementById("loading-title").innerText = title;
        document.getElementById("loading-desc").innerText = desc;
        overlay.style.display = "flex";
    } else {
        overlay.style.display = "none";
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();
    if (!CONFIG_DATA || WEB_APP_URL === "วาง_URL_เว็บแอปของท่านที่นี่") {
        alert("ระบบยังไม่พร้อมส่งข้อมูลเนื่องจากไม่พบ API Web App URL");
        return;
    }
    
    toggleLoading(true, "กำลังประมวลผลรูปภาพ...", "กรุณารอสักครู่ ระบบกำลังแปลงไฟล์เพื่อเตรียมบันทึกเข้า Google Drive");
    
    try {
        const teamCards = document.querySelectorAll(".team-card");
        const teamsDataArray = [];
        
        // รวบรวมและแปลงไฟล์ Base64 ภายในแต่ละทีม
        for (let card of teamCards) {
            const category = card.querySelector(".team-category-select").value;
            const coachName = card.querySelector(".coach-name-input").value;
            const coachPhone = card.querySelector(".coach-phone-input").value;
            const coachPicFile = card.querySelector(".coach-pic-input").files[0];
            const coachPicBase64 = await fileToBase64(coachPicFile);
            
            const playerBoxes = card.querySelectorAll(".player-box");
            const playersArray = [];
            
            for (let pBox of playerBoxes) {
                const pName = pBox.querySelector(".player-name-input").value;
                const pPhone = pBox.querySelector(".player-phone-input").value;
                const pPicFile = pBox.querySelector(".player-pic-input").files[0];
                const pPicBase64 = await fileToBase64(pPicFile);
                
                playersArray.push({
                    name: pName,
                    phone: pPhone,
                    pic: pPicBase64
                });
            }
            
            teamsDataArray.push({
                category: category,
                coachName: coachName,
                coachPhone: coachPhone,
                coachPic: coachPicBase64,
                players: playersArray
            });
        }
        
        const slipFile = document.getElementById("paymentSlip").files[0];
        const slipBase64 = await fileToBase64(slipFile);
        const taxInvoiceVal = document.getElementById("taxInvoice").value;
        
        const payload = {
            action: "register",
            schoolName: document.getElementById("schoolName").value,
            province: document.getElementById("province").value,
            totalFee: document.getElementById("total-fee-display").innerText,
            paymentSlip: slipBase64,
            taxInvoice: taxInvoiceVal === "รับ" ? "Yes" : "No",
            receivedFrom: taxInvoiceVal === "รับ" ? document.getElementById("receivedFrom").value : "No receipt",
            address: taxInvoiceVal === "รับ" ? document.getElementById("address").value : "No receipt",
            teams: teamsDataArray
        };
        
        toggleLoading(true, "กำลังบันทึกข้อมูล...", "กรุณารอสักครู่ อาจใช้เวลา 1-2 นาที ห้ามปิดหน้าต่างนี้เด็ดขาด");
        
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify(payload)
        });
        const resData = await response.json();
        
        toggleLoading(false);
        if (resData.status === "success") {
            alert("บันทึกข้อมูลเสร็จแล้ว\nรหัสโรงเรียนหลักของคุณคือ: " + resData.serialNumber);
            document.getElementById("reg-form").reset();
            document.getElementById("dynamic-teams-container").innerHTML = "";
            addTeamField();
            toggleReceiptView();
            showPage('home-page');
        } else {
            alert("เกิดข้อผิดพลาด: " + resData.message);
        }
    } catch (err) {
        toggleLoading(false);
        console.error(err);
        alert("เกิดข้อผิดพลาดในการเชื่อมต่อระบบหลังบ้าน");
    }
}

async function searchRegistration() {
    const kw = document.getElementById("searchKeyword").value.trim();
    if (!kw) {
        alert("กรุณากรอกคำค้นหาก่อนครับ");
        return;
    }
    
    toggleLoading(true, "กำลังค้นหาข้อมูล...", "กรุณารอสักครู่ ระบบกำลังดึงฐานข้อมูลรายชื่อ");
    
    try {
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify({ action: "search", keyword: kw })
        });
        const results = await response.json();
        
        toggleLoading(false);
        const tbody = document.getElementById("searchResultBody");
        tbody.innerHTML = "";
        
        if (results.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #e53e3e; padding: 20px;">❌ ไม่พบข้อมูลรายชื่อที่ค้นหา</td></tr>`;
            return;
        }
        
        results.forEach(item => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${item.serialNumber}</strong></td>
                <td>${item.schoolName}</td>
                <td>${item.province}</td>
                <td>${item.competitionCategory}</td>
                <td>${item.playerName}</td>
                <td>${item.coachName}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        toggleLoading(false);
        console.error(err);
        alert("ไม่สามารถเชื่อมต่อระบบเพื่อค้นหาได้");
    }
}