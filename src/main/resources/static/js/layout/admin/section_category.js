import generateUUID from "../../utils/uuid.js";
import getCsrfToken, {apiFetch} from "../../utils/api.js";

/*────────────────────────────────────
  정보 저장 함수
────────────────────────────────────*/

class CategoryMenuItem {
    // todo 추후 버서에서 게시글이 작성 되어 있을 경우에 변경 못하게 막는 로직을 추가해야한다.
    constructor(id, parentId = null, serverId = null, title = "", tag = 1) {
        this.id = id;                   // 현재 자신의 uuid
        this.parentId = parentId;       // 부모의 uuid
        this.serverId = serverId;       // 서버에서 받아온 pk
        this.categoryTitle = title;     // 타이틀 값
        this.categoryTag = tag;         // 태그 값
        this.state = 'ADD';             // UPDATE, ADD, DELETE, DEFAULT
        this.orderNo = 0;
        this.children = [];
    }
    
    isParent() {
        return this.parentId == null;
    }
    
    updateTag(tag) {
        if (this.categoryTag !== tag) {
            this.categoryTag = tag;
        }
    }
    
    updateState(state) {
        this.state = state;
        // 변경 시점
        const event = new CustomEvent("categoryStateChanged", {
            detail: {state}
        });
        window.dispatchEvent(event);
    }
    
    updateTitle(title) {
        if (this.categoryTitle !== title) {
            this.categoryTitle = title;
        }
    }
    
    updateOrder(orderNo) {
        if (this.orderNo !== orderNo) {
            this.orderNo = orderNo;
            this.updateState("UPDATE");
        }
    }
}

/*────────────────────────────────────
  api 호출 관련 함수
────────────────────────────────────*/
async function loadCategoryTitles() {
    try {
        return await apiFetch('/category-titles', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    } catch (e) {
        handleError(e, '카테고리 타이틀 로딩');
        return null;
    }
}

async function loadSectionAndSetTitle($mainSection, url, sectionTitle) {
    try {
        return await apiFetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/html'
            }
        });
        
    } catch (e) {
        handleError(e, '섹션 로딩');
        return '';
    }
}

