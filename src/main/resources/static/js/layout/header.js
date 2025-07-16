document.addEventListener('DOMContentLoaded', function () {
    initEvent();
});

function initEvent() {
    const $menu = document.querySelector('header .header__nav .nav__menu');
    const $closeIcon = $menu.querySelector('.icon__close');
    const $menuIcon = $menu.querySelector('.icon__menu');
    
    $menu.addEventListener('click', () => {
        toggleMenuIcons($closeIcon, $menuIcon);
    });
    
    // 모바일 화면에서 확장되었는지 이벤트 체크
    window.addEventListener('viewportChanged', (event) => {
        const { isViewChanged } = event.detail;
        // close icon 으로 닫기
        if(!$closeIcon.classList.contains('hide')) {
            $closeIcon.classList.add('hide');
        }
        if($menuIcon.classList.contains('hide')) {
            $menuIcon.classList.remove('hide');
        }
    })
}

// header 토클 아이콘 클릭시 실행 애니메이션
function toggleMenuIcons($closeIcon, $menuIcon) {
    const isCloseHidden = $closeIcon.classList.contains('hide');
    
    if (isCloseHidden) {
        $closeIcon.classList.remove('hide');
        $menuIcon.classList.add('hide');
    } else {
        $closeIcon.classList.add('hide');
        $menuIcon.classList.remove('hide');
    }
    // 커스텀 이벤트 등록
    window.dispatchEvent(new CustomEvent("toggleMenuIcon", {
        detail: {
            open: isCloseHidden
        }
    }));
}


