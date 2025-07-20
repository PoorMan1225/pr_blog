import generateUUID from "../../utils/uuid.js";
import { apiFetch } from "../../utils/api.js";

document.addEventListener("DOMContentLoaded", function () {
    const categoryMap = {};
    const $mainSection = document.querySelector('.container .main__section');
    
    // 최초 섹션 정보 받아오기
    window.addEventListener('sideMenuClick', async function (ev) {
        try {
            const { section_title, url } = ev.detail;
            $mainSection.innerHTML = await apiFetch(url,
                {
                    method: 'GET',
                    headers: {
                        'Content_type': 'application/json',
                        'Accept': 'text/html'
                    }
                });
            const $title = document.querySelector('.category__container .title');
            $title.textContent = section_title;
        } catch (e) {
            // todo : 에러 페이지로 리다이렉트 할 수 도 있다.
           console.log(e);
        }
    });
    
    function childMenuItemDisabled($childDiv, isDisabled) {
        $childDiv.querySelector(".btn__add").style.display = isDisabled ? 'none' : 'block';              // 자식은 추가 버튼 없음
        $childDiv.querySelector('.select__container').style.display = isDisabled ? 'none' : 'block';                           // 자식은 주제 선택 없음
        $childDiv.querySelector('.selected__title__box').style.display = isDisabled ? 'none' : 'block';                        // 자식은 주제 선택 없음
        $childDiv.querySelector('.icon__block.subtree').style.display = isDisabled ? 'none' : 'block';
    }
    
    function changeItemDropIcon($element, icon, replaceIcon) {
        $element.classList.replace(icon, replaceIcon);
    }
    
    document.addEventListener("click", function (event) {
        const $target = event.target;
        
        // root 에서 추가 버튼 누를시 동작
        if ($target.closest('.category__root .btns__default button') || $target.closest('.category__bottom__add')) {
            const type = $target.dataset.type;
            console.log($target);
            if (type !== "add") return;
            const id = generateUUID();
            const item = new CategoryMenuItem();
            categoryMap[id] = item;
            
            const $div = createCategoryItem(id, item);
            document.querySelector(".category__controller").appendChild($div);
        }
        
        // 자식 관련된 추가 삭제
        if ($target.closest(".btn__add") ) {
            const $div = $target.closest(".category__item");
            if (!$div) return;
            // data 매핑
            const parentId = $div.id;
            const childId = generateUUID();
            const childItem = new CategoryMenuItem(parentId);
            categoryMap[childId] = childItem;
            
            const $childDiv = createCategoryItem(childId, childItem);
            childMenuItemDisabled($childDiv, true);
            
            // 형제 요소를 만들고 자식을 삽임
            const next = $div.nextElementSibling;
            const isContainer = next ? next.classList.contains('child__container') : false;
            let $childContainer;
            if (!isContainer) {
                $childContainer = document.createElement('div');
                $childContainer.className = 'child__container';
                $childContainer.style.marginLeft = '50px';
                $div.insertAdjacentElement("afterend", $childContainer);
            }
            $childContainer = $div.nextElementSibling;
            $childContainer.appendChild($childDiv);
            $childContainer.style.display = 'block';
            
            // 추가시 arrow icon 추가
            const $span = $div.querySelector('.icon__block.subtree span');
            const $iconBlock = $span.closest('.icon__block.subtree');
            $iconBlock.classList.add('active');
            // 마지막 아이탬 포커스 추가
            
            $childContainer.querySelector('.child__container .category__item:last-child input[type="text"]').focus();
            changeItemDropIcon($span, 'none', 'arrow_icon');
        }
        
        if ($target.closest(".btn__edit")) {
            const $div = $target.closest(".category__item");
            const $input = $div.querySelector("input[type='text']");
            const $btnConfirm = $div.querySelector(".btn__confirm");
            
            $div.dataset.type = "edit";
            $input.disabled = false;
            $btnConfirm.disabled = true;
        }
        
        if ($target.closest(".btn__delete")) {
            const $div = $target.closest(".category__item");
            if (!$div) return;
            const parentId = categoryMap[$div.id].parentId;
            if (parentId) {  // 자식 아이탬인 경우
                // 부모 element 를 가지고 와서
                const $parentElement = document.getElementById(parentId);
                const $childContainer = $div.closest('.child__container');
                delete categoryMap[$div.id];
                $div.remove();
                
                // 자식 아이탬이 없을 경우 icon 변경
                if ($childContainer.children.length <= 0) {
                    // 부모 아이탬이 있을 경우에 자식 하나씩 삭제시 icon 을 none 으로 변경해야한다.
                    const $span = $parentElement.querySelector('.icon__block.subtree span');
                    changeItemDropIcon($span, 'arrow_icon', 'none');
                }
                return;
            }
            
            // 부모 일경우 자식들을 찾아서 하나씩 지워줘야 한다.
            const $next = $div.nextElementSibling;
            if(!$next || !$next.classList.contains('.child__container')) {
                $div.remove();
                return;
            }
            // 컨테이너 아래 자식 들 모두 삭제
            $next.querySelectorAll('.child__container > .category__item').forEach(($childItem) => {
                delete categoryMap[$childItem.id];
                $childItem.remove();
            })
            $next.remove();
            $div.remove();
            delete categoryMap[$div.id];
        }
        
        if ($target.closest(".btn__cancel")) {
            const $div = $target.closest(".category__item");
            const $input = $div.querySelector("input[type='text']");
            const parentId = categoryMap[$div.id]?.parentId;
            const $childContainer = $div.closest('.child__container');
            
            // 자식일 경우 그냥 자기자신을 지우면된다.
            if ($div.dataset.type === "add") {
                $div.remove();
                delete categoryMap[$div.id];
            } else {
                // confirm 상태일 경우 삭제하면 안되니까 return 해야된다.
                $div.dataset.type = "confirm";
                $input.disabled = true;
                return;
            }
            // 부모아이디가 잇는 경우만 취소시 아이콘 변경
            if (!parentId) return;
            
            // 컨테이너의 자식이 존재하지 부모의 아이콘을 변경해준다.
            const $parentElement = document.getElementById(parentId);
            if ($childContainer.children.length <= 0) {
                const $span = $parentElement.querySelector('.icon__block.subtree span');
                changeItemDropIcon($span, 'arrow_icon', 'none');
            }
        }
        
        if ($target.closest(".btn__confirm")) {
            const $div = $target.closest(".category__item");
            const item = categoryMap[$div.id];
            const $input = $div.querySelector("input[type='text']");
            const $selectedBox = $div.querySelector(".selected__title");
            
            if (!item.categoryTitle.trim()) return;
            $div.dataset.type = "confirm";
            // 자식 노드는 selectedBox 없음
            if ($selectedBox) $selectedBox.textContent = item.categoryTag;
            $input.disabled = true;
        }
        
        // 아이콘 클릭시 발동
        if ($target.closest('.icon__block.subtree')) {
            const $iconBlock = $target.closest('.icon__block.subtree');
            let $span = $target.closest('span');
            // 부모요소 클릭시 초기화
            if (!$span) $span = $iconBlock.querySelector('span');
            
            if ($span.className === 'none') return;
            // 접기 버튼 활성화 시 child item 모두 접음
            const $parentElement = $iconBlock.closest('.category__item');
            const $childContainer = $parentElement.nextElementSibling;
            // 컨테이너 존재하지 않을 경우 리턴
            if (!$childContainer || !$childContainer.classList.contains('child__container')) return;
            
            if (!$iconBlock.classList.contains('active')) {   // 펼치기
                $iconBlock.classList.add('active');
                $childContainer.style.display = 'block';
                $childContainer.querySelector('.child__container .category__item:last-child input[type="text"]').focus();
            } else {                                        // 접기
                $iconBlock.classList.remove('active');
                $childContainer.style.display = 'none';
            }
        }
        
        if ($target.closest(".select__container button")) {
            const $container = $target.closest(".select__container");
            $container.classList.toggle("active");
        }
        
        if ($target.closest(".select__menus li")) {
            const $div = $target.closest(".category__item");
            const $container = $div.querySelector(".select__container");
            const $title = $container.querySelector(".select__menu__title");
            const value = $target.textContent;
            
            categoryMap[$div.id].updateTag(value);
            $title.textContent = value;
            $container.classList.remove("active");
        }
    });
    
    document.addEventListener("input", function (event) {
        const $input = event.target;
        if (!$input.matches("input[type='text']")) return;
        
        const $div = $input.closest(".category__item");
        const $btnConfirm = $div.querySelector(".btn__confirm");
        const text = $input.value.trim();
        
        categoryMap[$div.id].updateTitle(text);
        $btnConfirm.disabled = !text;
    });
    
    class CategoryMenuItem {
        constructor(parentId = null, title = "", tag = "주제 없음") {
            this.parentId = parentId;
            this.categoryTitle = title;
            this.categoryTag = tag;
        }
        
        updateTag(tag) {
            this.categoryTag = tag;
        }
        
        updateTitle(title) {
            this.categoryTitle = title;
        }
    }
    
    function createCategoryItem(id, categoryItem) {
        const $div = document.createElement("div");
        $div.className = "category__item";
        $div.id = id;
        $div.dataset.type = "add";
        $div.innerHTML = `
      <div class="left">
        <div class="icons">
          <div class="icon__block subtree"><span class="none"></span></div>
          <div class="icon__block drag"><span class="icon"></span></div>
        </div>
        <label><input class="ellipsis" type="text"></label>
        <div class="selected__title__box">
          <span class="selected__title"></span>
        </div>
        <div class="select__container">
          <button>
            <span class="select__menu__title">${categoryItem.categoryTag}</span>
            <span class="icon__dropdown"></span>
          </button>
          <ul class="select__menus">
            <li>주제없음</li>
            <li>주제선정1</li>
            <li>주제선정2</li>
            <li>주제선정3</li>
            <li>주제선정4</li>
            <li>주제선정5</li>
          </ul>
        </div>
      </div>
      <div class="right">
        <div class="btns__edit">
          <button class="btn__cancel">취소</button>
          <button disabled class="btn__confirm">확인</button>
        </div>
        <div class="btns__default">
          <button class="btn__add">추가</button>
          <button class="btn__edit">수정</button>
          <button class="btn__delete">삭제</button>
        </div>
      </div>`;
        return $div;
    }
});
