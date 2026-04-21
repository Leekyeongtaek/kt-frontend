import {StockResponse} from "@/src/types/domain/stock";
import {SortConfig} from "@/src/components/stock/StockDashboard";

interface StockTableProps {
    data: StockResponse[];
    observerRef?: React.RefObject<HTMLDivElement | null>;
    hasMore?: boolean;
    sortConfig: SortConfig;
    onSort: (key: string, direction: 'asc' | 'desc') => void;
}

// 1. SortableHeader를 StockTable 밖으로 완전히 분리
// 이제 onSort 함수를 props로 추가로 전달받습니다.
const SortableHeader = ({columnKey, label, width, onSort}: { columnKey: string, label: string, width: string, onSort: (key: string, direction: 'asc' | 'desc') => void }) => {
    return (
        <th className={`border border-[#6b7b92] p-2 font-medium bg-[#54627b] sticky top-0 z-10`} style={{width}}>
            <div className="flex items-center gap-2 justify-center">
                <span>{label}</span>
                <div className="flex flex-col text-[9px] text-[#a3b3cc] opacity-70">
                    <span
                        onClick={(e) => {
                            e.stopPropagation();
                            onSort(columnKey, 'asc');
                        }}
                        className="leading-none cursor-pointer mb-[1px] hover:text-white transition-colors"
                    >
                        ▲
                    </span>
                    <span
                        onClick={(e) => {
                            e.stopPropagation();
                            onSort(columnKey, 'desc');
                        }}
                        className="leading-none cursor-pointer hover:text-white transition-colors"
                    >
                        ▼
                    </span>
                </div>
            </div>
        </th>
    );
};

export default function StockTable({data = [], observerRef, hasMore, sortConfig, onSort}: StockTableProps) {
    return (
        <div className="border border-gray-300 rounded-sm shadow-sm bg-white">
            <div className={"max-h-[600px] overflow-auto custom-scrollbar"}>
                <table className="w-full border-collapse text-[12px] table-fixed min-w-[1400px]">
                    <thead className="text-white font-normal text-[13px]">
                    <tr>
                        {/* 2. SortableHeader를 호출할 때 onSort 함수를 함께 넘겨줌 */}
                        <SortableHeader columnKey="standardCode" label="표준코드" width="120px" onSort={onSort} />
                        <SortableHeader columnKey="shortCode" label="단축코드" width="80px" onSort={onSort} />
                        <SortableHeader columnKey="korName" label="한글종목명" width="160px" onSort={onSort} />
                        <SortableHeader columnKey="korAbbrName" label="한글종목약명" width="140px" onSort={onSort} />
                        <SortableHeader columnKey="engName" label="영문종목명" width="180px" onSort={onSort} />
                        <SortableHeader columnKey="listedDate" label="상장일" width="100px" onSort={onSort} />
                        <SortableHeader columnKey="marketType" label="시장구분" width="80px" onSort={onSort} />
                        <SortableHeader columnKey="securitiesType" label="증권구분" width="80px" onSort={onSort} />
                        <SortableHeader columnKey="department" label="소속부" width="100px" onSort={onSort} />
                        <SortableHeader columnKey="stockType" label="주식종류" width="80px" onSort={onSort} />
                        <SortableHeader columnKey="faceValue" label="액면가" width="90px" onSort={onSort} />
                        <SortableHeader columnKey="listedShares" label="상장주식수" width="120px" onSort={onSort} />
                    </tr>
                    </thead>

                    <tbody className="bg-white text-[#333333]">
                    {data.map((item, index) => (
                        <tr key={item.standardCode + index}
                            className="hover:bg-[#f4f6f9] border-b border-gray-200 transition-colors">

                            <td className="border border-gray-200 p-2 text-center text-gray-500">{item.standardCode}</td>
                            <td className="border border-gray-200 p-2 text-center font-medium">{item.shortCode}</td>

                            <td className="border border-gray-200 p-2 text-left px-3 truncate" title={item.korName}>{item.korName}</td>
                            <td className="border border-gray-200 p-2 text-left px-3 truncate" title={item.korAbbrName}>{item.korAbbrName}</td>
                            <td className="border border-gray-200 p-2 text-left px-3 truncate" title={item.engName}>{item.engName}</td>

                            <td className="border border-gray-200 p-2 text-center">{item.listedDate}</td>
                            <td className="border border-gray-200 p-2 text-center">{item.marketTypeName}</td>
                            <td className="border border-gray-200 p-2 text-center">{item.securitiesTypeDescription}</td>
                            <td className="border border-gray-200 p-2 text-center">{item.departmentName}</td>
                            <td className="border border-gray-200 p-2 text-center">{item.stockTypeName}</td>

                            <td className="border border-gray-200 p-2 text-right pr-3">{item.faceValue.toLocaleString()}</td>
                            <td className="border border-gray-200 p-2 text-right pr-3">{item.listedShares.toLocaleString()}</td>
                        </tr>
                    ))}

                    {data.length === 0 && (
                        <tr>
                            <td colSpan={12} className={"p-10 text-center text-gray-500 border-gray-200"}>
                                조회된 데이터가 없습니다.
                            </td>
                        </tr>
                    )}

                    {data.length > 0 && (
                        <tr>
                            <td colSpan={12} className={"p-0 border-t border-gray-200"}>
                                <div ref={observerRef}
                                     className={"h-10 w-full flex items-center justify-center text-gray-400 text-xs"}>
                                    {hasMore ? "데이터를 불러오는 중..." : "모든 데이터 조회 완료"}
                                </div>
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}