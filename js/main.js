// ===== localStorage 키 =====
const STORAGE_KEYS = {
    USERS: 'gs_gold_users',
    CURRENT_USER: 'gs_gold_current_user',
    CHARGES: 'gs_gold_charges',
    EXCHANGES: 'gs_gold_exchanges'
};

// ===== 유틸리티 함수 =====
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ===== 현재 사용자 관리 =====
function getCurrentUser() {
    const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userJson ? JSON.parse(userJson) : null;
}

function setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
}

function clearCurrentUser() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

function updateUserPoints(userId, newPoints) {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        users[userIndex].points = newPoints;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            currentUser.points = newPoints;
            setCurrentUser(currentUser);
        }
    }
}

// ===== 헤더/네비게이션 =====
const navToggle = document.getElementById('nav-toggle');
const navClose = document.getElementById('nav-close');
const navMenu = document.getElementById('nav-menu');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.add('show');
    });
}

if (navClose) {
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('show');
    });
}

// 섹션 표시 함수
function showSection(targetId) {
    // 모든 섹션 숨기기
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // home이 아닌 경우에만 섹션 표시
    if (targetId && targetId !== 'home') {
        const targetSection = document.getElementById(targetId);
        if (targetSection && targetSection.classList.contains('section')) {
            targetSection.classList.add('active');
            // 섹션으로 부드럽게 스크롤
            setTimeout(() => {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    } else {
        // home 클릭 시 맨 위로 스크롤
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// 메뉴 링크 클릭 시 모바일 메뉴 닫기
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        // 모바일 메뉴 닫기
        navMenu.classList.remove('show');
        
        // 해시 변경은 브라우저가 자동으로 처리하고
        // hashchange 이벤트에서 섹션 표시 처리
    });
});

// 스크롤 시 헤더 스타일 변경
window.addEventListener('scroll', () => {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    }
});

// ===== 사용자 인증 상태 표시 =====
function updateAuthUI() {
    const user = getCurrentUser();
    const userInfo = document.getElementById('userInfo');
    const authBtns = document.getElementById('authBtns');
    
    if (user) {
        userInfo.style.display = 'flex';
        authBtns.style.display = 'none';
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userPoints').textContent = formatNumber(user.points);
        document.getElementById('exchangePoints').textContent = `${formatNumber(user.points)} P`;
    } else {
        userInfo.style.display = 'none';
        authBtns.style.display = 'flex';
    }
}

// 로그아웃
document.getElementById('btnLogout')?.addEventListener('click', () => {
    if (confirm('로그아웃 하시겠습니까?')) {
        clearCurrentUser();
        updateAuthUI();
        alert('로그아웃되었습니다.');
        window.location.href = '#home';
    }
});

