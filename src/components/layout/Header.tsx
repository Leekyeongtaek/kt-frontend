export default function Header() {
    // 양팔 저울 원리에 빗댄 비유
    // 부모 컨테이너 <header>
    // flex를 사용해 자식들을 가로로 배치, items-center로 세로 중앙 정렬 맞춤
    return (
        <header className="flex items-center px-6 py-3 bg-[#1e293b] text-white">
            {/*
            flex-1: 양팔 저울의 왼쪽 접시, 남은 여백을 모두 빨아들여 공간 차지하기
            justify-start: 차지한 공간 안에서 로고를 제일 왼쪽으로 밀어붙임
            */}
            <div className={"flex-1 flex items-center justify-start"}>
                <h1 className={"text-xl font-bold tracking-tighter"}>
                    <span className={"text-blue-300"}>Mr.lee</span> Marketplace
                </h1>
            </div>

            {/*
            flex-1: 양팔 저울의 '오른쪽 접시' 역할, 눈에 보이지 않지만 왼쪽 로고와 똑같은 크기의 공간 차지
            */}
            <div className={"flex-1"}>
            </div>
        </header>
    );
}