document.addEventListener('DOMContentLoaded', function () {
    initEvent();
});

function initEvent() {
    const $menu = document.querySelector('header .header__nav .nav__menu');
    const $closeIcon = $menu.querySelector('.icon__close');
    const $menuIcon = $menu.querySelector('.icon__menu');
    const $mobileNav = document.querySelector('.container .mobile_nav__wrapper');
    
    $menu.addEventListener('click', () => {
        toggleMenuIcons($closeIcon, $menuIcon, $mobileNav);
    });
    
    let resizeTimer;
    // 디바운싱 적용 resize 이벤트가 너무 많이 발생
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        // 모바일 화면 범위를 넘었을때만 코드 실행 .
        if (isMobileWindow()) return;
        // 0.1초 뒤에만 해당 hide 코드 실행
        resizeTimer = setTimeout(() => {
            if (!$mobileNav.classList.contains('hide')) {
                $mobileNav.classList.add('hide');
                $closeIcon.classList.add('hide');
                $menuIcon.classList.remove('hide');
            }
        }, 100);
    });
}

// header 토클 아이콘 클릭시 실행 애니메이션
function toggleMenuIcons($closeIcon, $menuIcon, $mobileNav) {
    const isCloseHidden = $closeIcon.classList.contains('hide');
    
    if (isCloseHidden) {
        $closeIcon.classList.remove('hide');
        $menuIcon.classList.add('hide');
        $mobileNav.classList.remove('hide');
    } else {
        $closeIcon.classList.add('hide');
        $menuIcon.classList.remove('hide');
        $mobileNav.classList.add('hide');
    }
}

function isMobileWindow() {
    return window.innerWidth <= 700;
}