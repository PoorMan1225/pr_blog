import {apiFetch} from "../utils/api.js";

document.addEventListener("DOMContentLoaded", function () {
    const $listMenus = document.querySelectorAll('.managed__container .list__menu li');
    const $mainSection = document.querySelector('.container .main__section');
    
    $listMenus.forEach(($menu) => {
        $menu.addEventListener('click', async function (ev) {
            const $li = ev.target;
            // active 붙은 메뉴들 제거
            clearActiveMenu($listMenus);
            // active 추가
            $li.classList.add('active');
            
            const url = $li.dataset.url;
            // 비동기로 html 받기
            try {
                $mainSection.innerHTML = await apiFetch(url,
                    {
                        method: 'GET',
                        headers: {
                            'Content_type': 'application/json',
                            'Accept': 'text/html'
                        }
                    });
                
                // side 메뉴 클릭시 발생 커스텀 이벤트
                const title = $menu.textContent;
                window.dispatchEvent(new CustomEvent("sideMenuClick", {
                    detail: {
                        section_title: title,
                        url: url
                    }
                }));
            } catch (err) {
                console.log(err);
            }
        });
    })
});

function clearActiveMenu($listMenu) {
    $listMenu.forEach(($menu) => {
        $menu.classList.remove('active');
    })
}