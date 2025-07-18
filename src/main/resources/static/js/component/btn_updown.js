let onScrollDown = null;
let onScrollUp = null;

document.addEventListener('DOMContentLoaded', () => {
    const $btnUp = document.querySelector('.btn__up');
    const $btnDown = document.querySelector('.btn__down');
    
    $btnUp.addEventListener('click', (ev) => {
        // 기본 동작 (예: 부드럽게 위로 스크롤)
        window.scrollTo({top: 0, behavior: 'smooth'});
        
        // 사용자 정의 콜백 호출
        if (typeof onScrollUp === 'function') {
            onScrollUp();
        }
    });
    
    $btnDown.addEventListener('click', () => {
        // 기본 동작 (예: 부드럽게 아래로 스크롤)
        window.scrollTo({
            top: document.body.scrollHeight,
            left: 0,
            behavior: 'smooth'
        });
        
        // 사용자 정의 콜백 호출
        if (typeof onScrollDown === 'function') {
            onScrollDown();
        }
    });
});

// 외부에서 콜백 등록
export function setOnScrollUp(callback) {
    onScrollUp = callback;
}

export function setOnScrollDown(callback) {
    onScrollDown = callback;
}