async function categoryUpdate(categoryMap) {
    try {
        // 리스트 정보로 변환 .
        const categoryList = [...categoryMap.values()].filter((item) => item.parentId === null);
        // 자식 값중에 default 는 제외 하고 보냄
        categoryList.forEach((item) => {
            item.children = item.children.filter(child => child.state !== 'DEFAULT');
        });
        if (!categoryMap || !categoryList || categoryList.length <= 0) return null;
        
        return await apiFetch('/categories', {
            method: 'PATCH',
            body: JSON.stringify(categoryList),
            headers: {
                ...getCsrfToken(),
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    } catch (e) {
        handleError(e, '카테고리 전송 실패!');
        return null;
    }
}

async function getAllCategories() {
    try {
        return await apiFetch('/categories', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });
    } catch (e) {
        handleError(e, '카테고리 메뉴 가져오기 실패!');
        return null;
    }
}

function handleError(error, context = "") {
    alert(`[${context}] 에러 발생:`);
    console.error(`[${context}] 에러 발생:`, error);
    // TODO: 필요하면 location.href = "/error" 등 리다이렉트 처리
}

/*────────────────────────────────────
  ui 관련 함수
────────────────────────────────────*/
function childMenuItemDisabled($childDiv, isDisabled) {
    $childDiv.querySelector(".btn__add").style.display = isDisabled ? 'none' : 'block';              // 자식은 추가 버튼 없음
    $childDiv.querySelector('.select__container').style.display = isDisabled ? 'none' : 'block';                           // 자식은 주제 선택 없음
    $childDiv.querySelector('.selected__title__box').style.display = isDisabled ? 'none' : 'flex';                        // 자식은 주제 선택 없음
    $childDiv.querySelector('.icon__block.subtree').style.display = isDisabled ? 'none' : 'flex';
}

function changeItemDropIcon($element, icon, replaceIcon) {
    $element.classList.replace(icon, replaceIcon);
}

function isSameTitle(categoryMap, $input) {
    if (!$input) return false;
    return categoryMap.values().some((item) => item.categoryTitle.trim() === $input.value.trim());
}


function makeCategoryItems(categoryMap, categoryTitleMap, response) {
    if (!response || !response.data) return;
    const items = response.data;
    const $categoryController = document.querySelector(".category__controller")
    $categoryController.innerHTML = '';
    categoryMap.clear();
    
    for (const parent of items) {
        const parentItem = new CategoryMenuItem(generateUUID());
        parentItem.serverId = parent.serverId;
        parentItem.orderNo = parent.orderNo;
        parentItem.categoryTag = parent.categoryTag;
        parentItem.categoryTitle = parent.categoryTitle;
        parentItem.state = parent.state;
        categoryMap.set(parentItem.id, parentItem)
        
        const $parentElement = createCategoryItem(parentItem, categoryMap, categoryTitleMap, 'confirm');
        
        $categoryController.appendChild($parentElement);
        const $iconBlock = $parentElement.querySelector('.icon__block.subtree');
        const $span = $iconBlock.querySelector('span');
        
        for (const child of parent.children) {
            // 아이콘 변경
            $iconBlock.classList.add('active');
            changeItemDropIcon($span, 'none', 'arrow_icon');
            // 자식 아이탬 데이터 세팅
            const childItem = new CategoryMenuItem(generateUUID(), parentItem.id);
            childItem.serverId = child.serverId;
            childItem.orderNo = child.orderNo;
            childItem.categoryTag = child.categoryTag;
            childItem.categoryTitle = child.categoryTitle;
            childItem.state = child.state;
            parentItem.children.push(childItem);
            
            categoryMap.set(childItem.id, childItem);
            const $childElement = createCategoryItem(childItem, categoryMap, categoryTitleMap, 'confirm');
            childMenuItemDisabled($childElement, true);
            addChildItemToContainer($parentElement, $childElement);
        }
    }
}

// 부모아이탬을 만들어서 반환.
function addEmptyParentItem(categoryMap, categoryTitleMap, orderNo) {
    const makeItem = new CategoryMenuItem(generateUUID());
    makeItem.updateOrder(orderNo);
    makeItem.updateState('ADD');
    
    // 부모 아이디 매핑 gn
    categoryMap.set(makeItem.id, makeItem);
    const $div = createCategoryItem(makeItem, categoryMap, categoryTitleMap, 'add');
    document.querySelector(".category__controller").appendChild($div);
    
    // 상태변경 이벤트 추가.
    const event = new CustomEvent("categoryStateChanged", {
        detail: {
            state: makeItem.state
        }
    });
    window.dispatchEvent(event);
    return $div;
}

// 자식 아이탬 만들어서 반환
function addEmptyChildItem(categoryMap, categoryTitleMap, parentId) {
    const parentCategoryItem = categoryMap.get(parentId);
    if (!parentCategoryItem) return null;
    
    const childItem = new CategoryMenuItem(generateUUID(), parentId);
    childItem.updateOrder(parentCategoryItem.children.length);
    childItem.updateState('ADD');
    parentCategoryItem.children.push(childItem);
    // 데이터 동기화
    categoryMap.set(childItem.id, childItem);
    
    // 자식 아이탬을 만듬
    const $childDiv = createCategoryItem(childItem, categoryMap, categoryTitleMap, 'add');
    childMenuItemDisabled($childDiv, true);
    return $childDiv;
}

// 자식아이탬 컨테이너에 추가
function addChildItemToContainer($parentItem, $childItem) {
    // 형제 요소를 만들고 자식을 삽임
    if (!$parentItem || !$childItem) return null;
    const next = $parentItem.nextElementSibling;
    const isContainer = next ? next.classList.contains('child__container') : false;
    let $childContainer;
    // 컨테이너 요소 생성
    if (!isContainer) {
        $childContainer = document.createElement('div');
        $childContainer.className = 'child__container';
        $childContainer.style.marginLeft = '50px';
        $parentItem.insertAdjacentElement("afterend", $childContainer);
    }
    $childContainer = $parentItem.nextElementSibling;
    $childContainer.appendChild($childItem);
    $childContainer.style.display = 'block';
    // 추가할때마다 포커스 주기
    $childContainer.querySelector('.child__container .category__item:last-child input[type="text"]').focus();
    return $childContainer;
}

function removeChildItem(categoryMap, parentId, childId) {
    // 부모아이탬이 클릭 되었을 경우 true 처리
    if (!parentId) return true;
    const parentCategoryItem = categoryMap.get(parentId);
    const childItem = categoryMap.get(childId);
    if (!childItem) return false;
    
    // 자식 아이탬을 삭제하는 경우
    if (!childItem.serverId) {
        const index = parentCategoryItem.children.findIndex(item => item.id === childId);
        if (index === -1) return false;
        parentCategoryItem.children.splice(index, 1);
        // element 기준으로 정렬을 시키는게 맞음
        reOrder(parentCategoryItem.children);
        // 데이터 동기화
        categoryMap.delete(childId);
    } else {
        childItem.updateState('DELETE');
        reOrder(parentCategoryItem.children);
    }
    return true;
}

function reOrder(items) {
    let idx = 0;
    for (const index in items) {
        const item = items[index];
        if (item.state !== 'DELETE') {
            item.updateOrder(idx);
            idx++;
        }
    }
}

function reassignParentOrder(categoryMap) {
    const parents = [...categoryMap.values()]
        .filter(item => item.parentId === null)
        .sort((a, b) => a.orderNo - b.orderNo); // 혹시 순서 꼬였을 경우 대비
    
    let index = 0;
    parents.forEach((item) => {
        if (item.state !== 'DELETE') {
            item.updateOrder(index);
            index++;
        }
    });
}

function createCategoryTitle(categoryTitleMap) {
    const $ul = document.createElement('ul');
    $ul.className = 'select__menus';
    // map 은 in 으로 받으면 index 를 가져와서 of 로 받아야 한다.
    for (const [key, categoryTitle] of categoryTitleMap.entries()) {
        const $li = document.createElement('li');
        $li.id = key;
        $li.textContent = categoryTitle;
        $ul.appendChild($li);
    }
    return $ul;
}

function createCategoryItem(categoryItem, categoryMap, categoryTitleMap, dataType) {
    const $div = document.createElement("div");
    $div.className = "category__item";
    $div.id = categoryItem.id;
    $div.dataset.type = dataType;
    $div.draggable = true;
    $div.innerHTML = `
      <div class="left">
        <div class="icons">
          <div class="icon__block subtree"><span class="none"></span></div>
          <div class="icon__block drag"><span class="icon"></span></div>
        </div>
      </div>
      <div class="right">
        <div class="right__left">
            <label>
                <input class="ellipsis" type="text" value="${categoryItem?.categoryTitle ?? ''}">
            </label>
            <div class="selected__title__box">
              <span class="selected__title">${categoryTitleMap.get(categoryItem.categoryTag)}</span>
            </div>
            <div class="select__container">
              <button>
                <span id="${categoryItem.categoryTag}"
                      class="select__menu__title">${categoryTitleMap.get(categoryItem.categoryTag)}</span>
                <span class="icon__dropdown"></span>
              </button>
            </div>
        </div>
        <div class="right__right">
            <div class="btns__edit">
              <button class="btn__cancel">취소</button>
              <button disabled class="btn__confirm">확인</button>
            </div>
            <div class="btns__default">
              <button class="btn__add">추가</button>
              <button class="btn__edit">수정</button>
              <button class="btn__delete">삭제</button>
            </div>
        </div>
      </div>`;
    const $selectContainer = $div.querySelector('.select__container');
    const $ul = createCategoryTitle(categoryTitleMap);
    const $input = $div.querySelector('input[type="text"]');
    if (dataType === 'add') {
        $input.disabled = false;
    } else if (dataType === 'confirm') {
        $input.disabled = true;
    }
    $selectContainer.appendChild($ul);
    
    // 드래그 이벤트 추가
    $div.addEventListener('dragend', onDragEnd(categoryMap));
    $div.addEventListener('dragstart', onDragStart);
    $div.addEventListener('dragover', throttle(onDragOver, 200));
    return $div;
}

// 카테고리 타이틀 데이터 매핑 함수
function initCategoryTitle(categoryTitles, categoryTitleMap) {
    if (!categoryTitles) return false;
    for (let key in categoryTitles) {
        const item = categoryTitles[key];
        categoryTitleMap.set(item.no, item.title);
    }
}

/*────────────────────────────────────
  drag 관련 함수
────────────────────────────────────*/
let $prevElement = null;
let $dragStartElement = null;

function onDragStart(ev) {
    const x = ev.clientX;
    const y = ev.clientY;
    
    const elementAtDrop = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('.category__item');
    if (elementAtDrop != null) {
        $dragStartElement = elementAtDrop;
    }
}

function onDragEnd(categoryMap) {
    return function (ev) {
        if (!$dragStartElement) return;
        
        const x = ev.clientX;
        const y = ev.clientY;
        
        // 드래그 끝날시 라인 다 지우기
        const $lines = document.querySelectorAll('.root__line, .child__line');
        $lines.forEach((el) => {
            el.classList.remove('root__line');
            el.classList.remove('child__line');
        });
        
        const $elementAtDrop = document.elementFromPoint(ev.clientX, ev.clientY)
            .closest('.category__root, .category__item');
        
        // 루트라면
        if ($elementAtDrop.className === 'category__root') {
            const dragItem = categoryMap.get($dragStartElement.id);
            const $categoryContainer = document.querySelector('.category__controller');
            
            if (dragItem.isParent()) { // 부모일 경우 자기 자식들도 다 옮겨줘야 함
                const $childContainer = $dragStartElement.nextElementSibling;
                $categoryContainer.insertBefore($dragStartElement, $categoryContainer.firstChild);
                
                if ($childContainer && $childContainer.classList.contains('child__container')) {
                    $dragStartElement.insertAdjacentElement('afterend', $childContainer);
                }
                // 부모요소의 정렬을 다 재정렬 해야한다.
                const $elements = document.querySelectorAll('.category__item:not(.child__container .category__item)');
                $elements.forEach(($el, index) => {
                    categoryMap.get($el.id).updateOrder(index);
                })
            } else { // 자식의 경우라면
                // 현재 있는 부모 밑에 값을 변경을 해주고
                const parentItem = categoryMap.get(dragItem.parentId);
                const childItem = categoryMap.get(dragItem.id);
                const $parentElement = document.getElementById(parentItem.id);
                
                // 데이터를 동기화 해준다.
                for (let i = parentItem.children.length - 1; i >= 0; i--) {
                    if (parentItem.children[i].id === childItem.id) {
                        parentItem.children.splice(i, 1);
                        break;
                    }
                }
                childItem.updateState("UPDATE");
                childItem.parentId = null;
                categoryMap.set(childItem.id, childItem);
                
                // 해당 아이탬을 옮긴다.
                $categoryContainer.insertBefore($dragStartElement, $categoryContainer.firstChild);
                // 해당 아이탬의 display 를 변경해준다.
                childMenuItemDisabled($dragStartElement, false);
                // 요소의 오더를 재정렬 해준다.
                const $elements = document.querySelectorAll('.category__item:not(.child__container .category__item)');
                $elements.forEach(($el, index) => {
                    categoryMap.get($el.id).updateOrder(index);
                })
                // 부모의 아이탬이 없을 경우 아이콘을 변경해준다.
                const $childContainer = $parentElement.nextElementSibling;
                if (!$childContainer) return;
                if ($childContainer.children.length <= 0) {
                    // 부모 아이탬이 있을 경우에 자식 하나씩 삭제시 icon 을 none 으로 변경해야한다.
                    const $span = $parentElement.querySelector('.icon__block.subtree span');
                    changeItemDropIcon($span, 'arrow_icon', 'none');
                }
            }
        }
        
        // 루트가 아니라면
        if ($elementAtDrop.className === 'category__item') {
            // 부모요소인데 자식으로 갈경우
            const overItem = categoryMap.get($elementAtDrop.id);
            const dragItem = categoryMap.get($dragStartElement.id);
            
            // 부모 요소인데 부모로만 갈경우
            if (dragItem.isParent() && overItem.isParent()) {
                // 자리만 변경 가능
                const $overChildContainer = $elementAtDrop.nextElementSibling;
                if (!$overChildContainer || !$overChildContainer.classList.contains('child__container')) {
                    const $dragChildContainer = $dragStartElement.nextElementSibling;
                    $elementAtDrop.insertAdjacentElement('afterend', $dragStartElement); // 자기자신을 먼저 이동하고
                    
                    if ($dragChildContainer && $dragChildContainer.classList.contains('child__container')) {
                        $dragStartElement.insertAdjacentElement('afterend', $dragChildContainer); // 자식들도 같이 이동
                    }
                }
                
                // over 된 녀석이 부모일경우 컨테이너 밑으로 나와 자식들을 이동.
                if ($overChildContainer && $overChildContainer.classList.contains('child__container')) {
                    const $dragChildContainer = $dragStartElement.nextElementSibling;
                    $overChildContainer.insertAdjacentElement('afterend', $dragStartElement);
                    
                    if ($dragChildContainer && $dragChildContainer.classList.contains('child__container')) {
                        $dragStartElement.insertAdjacentElement('afterend', $dragChildContainer); // 자식들도 같이 이동
                    }
                }
                
                // 부모요소의 정렬을 다 재정렬 해야한다.
                const $elements = document.querySelectorAll('.category__item:not(.child__container .category__item)');
                $elements.forEach(($el, index) => {
                    categoryMap.get($el.id).updateOrder(index);
                })
                return;
            }
            
            const pointElement = document.elementFromPoint(ev.clientX, ev.clientY);
            const isRootLine = pointElement?.closest('.left');
            // 자식 요소 드래그 -> 부모 요소
            if (!dragItem.isParent() && overItem.isParent()) {
                if (isRootLine) {
                    // 부모 라인으로 이동
                    const parentItem = categoryMap.get(dragItem.parentId);
                    const childItem = categoryMap.get(dragItem.id);
                    const $parentElement = document.getElementById(parentItem.id);
                    
                    // 데이터를 동기화 해준다.
                    for (let i = parentItem.children.length - 1; i >= 0; i--) {
                        if (parentItem.children[i].id === childItem.id) {
                            parentItem.children.splice(i, 1);
                            break;
                        }
                    }
                    
                    childItem.updateState("UPDATE");
                    childItem.parentId = null;
                    categoryMap.set(childItem.id, childItem);
                    
                    let $childContainer = $elementAtDrop.nextElementSibling;
                    // display 변경
                    childMenuItemDisabled($dragStartElement, false);
                    if ($childContainer && $childContainer.classList.contains('child__container')) {
                        $childContainer.insertAdjacentElement('afterend', $dragStartElement);
                    } else {
                        $elementAtDrop.insertAdjacentElement('afterend', $dragStartElement);
                    }
                    
                    // 요소의 오더를 재정렬 해준다.
                    const $elements = document.querySelectorAll('.category__item:not(.child__container .category__item)');
                    $elements.forEach(($el, index) => {
                        categoryMap.get($el.id).updateOrder(index);
                    })
                    // 부모의 아이탬이 없을 경우 아이콘을 변경해준다.
                    const $parentChildContainer = $parentElement.nextElementSibling;
                    if (!$parentChildContainer) return;
                    if ($parentChildContainer.children.length <= 0) {
                        // 부모 아이탬이 있을 경우에 자식 하나씩 삭제시 icon 을 none 으로 변경해야한다.
                        const $span = $parentElement.querySelector('.icon__block.subtree span');
                        changeItemDropIcon($span, 'arrow_icon', 'none');
                    }
                } else { // 자식 라인으로 이동
                    // 부모의 바로 아래에 배치
                    const parentItem = categoryMap.get(dragItem.parentId);
                    const childItem = categoryMap.get(dragItem.id);
                    const overItem = categoryMap.get($elementAtDrop.id);
                    // 데이터를 동기화 해준다.
                    childItem.parentId = overItem.parentId;
                    childItem.updateState("UPDATE");
                    for (let i = parentItem.children.length - 1; i >= 0; i--) {
                        if (parentItem.children[i].id === childItem.id) {
                            parentItem.children.splice(i, 1);
                            break;
                        }
                    }
                    
                    let $childContainer = $elementAtDrop.nextElementSibling;
                    // 컨테이너 요소 생성
                    if (!$childContainer || !$childContainer.classList.contains('child__container')) {
                        $childContainer = document.createElement('div');
                        $childContainer.className = 'child__container';
                        $childContainer.display = 'block';
                        $childContainer.style.marginLeft = '50px';
                        $elementAtDrop.insertAdjacentElement("afterend", $childContainer);
                        $childContainer.insertBefore($dragStartElement, $childContainer.firstChild);
                    } else {
                        $childContainer.insertBefore($dragStartElement, $childContainer.firstChild);
                    }
                    // 호버된 녀석에게 첫번째 인덱스에 아이탬 추가.
                    childItem.parentId = overItem.id;
                    categoryMap.set(childItem.id, childItem);
                    overItem.children.unshift(childItem);
                    reOrder(overItem.children);
                }
            }
            
            // 자식요소 드래그 -> 자식 요소
            if (!dragItem.isParent() && !overItem.isParent()) {
                const overItem = categoryMap.get($elementAtDrop.id);
                const dragItem = categoryMap.get($dragStartElement.id);
                const parentItem = categoryMap.get(dragItem.parentId);
                const overParentItem = categoryMap.get(overItem.parentId);
                
                for (let i = parentItem.children.length - 1; i >= 0; i--) {
                    if (parentItem.children[i].id === dragItem.id) {
                        parentItem.children.splice(i, 1);
                        break;
                    }
                }
                reOrder(parentItem.children);
                for (let i = overParentItem.children.length - 1; i >= 0; i--) {
                    if (overParentItem.children[i].id === overItem.id) {
                        dragItem.updateState("UPDATE");
                        dragItem.parentId = overParentItem.id;
                        overParentItem.children.splice(i+1, 0, dragItem);
                        reOrder(overParentItem.children);
                        break;
                    }
                }
                $elementAtDrop.insertAdjacentElement('afterend', $dragStartElement);
            }
        }
        // 초기화
        $prevElement = null;
        $dragStartElement = null;
    }
}

function throttle(callback, limit) {
    let waiting = false; // 클로저로 감싸서 false 로 처리
    return function (...args) {
        // 브라우저가 이벤트 넘겨주고
        if (!waiting) {
            waiting = true;
            callback(this, ...args);
            setTimeout(() => {
                waiting = false;
            }, limit);
        }
    }
}

let prevHighlighted = null;

function onDragOver(element, ev) {
    // 드래그 시작 element 가 없으면 바로 종료
    if (!$dragStartElement) return;
    // element가 유효하지 않으면 종료
    if (!element || element === $dragStartElement) return;
    
    const pointElement = document.elementFromPoint(ev.clientX, ev.clientY);
    const isRootLine = pointElement?.closest('.left');
    const isOverChild = element.closest('.child__container');
    const isDragChild = $dragStartElement.closest('.child__container');
    
    // 이전 강조 요소가 있고, 지금과 다르다면 제거
    if (prevHighlighted && prevHighlighted !== element) {
        prevHighlighted.classList.remove('root__line', 'child__line');
    }
    
    // 공통: 먼저 이전 보더 클래스 제거
    element.classList.remove('root__line', 'child__line');
    prevHighlighted = element;
    
    // element 가 root 라면
    if (element.className === 'category__root') {
        element.classList.add('root__line');
        return;
    }
    
    // 부모 인데 자식이 있는 경우라면
    if (!isDragChild) {
        // 다른 부모 또는 루트 한테로만 이동 가능
        if (!isOverChild) {
            element.classList.add('root__line');
        }
        return;
    }
    if (isOverChild) { // 자식 위로 드래그 했을 경우
        element.classList.add('root__line');
        return;
    }
    if (isRootLine) {
        element.classList.add('root__line');
    } else {
        element.classList.add('child__line');
    }
}

/*────────────────────────────────────
  event
────────────────────────────────────*/
document.addEventListener("DOMContentLoaded", function () {
    const categoryMap = new Map();
    const categoryTitleMap = new Map();
    const categoryParentList = [];
    const $mainSection = document.querySelector('.container .main__section');
    
    // 카테고리 상태 변경 이벤트
    window.addEventListener("categoryStateChanged", (e) => {
        const newState = e.detail.state;
        const $btnSave = document.querySelector('.btn__save');
        $btnSave.disabled = false;
    });
    
    window.addEventListener('sideMenuClick', async function (ev) {
        const {section_title, url} = ev.detail;
        
        // 카테고리 메뉴 초기화
        const responseCategoryTitles = await loadCategoryTitles();
        initCategoryTitle(responseCategoryTitles.data, categoryTitleMap);
        
        // html section 받아오기
        $mainSection.innerHTML = await loadSectionAndSetTitle($mainSection, url, section_title);
        const $title = document.querySelector('.category__container .title');
        if ($title) $title.textContent = section_title;
        
        // root 드래그 이벤트 초기화
        const $categoryRoot = document.querySelector('.category__root');
        $categoryRoot.addEventListener('dragover', throttle(onDragOver, 200));
        
        // post 카테고리 조회 데이터 받아오기
        const response = await getAllCategories();
        
        // 최초 item data 만들기
        makeCategoryItems(categoryMap, categoryTitleMap, response);
    });
    
    document.addEventListener("click", async function (event) {
        const $target = event.target;
        
        // root 에서 추가 버튼 누를시 동작
        if ($target.closest('.category__root .btns__default button') || $target.closest('.category__bottom__add')) {
            const type = $target.dataset.type;
            if (type !== "add") return;
            const orderNo = [...categoryMap.values()].filter(item => item.parentId === null).length;
            addEmptyParentItem(categoryMap, categoryTitleMap, orderNo);
        }
        
        // 자식 관련된 추가 삭제
        if ($target.closest(".btn__add")) {
            const $element = $target.closest(".category__item");
            if (!$element) return;
            
            // 자식 아이탬을 만듬
            const $childDiv = addEmptyChildItem(categoryMap, categoryTitleMap, $element.id);
            
            // 자식을 컨테이너에 추가
            addChildItemToContainer($element, $childDiv);
            
            // 추가시 arrow icon 추가
            const $span = $element.querySelector('.icon__block.subtree span');
            const $iconBlock = $span.closest('.icon__block.subtree');
            $iconBlock.classList.add('active');
            changeItemDropIcon($span, 'none', 'arrow_icon');
            
            console.log(categoryMap);
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
            const $element = $target.closest(".category__item");
            if (!$element) return;
            
            const item = categoryMap.get($element.id);
            if (item.parentId) {  // 자식 아이탬인 경우
                const $parentElement = document.getElementById(item.parentId);
                const $childContainer = $element.closest('.child__container');
                const parentChildItem = categoryMap.get(item.parentId);
                
                // 자식 아이탬 삭제
                if (!removeChildItem(categoryMap, item.parentId, $element.id)) return;
                $element.remove();
                // 자식 아이탬이 없을 경우 icon 변경
                if (!$childContainer) return;
                if ($childContainer.children.length <= 0) {
                    // 부모 아이탬이 있을 경우에 자식 하나씩 삭제시 icon 을 none 으로 변경해야한다.
                    const $span = $parentElement.querySelector('.icon__block.subtree span');
                    changeItemDropIcon($span, 'arrow_icon', 'none');
                }
                return;
            } else { // 부모 아이탬인 경우
                // 부모 일경우 자식들을 찾아서 하나씩 지워줘야 한다.
                const $next = $element.nextElementSibling;
                
                // 자식이 없는 경우는
                if (!$next || !$next.classList.contains('child__container')) {
                    $element.remove();
                    if (item.serverId) {
                        item.updateState("DELETE");
                    } else {
                        categoryMap.delete($element.id);
                    }
                    return;
                }
                // 컨테이너 아래 자식 들 모두 삭제
                $next?.querySelectorAll('.child__container > .category__item').forEach(($childItem) => {
                    removeChildItem(categoryMap, item.id, $childItem.id);
                    $childItem.remove();
                })
                $next.remove();
                $element.remove();
                // 서버아이디가 존재한다면 마킹 하고 아니면 삭제후 재정렬
                if (item.serverId) {
                    item.updateState("DELETE");
                } else {
                    categoryMap.delete($element.id);
                }
                reassignParentOrder(categoryMap);
            }
        }
        
        if ($target.closest(".btn__cancel")) {
            const $div = $target.closest(".category__item");
            const $input = $div.querySelector("input[type='text']");
            const parentId = categoryMap.get($div.id)?.parentId;
            const $childContainer = $div.closest('.child__container');
            const $selectMenuTitle = $div.querySelector('.select__menu__title');
            const item = categoryMap.get($div.id);
            
            // 자식일 경우 그냥 자기자신을 지우면된다.
            if ($div.dataset.type === "add") {
                if (parentId) {
                    $div.remove();
                    removeChildItem(categoryMap, parentId, $div.id);
                } else {
                    $div.remove();
                    categoryMap.delete($div.id);
                    // 다시 재정렬
                    reassignParentOrder(categoryMap);
                    // 컨테이너의 자식이 존재하지 부모의 아이콘을 변경해준다.
                    const $parentElement = document.getElementById(parentId);
                    if ($childContainer && $childContainer.children.length <= 0) {
                        const $span = $parentElement.querySelector('.icon__block.subtree span');
                        changeItemDropIcon($span, 'arrow_icon', 'none');
                    }
                }
            }
            // edit 상태일 경우 취소를 누르면 confirm 상태로 돌아가야 한다. ui 업데이트
            if ($div.dataset.type === "edit") {
                $div.dataset.type = "confirm";
                $input.value = item.categoryTitle;
                $selectMenuTitle.id = String(item.categoryTag);
                $selectMenuTitle.textContent = categoryTitleMap.get(item.categoryTag);
                $input.disabled = true;
                return;
            }
        }
        
        if ($target.closest(".btn__confirm")) {
            const $div = $target.closest(".category__item");
            const item = categoryMap.get($div.id);
            const $input = $div.querySelector("input[type='text']");
            const $selectedBox = $div.querySelector(".selected__title");
            const $selectedMenuTitle = $div.querySelector(".select__menu__title");
            
            if (isSameTitle(categoryMap, $input)) {
                alert('같은 타이틀 제목이 존재합니다.');
                $input?.focus();
                return;
            }
            
            // data 업데이트
            item.updateTitle($input.value.trim());
            item.updateTag(Number($selectedMenuTitle.id));
            item.updateState('UPDATE');
            $div.dataset.type = "confirm";
            
            // 자식 노드는 selectedBox 없음
            if ($selectedBox) $selectedBox.textContent = categoryTitleMap.get(item.categoryTag);
            $input.disabled = true;
            console.log(categoryMap);
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
            // 선택된 아이디로 변경
            const $title = $container.querySelector(".select__menu__title");
            $title.id = $target.id;
            
            const tag = Number($target.id);  // 태그값을 가지고옴.
            if (categoryTitleMap.get(tag)) {
                $title.textContent = categoryTitleMap.get(tag);
            }
            $container.classList.remove("active");
        }
        
        // 변경사항 저장
        if ($target.closest('.btn__save')) {
            // 추가 카테고리가 있는지 체크 한다.
            const elements = document.querySelectorAll('.category__item[data-type="add"]');
            if (elements.length > 0) {
                alert('정보를 확정한 후에 저장할 수 있습니다.');
                return;
            }
            // 저장성공했는지 확인한다.
            const updateResponse = await categoryUpdate(categoryMap);
            if (!updateResponse.success) return;
            
            // post 카테고리 조회 데이터 받아오기
            const searchResponse = await getAllCategories();
            
            // 최초 item data 만들기
            makeCategoryItems(categoryMap, categoryTitleMap, searchResponse);
            
            // 버튼 비활성화
            $target.disabled = true;
        }
    });
    
    document.addEventListener("input", function (event) {
        const $input = event.target;
        if (!$input.matches("input[type='text']")) return;
        
        const $div = $input.closest(".category__item");
        const $btnConfirm = $div.querySelector(".btn__confirm");
        const text = $input.value.trim();
        $btnConfirm.disabled = !text;
    });
});

