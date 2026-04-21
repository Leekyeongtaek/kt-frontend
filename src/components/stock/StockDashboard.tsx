/*
* 이 파일은 SSR(서버 사이드 렌더링)이 아니라, 사용자의 브라우저(클라이언트)에서 실행된다고 선언
* 브라우저의 API(스크롤 이벤트, IntersectionObserver)나 리액트의 상태(useState, useEffect)를 쓰려면 반드시 파일 최상단에 적어야 함
*
* */
'use client';

import {useCallback, useEffect, useRef, useState} from "react";
import StockTable from "@/src/components/stock/StockTable";
import {PageResponse} from "@/src/types/common/api";
import {MarketType, StockResponse, StockSearchCondition} from "@/src/types/domain/stock";
import {apiClient} from "@/src/utils/api";

/*
* 왜 컴포넌트 바깥에 선언했을까?
* 내부에 선언하면 화면이 갱신(리렌더링) 될 때마다 이 배열이 메모리에 새로 할당 됨
* */
const MARKET_OPTIONS = [
    {value: 'ALL', label: '전체'},
    {value: MarketType.KOSPI, label: 'KOSPI'},
    {value: MarketType.KOSDAQ, label: 'KOSDAQ'},
    {value: MarketType.KOSDAQ_GLOBAL, label: 'KOSDAQ_GLOBAL'},
    {value: MarketType.KONEX, label: 'KONEX'},
];

export interface SortConfig {
    key: string;
    direction: 'asc' | 'desc' | null;
}

