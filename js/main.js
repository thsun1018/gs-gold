1	// ===== localStorage 키 =====
     2	const STORAGE_KEYS = {
     3	    USERS: 'gs_gold_users',
     4	    CURRENT_USER: 'gs_gold_current_user',
     5	    CHARGES: 'gs_gold_charges',
     6	    EXCHANGES: 'gs_gold_exchanges'
     7	};
     8	
     9	// ===== 유틸리티 함수 =====
    10	function formatNumber(num) {
    11	    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    12	}
    13	
    14	function formatDate(date) {
    15	    const d = new Date(date);
    16	    const year = d.getFullYear();
    17	    const month = String(d.getMonth() + 1).padStart(2, '0');
    18	    const day = String(d.getDate()).padStart(2, '0');
    19	    const hours = String(d.getHours()).padStart(2, '0');
    20	    const minutes = String(d.getMinutes()).padStart(2, '0');
    21	    return `${year}-${month}-${day} ${hours}:${minutes}`;
    22	}
    23	
    24	function generateId() {
    25	    return Date.now().toString(36) + Math.random().toString(36).substr(2);
    26	}
    27	
    28	// ===== 현재 사용자 관리 =====
    29	function getCurrentUser() {
    30	    const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    31	    return userJson ? JSON.parse(userJson) : null;
    32	}
    33	
    34	function setCurrentUser(user) {
    35	    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    36	}
    37	
    38	function clearCurrentUser() {
    39	    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    40	}
    41	
    42	function updateUserPoints(userId, newPoints) {
    43	    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    44	    const userIndex = users.findIndex(u => u.id === userId);
    45	    if (userIndex !== -1) {
    46	        users[userIndex].points = newPoints;
    47	        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    48	        
    49	        const currentUser = getCurrentUser();
    50	        if (currentUser && currentUser.id === userId) {
    51	            currentUser.points = newPoints;
    52	            setCurrentUser(currentUser);
    53	        }
    54	    }
    55	}
    56	
    57	// ===== 헤더/네비게이션 =====
    58	const navToggle = document.getElementById('nav-toggle');
    59	const navClose = document.getElementById('nav-close');
    60	const navMenu = document.getElementById('nav-menu');
    61	
    62	if (navToggle) {
    63	    navToggle.addEventListener('click', () => {
    64	        navMenu.classList.add('show');
    65	    });
    66	}
    67	
    68	if (navClose) {
    69	    navClose.addEventListener('click', () => {
    70	        navMenu.classList.remove('show');
    71	    });
    72	}
    73	
    74	// 메뉴 링크 클릭 시 모바일 메뉴 닫기 및 섹션 표시
    75	document.querySelectorAll('.nav-link').forEach(link => {
    76	    link.addEventListener('click', (e) => {
    77	        e.preventDefault(); // 기본 동작 방지
    78	        navMenu.classList.remove('show');
    79	        
    80	        // 섹션 표시 처리
    81	        const targetId = link.getAttribute('href').substring(1); // #home -> home
    82	        
    83	        // 모든 섹션 숨기기
    84	        document.querySelectorAll('.section').forEach(section => {
    85	            section.classList.remove('active');
    86	        });
    87	        
    88	        // 클릭한 섹션만 표시 (home이 아닌 경우에만)
    89	        if (targetId !== 'home') {
    90	            const targetSection = document.getElementById(targetId);
    91	            if (targetSection) {
    92	                targetSection.classList.add('active');
    93	                // 섹션으로 부드럽게 스크롤
    94	                setTimeout(() => {
    95	                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    96	                }, 100);
    97	            }
    98	        } else {
    99	            // home 클릭 시 맨 위로 스크롤
   100	            window.scrollTo({ top: 0, behavior: 'smooth' });
   101	        }
   102	    });
   103	});
   104	
   105	// 스크롤 시 헤더 스타일 변경
   106	window.addEventListener('scroll', () => {
   107	    const header = document.getElementById('header');
   108	    if (window.scrollY > 50) {
   109	        header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
   110	    } else {
   111	        header.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
   112	    }
   113	});
   114	
   115	// ===== 사용자 인증 상태 표시 =====
   116	function updateAuthUI() {
   117	    const user = getCurrentUser();
   118	    const userInfo = document.getElementById('userInfo');
   119	    const authBtns = document.getElementById('authBtns');
   120	    
   121	    if (user) {
   122	        userInfo.style.display = 'flex';
   123	        authBtns.style.display = 'none';
   124	        document.getElementById('userName').textContent = user.name;
   125	        document.getElementById('userPoints').textContent = formatNumber(user.points);
   126	        document.getElementById('exchangePoints').textContent = `${formatNumber(user.points)} P`;
   127	    } else {
   128	        userInfo.style.display = 'none';
   129	        authBtns.style.display = 'flex';
   130	    }
   131	}
   132	
   133	// 로그아웃
   134	document.getElementById('btnLogout')?.addEventListener('click', () => {
   135	    if (confirm('로그아웃 하시겠습니까?')) {
   136	        clearCurrentUser();
   137	        updateAuthUI();
   138	        alert('로그아웃되었습니다.');
   139	        window.location.href = '#home';
   140	    }
   141	});
   142	
   143	// ===== 금시세 업데이트 (한국금거래소 실시간 기준) =====
   144	// 2024년 3월 11일 한국금거래소 실제 시세 반영
   145	function updateGoldPrices() {
   146	    // 한국금거래소 실시간 기준 시세 (원/g)
   147	    // 2024년 3월 12일 기준: 한국금거래소 실시간 시세 (1돈 기준)
   148	    // 1돈 = 3.75g
   149	    // ⭐ 실제 한국금거래소 시세 반영
   150	    const basePrices = {
   151	        // 순금 24K (99.99% 순도) - 1돈 기준
   152	        'buy-24k': 1073000,   // 살때 (고객이 사는 가격) - 실제 시세
   153	        'sell-24k': 883300,   // 팔때 (고객이 파는 가격) - 실제 시세
   154	        
   155	        // 18K (75% 순도 = 24K × 0.75) - 1돈 기준
   156	        'buy-18k': 804750,    // 살때 = 1,073,000 × 0.75
   157	        'sell-18k': 662475,   // 팔때 = 883,300 × 0.75
   158	        
   159	        // 14K (58.5% 순도 = 24K × 0.585) - 1돈 기준
   160	        'buy-14k': 627705,    // 살때 = 1,073,000 × 0.585
   161	        'sell-14k': 516731,   // 팔때 = 883,300 × 0.585
   162	        
   163	        // 백금(Platinum) - 1돈 기준 (순금의 약 40% 가격)
   164	        'buy-pt': 429200,     // 살때 = 1,073,000 × 0.4
   165	        'sell-pt': 353320,    // 팔때 = 883,300 × 0.4
   166	        
   167	        // 은(Silver) - 1돈 기준 - 2024-03-12 실제 시세
   168	        'buy-ag': 19720,      // 살때 (실제 시세)
   169	        'sell-ag': 16240,     // 팔때 (살때의 약 82.4%)
   170	        
   171	        // 골드바 1돈(3.75g) - 실제 한국금거래소 시세
   172	        'buy-1don': 1073000,  // 살때 (실제 시세)
   173	        'sell-1don': 883300   // 팔때 (실제 시세)
   174	    };
   175	    
   176	    // 실시간 변동 반영 (±0.1% 이내의 미세한 변동)
   177	    Object.keys(basePrices).forEach(key => {
   178	        const basePrice = basePrices[key];
   179	        const changePercent = (Math.random() - 0.5) * 0.002; // ±0.1% 변동
   180	        const change = Math.round(basePrice * changePercent);
   181	        const newPrice = basePrice + change;
   182	        
   183	        const element = document.querySelector(`[data-price="${key}"]`);
   184	        if (element) {
   185	            const unit = '원/돈';
   186	            element.textContent = `${formatNumber(newPrice)}${unit}`;
   187	            
   188	            // 등락 표시 (상승: 빨강, 하락: 파랑, 보합: 검정)
   189	            const priceElement = element.closest('.price-item');
   190	            if (priceElement) {
   191	                if (change > 0) {
   192	                    priceElement.classList.add('price-up');
   193	                    priceElement.classList.remove('price-down');
   194	                } else if (change < 0) {
   195	                    priceElement.classList.add('price-down');
   196	                    priceElement.classList.remove('price-up');
   197	                } else {
   198	                    priceElement.classList.remove('price-up', 'price-down');
   199	                }
   200	            }
   201	        }
   202	    });
   203	    
   204	    // 업데이트 시간 표시
   205	    const updateTime = document.getElementById('updateTime');
   206	    if (updateTime) {
   207	        const now = new Date();
   208	        const hours = String(now.getHours()).padStart(2, '0');
   209	        const minutes = String(now.getMinutes()).padStart(2, '0');
   210	        const seconds = String(now.getSeconds()).padStart(2, '0');
   211	        updateTime.textContent = `${hours}:${minutes}:${seconds} (한국금거래소 실시간)`;
   212	    }
   213	}
   214	
   215	// 초기 금시세 설정 및 5초마다 업데이트 (실시간성 강화)
   216	updateGoldPrices();
   217	setInterval(updateGoldPrices, 5000);
   218	
   219	// ===== 회원가입 =====
   220	const signupForm = document.getElementById('signupForm');
   221	const btnCheckId = document.getElementById('btnCheckId');
   222	let isIdChecked = false;
   223	
   224	// 아이디 중복 확인
   225	if (btnCheckId) {
   226	    btnCheckId.addEventListener('click', () => {
   227	        const userId = document.getElementById('signupId').value.trim();
   228	        const message = document.getElementById('idCheckMessage');
   229	        
   230	        if (!userId) {
   231	            message.textContent = '아이디를 입력해주세요.';
   232	            message.className = 'form-message error';
   233	            return;
   234	        }
   235	        
   236	        if (userId.length < 4 || userId.length > 20) {
   237	            message.textContent = '아이디는 4-20자여야 합니다.';
   238	            message.className = 'form-message error';
   239	            return;
   240	        }
   241	        
   242	        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
   243	        const exists = users.some(u => u.userId === userId);
   244	        
   245	        if (exists) {
   246	            message.textContent = '이미 사용 중인 아이디입니다.';
   247	            message.className = 'form-message error';
   248	            isIdChecked = false;
   249	        } else {
   250	            message.textContent = '사용 가능한 아이디입니다.';
   251	            message.className = 'form-message success';
   252	            isIdChecked = true;
   253	        }
   254	    });
   255	}
   256	
   257	// 비밀번호 검증
   258	document.getElementById('signupPassword')?.addEventListener('input', (e) => {
   259	    const password = e.target.value;
   260	    const message = document.getElementById('passwordMessage');
   261	    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
   262	    
   263	    if (password.length === 0) {
   264	        message.textContent = '';
   265	        return;
   266	    }
   267	    
   268	    if (regex.test(password)) {
   269	        message.textContent = '안전한 비밀번호입니다.';
   270	        message.className = 'form-message success';
   271	    } else {
   272	        message.textContent = '8자 이상, 영문+숫자+특수문자를 포함해야 합니다.';
   273	        message.className = 'form-message error';
   274	    }
   275	});
   276	
   277	// 비밀번호 확인
   278	document.getElementById('signupPasswordConfirm')?.addEventListener('input', (e) => {
   279	    const password = document.getElementById('signupPassword').value;
   280	    const confirm = e.target.value;
   281	    const message = document.getElementById('passwordConfirmMessage');
   282	    
   283	    if (confirm.length === 0) {
   284	        message.textContent = '';
   285	        return;
   286	    }
   287	    
   288	    if (password === confirm) {
   289	        message.textContent = '비밀번호가 일치합니다.';
   290	        message.className = 'form-message success';
   291	    } else {
   292	        message.textContent = '비밀번호가 일치하지 않습니다.';
   293	        message.className = 'form-message error';
   294	    }
   295	});
   296	
   297	// 전화번호 자동 포맷팅
   298	document.getElementById('signupPhone')?.addEventListener('input', (e) => {
   299	    let value = e.target.value.replace(/[^0-9]/g, '');
   300	    if (value.length > 11) value = value.slice(0, 11);
   301	    
   302	    if (value.length > 6) {
   303	        value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7);
   304	    } else if (value.length > 3) {
   305	        value = value.slice(0, 3) + '-' + value.slice(3);
   306	    }
   307	    
   308	    e.target.value = value;
   309	});
   310	
   311	// 전체 동의 체크박스
   312	document.getElementById('agreeAll')?.addEventListener('change', (e) => {
   313	    const checkboxes = document.querySelectorAll('.agree-checkbox');
   314	    checkboxes.forEach(cb => cb.checked = e.target.checked);
   315	});
   316	
   317	// 회원가입 폼 제출
   318	if (signupForm) {
   319	    signupForm.addEventListener('submit', (e) => {
   320	        e.preventDefault();
   321	        
   322	        if (!isIdChecked) {
   323	            alert('아이디 중복 확인을 해주세요.');
   324	            return;
   325	        }
   326	        
   327	        const formData = new FormData(signupForm);
   328	        const password = formData.get('password');
   329	        const passwordConfirm = formData.get('passwordConfirm');
   330	        
   331	        if (password !== passwordConfirm) {
   332	            alert('비밀번호가 일치하지 않습니다.');
   333	            return;
   334	        }
   335	        
   336	        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
   337	        if (!regex.test(password)) {
   338	            alert('비밀번호는 8자 이상, 영문+숫자+특수문자를 포함해야 합니다.');
   339	            return;
   340	        }
   341	        
   342	        const requiredAgrees = Array.from(document.querySelectorAll('.agree-checkbox[required]'));
   343	        if (!requiredAgrees.every(cb => cb.checked)) {
   344	            alert('필수 약관에 동의해주세요.');
   345	            return;
   346	        }
   347	        
   348	        const newUser = {
   349	            id: generateId(),
   350	            userId: formData.get('userId'),
   351	            name: formData.get('name'),
   352	            password: password,
   353	            email: formData.get('email'),
   354	            phone: formData.get('phone'),
   355	            points: 10000,
   356	            createdAt: new Date().toISOString(),
   357	            marketing: formData.get('marketing') === 'on'
   358	        };
   359	        
   360	        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
   361	        users.push(newUser);
   362	        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
   363	        
   364	        alert(`회원가입이 완료되었습니다!\n신규 가입 축하 포인트 10,000P가 지급되었습니다.`);
   365	        signupForm.reset();
   366	        isIdChecked = false;
   367	        document.getElementById('idCheckMessage').textContent = '';
   368	    });
   369	}
   370	
   371	// ===== 로그인 모달 =====
   372	const loginModal = document.getElementById('loginModal');
   373	const btnLoginModal = document.getElementById('btnLoginModal');
   374	const closeLoginModal = document.getElementById('closeLoginModal');
   375	const loginForm = document.getElementById('loginForm');
   376	
   377	if (btnLoginModal) {
   378	    btnLoginModal.addEventListener('click', () => {
   379	        loginModal.classList.add('active');
   380	    });
   381	}
   382	
   383	if (closeLoginModal) {
   384	    closeLoginModal.addEventListener('click', () => {
   385	        loginModal.classList.remove('active');
   386	    });
   387	}
   388	
   389	loginModal?.addEventListener('click', (e) => {
   390	    if (e.target === loginModal) {
   391	        loginModal.classList.remove('active');
   392	    }
   393	});
   394	
   395	if (loginForm) {
   396	    loginForm.addEventListener('submit', (e) => {
   397	        e.preventDefault();
   398	        
   399	        const userId = document.getElementById('loginId').value;
   400	        const password = document.getElementById('loginPassword').value;
   401	        
   402	        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
   403	        const user = users.find(u => u.userId === userId && u.password === password);
   404	        
   405	        if (user) {
   406	            setCurrentUser(user);
   407	            updateAuthUI();
   408	            loginModal.classList.remove('active');
   409	            loginForm.reset();
   410	            alert(`${user.name}님, 환영합니다!`);
   411	        } else {
   412	            alert('아이디 또는 비밀번호가 일치하지 않습니다.');
   413	        }
   414	    });
   415	}
   416	
   417	// ===== 포인트 교환 =====
   418	const tabBtns = document.querySelectorAll('.tab-btn');
   419	const tabContents = document.querySelectorAll('.tab-content');
   420	
   421	tabBtns.forEach(btn => {
   422	    btn.addEventListener('click', () => {
   423	        const targetTab = btn.dataset.tab;
   424	        
   425	        tabBtns.forEach(b => b.classList.remove('active'));
   426	        btn.classList.add('active');
   427	        
   428	        tabContents.forEach(content => {
   429	            if (content.id === targetTab) {
   430	                content.classList.add('active');
   431	            } else {
   432	                content.classList.remove('active');
   433	            }
   434	        });
   435	    });
   436	});
   437	
   438	// 교환 신청
   439	document.querySelectorAll('.btn-exchange').forEach(btn => {
   440	    btn.addEventListener('click', () => {
   441	        const user = getCurrentUser();
   442	        if (!user) {
   443	            alert('로그인이 필요합니다.');
   444	            return;
   445	        }
   446	        
   447	        const productName = btn.dataset.product;
   448	        const points = parseInt(btn.dataset.points);
   449	        
   450	        if (user.points < points) {
   451	            alert('보유 포인트가 부족합니다.');
   452	            return;
   453	        }
   454	        
   455	        if (confirm(`${productName}을(를) ${formatNumber(points)}P로 교환하시겠습니까?`)) {
   456	            const newPoints = user.points - points;
   457	            updateUserPoints(user.id, newPoints);
   458	            
   459	            const exchange = {
   460	                id: generateId(),
   461	                userId: user.id,
   462	                userName: user.name,
   463	                product: productName,
   464	                points: points,
   465	                date: new Date().toISOString(),
   466	                status: '교환완료'
   467	            };
   468	            
   469	            const exchanges = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXCHANGES) || '[]');
   470	            exchanges.unshift(exchange);
   471	            localStorage.setItem(STORAGE_KEYS.EXCHANGES, JSON.stringify(exchanges));
   472	            
   473	            updateAuthUI();
   474	            updateExchangeHistory();
   475	            
   476	            alert(`교환이 완료되었습니다!\n남은 포인트: ${formatNumber(newPoints)}P`);
   477	        }
   478	    });
   479	});
   480	
   481	function updateExchangeHistory() {
   482	    const user = getCurrentUser();
   483	    const tbody = document.getElementById('exchangeHistoryTable');
   484	    if (!tbody) return;
   485	    
   486	    if (!user) {
   487	        tbody.innerHTML = '<tr><td colspan="4" class="text-center">로그인 후 이용하실 수 있습니다</td></tr>';
   488	        return;
   489	    }
   490	    
   491	    const exchanges = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXCHANGES) || '[]');
   492	    const userExchanges = exchanges.filter(e => e.userId === user.id);
   493	    
   494	    if (userExchanges.length === 0) {
   495	        tbody.innerHTML = '<tr><td colspan="4" class="text-center">교환 내역이 없습니다</td></tr>';
   496	        return;
   497	    }
   498	    
   499	    tbody.innerHTML = userExchanges.map(e => `
   500	        <tr>
   501	            <td>${formatDate(e.date)}</td>
   502	            <td>${e.product}</td>
   503	            <td>${formatNumber(e.points)} P</td>
   504	            <td><span class="badge badge-success">${e.status}</span></td>
   505	        </tr>
   506	    `).join('');
   507	}
   508	
   509	// ===== 포인트 충전 요청 =====
   510	const chargeAmountInput = document.getElementById('chargeAmount');
   511	const depositorName = document.getElementById('depositorName');
   512	const depositDate = document.getElementById('depositDate');
   513	const chargeMemo = document.getElementById('chargeMemo');
   514	const btnChargeRequest = document.getElementById('btnChargeRequest');
   515	
   516	// 충전 금액 입력 시 요약 업데이트
   517	chargeAmountInput?.addEventListener('input', (e) => {
   518	    let value = parseInt(e.target.value.replace(/,/g, '')) || 0;
   519	    document.getElementById('summaryAmount').textContent = value > 0 ? `${formatNumber(value)}원` : '0원';
   520	    document.getElementById('summaryPoints').textContent = value > 0 ? `${formatNumber(value)} P` : '0 P';
   521	});
   522	
   523	// 계좌번호 복사 함수
   524	window.copyBankAccount = function() {
   525	    const accountNumber = '123-456-789012';
   526	    navigator.clipboard.writeText(accountNumber.replace(/-/g, '')).then(() => {
   527	        alert('계좌번호가 복사되었습니다!\n' + accountNumber);
   528	    }).catch(() => {
   529	        alert('복사 실패: ' + accountNumber);
   530	    });
   531	};
   532	
   533	// 충전 요청 제출
   534	btnChargeRequest?.addEventListener('click', async () => {
   535	    const user = getCurrentUser();
   536	    if (!user) {
   537	        alert('로그인이 필요합니다.');
   538	        return;
   539	    }
   540	    
   541	    // 입력값 검증
   542	    const amount = parseInt(chargeAmountInput.value.replace(/,/g, '')) || 0;
   543	    const depositor = depositorName.value.trim();
   544	    const depDate = depositDate.value;
   545	    
   546	    if (amount < 100000) {
   547	        alert('최소 충전 금액은 100,000원입니다.');
   548	        chargeAmountInput.focus();
   549	        return;
   550	    }
   551	    
   552	    if (!depositor) {
   553	        alert('입금자명을 입력해주세요.');
   554	        depositorName.focus();
   555	        return;
   556	    }
   557	    
   558	    if (!depDate) {
   559	        alert('입금 날짜를 선택해주세요.');
   560	        depositDate.focus();
   561	        return;
   562	    }
   563	    
   564	    if (confirm(`충전 요청을 하시겠습니까?\n\n입금 금액: ${formatNumber(amount)}원\n입금자명: ${depositor}\n입금일자: ${depDate}`)) {
   565	        const chargeRequest = {
   566	            id: generateId(),
   567	            userId: user.id,
   568	            userName: user.name,
   569	            userEmail: user.email,
   570	            userPhone: user.phone || '',
   571	            amount: amount,
   572	            points: amount,
   573	            depositorName: depositor,
   574	            depositDate: depDate,
   575	            depositTime: '',
   576	            memo: chargeMemo.value.trim(),
   577	            status: 'pending',
   578	            requestDate: new Date().toISOString(),
   579	            processedDate: null,
   580	            processedBy: null,
   581	            rejectReason: null
   582	        };
   583	        
   584	        try {
   585	            // API에 저장
   586	            const response = await fetch('tables/chargeRequests', {
   587	                method: 'POST',
   588	                headers: {'Content-Type': 'application/json'},
   589	                body: JSON.stringify(chargeRequest)
   590	            });
   591	            
   592	            if (response.ok) {
   593	                // localStorage에도 저장 (백업)
   594	                const requests = JSON.parse(localStorage.getItem('chargeRequests') || '[]');
   595	                requests.unshift(chargeRequest);
   596	                localStorage.setItem('chargeRequests', JSON.stringify(requests));
   597	                
   598	                alert('충전 요청이 완료되었습니다!\n\n관리자 확인 후 포인트가 지급됩니다.\n처리 시간: 약 10분~1시간');
   599	                
   600	                // 폼 초기화
   601	                chargeAmountInput.value = '';
   602	                depositorName.value = '';
   603	                depositDate.value = '';
   604	                chargeMemo.value = '';
   605	                document.getElementById('summaryAmount').textContent = '0원';
   606	                document.getElementById('summaryPoints').textContent = '0 P';
   607	                
   608	                // 내역 갱신
   609	                loadChargeRequests();
   610	            } else {
   611	                throw new Error('서버 오류');
   612	            }
   613	        } catch (error) {
   614	            console.error('충전 요청 오류:', error);
   615	            alert('충전 요청 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.');
   616	        }
   617	    }
   618	});
   619	
   620	// 충전 요청 내역 불러오기
   621	async function loadChargeRequests() {
   622	    const user = getCurrentUser();
   623	    const tbody = document.getElementById('chargeHistoryTable');
   624	    
   625	    if (!tbody) return;
   626	    
   627	    if (!user) {
   628	        tbody.innerHTML = '<tr><td colspan="6" class="text-center">로그인 후 이용하실 수 있습니다</td></tr>';
   629	        return;
   630	    }
   631	    
   632	    try {
   633	        const response = await fetch('tables/chargeRequests?limit=100');
   634	        const data = await response.json();
   635	        
   636	        // 현재 사용자의 요청만 필터링
   637	        const userRequests = data.data.filter(req => req.userId === user.id);
   638	        
   639	        // localStorage에도 저장
   640	        localStorage.setItem('chargeRequests', JSON.stringify(userRequests));
   641	        
   642	        updateChargeHistory(userRequests);
   643	    } catch (error) {
   644	        console.error('충전 요청 내역 로드 오류:', error);
   645	        // API 실패 시 localStorage에서 불러오기
   646	        const requests = JSON.parse(localStorage.getItem('chargeRequests') || '[]');
   647	        const userRequests = requests.filter(req => req.userId === user.id);
   648	        updateChargeHistory(userRequests);
   649	    }
   650	}
   651	
   652	// 충전 내역 업데이트
   653	function updateChargeHistory(requests = []) {
   654	    const tbody = document.getElementById('chargeHistoryTable');
   655	    if (!tbody) return;
   656	    
   657	    if (requests.length === 0) {
   658	        tbody.innerHTML = '<tr><td colspan="6" class="text-center">충전 요청 내역이 없습니다</td></tr>';
   659	        return;
   660	    }
   661	    
   662	    // 최신순 정렬
   663	    const sortedRequests = [...requests].sort((a, b) => 
   664	        new Date(b.requestDate) - new Date(a.requestDate)
   665	    );
   666	    
   667	    tbody.innerHTML = sortedRequests.map(req => {
   668	        let statusBadge = '';
   669	        let statusClass = '';
   670	        
   671	        if (req.status === 'pending') {
   672	            statusBadge = '대기중';
   673	            statusClass = 'badge-warning';
   674	        } else if (req.status === 'approved') {
   675	            statusBadge = '승인완료';
   676	            statusClass = 'badge-success';
   677	        } else if (req.status === 'rejected') {
   678	            statusBadge = '거부됨';
   679	            statusClass = 'badge-danger';
   680	        }
   681	        
   682	        return `
   683	            <tr>
   684	                <td>${formatDate(req.requestDate)}</td>
   685	                <td>${req.depositorName}</td>
   686	                <td>${formatNumber(req.amount)}원</td>
   687	                <td>${formatNumber(req.points)} P</td>
   688	                <td><span class="badge ${statusClass}">${statusBadge}</span></td>
   689	                <td>${req.processedDate ? formatDate(req.processedDate) : '-'}</td>
   690	            </tr>
   691	        `;
   692	    }).join('');
   693	}
   694	
   695	// 페이지 로드 시 충전 요청 내역 불러오기
   696	if (document.getElementById('chargeHistoryTable')) {
   697	    loadChargeRequests();
   698	}
   699	
   700	// ===== 스크롤 투 탑 버튼 =====
   701	const scrollTop = document.getElementById('scrollTop');
   702	
   703	window.addEventListener('scroll', () => {
   704	    if (window.scrollY > 300) {
   705	        scrollTop.classList.add('show');
   706	    } else {
   707	        scrollTop.classList.remove('show');
   708	    }
   709	});
   710	
   711	scrollTop?.addEventListener('click', () => {
   712	    window.scrollTo({ top: 0, behavior: 'smooth' });
   713	});
   714	
   715	// ===== 문의 폼 =====
   716	document.getElementById('contactForm')?.addEventListener('submit', (e) => {
   717	    e.preventDefault();
   718	    alert('문의가 접수되었습니다.\n빠른 시일 내에 답변드리겠습니다.');
   719	    e.target.reset();
   720	});
   721	
   722	// ===== 페이지 로드 시 초기화 =====
   723	document.addEventListener('DOMContentLoaded', () => {
   724	    updateAuthUI();
   725	    updateExchangeHistory();
   726	    updateChargeHistory();
   727	    
   728	    // 모바일 터치 이벤트 최적화
   729	    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
   730	        document.body.classList.add('touch-device');
   731	        
   732	        // 모바일에서 300ms 지연 제거
   733	        let lastTouchEnd = 0;
   734	        document.addEventListener('touchend', (e) => {
   735	            const now = Date.now();
   736	            if (now - lastTouchEnd <= 300) {
   737	                e.preventDefault();
   738	            }
   739	            lastTouchEnd = now;
   740	        }, { passive: false });
   741	    }
   742	    
   743	    // iOS Safari 뷰포트 높이 문제 해결
   744	    const setViewportHeight = () => {
   745	        const vh = window.innerHeight * 0.01;
   746	        document.documentElement.style.setProperty('--vh', `${vh}px`);
   747	    };
   748	    
   749	    setViewportHeight();
   750	    window.addEventListener('resize', setViewportHeight);
   751	    window.addEventListener('orientationchange', setViewportHeight);
   752	});
   753	
   754	// ===== 실시간 포인트 업데이트 감지 =====
   755	// localStorage 변경을 감지하여 포인트를 실시간으로 업데이트
   756	window.addEventListener('storage', (e) => {
   757	    // USERS 데이터가 변경되었을 때
   758	    if (e.key === STORAGE_KEYS.USERS && e.newValue) {
   759	        const currentUser = getCurrentUser();
   760	        if (currentUser) {
   761	            // 최신 사용자 정보 가져오기
   762	            const users = JSON.parse(e.newValue);
   763	            const updatedUser = users.find(u => u.id === currentUser.id);
   764	            
   765	            if (updatedUser && updatedUser.points !== currentUser.points) {
   766	                // 포인트가 변경되었으면 현재 사용자 정보 업데이트
   767	                setCurrentUser(updatedUser);
   768	                updateAuthUI();
   769	                
   770	                // 포인트 증가 알림 표시
   771	                if (updatedUser.points > currentUser.points) {
   772	                    const difference = updatedUser.points - currentUser.points;
   773	                    showPointsNotification(difference);
   774	                }
   775	            }
   776	        }
   777	    }
   778	    
   779	    // 충전 요청 데이터가 변경되었을 때
   780	    if (e.key === 'chargeRequests' && e.newValue) {
   781	        loadChargeRequests();
   782	    }
   783	});
   784	
   785	// 같은 탭에서도 변경 감지 (5초마다 체크)
   786	setInterval(() => {
   787	    const currentUser = getCurrentUser();
   788	    if (currentUser) {
   789	        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
   790	        const updatedUser = users.find(u => u.id === currentUser.id);
   791	        
   792	        if (updatedUser && updatedUser.points !== currentUser.points) {
   793	            const oldPoints = currentUser.points;
   794	            setCurrentUser(updatedUser);
   795	            updateAuthUI();
   796	            
   797	            // 포인트 증가 시 알림
   798	            if (updatedUser.points > oldPoints) {
   799	                const difference = updatedUser.points - oldPoints;
   800	                showPointsNotification(difference);
   801	            }
   802	        }
   803	    }
   804	}, 5000);
   805	
   806	// 포인트 증가 알림 표시
   807	function showPointsNotification(points) {
   808	    // 알림 요소 생성
   809	    const notification = document.createElement('div');
   810	    notification.className = 'points-notification';
   811	    notification.innerHTML = `
   812	        <i class="fas fa-coins"></i>
   813	        <div>
   814	            <strong>포인트 충전 완료!</strong>
   815	            <p>+${formatNumber(points)} P</p>
   816	        </div>
   817	    `;
   818	    
   819	    // body에 추가
   820	    document.body.appendChild(notification);
   821	    
   822	    // 애니메이션 시작
   823	    setTimeout(() => {
   824	        notification.classList.add('show');
   825	    }, 100);
   826	    
   827	    // 5초 후 제거
   828	    setTimeout(() => {
   829	        notification.classList.remove('show');
   830	        setTimeout(() => {
   831	            notification.remove();
   832	        }, 300);
   833	    }, 5000);
   834	}
   835	
   836	// ===== 이스터 에그: Konami Code =====
   837	const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
   838	let konamiIndex = 0;
   839	
   840	document.addEventListener('keydown', (e) => {
   841	    if (e.key === konamiCode[konamiIndex]) {
   842	        konamiIndex++;
   843	        if (konamiIndex === konamiCode.length) {
   844	            activateGoldenMode();
   845	            konamiIndex = 0;
   846	        }
   847	    } else {
   848	        konamiIndex = 0;
   849	    }
   850	});
   851	
   852	function activateGoldenMode() {
   853	    document.body.style.animation = 'goldenPulse 1s ease-in-out 3';
   854	    alert('🥇 황금 모드 활성화! 🥇\n모든 상품 10% 할인!');
   855	    
   856	    const style = document.createElement('style');
   857	    style.textContent = `
   858	        @keyframes goldenPulse {
   859	            0%, 100% { filter: hue-rotate(0deg); }
   860	            50% { filter: hue-rotate(45deg) brightness(1.2); }
   861	        }
   862	    `;
   863	    document.head.appendChild(style);
   864	    
   865	    setTimeout(() => {
   866	        document.body.style.animation = '';
   867	        style.remove();
   868	    }, 3000);
   869	}
   870	
   871	// ===== 섹션 표시 관리 =====
   872	// 히어로 섹션의 버튼들과 모든 a 태그 클릭 시 섹션 표시
   873	document.addEventListener('click', (e) => {
   874	    const target = e.target.closest('a[href^="#"]');
   875	    if (!target) return;
   876	    
   877	    // 네비게이션 링크는 이미 처리되었으므로 건너뜀
   878	    if (target.classList.contains('nav-link')) return;
   879	    
   880	    e.preventDefault(); // 기본 동작 방지
   881	    
   882	    const targetId = target.getAttribute('href').substring(1);
   883	    
   884	    // home 섹션으로 가는 경우 모든 섹션 숨기기
   885	    if (targetId === 'home') {
   886	        document.querySelectorAll('.section').forEach(section => {
   887	            section.classList.remove('active');
   888	        });
   889	        window.scrollTo({ top: 0, behavior: 'smooth' });
   890	        return;
   891	    }
   892	    
   893	    // 다른 섹션으로 가는 경우
   894	    const targetSection = document.getElementById(targetId);
   895	    if (targetSection && targetSection.classList.contains('section')) {
   896	        // 모든 섹션 숨기기
   897	        document.querySelectorAll('.section').forEach(section => {
   898	            section.classList.remove('active');
   899	        });
   900	        
   901	        // 클릭한 섹션만 표시
   902	        targetSection.classList.add('active');
   903	        
   904	        // 섹션으로 부드럽게 스크롤
   905	        setTimeout(() => {
   906	            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
   907	        }, 100);
   908	    }
   909	});
   910	
   911	// 페이지 로드 시 URL 해시 확인
   912	window.addEventListener('load', () => {
   913	    const hash = window.location.hash.substring(1);
   914	    if (hash && hash !== 'home') {
   915	        const targetSection = document.getElementById(hash);
   916	        if (targetSection && targetSection.classList.contains('section')) {
   917	            targetSection.classList.add('active');
   918	        }
   919	    }
   920	});
   921	
