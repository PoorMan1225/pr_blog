document.addEventListener('DOMContentLoaded', function () {
    const $mobileNavWrapper = document.querySelector('.container .mobile_nav__wrapper');
    function isMobileWindow() {
        return window.innerWidth <= 700;
    }
    
    /* header custom event 수신 */
    window.addEventListener('toggleMenuIcon', (event) => {
        const { open } = event.detail;
        if(open) {
            $mobileNavWrapper.classList.remove('hide');
        } else {
            $mobileNavWrapper.classList.add('hide');
        }
    });
    
    let resizeTimer;
    // 디바운싱 적용 resize 이벤트가 너무 많이 발생
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        // 0.1초 뒤에만 해당 hide 코드 실행
        resizeTimer = setTimeout(() => {
            // 모바일 화면 범위를 넘었을때만 코드 실행 .
            if (!$mobileNavWrapper.classList.contains('hide')) {
                $mobileNavWrapper.classList.add('hide');
            }
            // 모바일 에서 확장될 경우 이벤트
            window.dispatchEvent(new CustomEvent("viewportChanged", {
                detail: {
                    isViewChanged: true
                }
            }));
        }, 100);
    });
});