export default function StockDashboard() {

    /*
    * 상태 관리 (State /ViewModel)
    * -------------------------
    * [useState]: 프론트엔드의 '멤버 변수)' 하지만 일반 변수와 큰 차이가 존재
    * 변수의 값이 바뀌면(set 함수 호출), 리액트는 데이터 변경을 감지하고 리렌더링 반응
    * 구조 분해 할당 문법: [현재값, 값을 변경하는 메서드(Setter)]
    * */
    const [searchCondition, setSearchCondition] = useState<StockSearchCondition>({
        keyword: '',
        marketType: 'ALL',
        stockType: 'ALL',
        department: 'ALL',
        securitiesType: 'ALL'
    });

    const [displayData, setDisplayData] = useState<StockResponse[]>([]);
    // 페이징 상태: 0부터 시작
    const [page, setPage] = useState(0);
    const [iseLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [totalCount, setTotalCount] = useState(0);

    /*
    * [useRef]: HTML 요소의 '메모리 주소'를 직접 쥐고 있는 포인터
    * useState와 달리, 이 값이 변한다고 해서 화면이 다시 그려지지 않음
    * 투명한 감시용 박스(div)를 가리키는 리모컨 역할
    * */
    const observerTarget = useRef<HTMLDivElement>(null);

    // 정렬 상태
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        key: 'id',
        direction: 'desc'
    });

    const fetchStocksFromBackend = async (pageNum: number, condition: StockSearchCondition, sort: SortConfig) => {
        // [중복 호출 방지] 이미 통신 중(로딩 중)이면 요청 무시
        // 동시성 제어
        if (iseLoading) return;
        setIsLoading(true);

        try {
            // URL 뒤에 붙는 쿼리스트링을 안전하고 깔끔하게 조립해 주는 내장 객체
            const params = new URLSearchParams();
            params.append('page', pageNum.toString());
            params.append('size', '20');

            // [정렬 파라미터 추가]
            if (sort.direction) {
                params.append('sort', `${sort.key},${sort.direction}`);
            }

            if (condition.keyword.trim()) params.append('keyword', condition.keyword.trim());
            if (condition.marketType !== 'ALL') params.append('marketType', condition.marketType);
            if (condition.stockType !== 'ALL') params.append('stockType', condition.stockType);
            if (condition.department !== 'ALL') params.append('department', condition.department);
            if (condition.securitiesType !== 'ALL') params.append('securitiesType', condition.securitiesType);

            const endpoint = `/stock-service/api/v1/stocks/search?${params.toString()}`;

            // apiClient 호출하여 JSON 역직렬화 객체를 받는다
            const json: PageResponse<StockResponse> = await apiClient(endpoint);

            const newData = json.content || [];
            const isLast = json.last;

            /*
            * [상태 업데이트 시의 콜백 함수 사용 (prev => ...)]: 매우 중요
            * 첫 페이지(0)를 조회했다면 새 데이터를 그대로 덮어쓰고,
            * 2페이지 이상을 조회했다면 기존 배열(prev) 뒤에 새 배열(newData)을 이어 붙임 (전개 구문 ... 활용)
            * 콜백을 쓰는 이유는 비동기 환경에서 '최신 상태의 기존 데이터'를 보장받기 위함
            * */
            setDisplayData(prev => pageNum === 0 ? newData : [...prev, ...newData]);

            setTotalCount(json.totalElements || 0);
            setHasMore(!isLast);

        } catch (error) {
            console.error("API 호출 중 오류 발생:", error);
        } finally {
            setIsLoading(false);
        }
    }

    // 정렬 변경 핸들러
    const handleSort = (key: string) => {
        let direction: 'asc' | 'desc' = 'asc';

        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }

        const newSort: SortConfig = {key, direction};
        setSortConfig(newSort);

        // 정렬이 바뀌면 0페이지부터 다시 조회
        setPage(0);
        setHasMore(true);
        setDisplayData([]);
        fetchStocksFromBackend(0, searchCondition, newSort);
    }

    /*
    * 이벤트 핸들러
    * HTML의 <input name="keyword" />, <select name="marketType" /> 등의 값이 바뀔 때마다 실행
    * */
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        // 태그의 name 속성과 value 속성을 뽑아냄
        const {name, value} = e.target;
        // 검색 조건 객체 업데이트
        // 기존 객체(prev)의 껍질을 벗겨 복사한 뒤(...prev), 이벤트가 발생한 필드(name)만 새로운 값(value)으로 덮어씀
        // JS 객체는 불변성을 유지하며 업데이트해야 리액트가 변화를 감지할 수 있기 때문
        setSearchCondition(prev => ({...prev, [name]: value}));
    }

    //  [검색 버튼 클릭 시]
    const handleSearch = () => {
        setPage(0);
        setHasMore(true);
        setDisplayData([]);
        fetchStocksFromBackend(0, searchCondition, sortConfig);
    }

    /*
    * 생명주기 - 컴포넌트 마운트
    * [useEffect]: 스프링의 @PostConstructor 와 비슷한 역할
    * 배열을 빈칸으로 두면, 이 컴포넌트가 브라우저에 처음 딱 한 번 그려딜 때 내부의 코드를 실행
    * 즉 사용자가 페이지에 처음 들어오자마자 초기 검색(0페이지 전체 목록)을 수행하게 됨
    * */
    useEffect(() => {
        handleSearch();
    }, []);

    /*
    * 무한 스크롤 함수 & 옵저버 등록
    * [useCallback]: 이 함수를 메모리(캐시)에 저장해 두고 재사용해라
    * 리액트는 화면을 다시 그릴 때마다 함수들도 전부 새로 생성(메모리 재할당)하는데,
    * 무거운 함수나 useEffect에 주입될 함수는 useCallback으로 감싸서 성능 최적화 (빈 등록과 비슷)
    * */
    const loadMoreData = useCallback(() => {
        if (!iseLoading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchStocksFromBackend(nextPage, searchCondition, sortConfig);
        }
    }, [page, iseLoading, hasMore, searchCondition]);

    // [무한 스크롤 감시자 등록]
    useEffect(() => {
        // [IntersectionObserver]: 브라우저 내장 API로, 특정 HTML 요소가 화면에 나타났는지 관찰
        const observer = new IntersectionObserver(
            (entries) => {
                // entries[0].isIntersecting == true 이면, 감시 대상(observerTarget)이 사용자 화면에 보였다는 뜻
                // 사용자가 스크롤을 맨 밑까지 내렸으니 다음 페이지 데이터를 불러옴
                if (entries[0].isIntersecting) loadMoreData();
            },
            // threshold: 0.1 -> 박스가 10%만 보여도 트리거
            // rootMargin: 200px -> 박스가 보이지 200px 전(미리)부터 트리거해서 로딩 지연 체감 못하게 만들기
            {threshold: 0.1, rootMargin: '200px'}
        );

        // useRef로 잡아둔 타겟(테이블 맨 밑바닥 div)을 옵저버에 등록해 감시 시작
        if (observerTarget.current) observer.observe(observerTarget.current);

        // [클린업 함수]: 스프링의 @PreDestroy, Connection.cose() 역할
        // 컴포넌트가 화면에서 사라지거나 이 useEffect가 다시 실행되기 직전에, 기존 옵저버의 감시를 해제(메모리 누수 방지)
        return () => observer.disconnect();
    }, [loadMoreData]);

    return (
        <div className={"flex flex-col min-h-screen bg-[#f3f4f8] p-4 text-gray-800 font-sans"}>

            {/* 타이틀 영역 */}
            <div className={"px-5 py-3 border-b border-gray-200 bg-white"}>
                <h2 className={"text-lg font-bold text-gray-800 flex items-center justify-center"}>
                    전종목 기본정보
                </h2>
            </div>

            {/* 필터 패널 */}
            <div className={"bg-[#eaeef6] border-b border-gray-300 p-4"}> {/* 2번 이미지와 비슷한 배경색으로 조정 */}
                {/* 1. items-start를 items-center로 변경하여 버튼과 텍스트 수직 중앙 정렬 */}
                <div className={"flex justify-between items-center"}>

                    {/* 좌측 검색 조건 */}
                    <div className={"flex flex-col gap-3 flex-1"}>
                        <div className={"flex items-center text-[14px]"}>
                            <span className="font-bold text-black w-24">시장구분</span>

                            {/* 라디오 버튼 그룹 */}
                            <div className="flex items-center font-medium text-gray-900">

                                <label className={"flex items-center space-x-1.5 cursor-pointer mr-5"}>
                                    <input type={"radio"}
                                           name={"marketType"}
                                           value={"ALL"}
                                           className={"w-4 h-4 accent-blue-500"}
                                           checked={searchCondition.marketType === 'ALL'}
                                           onChange={handleChange}
                                    />
                                    <span>전체</span>
                                </label>

                                <label className={"flex items-center space-x-1.5 cursor-pointer mr-5"}>
                                    <input type={"radio"} name={"marketType"}
                                           value={"KOSPI"}
                                           className={"w-4 h-4 accent-blue-500"}
                                           checked={searchCondition.marketType === 'KOSPI'}
                                           onChange={handleChange}
                                    />
                                    <span>KOSPI</span>
                                </label>

                                <label className={"flex items-center space-x-1.5 cursor-pointer mr-3"}>
                                    <input type={"radio"} name={"marketType"} value={"KOSDAQ"}
                                           className={"w-4 h-4 accent-blue-500"}
                                           checked={searchCondition.marketType === 'KOSDAQ'}
                                           onChange={handleChange}
                                    />
                                    <span>KOSDAQ</span>
                                </label>

                                <label className={"flex items-center space-x-1.5 cursor-pointer mr-1"}>
                                    <input type={"radio"} name={"marketType"} value={"KOSDAQ_GLOBAL"}
                                           className={"w-4 h-4 accent-blue-500"}
                                           checked={searchCondition.marketType === 'KOSDAQ_GLOBAL'}
                                           onChange={handleChange}
                                    />
                                    <span>KOSDAQ GLOBAL</span>
                                </label>

                                <label className={"flex items-center space-x-1.5 cursor-pointer"}>
                                    <input type={"radio"} name={"marketType"} value={"KONEX"}
                                           className={"w-4 h-4 accent-blue-500"}
                                           checked={searchCondition.marketType === 'KONEX'}
                                           onChange={handleChange}
                                    />
                                    <span>KONEX</span>
                                </label>

                            </div>
                        </div>
                    </div>

                    {/* 우측 버튼 */}
                    <div>
                        {/* 3. rounded-sm을 rounded-full로 변경, 배경색 블랙으로 통일 */}
                        <button
                            onClick={handleSearch}
                            className="bg-black text-white px-8 py-2.5 rounded-full text-[14px] font-bold hover:bg-gray-800 transition-colors"
                        >
                            조회
                        </button>
                    </div>

                </div>
            </div>

            {/* 정보 영역 */}
            <div className={"p-3 bg-white"}>
                <div className={"flex justify-between items-center mb-1 text-xs text-gray-500"}>

                    <div className={"flex items-center gap-4"}>

                        {/* 검색창 UI */}
                        <div
                            className={"flex-none flex items-center bg-white border border-gray-300 rounded overflow-hidden text-black h-8"}>
                            <select
                                className={"bg-blue-400 text-white px-3 h-full outline-none text-[13px] cursor-pointer"}>
                                <option>종목명</option>
                                {/* 맥락에 맞게 '통합검색'에서 '종목명' 등으로 변경 가능 */}
                            </select>
                            <input
                                type="text"
                                name="keyword" // handleChange와 연결하기 위해 추가
                                value={searchCondition.keyword} // 상태값과 동기화
                                onChange={handleChange} // 입력할 때마다 searchCondition 업데이트
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSearch(); // 엔터키로 검색
                                }}
                                placeholder={"검색어를 입력해주세요."}
                                className={"px-3 h-full outline-none w-64 text-[13px]"}
                            />
                            <button
                                onClick={handleSearch} // 돋보기 클릭 시 검색
                                className={"bg-orange-500 px-3 h-full text-white flex items-center justify-center hover:bg-orange-600 transition-colors"}
                            >
                                🔍
                            </button>
                        </div>

                        {/* 데이터 로딩 표시 */}
                        {iseLoading && <span className="text-blue-500 font-medium ml-2">데이터 로딩 중...</span>}
                    </div>

                    {/* 우측: 데이터 건수 */}
                    <div className={"font-medium"}>
                        건수: {displayData.length} / {totalCount}
                    </div>
                </div>
            </div>

            <StockTable
                data={displayData}
                observerRef={observerTarget}
                hasMore={hasMore || iseLoading}
                sortConfig={sortConfig}
                onSort={handleSort}
            />
        </div>
    );
}