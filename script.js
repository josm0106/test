// 스크롤 시 헤더 스타일 변경
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.padding = '10px 0';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.padding = '15px 0';
        header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
});

// 네비게이션 스무스 스크롤
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const headerHeight = document.querySelector('header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// 예약 모달 관련 스크립트
const reservationBtn = document.getElementById('reservation-btn');
const reservationModal = document.getElementById('reservation-modal');
const confirmationModal = document.getElementById('confirmation-modal');
const reservationForm = document.getElementById('reservation-form');
const closeBtns = document.querySelectorAll('.close');
const confirmCloseBtn = document.querySelector('.close-confirm-btn');

// 예약 관련 유틸리티 함수
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// 모든 예약 가져오기
function getAllReservations() {
    const reservationsJson = localStorage.getItem('reservations');
    return reservationsJson ? JSON.parse(reservationsJson) : [];
}

// 특정 날짜와 시간에 예약이 존재하는지 확인
function isTimeSlotBooked(date, time) {
    const allReservations = getAllReservations();
    return allReservations.some(reservation => 
        reservation.date === date && reservation.time === time
    );
}

// 특정 날짜의 예약된 시간대 가져오기
function getBookedTimeSlots(date) {
    const allReservations = getAllReservations();
    return allReservations
        .filter(reservation => reservation.date === date)
        .map(reservation => reservation.time);
}

// 예약 시간대 업데이트 (이미 예약된 시간대 비활성화)
function updateAvailableTimeSlots(selectedDate) {
    const timeSelect = document.getElementById('time');
    const bookedTimes = getBookedTimeSlots(selectedDate);
    
    // 시간 옵션 순회
    Array.from(timeSelect.options).forEach(option => {
        // 첫 번째 안내 옵션은 건너뜀
        if (option.value === '') return;
        
        // 이미 예약된 시간대인지 확인
        if (bookedTimes.includes(option.value)) {
            option.disabled = true;
            option.text = option.value + ' (예약 마감)';
        } else {
            option.disabled = false;
            option.text = option.value;
        }
    });
    
    // 선택된 시간이 비활성화되었으면 선택 초기화
    if (timeSelect.selectedIndex > 0 && timeSelect.options[timeSelect.selectedIndex].disabled) {
        timeSelect.selectedIndex = 0;
    }
}

// 예약 버튼 클릭 시 모달 열기
reservationBtn.addEventListener('click', function() {
    openModal(reservationModal);
    
    // 날짜 필드에 오늘 날짜 이후만 선택 가능하도록 설정
    const dateInput = document.getElementById('date');
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    dateInput.min = `${year}-${month}-${day}`;
    
    // 기본값으로 오늘 날짜 설정
    dateInput.value = `${year}-${month}-${day}`;
    
    // 선택된 날짜의 예약 가능 시간대 업데이트
    updateAvailableTimeSlots(dateInput.value);
});

// 날짜 변경 시 예약 가능 시간대 업데이트
document.getElementById('date').addEventListener('change', function() {
    updateAvailableTimeSlots(this.value);
});

// 닫기 버튼 클릭 시 모달 닫기
closeBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        closeModal(this.closest('.modal'));
    });
});

// 확인 모달 닫기 버튼
confirmCloseBtn.addEventListener('click', function() {
    closeModal(confirmationModal);
});

// 모달 외부 클릭 시 닫기
window.addEventListener('click', function(event) {
    if (event.target === reservationModal) {
        closeModal(reservationModal);
    }
    if (event.target === confirmationModal) {
        closeModal(confirmationModal);
    }
});

// 예약 폼 제출 처리
reservationForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 폼 데이터 수집
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const date = document.getElementById('date').value;
    const time = document.getElementById('time').value;
    const department = document.getElementById('department');
    const departmentText = department.options[department.selectedIndex].text;
    const message = document.getElementById('message').value;
    
    // 시간대가 이미 예약되었는지 재확인
    if (isTimeSlotBooked(date, time)) {
        alert('선택하신 시간대는 이미 예약이 완료되었습니다. 다른 시간대를 선택해주세요.');
        updateAvailableTimeSlots(date); // 시간대 다시 새로고침
        return;
    }
    
    // 예약 데이터 생성
    const reservation = {
        id: generateId(),
        name,
        phone,
        date,
        time,
        department: department.value,
        departmentText,
        message,
        created: new Date().toLocaleString()
    };
    
    // 기존 예약 데이터 가져오기
    const allReservations = getAllReservations();
    
    // 새 예약 추가 및 저장
    allReservations.push(reservation);
    localStorage.setItem('reservations', JSON.stringify(allReservations));
    
    // 확인 모달에 정보 표시
    document.getElementById('confirm-name').textContent = name;
    document.getElementById('confirm-phone').textContent = phone;
    document.getElementById('confirm-datetime').textContent = `${date} ${time}`;
    document.getElementById('confirm-department').textContent = departmentText;
    
    // 예약 모달 닫고 확인 모달 열기
    closeModal(reservationModal);
    setTimeout(() => {
        openModal(confirmationModal);
        // 폼 초기화
        reservationForm.reset();
    }, 300);
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

// 페이지 로드 애니메이션
document.addEventListener('DOMContentLoaded', function() {
    const heroContent = document.querySelector('.hero-content');
    const heroImage = document.querySelector('.hero-image');
    const infoCards = document.querySelectorAll('.info-card');
    
    heroContent.style.opacity = '0';
    heroImage.style.opacity = '0';
    heroContent.style.transform = 'translateX(-50px)';
    heroImage.style.transform = 'translateX(50px)';
    
    setTimeout(() => {
        heroContent.style.transition = 'all 1s ease';
        heroImage.style.transition = 'all 1s ease';
        heroContent.style.opacity = '1';
        heroImage.style.opacity = '1';
        heroContent.style.transform = 'translateX(0)';
        heroImage.style.transform = 'translateX(0)';
    }, 300);
    
    infoCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.6s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 800 + (index * 200));
    });
}); 