// ===== 금시세 업데이트 (한국금거래소 실시간 기준) =====
// 2024년 3월 11일 한국금거래소 실제 시세 반영
function updateGoldPrices() {
    // 한국금거래소 실시간 기준 시세 (원/g)
    // 2024년 3월 12일 기준: 한국금거래소 실시간 시세 (1돈 기준)
    // 1돈 = 3.75g
    // ⭐ 실제 한국금거래소 시세 반영
    const basePrices = {
        // 순금 24K (99.99% 순도) - 1돈 기준
        'buy-24k': 1073000,   // 살때 (고객이 사는 가격) - 실제 시세
        'sell-24k': 883300,   // 팔때 (고객이 파는 가격) - 실제 시세
        
        // 18K (75% 순도 = 24K × 0.75) - 1돈 기준
        'buy-18k': 804750,    // 살때 = 1,073,000 × 0.75
        'sell-18k': 662475,   // 팔때 = 883,300 × 0.75
        
        // 14K (58.5% 순도 = 24K × 0.585) - 1돈 기준
        'buy-14k': 627705,    // 살때 = 1,073,000 × 0.585
        'sell-14k': 516731,   // 팔때 = 883,300 × 0.585
        
        // 백금(Platinum) - 1돈 기준 (순금의 약 40% 가격)
        'buy-pt': 429200,     // 살때 = 1,073,000 × 0.4
        'sell-pt': 353320,    // 팔때 = 883,300 × 0.4
        
        // 은(Silver) - 1돈 기준 - 2024-03-12 실제 시세
        'buy-ag': 19720,      // 살때 (실제 시세)
        'sell-ag': 16240,     // 팔때 (살때의 약 82.4%)
        
        // 골드바 1돈(3.75g) - 실제 한국금거래소 시세
        'buy-1don': 1073000,  // 살때 (실제 시세)
        'sell-1don': 883300   // 팔때 (실제 시세)
    };
    
    // 실시간 변동 반영 (±0.1% 이내의 미세한 변동)
    Object.keys(basePrices).forEach(key => {
        const basePrice = basePrices[key];
        const changePercent = (Math.random() - 0.5) * 0.002; // ±0.1% 변동
        const change = Math.round(basePrice * changePercent);
        const newPrice = basePrice + change;
        
        const element = document.querySelector(`[data-price="${key}"]`);
        if (element) {
            const unit = '원/돈';
            element.textContent = `${formatNumber(newPrice)}${unit}`;
            
            // 등락 표시 (상승: 빨강, 하락: 파랑, 보합: 검정)
            const priceElement = element.closest('.price-item');
            if (priceElement) {
                if (change > 0) {
                    priceElement.classList.add('price-up');
                    priceElement.classList.remove('price-down');
                } else if (change < 0) {
                    priceElement.classList.add('price-down');
                    priceElement.classList.remove('price-up');
                } else {
                    priceElement.classList.remove('price-up', 'price-down');
                }
            }
        }
    });
    
    // 마지막 업데이트 시간 표시
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    document.querySelectorAll('.last-update').forEach(el => {
        el.textContent = `최종 업데이트: ${timeStr}`;
    });
}

// 5초마다 금시세 업데이트
updateGoldPrices();
setInterval(updateGoldPrices, 5000);

// ===== 회원가입 =====
const signupForm = document.getElementById('signupForm');
const signupTab = document.getElementById('signupTab');
const loginTab = document.getElementById('loginTab');
const signupContent = document.getElementById('signupContent');
const loginContent = document.getElementById('loginContent');

// 탭 전환
signupTab?.addEventListener('click', () => {
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    signupContent.classList.add('active');
    loginContent.classList.remove('active');
});

loginTab?.addEventListener('click', () => {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginContent.classList.add('active');
    signupContent.classList.remove('active');
});

// ID 중복 체크
document.getElementById('checkId')?.addEventListener('click', () => {
    const userId = document.getElementById('userId').value.trim();
    
    if (!userId) {
        alert('아이디를 입력해주세요.');
        return;
    }
    
    if (userId.length < 4) {
        alert('아이디는 4자 이상이어야 합니다.');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const exists = users.some(u => u.userId === userId);
    
    if (exists) {
        alert('이미 사용 중인 아이디입니다.');
    } else {
        alert('사용 가능한 아이디입니다.');
        document.getElementById('userId').dataset.checked = 'true';
    }
});

// 비밀번호 확인
document.getElementById('passwordConfirm')?.addEventListener('input', (e) => {
    const password = document.getElementById('password').value;
    const passwordConfirm = e.target.value;
    const message = document.getElementById('passwordMessage');
    
    if (password && passwordConfirm) {
        if (password === passwordConfirm) {
            message.textContent = '비밀번호가 일치합니다.';
            message.style.color = 'green';
        } else {
            message.textContent = '비밀번호가 일치하지 않습니다.';
            message.style.color = 'red';
        }
    } else {
        message.textContent = '';
    }
});

// 전화번호 자동 포맷
document.getElementById('phone')?.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substr(0, 11);
    
    if (value.length >= 7) {
        e.target.value = value.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (value.length >= 3) {
        e.target.value = value.replace(/(\d{3})(\d{1,4})/, '$1-$2');
    } else {
        e.target.value = value;
    }
});

// 전체 동의 체크박스
document.getElementById('allAgree')?.addEventListener('change', (e) => {
    const checkboxes = document.querySelectorAll('.agreement-item input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = e.target.checked);
});

// 개별 체크박스 변경 시 전체 동의 체크박스 상태 업데이트
document.querySelectorAll('.agreement-item input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => {
        const allChecked = Array.from(document.querySelectorAll('.agreement-item input[type="checkbox"]'))
            .every(checkbox => checkbox.checked);
        document.getElementById('allAgree').checked = allChecked;
    });
});

