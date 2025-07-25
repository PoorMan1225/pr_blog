/**
 * 공통 api fetch 호출 함수
 * @param url
 * @param options 헤더 변경 이나, language 등을 선언해야 할때 사용
 * @returns {Promise<any>}
 */
export async function apiFetch(url, options = {}) {
    const defaultHeaders = {
        'Content-Type': 'application/json',
    };
    
    // 여기서 config 변경시에
    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };
    
    const response = await fetch(url, config);
    
    // 200 ~ 299 응답 ok 처리
    if (!response.ok) {
        // 요청 했는데 권한이 없을 경우 login page 로 이동
        if (response.status === 401 || response.status === 403) { // 권한 부족 또는 인증이 없을 경우 처리
            window.location.href = "/admin/login?expired=true"; // 로그인 페이지로 이동.
        }
        // 에러 처리
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Accept 타입에 따른 분기
    const accept = config.headers['Accept'] || config.headers['accept'] || '';
    if (accept.includes('application/json')) {
        return response.json();
    } else if (accept.includes('text/html')) {
        return response.text(); // HTML fragment
    } else {
        return response; // 원시 응답 필요 시
    }
}

/**
 * csrf 토큰 받아오는 공통 함수 헤더에 있는 토큰 값을 받아옴
 * @returns {{[p: string]: string}} 동적으로 key 이름 을 변경하려면 [] 가 필요하다, token 을 value 로 가짐
 */
export default function getCsrfToken()
{
    const token = document.querySelector('meta[name="_csrf"]').getAttribute('content');
    const header = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');
    return {[header]: token};
}