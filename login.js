// 관리자 로그인 스크립트
document.addEventListener('DOMContentLoaded', function() {
    // 요소 선택
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberCheckbox = document.getElementById('remember');
    const loginError = document.getElementById('login-error');
    const togglePasswordBtn = document.querySelector('.toggle-password');
    
    // 관리자 계정 정보 (실제로는 서버 측에서 처리해야 함)
    const ADMIN_USERNAME = 'josm0106';
    const ADMIN_PASSWORD = 'whtpaud';
    
    // 저장된 로그인 정보 불러오기
    loadSavedCredentials();
    
    // 비밀번호 보기/숨기기 토글
    togglePasswordBtn.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            togglePasswordBtn.classList.remove('fa-eye');
            togglePasswordBtn.classList.add('fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            togglePasswordBtn.classList.remove('fa-eye-slash');
            togglePasswordBtn.classList.add('fa-eye');
        }
    });
    
    // 로그인 폼 제출 처리
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        // 간단한 유효성 검사
        if (!username || !password) {
            loginError.textContent = '아이디와 비밀번호를 모두 입력해주세요.';
            return;
        }
        
        // 인증 확인 (실제로는 서버 측에서 처리해야 함)
        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            // 인증 성공
            loginError.textContent = '';
            
            // 로그인 정보 저장 처리
            if (rememberCheckbox.checked) {
                saveCredentials(username, password);
            } else {
                clearSavedCredentials();
            }
            
            // 인증 세션 저장
            setAuthSession();
            
            // 관리자 페이지로 리디렉션
            window.location.href = 'admin.html';
        } else {
            // 인증 실패
            loginError.textContent = '아이디 또는 비밀번호가 올바르지 않습니다.';
            passwordInput.value = '';
        }
    });
    
    // 저장된 로그인 정보 불러오기
    function loadSavedCredentials() {
        const savedUsername = localStorage.getItem('admin_username');
        const savedPassword = localStorage.getItem('admin_password');
        
        if (savedUsername && savedPassword) {
            usernameInput.value = savedUsername;
            passwordInput.value = savedPassword;
            rememberCheckbox.checked = true;
        }
    }
    
    // 로그인 정보 저장
    function saveCredentials(username, password) {
        localStorage.setItem('admin_username', username);
        localStorage.setItem('admin_password', password);
    }
    
    // 저장된 로그인 정보 삭제
    function clearSavedCredentials() {
        localStorage.removeItem('admin_username');
        localStorage.removeItem('admin_password');
    }
    
    // 인증 세션 설정 (24시간)
    function setAuthSession() {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        
        localStorage.setItem('admin_auth', 'true');
        localStorage.setItem('admin_auth_expires', expiresAt.toISOString());
    }
}); 