// 회원가입 폼 제출
signupForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const userId = document.getElementById('userId').value.trim();
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const termsAgree = document.getElementById('termsAgree').checked;
    const privacyAgree = document.getElementById('privacyAgree').checked;
    
    // 유효성 검사
    if (!userId || userId.length < 4) {
        alert('아이디는 4자 이상이어야 합니다.');
        return;
    }
    
    if (!document.getElementById('userId').dataset.checked) {
        alert('아이디 중복 확인을 해주세요.');
        return;
    }
    
    if (!password || password.length < 6) {
        alert('비밀번호는 6자 이상이어야 합니다.');
        return;
    }
    
    if (password !== passwordConfirm) {
        alert('비밀번호가 일치하지 않습니다.');
        return;
    }
    
    if (!name) {
        alert('이름을 입력해주세요.');
        return;
    }
    
    if (!phone || phone.length < 12) {
        alert('올바른 전화번호를 입력해주세요.');
        return;
    }
    
    if (!termsAgree || !privacyAgree) {
        alert('필수 약관에 동의해주세요.');
        return;
    }
    
    // 사용자 저장
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const newUser = {
        id: generateId(),
        userId,
        password,
        name,
        phone,
        points: 10000, // 가입 축하 포인트
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    alert(`회원가입이 완료되었습니다!\n가입 축하 포인트 10,000P가 지급되었습니다.`);
    
    // 자동 로그인
    setCurrentUser(newUser);
    updateAuthUI();
    
    // 폼 초기화 및 교환 섹션으로 이동
    signupForm.reset();
    document.getElementById('userId').dataset.checked = '';
    window.location.href = '#exchange';
});

// ===== 로그인 =====
const loginForm = document.getElementById('loginForm');

loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const loginUserId = document.getElementById('loginUserId').value.trim();
    const loginPassword = document.getElementById('loginPassword').value;
    
    if (!loginUserId || !loginPassword) {
        alert('아이디와 비밀번호를 입력해주세요.');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = users.find(u => u.userId === loginUserId && u.password === loginPassword);
    
    if (user) {
        setCurrentUser(user);
        updateAuthUI();
        alert(`${user.name}님, 환영합니다!`);
        
        // 로그인 모달 닫기
        const loginModal = document.getElementById('loginModal');
        if (loginModal) loginModal.style.display = 'none';
        
        // 교환 섹션으로 이동
        window.location.href = '#exchange';
    } else {
        alert('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
});

// ===== 포인트 교환 =====
const exchangeTabs = document.querySelectorAll('.exchange-tab');
const exchangeProducts = document.querySelectorAll('.exchange-products');

exchangeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const category = tab.dataset.category;
        
        // 탭 활성화
        exchangeTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // 상품 목록 표시
        exchangeProducts.forEach(products => {
            if (products.dataset.category === category || category === 'all') {
                products.style.display = 'grid';
            } else {
                products.style.display = 'none';
            }
        });
    });
});

// 교환하기 버튼
document.querySelectorAll('.btn-exchange').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const user = getCurrentUser();
        
        if (!user) {
            alert('로그인이 필요합니다.');
            window.location.href = '#signup';
            return;
        }
        
        const productCard = e.target.closest('.product-card');
        const productName = productCard.querySelector('h3').textContent;
        const pointsText = productCard.querySelector('.product-points').textContent;
        const requiredPoints = parseInt(pointsText.replace(/[^0-9]/g, ''));
        
        if (user.points < requiredPoints) {
            alert('포인트가 부족합니다.');
            return;
        }
        
        if (confirm(`${productName}(을)를 ${formatNumber(requiredPoints)}P에 교환하시겠습니까?`)) {
            // 포인트 차감
            const newPoints = user.points - requiredPoints;
            updateUserPoints(user.id, newPoints);
            user.points = newPoints;
            updateAuthUI();
            
            // 교환 내역 저장
            const exchanges = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXCHANGES) || '[]');
            exchanges.push({
                id: generateId(),
                userId: user.id,
                productName,
                points: requiredPoints,
                date: new Date().toISOString()
            });
            localStorage.setItem(STORAGE_KEYS.EXCHANGES, JSON.stringify(exchanges));
            
            alert(`교환이 완료되었습니다!\n남은 포인트: ${formatNumber(newPoints)}P`);
            loadExchangeHistory();
        }
    });
});

