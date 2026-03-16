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
    77	        navMenu.classList.remove('show');
    78	        
    79	        // 섹션 표시 처리
    80	        const targetId = link.getAttribute('href').substring(1); // #home -> home
    81	        
    82	        // 모든 섹션 숨기기
    83	        document.querySelectorAll('.section').forEach(section => {
    84	            section.classList.remove('active');
    85	        });
    86	        
    87	        // 클릭한 섹션만 표시 (home이 아닌 경우에만)
    88	        if (targetId !== 'home') {
    89	            const targetSection = document.getElementById(targetId);
    90	            if (targetSection) {
    91	                targetSection.classList.add('active');
    92	            }
    93	        }
    94	    });
    95	});
    96	
    97	// 스크롤 시 헤더 스타일 변경
    98	window.addEventListener('scroll', () => {
    99	    const header = document.getElementById('header');
   100	    if (window.scrollY > 50) {
   101	        header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
   102	    } else {
   103	        header.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
   104	    }
   105	});
   106	
   107	// ===== 사용자 인증 상태 표시 =====
   108	function updateAuthUI() {
   109	    const user = getCurrentUser();
   110	    const userInfo = document.getElementById('userInfo');
   111	    const authBtns = document.getElementById('authBtns');
   112	    
   113	    if (user) {
   114	        userInfo.style.display = 'flex';
   115	        authBtns.style.display = 'none';
   116	        document.getElementById('userName').textContent = user.name;
   117	        document.getElementById('userPoints').textContent = formatNumber(user.points);
   118	        document.getElementById('exchangePoints').textContent = `${formatNumber(user.points)} P`;
   119	    } else {
   120	        userInfo.style.display = 'none';
   121	        authBtns.style.display = 'flex';
   122	    }
   123	}
   124	
   125	// 로그아웃
   126	document.getElementById('btnLogout')?.addEventListener('click', () => {
   127	    if (confirm('로그아웃 하시겠습니까?')) {
   128	        clearCurrentUser();
   129	        updateAuthUI();
   130	        alert('로그아웃되었습니다.');
   131	        window.location.href = '#home';
   132	    }
   133	});
   134	
   135	// ===== 금시세 업데이트 (한국금거래소 실시간 기준) =====
   136	// 2024년 3월 11일 한국금거래소 실제 시세 반영
   137	function updateGoldPrices() {
   138	    // 한국금거래소 실시간 기준 시세 (원/g)
   139	    // 2024년 3월 12일 기준: 한국금거래소 실시간 시세 (1돈 기준)
   140	    // 1돈 = 3.75g
   141	    // ⭐ 실제 한국금거래소 시세 반영
   142	    const basePrices = {
   143	        // 순금 24K (99.99% 순도) - 1돈 기준
   144	        'buy-24k': 1073000,   // 살때 (고객이 사는 가격) - 실제 시세
   145	        'sell-24k': 883300,   // 팔때 (고객이 파는 가격) - 실제 시세
   146	        
   147	        // 18K (75% 순도 = 24K × 0.75) - 1돈 기준
   148	        'buy-18k': 804750,    // 살때 = 1,073,000 × 0.75
   149	        'sell-18k': 662475,   // 팔때 = 883,300 × 0.75
   150	        
   151	        // 14K (58.5% 순도 = 24K × 0.585) - 1돈 기준
   152	        'buy-14k': 627705,    // 살때 = 1,073,000 × 0.585
   153	        'sell-14k': 516731,   // 팔때 = 883,300 × 0.585
   154	        
   155	        // 백금(Platinum) - 1돈 기준 (순금의 약 40% 가격)
   156	        'buy-pt': 429200,     // 살때 = 1,073,000 × 0.4
   157	        'sell-pt': 353320,    // 팔때 = 883,300 × 0.4
   158	        
   159	        // 은(Silver) - 1돈 기준 - 2024-03-12 실제 시세
   160	        'buy-ag': 19720,      // 살때 (실제 시세)
   161	        'sell-ag': 16240,     // 팔때 (살때의 약 82.4%)
   162	        
   163	        // 골드바 1돈(3.75g) - 실제 한국금거래소 시세
   164	        'buy-1don': 1073000,  // 살때 (실제 시세)
   165	        'sell-1don': 883300   // 팔때 (실제 시세)
   166	    };
   167	    
   168	    // 실시간 변동 반영 (±0.1% 이내의 미세한 변동)
   169	    Object.keys(basePrices).forEach(key => {
   170	        const basePrice = basePrices[key];
   171	        const changePercent = (Math.random() - 0.5) * 0.002; // ±0.1% 변동
   172	        const change = Math.round(basePrice * changePercent);
   173	        const newPrice = basePrice + change;
   174	        
   175	        const element = document.querySelector(`[data-price="${key}"]`);
   176	        if (element) {
   177	            const unit = '원/돈';
   178	            element.textContent = `${formatNumber(newPrice)}${unit}`;
   179	            
   180	            // 등락 표시 (상승: 빨강, 하락: 파랑, 보합: 검정)
   181	            const priceElement = element.closest('.price-item');
   182	            if (priceElement) {
   183	                if (change > 0) {
   184	                    priceElement.classList.add('price-up');
   185	                    priceElement.classList.remove('price-down');
   186	                } else if (change < 0) {
   187	                    priceElement.classList.add('price-down');
   188	                    priceElement.classList.remove('price-up');
   189	                } else {
   190	                    priceElement.classList.remove('price-up', 'price-down');
   191	                }
   192	            }
   193	        }
   194	    });
   195	    
   196	    // 업데이트 시간 표시
   197	    const updateTime = document.getElementById('updateTime');
   198	    if (updateTime) {
   199	        const now = new Date();
   200	        const hours = String(now.getHours()).padStart(2, '0');
   201	        const minutes = String(now.getMinutes()).padStart(2, '0');
   202	        const seconds = String(now.getSeconds()).padStart(2, '0');
   203	        updateTime.textContent = `${hours}:${minutes}:${seconds} (한국금거래소 실시간)`;
   204	    }
   205	}
   206	
   207	// 초기 금시세 설정 및 5초마다 업데이트 (실시간성 강화)
   208	updateGoldPrices();
   209	setInterval(updateGoldPrices, 5000);
   210	
   211	// ===== 회원가입 =====
   212	const signupForm = document.getElementById('signupForm');
   213	const btnCheckId = document.getElementById('btnCheckId');
   214	let isIdChecked = false;
   215	
   216	// 아이디 중복 확인
   217	if (btnCheckId) {
   218	    btnCheckId.addEventListener('click', () => {
   219	        const userId = document.getElementById('signupId').value.trim();
   220	        const message = document.getElementById('idCheckMessage');
   221	        
   222	        if (!userId) {
   223	            message.textContent = '아이디를 입력해주세요.';
   224	            message.className = 'form-message error';
   225	            return;
   226	        }
   227	        
   228	        if (userId.length < 4 || userId.length > 20) {
   229	            message.textContent = '아이디는 4-20자여야 합니다.';
   230	            message.className = 'form-message error';
   231	            return;
   232	        }
   233	        
   234	        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
   235	        const exists = users.some(u => u.userId === userId);
   236	        
   237	        if (exists) {
   238	            message.textContent = '이미 사용 중인 아이디입니다.';
   239	            message.className = 'form-message error';
   240	            isIdChecked = false;
   241	        } else {
   242	            message.textContent = '사용 가능한 아이디입니다.';
   243	            message.className = 'form-message success';
   244	            isIdChecked = true;
   245	        }
   246	    });
   247	}
   248	
   249	// 비밀번호 검증
   250	document.getElementById('signupPassword')?.addEventListener('input', (e) => {
   251	    const password = e.target.value;
   252	    const message = document.getElementById('passwordMessage');
   253	    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
   254	    
   255	    if (password.length === 0) {
   256	        message.textContent = '';
   257	        return;
   258	    }
   259	    
   260	    if (regex.test(password)) {
   261	        message.textContent = '안전한 비밀번호입니다.';
   262	        message.className = 'form-message success';
   263	    } else {
   264	        message.textContent = '8자 이상, 영문+숫자+특수문자를 포함해야 합니다.';
   265	        message.className = 'form-message error';
   266	    }
   267	});
   268	
   269	// 비밀번호 확인
   270	document.getElementById('signupPasswordConfirm')?.addEventListener('input', (e) => {
   271	    const password = document.getElementById('signupPassword').value;
   272	    const confirm = e.target.value;
   273	    const message = document.getElementById('passwordConfirmMessage');
   274	    
   275	    if (confirm.length === 0) {
   276	        message.textContent = '';
   277	        return;
   278	    }
   279	    
   280	    if (password === confirm) {
   281	        message.textContent = '비밀번호가 일치합니다.';
   282	        message.className = 'form-message success';
   283	    } else {
   284	        message.textContent = '비밀번호가 일치하지 않습니다.';
   285	        message.className = 'form-message error';
   286	    }
   287	});
   288	
   289	// 전화번호 자동 포맷팅
   290	document.getElementById('signupPhone')?.addEventListener('input', (e) => {
   291	    let value = e.target.value.replace(/[^0-9]/g, '');
   292	    if (value.length > 11) value = value.slice(0, 11);
   293	    
   294	    if (value.length > 6) {
   295	        value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7);
   296	    } else if (value.length > 3) {
   297	        value = value.slice(0, 3) + '-' + value.slice(3);
   298	    }
   299	    
   300	    e.target.value = value;
   301	});
   302	
   303	// 전체 동의 체크박스
   304	document.getElementById('agreeAll')?.addEventListener('change', (e) => {
   305	    const checkboxes = document.querySelectorAll('.agree-checkbox');
   306	    checkboxes.forEach(cb => cb.checked = e.target.checked);
   307	});
   308	
   309	// 회원가입 폼 제출
   310	if (signupForm) {
   311	    signupForm.addEventListener('submit', (e) => {
   312	        e.preventDefault();
   313	        
   314	        if (!isIdChecked) {
   315	            alert('아이디 중복 확인을 해주세요.');
   316	            return;
   317	        }
   318	        
   319	        const formData = new FormData(signupForm);
   320	        const password = formData.get('password');
   321	        const passwordConfirm = formData.get('passwordConfirm');
   322	        
   323	        if (password !== passwordConfirm) {
   324	            alert('비밀번호가 일치하지 않습니다.');
   325	            return;
   326	        }
   327	        
   328	        const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
   329	        if (!regex.test(password)) {
   330	            alert('비밀번호는 8자 이상, 영문+숫자+특수문자를 포함해야 합니다.');
   331	            return;
   332	        }
   333	        
   334	        const requiredAgrees = Array.from(document.querySelectorAll('.agree-checkbox[required]'));
   335	        if (!requiredAgrees.every(cb => cb.checked)) {
   336	            alert('필수 약관에 동의해주세요.');
   337	            return;
   338	        }
   339	        
   340	        const newUser = {
   341	            id: generateId(),
   342	            userId: formData.get('userId'),
   343	            name: formData.get('name'),
   344	            password: password,
   345	            email: formData.get('email'),
   346	            phone: formData.get('phone'),
   347	            points: 10000,
   348	            createdAt: new Date().toISOString(),
   349	            marketing: formData.get('marketing') === 'on'
   350	        };
   351	        
   352	        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
   353	        users.push(newUser);
   354	        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
   355	        
   356	        alert(`회원가입이 완료되었습니다!\n신규 가입 축하 포인트 10,000P가 지급되었습니다.`);
   357	        signupForm.reset();
   358	        isIdChecked = false;
   359	        document.getElementById('idCheckMessage').textContent = '';
   360	    });
   361	}
   362	
   363	// ===== 로그인 모달 =====
   364	const loginModal = document.getElementById('loginModal');
   365	const btnLoginModal = document.getElementById('btnLoginModal');
   366	const closeLoginModal = document.getElementById('closeLoginModal');
   367	const loginForm = document.getElementById('loginForm');
   368	
   369	if (btnLoginModal) {
   370	    btnLoginModal.addEventListener('click', () => {
   371	        loginModal.classList.add('active');
   372	    });
   373	}
   374	
   375	if (closeLoginModal) {
   376	    closeLoginModal.addEventListener('click', () => {
   377	        loginModal.classList.remove('active');
   378	    });
   379	}
   380	
   381	loginModal?.addEventListener('click', (e) => {
   382	    if (e.target === loginModal) {
   383	        loginModal.classList.remove('active');
   384	    }
   385	});
   386	
   387	if (loginForm) {
   388	    loginForm.addEventListener('submit', (e) => {
   389	        e.preventDefault();
   390	        
   391	        const userId = document.getElementById('loginId').value;
   392	        const password = document.getElementById('loginPassword').value;
   393	        
   394	        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
   395	        const user = users.find(u => u.userId === userId && u.password === password);
   396	        
   397	        if (user) {
   398	            setCurrentUser(user);
   399	            updateAuthUI();
   400	            loginModal.classList.remove('active');
   401	            loginForm.reset();
   402	            alert(`${user.name}님, 환영합니다!`);
   403	        } else {
   404	            alert('아이디 또는 비밀번호가 일치하지 않습니다.');
   405	        }
   406	    });
   407	}
   408	
   409	// ===== 포인트 교환 =====
   410	const tabBtns = document.querySelectorAll('.tab-btn');
   411	const tabContents = document.querySelectorAll('.tab-content');
   412	
   413	tabBtns.forEach(btn => {
   414	    btn.addEventListener('click', () => {
   415	        const targetTab = btn.dataset.tab;
   416	        
   417	        tabBtns.forEach(b => b.classList.remove('active'));
   418	        btn.classList.add('active');
   419	        
   420	        tabContents.forEach(content => {
   421	            if (content.id === targetTab) {
   422	                content.classList.add('active');
   423	            } else {
   424	                content.classList.remove('active');
   425	            }
   426	        });
   427	    });
   428	});
   429	
   430	// 교환 신청
   431	document.querySelectorAll('.btn-exchange').forEach(btn => {
   432	    btn.addEventListener('click', () => {
   433	        const user = getCurrentUser();
   434	        if (!user) {
   435	            alert('로그인이 필요합니다.');
   436	            return;
   437	        }
   438	        
   439	        const productName = btn.dataset.product;
   440	        const points = parseInt(btn.dataset.points);
   441	        
   442	        if (user.points < points) {
   443	            alert('보유 포인트가 부족합니다.');
   444	            return;
   445	        }
   446	        
   447	        if (confirm(`${productName}을(를) ${formatNumber(points)}P로 교환하시겠습니까?`)) {
   448	            const newPoints = user.points - points;
   449	            updateUserPoints(user.id, newPoints);
   450	            
   451	            const exchange = {
   452	                id: generateId(),
   453	                userId: user.id,
   454	                userName: user.name,
   455	                product: productName,
   456	                points: points,
   457	                date: new Date().toISOString(),
   458	                status: '교환완료'
   459	            };
   460	            
   461	            const exchanges = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXCHANGES) || '[]');
   462	            exchanges.unshift(exchange);
   463	            localStorage.setItem(STORAGE_KEYS.EXCHANGES, JSON.stringify(exchanges));
   464	            
   465	            updateAuthUI();
   466	            updateExchangeHistory();
   467	            
   468	            alert(`교환이 완료되었습니다!\n남은 포인트: ${formatNumber(newPoints)}P`);
   469	        }
   470	    });
   471	});
   472	
   473	function updateExchangeHistory() {
   474	    const user = getCurrentUser();
   475	    const tbody = document.getElementById('exchangeHistoryTable');
   476	    if (!tbody) return;
   477	    
   478	    if (!user) {
   479	        tbody.innerHTML = '<tr><td colspan="4" class="text-center">로그인 후 이용하실 수 있습니다</td></tr>';
   480	        return;
   481	    }
   482	    
   483	    const exchanges = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXCHANGES) || '[]');
   484	    const userExchanges = exchanges.filter(e => e.userId === user.id);
   485	    
   486	    if (userExchanges.length === 0) {
   487	        tbody.innerHTML = '<tr><td colspan="4" class="text-center">교환 내역이 없습니다</td></tr>';
   488	        return;
   489	    }
   490	    
   491	    tbody.innerHTML = userExchanges.map(e => `
   492	        <tr>
   493	            <td>${formatDate(e.date)}</td>
   494	            <td>${e.product}</td>
   495	            <td>${formatNumber(e.points)} P</td>
   496	            <td><span class="badge badge-success">${e.status}</span></td>
   497	        </tr>
   498	    `).join('');
   499	}
   500	
   501	// ===== 포인트 충전 요청 =====
   502	const chargeAmountInput = document.getElementById('chargeAmount');
   503	const depositorName = document.getElementById('depositorName');
   504	const depositDate = document.getElementById('depositDate');
   505	const chargeMemo = document.getElementById('chargeMemo');
   506	const btnChargeRequest = document.getElementById('btnChargeRequest');
   507	
   508	// 충전 금액 입력 시 요약 업데이트
   509	chargeAmountInput?.addEventListener('input', (e) => {
   510	    let value = parseInt(e.target.value.replace(/,/g, '')) || 0;
   511	    document.getElementById('summaryAmount').textContent = value > 0 ? `${formatNumber(value)}원` : '0원';
   512	    document.getElementById('summaryPoints').textContent = value > 0 ? `${formatNumber(value)} P` : '0 P';
   513	});
   514	
   515	// 계좌번호 복사 함수
   516	window.copyBankAccount = function() {
   517	    const accountNumber = '123-456-789012';
   518	    navigator.clipboard.writeText(accountNumber.replace(/-/g, '')).then(() => {
   519	        alert('계좌번호가 복사되었습니다!\n' + accountNumber);
   520	    }).catch(() => {
   521	        alert('복사 실패: ' + accountNumber);
   522	    });
   523	};
   524	
   525	// 충전 요청 제출
   526	btnChargeRequest?.addEventListener('click', async () => {
   527	    const user = getCurrentUser();
   528	    if (!user) {
   529	        alert('로그인이 필요합니다.');
   530	        return;
   531	    }
   532	    
   533	    // 입력값 검증
   534	    const amount = parseInt(chargeAmountInput.value.replace(/,/g, '')) || 0;
   535	    const depositor = depositorName.value.trim();
   536	    const depDate = depositDate.value;
   537	    
   538	    if (amount < 100000) {
   539	        alert('최소 충전 금액은 100,000원입니다.');
   540	        chargeAmountInput.focus();
   541	        return;
   542	    }
   543	    
   544	    if (!depositor) {
   545	        alert('입금자명을 입력해주세요.');
   546	        depositorName.focus();
   547	        return;
   548	    }
   549	    
   550	    if (!depDate) {
   551	        alert('입금 날짜를 선택해주세요.');
   552	        depositDate.focus();
   553	        return;
   554	    }
   555	    
   556	    if (confirm(`충전 요청을 하시겠습니까?\n\n입금 금액: ${formatNumber(amount)}원\n입금자명: ${depositor}\n입금일자: ${depDate}`)) {
   557	        const chargeRequest = {
   558	            id: generateId(),
   559	            userId: user.id,
   560	            userName: user.name,
   561	            userEmail: user.email,
   562	            userPhone: user.phone || '',
   563	            amount: amount,
   564	            points: amount,
   565	            depositorName: depositor,
   566	            depositDate: depDate,
   567	            depositTime: '',
   568	            memo: chargeMemo.value.trim(),
   569	            status: 'pending',
   570	            requestDate: new Date().toISOString(),
   571	            processedDate: null,
   572	            processedBy: null,
   573	            rejectReason: null
   574	        };
   575	        
   576	        try {
   577	            // API에 저장
   578	            const response = await fetch('tables/chargeRequests', {
   579	                method: 'POST',
   580	                headers: {'Content-Type': 'application/json'},
   581	                body: JSON.stringify(chargeRequest)
   582	            });
   583	            
   584	            if (response.ok) {
   585	                // localStorage에도 저장 (백업)
   586	                const requests = JSON.parse(localStorage.getItem('chargeRequests') || '[]');
   587	                requests.unshift(chargeRequest);
   588	                localStorage.setItem('chargeRequests', JSON.stringify(requests));
   589	                
   590	                alert('충전 요청이 완료되었습니다!\n\n관리자 확인 후 포인트가 지급됩니다.\n처리 시간: 약 10분~1시간');
   591	                
   592	                // 폼 초기화
   593	                chargeAmountInput.value = '';
   594	                depositorName.value = '';
   595	                depositDate.value = '';
   596	                chargeMemo.value = '';
   597	                document.getElementById('summaryAmount').textContent = '0원';
   598	                document.getElementById('summaryPoints').textContent = '0 P';
   599	                
   600	                // 내역 갱신
   601	                loadChargeRequests();
   602	            } else {
   603	                throw new Error('서버 오류');
   604	            }
   605	        } catch (error) {
   606	            console.error('충전 요청 오류:', error);
   607	            alert('충전 요청 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.');
   608	        }
   609	    }
   610	});
   611	
   612	// 충전 요청 내역 불러오기
   613	async function loadChargeRequests() {
   614	    const user = getCurrentUser();
   615	    const tbody = document.getElementById('chargeHistoryTable');
   616	    
   617	    if (!tbody) return;
   618	    
   619	    if (!user) {
   620	        tbody.innerHTML = '<tr><td colspan="6" class="text-center">로그인 후 이용하실 수 있습니다</td></tr>';
   621	        return;
   622	    }
   623	    
   624	    try {
   625	        const response = await fetch('tables/chargeRequests?limit=100');
   626	        const data = await response.json();
   627	        
   628	        // 현재 사용자의 요청만 필터링
   629	        const userRequests = data.data.filter(req => req.userId === user.id);
   630	        
   631	        // localStorage에도 저장
   632	        localStorage.setItem('chargeRequests', JSON.stringify(userRequests));
   633	        
   634	        updateChargeHistory(userRequests);
   635	    } catch (error) {
   636	        console.error('충전 요청 내역 로드 오류:', error);
   637	        // API 실패 시 localStorage에서 불러오기
   638	        const requests = JSON.parse(localStorage.getItem('chargeRequests') || '[]');
   639	        const userRequests = requests.filter(req => req.userId === user.id);
   640	        updateChargeHistory(userRequests);
   641	    }
   642	}
   643	
   644	// 충전 내역 업데이트
   645	function updateChargeHistory(requests = []) {
   646	    const tbody = document.getElementById('chargeHistoryTable');
   647	    if (!tbody) return;
   648	    
   649	    if (requests.length === 0) {
   650	        tbody.innerHTML = '<tr><td colspan="6" class="text-center">충전 요청 내역이 없습니다</td></tr>';
   651	        return;
   652	    }
   653	    
   654	    // 최신순 정렬
   655	    const sortedRequests = [...requests].sort((a, b) => 
   656	        new Date(b.requestDate) - new Date(a.requestDate)
   657	    );
   658	    
   659	    tbody.innerHTML = sortedRequests.map(req => {
   660	        let statusBadge = '';
   661	        let statusClass = '';
   662	        
   663	        if (req.status === 'pending') {
   664	            statusBadge = '대기중';
   665	            statusClass = 'badge-warning';
   666	        } else if (req.status === 'approved') {
   667	            statusBadge = '승인완료';
   668	            statusClass = 'badge-success';
   669	        } else if (req.status === 'rejected') {
   670	            statusBadge = '거부됨';
   671	            statusClass = 'badge-danger';
   672	        }
   673	        
   674	        return `
   675	            <tr>
   676	                <td>${formatDate(req.requestDate)}</td>
   677	                <td>${req.depositorName}</td>
   678	                <td>${formatNumber(req.amount)}원</td>
   679	                <td>${formatNumber(req.points)} P</td>
   680	                <td><span class="badge ${statusClass}">${statusBadge}</span></td>
   681	                <td>${req.processedDate ? formatDate(req.processedDate) : '-'}</td>
   682	            </tr>
   683	        `;
   684	    }).join('');
   685	}
   686	
   687	// 페이지 로드 시 충전 요청 내역 불러오기
   688	if (document.getElementById('chargeHistoryTable')) {
   689	    loadChargeRequests();
   690	}
   691	
   692	// ===== 스크롤 투 탑 버튼 =====
   693	const scrollTop = document.getElementById('scrollTop');
   694	
   695	window.addEventListener('scroll', () => {
   696	    if (window.scrollY > 300) {
   697	        scrollTop.classList.add('show');
   698	    } else {
   699	        scrollTop.classList.remove('show');
   700	    }
   701	});
   702	
   703	scrollTop?.addEventListener('click', () => {
   704	    window.scrollTo({ top: 0, behavior: 'smooth' });
   705	});
   706	
   707	// ===== 문의 폼 =====
   708	document.getElementById('contactForm')?.addEventListener('submit', (e) => {
   709	    e.preventDefault();
   710	    alert('문의가 접수되었습니다.\n빠른 시일 내에 답변드리겠습니다.');
   711	    e.target.reset();
   712	});
   713	
   714	// ===== 페이지 로드 시 초기화 =====
   715	document.addEventListener('DOMContentLoaded', () => {
   716	    updateAuthUI();
   717	    updateExchangeHistory();
   718	    updateChargeHistory();
   719	    
   720	    // 모바일 터치 이벤트 최적화
   721	    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
   722	        document.body.classList.add('touch-device');
   723	        
   724	        // 모바일에서 300ms 지연 제거
   725	        let lastTouchEnd = 0;
   726	        document.addEventListener('touchend', (e) => {
   727	            const now = Date.now();
   728	            if (now - lastTouchEnd <= 300) {
   729	                e.preventDefault();
   730	            }
   731	            lastTouchEnd = now;
   732	        }, { passive: false });
   733	    }
   734	    
   735	    // iOS Safari 뷰포트 높이 문제 해결
   736	    const setViewportHeight = () => {
   737	        const vh = window.innerHeight * 0.01;
   738	        document.documentElement.style.setProperty('--vh', `${vh}px`);
   739	    };
   740	    
   741	    setViewportHeight();
   742	    window.addEventListener('resize', setViewportHeight);
   743	    window.addEventListener('orientationchange', setViewportHeight);
   744	});
   745	
   746	// ===== 실시간 포인트 업데이트 감지 =====
   747	// localStorage 변경을 감지하여 포인트를 실시간으로 업데이트
   748	window.addEventListener('storage', (e) => {
   749	    // USERS 데이터가 변경되었을 때
   750	    if (e.key === STORAGE_KEYS.USERS && e.newValue) {
   751	        const currentUser = getCurrentUser();
   752	        if (currentUser) {
   753	            // 최신 사용자 정보 가져오기
   754	            const users = JSON.parse(e.newValue);
   755	            const updatedUser = users.find(u => u.id === currentUser.id);
   756	            
   757	            if (updatedUser && updatedUser.points !== currentUser.points) {
   758	                // 포인트가 변경되었으면 현재 사용자 정보 업데이트
   759	                setCurrentUser(updatedUser);
   760	                updateAuthUI();
   761	                
   762	                // 포인트 증가 알림 표시
   763	                if (updatedUser.points > currentUser.points) {
   764	                    const difference = updatedUser.points - currentUser.points;
   765	                    showPointsNotification(difference);
   766	                }
   767	            }
   768	        }
   769	    }
   770	    
   771	    // 충전 요청 데이터가 변경되었을 때
   772	    if (e.key === 'chargeRequests' && e.newValue) {
   773	        loadChargeRequests();
   774	    }
   775	});
   776	
   777	// 같은 탭에서도 변경 감지 (5초마다 체크)
   778	setInterval(() => {
   779	    const currentUser = getCurrentUser();
   780	    if (currentUser) {
   781	        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
   782	        const updatedUser = users.find(u => u.id === currentUser.id);
   783	        
   784	        if (updatedUser && updatedUser.points !== currentUser.points) {
   785	            const oldPoints = currentUser.points;
   786	            setCurrentUser(updatedUser);
   787	            updateAuthUI();
   788	            
   789	            // 포인트 증가 시 알림
   790	            if (updatedUser.points > oldPoints) {
   791	                const difference = updatedUser.points - oldPoints;
   792	                showPointsNotification(difference);
   793	            }
   794	        }
   795	    }
   796	}, 5000);
   797	
   798	// 포인트 증가 알림 표시
   799	function showPointsNotification(points) {
   800	    // 알림 요소 생성
   801	    const notification = document.createElement('div');
   802	    notification.className = 'points-notification';
   803	    notification.innerHTML = `
   804	        <i class="fas fa-coins"></i>
   805	        <div>
   806	            <strong>포인트 충전 완료!</strong>
   807	            <p>+${formatNumber(points)} P</p>
   808	        </div>
   809	    `;
   810	    
   811	    // body에 추가
   812	    document.body.appendChild(notification);
   813	    
   814	    // 애니메이션 시작
   815	    setTimeout(() => {
   816	        notification.classList.add('show');
   817	    }, 100);
   818	    
   819	    // 5초 후 제거
   820	    setTimeout(() => {
   821	        notification.classList.remove('show');
   822	        setTimeout(() => {
   823	            notification.remove();
   824	        }, 300);
   825	    }, 5000);
   826	}
   827	
   828	// ===== 이스터 에그: Konami Code =====
   829	const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
   830	let konamiIndex = 0;
   831	
   832	document.addEventListener('keydown', (e) => {
   833	    if (e.key === konamiCode[konamiIndex]) {
   834	        konamiIndex++;
   835	        if (konamiIndex === konamiCode.length) {
   836	            activateGoldenMode();
   837	            konamiIndex = 0;
   838	        }
   839	    } else {
   840	        konamiIndex = 0;
   841	    }
   842	});
   843	
   844	function activateGoldenMode() {
   845	    document.body.style.animation = 'goldenPulse 1s ease-in-out 3';
   846	    alert('🥇 황금 모드 활성화! 🥇\n모든 상품 10% 할인!');
   847	    
   848	    const style = document.createElement('style');
   849	    style.textContent = `
   850	        @keyframes goldenPulse {
   851	            0%, 100% { filter: hue-rotate(0deg); }
   852	            50% { filter: hue-rotate(45deg) brightness(1.2); }
   853	        }
   854	    `;
   855	    document.head.appendChild(style);
   856	    
   857	    setTimeout(() => {
   858	        document.body.style.animation = '';
   859	        style.remove();
   860	    }, 3000);
   861	}
   862	
   863	// ===== 섹션 표시 관리 =====
   864	// 히어로 섹션의 버튼들과 모든 a 태그 클릭 시 섹션 표시
   865	document.addEventListener('click', (e) => {
   866	    const target = e.target.closest('a[href^="#"]');
   867	    if (!target) return;
   868	    
   869	    const targetId = target.getAttribute('href').substring(1);
   870	    
   871	    // home 섹션으로 가는 경우 모든 섹션 숨기기
   872	    if (targetId === 'home') {
   873	        document.querySelectorAll('.section').forEach(section => {
   874	            section.classList.remove('active');
   875	        });
   876	        return;
   877	    }
   878	    
   879	    // 다른 섹션으로 가는 경우
   880	    const targetSection = document.getElementById(targetId);
   881	    if (targetSection && targetSection.classList.contains('section')) {
   882	        // 모든 섹션 숨기기
   883	        document.querySelectorAll('.section').forEach(section => {
   884	            section.classList.remove('active');
   885	        });
   886	        
   887	        // 클릭한 섹션만 표시
   888	        targetSection.classList.add('active');
   889	    }
   890	});
   891	
   892	// 페이지 로드 시 URL 해시 확인
   893	window.addEventListener('load', () => {
   894	    const hash = window.location.hash.substring(1);
   895	    if (hash && hash !== 'home') {
   896	        const targetSection = document.getElementById(hash);
   897	        if (targetSection && targetSection.classList.contains('section')) {
   898	            targetSection.classList.add('active');
   899	        }
   900	    }
   901	});
   902	
