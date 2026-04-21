// 왜 'NEXT_PUBLIC'을 꼭 붙여야 할까?
// 백엔드의 환경변수는 서버 메모리에만 안전하게 숨겨져 있지만, 프론트엔드 코드는 결국 사용자의 브라우저로 다운로드 되어 실행됨
// 빌드 도구(Next.js)는 보안을 위해 기본적으로 환경ㅂ변수를 브라우저로 보내지 않는데,
// 이 변수는 브라우저에 노출되어도 안전한 공개 설정값이라는 명시적 허락 키워드가 'NEXT_PUBLIC'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

/*
* [export]: Java의 public, Spring @Component로 빈 등록과 같다. 다른 파일에서 import 해서 쓸 수 있도록 하는 용도
* [async]: 프론트엔드에서 네트워크 I/O는 무조건 비동기(Non-blocking) 처리.
* - 스레드가 하나 뿐이라 비동기 처리 하지 않으면 프리징 발생
* [options?]: TypeScript 문법으로 생략 가능 의미. @Nullable과 같음
* [RequestInit]: fetch 함수가 기본적으로 요구하는 설정 객체(method, headers, body 등) 타입 (Type Safety 보장)
* */
export const apiClient = async (endpoint: string, options?: RequestInit) => {

    const url = `${API_BASE_URL}${endpoint}`;

    // [await]: 비동기 작업(fetch)이 끝날 때까지 실행 컨텍스트 잠시 멈추고 대기 (Promise가 resolve 될 때까지 대기)
    const response = await fetch(url, {

        /*
        * [전개 구문 (Spread Operator: ...)]:
        * options 객체 안에 있는 모든 프로퍼티(method: 'POST', body: '...' 등)를 이 위치에 껍질을 벗겨서 풀어 놓음
        * 호출 시 특별 설정을 넘겼다면 그 요청을 적용하기 위해 사용
        * */
        ...options,
        headers: {
            'Content-Type': 'application/json',
            /*
            * 옵셔널 체이닝(?.)은 백엔드의 NPE을 방지하는 아주 우아한 문법.
            * null/undefined가 아니면 headers를 꺼내서 전개(...)해라! 라는 뜻
            * 왜 쓸까?: 호출자가 인증 토근 같은 커스텀 헤더를 넘겼다면 위에서 설정한 기본 Content-Type 밑에 해당 커스텀 헤더들을 추가/덮어쓰기
            * */
            ...options?.headers,
        },
    });

    /*
    * 브라우저의 기본 fetch API는 404, 500 같은 서버 에러가 발생해도,
    * 네트워크 요청 자체는 성공적으로 도달했다고 판단해 예외를 던지지 않음
    * 수동으로 response.ok 를 수동으로 체크해서 정상이 아니면 호출한 쪽으로 에러를 만들어 던짐
    * */
    if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
    }

    // 서버에서 받은 JSON 데이터를 프론트엔드의 JavaScript 객체(Object)로 변환.
    return response.json();
}