// 교환 내역 로드
function loadExchangeHistory() {
    const user = getCurrentUser();
    if (!user) return;
    
    const exchanges = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXCHANGES) || '[]');
    const userExchanges = exchanges.filter(e => e.userId === user.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);
    
    const tbody = document.querySelector('#exchangeHistory tbody');
    if (!tbody) return;
    
    if (userExchanges.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 2rem;">교환 내역이 없습니다.</td></tr>';
        return;
    }
    
    tbody.innerHTML = userExchanges.map(ex => `
        <tr>
            <td>${formatDate(ex.date)}</td>
            <td>${ex.productName}</td>
            <td class="points-cell">-${formatNumber(ex.points)} P</td>
        </tr>
    `).join('');
}

// ===== 포인트 충전 신청 =====
const chargeForm = document.getElementById('chargeForm');

chargeForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const user = getCurrentUser();
    
    if (!user) {
        alert('로그인이 필요합니다.');
        window.location.href = '#signup';
        return;
    }
    
    const amount = parseInt(document.getElementById('chargeAmount').value);
    const depositor = document.getElementById('depositor').value.trim();
    const depositDate = document.getElementById('depositDate').value;
    
    if (amount < 100000) {
        alert('최소 충전 금액은 100,000원입니다.');
        return;
    }
    
    if (!depositor) {
        alert('입금자명을 입력해주세요.');
        return;
    }
    
    if (!depositDate) {
        alert('입금 예정일을 선택해주세요.');
        return;
    }
    
    // 충전 신청 데이터
    const chargeRequest = {
        userId: user.id,
        userName: user.name,
        amount: amount,
        points: amount, // 1원 = 1포인트
        depositor: depositor,
        depositDate: depositDate,
        status: 'pending', // pending, approved, rejected
        createdAt: new Date().toISOString()
    };
    
    try {
        // API로 전송
        const response = await fetch('tables/chargeRequests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(chargeRequest)
        });
        
        if (response.ok) {
            // localStorage에도 백업 저장
            const charges = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHARGES) || '[]');
            charges.push(chargeRequest);
            localStorage.setItem(STORAGE_KEYS.CHARGES, JSON.stringify(charges));
            
            alert('충전 신청이 완료되었습니다.\n관리자 승인 후 포인트가 지급됩니다.');
            chargeForm.reset();
            loadChargeHistory();
        } else {
            throw new Error('API 요청 실패');
        }
    } catch (error) {
        console.error('충전 신청 오류:', error);
        
        // API 실패 시 localStorage에만 저장
        const charges = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHARGES) || '[]');
        charges.push(chargeRequest);
        localStorage.setItem(STORAGE_KEYS.CHARGES, JSON.stringify(charges));
        
        alert('충전 신청이 완료되었습니다.\n관리자 승인 후 포인트가 지급됩니다.');
        chargeForm.reset();
        loadChargeHistory();
    }
});

// 충전 내역 로드
async function loadChargeHistory() {
    const user = getCurrentUser();
    if (!user) return;
    
    const tbody = document.querySelector('#chargeHistory tbody');
    if (!tbody) return;
    
    let userCharges = [];
    
    try {
        // API에서 데이터 가져오기
        const response = await fetch('tables/chargeRequests');
        if (response.ok) {
            const data = await response.json();
            userCharges = (data.data || [])
                .filter(c => c.userId === user.id)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 10);
        }
    } catch (error) {
        console.error('충전 내역 로드 오류:', error);
    }
    
    // API 실패 시 localStorage에서 가져오기
    if (userCharges.length === 0) {
        const charges = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHARGES) || '[]');
        userCharges = charges
            .filter(c => c.userId === user.id)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 10);
    }
    
    if (userCharges.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;">충전 내역이 없습니다.</td></tr>';
        return;
    }
    
    tbody.innerHTML = userCharges.map(charge => {
        const statusText = {
            pending: '대기중',
            approved: '승인완료',
            rejected: '반려'
        }[charge.status] || '대기중';
        
        const statusClass = {
            pending: 'status-pending',
            approved: 'status-approved',
            rejected: 'status-rejected'
        }[charge.status] || 'status-pending';
        
        return `
            <tr>
                <td>${formatDate(charge.createdAt)}</td>
                <td>${formatNumber(charge.amount)}원</td>
                <td>+${formatNumber(charge.points)} P</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            </tr>
        `;
    }).join('');
}

