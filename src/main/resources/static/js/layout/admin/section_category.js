import generateUUID from "../../utils/uuid.js";

document.addEventListener("DOMContentLoaded", function () {
    const categoryMap = {};
    
    document.addEventListener("click", function (event) {
        const $target = event.target;
        
        // root 에서 추가 버튼 누를시 동작
        if ($target.closest('.category__root .btns__default button')) {
            const type = $target.dataset.type;
            if (type !== "add") return;
            
            const id = generateUUID();
            const item = new CategoryMenuItem();
            categoryMap[id] = item;
            
            const $li = createCategoryItem(id, item);
            document.querySelector(".category__controller").appendChild($li);
        }
        
        // 버튼 타입별 분기 처리
        if ($target.closest(".btn__add")) {
            const $li = $target.closest(".category__item");
            if (!$li) return;
            const parentId = $li.id;
            const childId = generateUUID();
            const childItem = new CategoryMenuItem(parentId);
            categoryMap[childId] = childItem;
            
            const $childLi = createCategoryItem(childId, childItem);
            $childLi.querySelector(".btn__add").style.display = 'none';              // 자식은 추가 버튼 없음
            $childLi.querySelector('.select__container').style.display = 'none';     // 자식은 주제 선택 없음
            $childLi.querySelector('.selected__title__box').style.display = 'none';  // 자식은 주제 선택 없음
            $childLi.querySelector('.icon__block.subtree').style.display = 'none';
            
            // 형제 요소를 만들고 자식을 삽임
            const next = $li.nextElementSibling;
            const isContainer = next ? next.classList.contains('child__container') : false;
            let $listSub;
            if (!isContainer) {
                $listSub = document.createElement('div');
                $listSub.className = 'child__container';
                $listSub.style.marginLeft = '50px';
                $li.insertAdjacentElement("afterend", $listSub);
            }
            $listSub = $li.nextElementSibling;
            $listSub.appendChild($childLi);
            
            // arrow 접기 기능 추가해야함.
            const $parentLi = $li.closest('li');
            if(!$parentLi) return;
            $parentLi.querySelector('.icon__block.subtree span')
                .classList.replace('none', 'arrow_icon');
        }
        
        if ($target.closest(".btn__edit")) {
            const $li = $target.closest(".category__item");
            const $input = $li.querySelector("input[type='text']");
            const $btnConfirm = $li.querySelector(".btn__confirm");
            
            $li.dataset.type = "edit";
            $input.disabled = false;
            $btnConfirm.disabled = true;
        }
        
        if ($target.closest(".btn__delete")) {
            const $li = $target.closest(".category__item");
            if (!$li) return;
            // 자식일 경우 하나만 지우고
            const parentId = categoryMap[$li.id].parentId;
            if (parentId) {
                delete categoryMap[$li.id];
                $li.remove();
                return;
            }
            // 부모 일경우 자식들을 찾아서 하나씩 지워줘야 한다.
            const $next = $li.nextElementSibling;
            const isContainer = $next ? $next.classList.contains('child__container') : false;
            $next.querySelectorAll('li').forEach(($childLi) => {
                delete categoryMap[$childLi.id];
                $childLi.remove();
            })
            $li.remove();
        }
        
        if ($target.closest(".btn__cancel")) {
            const $li = $target.closest(".category__item");
            const $input = $li.querySelector("input[type='text']");
            if ($li.dataset.type === "add") {
                $li.remove();
            } else {
                $li.dataset.type = "confirm";
                $input.disabled = true;
            }
        }
        
        if ($target.closest(".btn__confirm")) {
            const $li = $target.closest(".category__item");
            const item = categoryMap[$li.id];
            const $input = $li.querySelector("input[type='text']");
            const $selectedBox = $li.querySelector(".selected__title");
            
            if (!item.categoryTitle.trim()) return;
            $li.dataset.type = "confirm";
            // 자식 노드는 selectedBox 없음
            if($selectedBox) $selectedBox.textContent = item.categoryTag;
            $input.disabled = true;
        }
        
        if ($target.closest(".select__container button")) {
            const $container = $target.closest(".select__container");
            $container.classList.toggle("active");
        }
        
        if ($target.closest(".select__menus li")) {
            const $li = $target.closest(".category__item");
            const $container = $li.querySelector(".select__container");
            const $title = $container.querySelector(".select__menu__title");
            const value = $target.textContent;
            
            categoryMap[$li.id].updateTag(value);
            $title.textContent = value;
            $container.classList.remove("active");
        }
    });
    
    document.addEventListener("input", function (event) {
        const $input = event.target;
        if (!$input.matches("input[type='text']")) return;
        
        const $li = $input.closest(".category__item");
        const $btnConfirm = $li.querySelector(".btn__confirm");
        const text = $input.value.trim();
        
        categoryMap[$li.id].updateTitle(text);
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
    
    function bindEventsToItem($li, item, id) {
        // 바인딩은 document level 에서 처리되므로 생략 가능
    }
    
    function createCategoryItem(id, categoryItem) {
        const li = document.createElement("li");
        li.className = "category__item";
        li.id = id;
        li.dataset.type = "add";
        li.innerHTML = `
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
        return li;
    }
});
