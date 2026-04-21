import {StockResponse} from '@/src/types/domain/stock'

export const stockMockData: StockResponse[] = Array.from({length: 100}, (_, i) => ({
    id: i,
    standardCode: `KR7${(1000000000 + i).toString()}`,
    shortCode: (100000 + i).toString(),
    // korName으로 수정 (krName -> korName)
    korName: i < 5 ? ['KPX홀딩스보통주', 'KR모터스보통주', 'LF보통주', 'LG1우선주', 'LG디스플레이보통주'][i] : `테스트종목_${i + 1}`,
    // korAbbrName으로 수정 (krShortName -> korAbbrName)
    korAbbrName: i < 5 ? ['KPX홀딩스', 'KR모터스', 'LF', 'LG우', 'LG디스플레이'][i] : `종목_${i + 1}`,
    // engName으로 수정 (enName -> engName)
    engName: `Stock_Item_${i + 1}`,
    // listedDate로 수정 (listDate -> listedDate)
    listedDate: '2026/04/13',

    marketTypeName: i % 2 === 0 ? 'KOSPI' : 'KOSDAQ',
    securitiesTypeDescription: '주권',
    departmentName: i % 3 === 0 ? '벤처기업부' : i % 3 === 1 ? '중견기업부' : '우량기업부',
    stockTypeName: '보통주',
    faceValue: i % 2 === 0 ? 500 : 100,
    listedShares: ((i * 7777777) % 50000000) + 5000000,
}));