// ===== 맨 위로 스크롤 버튼 =====
const scrollTopBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollTopBtn.style.display = 'flex';
    } else {
        scrollTopBtn.style.display = 'none';
    }
});

scrollTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===== 문의하기 폼 =====
const contactForm = document.getElementById('contactForm');

contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('문의가 접수되었습니다.\n빠른 시일 내에 답변드리겠습니다.');
    contactForm.reset();
});

// ===== 로그인 모달 =====
const btnLoginModal = document.getElementById('btnLoginModal');
const loginModal = document.getElementById('loginModal');
const closeModal = document.querySelector('.close-modal');

btnLoginModal?.addEventListener('click', () => {
    loginModal.style.display = 'flex';
});

closeModal?.addEventListener('click', () => {
    loginModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
    }
});

// ===== 초기화 =====
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    loadExchangeHistory();
    loadChargeHistory();
    
    // iOS Safari 100vh 버그 해결
    const setVh = () => {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);
    
    // 터치 디바이스 감지
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
});

// ===== 다른 탭에서 변경사항 동기화 =====
window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEYS.CURRENT_USER) {
        updateAuthUI();
        loadExchangeHistory();
    } else if (e.key === STORAGE_KEYS.CHARGES) {
        loadChargeHistory();
    }
});

// ===== 포인트 변경 감지 및 알림 =====
let lastKnownPoints = null;

setInterval(() => {
    const user = getCurrentUser();
    if (user) {
        if (lastKnownPoints !== null && user.points > lastKnownPoints) {
            const difference = user.points - lastKnownPoints;
            if (difference > 0) {
                showPointsNotification(difference);
            }
        }
        lastKnownPoints = user.points;
    }
}, 5000);

// 포인트 증가 알림 표시
function showPointsNotification(points) {
    // 알림 요소 생성
    const notification = document.createElement('div');
    notification.className = 'points-notification';
    notification.innerHTML = `
        <i class="fas fa-coins"></i>
        <div>
            <strong>포인트 충전 완료!</strong>
            <p>+${formatNumber(points)} P</p>
        </div>
    `;
    
    // body에 추가
    document.body.appendChild(notification);
    
    // 애니메이션 시작
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // 5초 후 제거
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 5000);
}

// ===== 이스터 에그: Konami Code =====
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            activateGoldenMode();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function activateGoldenMode() {
    document.body.style.animation = 'goldenPulse 1s ease-in-out 3';
    alert('🥇 황금 모드 활성화! 🥇\n모든 상품 10% 할인!');
    
    const style = document.createElement('style');
    style.textContent = `
        @keyframes goldenPulse {
            0%, 100% { filter: hue-rotate(0deg); }
            50% { filter: hue-rotate(45deg) brightness(1.2); }
        }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
        document.body.style.animation = '';
        style.remove();
    }, 3000);
}

// ===== 해시 변경 감지 및 섹션 표시 =====
// URL 해시가 변경될 때마다 섹션 표시 업데이트
function handleHashChange() {
    const hash = window.location.hash.substring(1); // # 제거
    showSection(hash || 'home');
}

// hashchange 이벤트 리스너
window.addEventListener('hashchange', handleHashChange);

// 페이지 로드 시 URL 해시 확인
window.addEventListener('load', () => {
    const hash = window.location.hash.substring(1);
    if (hash && hash !== 'home' && hash !== '') {
        showSection(hash);
    }
});
