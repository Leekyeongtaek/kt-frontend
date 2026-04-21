import Header from "@/src/components/layout/Header";
import Navigation from "@/src/components/layout/Navigation";
import StockDashboard from "@/src/components/stock/StockDashboard";

export default function Home() {
    return (
        // 1. 전체 화면 높이(min-h-screen), 세로 배치(flex flex-col), 연한 회색 배경(bg-gray-50)
        <div className="min-h-screen flex flex-col">
            <Header/>
            {/*<Navigation/>*/}

            {/*남은 공간 채우기(flex-1), 양옆 패딩(p-4 ~ p-6)으로 대시보드 여백 확보*/}
            <main className="flex-1 w-full p-4 sm:p-6 lg:p-8">
                <StockDashboard/>
            </main>
        </div>
    );
}