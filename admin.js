// 예약 관리 페이지 스크립트
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 상태 확인
    checkAuth();
    
    // 로그아웃 버튼 설정
    document.getElementById('logout-btn').addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    // 요소 선택
    const viewDateInput = document.getElementById('view-date');
    const prevDateBtn = document.getElementById('prev-date');
    const nextDateBtn = document.getElementById('next-date');
    const reservationTbody = document.getElementById('reservation-tbody');
    const noReservationsDiv = document.getElementById('no-reservations');
    const detailModal = document.getElementById('reservation-detail-modal');
    const closeDetailBtn = document.getElementById('close-detail');
    const deleteReservationBtn = document.getElementById('delete-reservation');
    
    // 선택된 예약 ID를 저장하는 변수
    let selectedReservationId = null;
    
    // 날짜 기본값 설정 (오늘)
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    viewDateInput.value = `${year}-${month}-${day}`;
    
    // 저장소에서 모든 예약 데이터 가져오기
    function getAllReservations() {
        const reservationsJson = localStorage.getItem('reservations');
        return reservationsJson ? JSON.parse(reservationsJson) : [];
    }
    
    // 선택한 날짜의 예약 데이터 가져오기
    function getReservationsByDate(date) {
        const allReservations = getAllReservations();
        return allReservations.filter(reservation => reservation.date === date);
    }
    
    // 예약 데이터를 테이블에 표시
    function displayReservations(selectedDate) {
        const reservations = getReservationsByDate(selectedDate);
        reservationTbody.innerHTML = '';
        
        if (reservations.length === 0) {
            noReservationsDiv.style.display = 'block';
            document.getElementById('reservation-table').style.display = 'none';
            return;
        }
        
        noReservationsDiv.style.display = 'none';
        document.getElementById('reservation-table').style.display = 'table';
        
        // 시간 순으로 정렬
        reservations.sort((a, b) => {
            return a.time.localeCompare(b.time);
        });
        
        reservations.forEach(reservation => {
            const row = document.createElement('tr');
            
            // 예약 시간
            const timeCell = document.createElement('td');
            timeCell.textContent = reservation.time;
            row.appendChild(timeCell);
            
            // 예약자 이름
            const nameCell = document.createElement('td');
            nameCell.textContent = reservation.name;
            row.appendChild(nameCell);
            
            // 연락처
            const phoneCell = document.createElement('td');
            phoneCell.textContent = formatPhone(reservation.phone);
            row.appendChild(phoneCell);
            
            // 진료분야
            const departmentCell = document.createElement('td');
            departmentCell.textContent = reservation.departmentText;
            row.appendChild(departmentCell);
            
            // 증상 메모 (줄여서 표시)
            const messageCell = document.createElement('td');
            messageCell.textContent = reservation.message 
                ? (reservation.message.length > 20 
                    ? reservation.message.substring(0, 20) + '...' 
                    : reservation.message)
                : '-';
            row.appendChild(messageCell);
            
            // 관리 버튼
            const actionCell = document.createElement('td');
            
            const viewBtn = document.createElement('button');
            viewBtn.innerHTML = '<i class="fas fa-eye"></i>';
            viewBtn.className = 'action-btn view';
            viewBtn.title = '상세보기';
            viewBtn.addEventListener('click', () => showReservationDetail(reservation.id));
            actionCell.appendChild(viewBtn);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteBtn.className = 'action-btn delete';
            deleteBtn.title = '예약취소';
            deleteBtn.addEventListener('click', () => confirmDeleteReservation(reservation.id));
            actionCell.appendChild(deleteBtn);
            
            row.appendChild(actionCell);
            
            reservationTbody.appendChild(row);
        });
    }
    
    // 전화번호 형식화 (010-1234-5678)
    function formatPhone(phone) {
        phone = phone.replace(/[^0-9]/g, '');
        return phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    }
    
    // 예약 상세 정보 표시
    function showReservationDetail(reservationId) {
        const allReservations = getAllReservations();
        const reservation = allReservations.find(r => r.id === reservationId);
        
        if (!reservation) return;
        
        selectedReservationId = reservationId;
        
        document.getElementById('detail-id').textContent = reservation.id;
        document.getElementById('detail-name').textContent = reservation.name;
        document.getElementById('detail-phone').textContent = formatPhone(reservation.phone);
        document.getElementById('detail-datetime').textContent = `${reservation.date} ${reservation.time}`;
        document.getElementById('detail-department').textContent = reservation.departmentText;
        document.getElementById('detail-message').textContent = reservation.message || '-';
        document.getElementById('detail-created').textContent = reservation.created;
        
        openModal(detailModal);
    }
    
    // 예약 삭제 확인
    function confirmDeleteReservation(reservationId) {
        if (confirm('이 예약을 취소하시겠습니까?')) {
            deleteReservation(reservationId);
        }
    }
    
    // 예약 삭제 처리
    function deleteReservation(reservationId) {
        let allReservations = getAllReservations();
        allReservations = allReservations.filter(r => r.id !== reservationId);
        
        localStorage.setItem('reservations', JSON.stringify(allReservations));
        
        if (detailModal.classList.contains('show')) {
            closeModal(detailModal);
        }
        
        displayReservations(viewDateInput.value);
    }
    
    // 날짜 변경 시 예약 데이터 새로고침
    viewDateInput.addEventListener('change', function() {
        displayReservations(this.value);
    });
    
    // 이전 날짜 버튼
    prevDateBtn.addEventListener('click', function() {
        const currentDate = new Date(viewDateInput.value);
        currentDate.setDate(currentDate.getDate() - 1);
        
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        
        viewDateInput.value = `${year}-${month}-${day}`;
        displayReservations(viewDateInput.value);
    });
    
    // 다음 날짜 버튼
    nextDateBtn.addEventListener('click', function() {
        const currentDate = new Date(viewDateInput.value);
        currentDate.setDate(currentDate.getDate() + 1);
        
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        
        viewDateInput.value = `${year}-${month}-${day}`;
        displayReservations(viewDateInput.value);
    });
    
    // 모달 닫기 버튼
    closeDetailBtn.addEventListener('click', function() {
        closeModal(detailModal);
    });
    
    // 상세 보기에서 예약 취소 버튼
    deleteReservationBtn.addEventListener('click', function() {
        if (selectedReservationId && confirm('이 예약을 취소하시겠습니까?')) {
            deleteReservation(selectedReservationId);
        }
    });
    
    // 모달 X 버튼 닫기
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', function() {
            closeModal(this.closest('.modal'));
        });
    });
    
    // 모달 외부 클릭 시 닫기
    window.addEventListener('click', function(event) {
        if (event.target === detailModal) {
            closeModal(detailModal);
        }
    });
    
    // 모달 열기 함수
    function openModal(modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
    
    // 모달 닫기 함수
    function closeModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    
    // 로그인 상태 확인
    function checkAuth() {
        const isAuthenticated = localStorage.getItem('admin_auth');
        const authExpires = localStorage.getItem('admin_auth_expires');
        
        // 인증되지 않았거나 만료된 경우
        if (!isAuthenticated || !authExpires || new Date(authExpires) < new Date()) {
            // 인증 정보 삭제
            localStorage.removeItem('admin_auth');
            localStorage.removeItem('admin_auth_expires');
            
            // 로그인 페이지로 리디렉션
            window.location.href = 'login.html';
            return false;
        }
        
        return true;
    }
    
    // 로그아웃 함수
    function logout() {
        // 인증 정보 삭제
        localStorage.removeItem('admin_auth');
        localStorage.removeItem('admin_auth_expires');
        
        // 로그인 페이지로 리디렉션
        window.location.href = 'login.html';
    }
    
    // 초기 데이터 로드
    displayReservations(viewDateInput.value);
}); 