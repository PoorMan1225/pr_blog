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