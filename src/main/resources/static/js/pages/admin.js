import {apiFetch} from "../utils/api.js";


document.addEventListener("DOMContentLoaded", function () {
    const $listMenus = document.querySelectorAll('.managed__container .list__menu li');
    
    
    let beforeUrl = '';
    $listMenus.forEach(($menu) => {
        $menu.addEventListener('click', async function (ev) {
            const $li = ev.target;
            // active 붙은 메뉴들 제거
            clearActiveMenu($listMenus);
            // active 추가
            $li.classList.add('active');
            const url = $li.dataset.url;
            if (beforeUrl === url) return;
            beforeUrl = url;
            
            // side 메뉴 클릭시 발생 커스텀 이벤트
            const title = $menu.textContent;
            window.dispatchEvent(new CustomEvent("sideMenuClick", {
                detail: {
                    section_title: title,
                    url: url
                }
            }));
        });
    })
});

function clearActiveMenu($listMenu) {
    $listMenu.forEach(($menu) => {
        $menu.classList.remove('active');
    })
}