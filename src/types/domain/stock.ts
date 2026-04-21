export enum MarketType {
    KOSPI = 'KOSPI',
    KOSDAQ = 'KOSDAQ',
    KOSDAQ_GLOBAL = 'KOSDAQ_GLOBAL',
    KONEX = 'KONEX',
}

export enum SecuritiesType {
    STOCK = 'STOCK',
    REIT = 'REIT',
    DEPOSITORY_RECEIPT = 'DEPOSITORY_RECEIPT',
    FOREIGN_STOCK = 'FOREIGN_STOCK',
    INFRASTRUCTURE_INVESTMENT = 'INFRASTRUCTURE_INVESTMENT',
    INVESTMENT_COMPANY = 'INVESTMENT_COMPANY',
}

export enum Department {
    MID_TIER = 'MID_TIER',
    BLUE_CHIP = 'BLUE_CHIP',
}

export enum StockType {
    COMMON = 'COMMON',
    OLD_PREFERRED = 'OLD_PREFERRED',
    NEW_PREFERRED = 'NEW_PREFERRED',
    CERTIFICATE_OF_CLASS_SHARE = 'CERTIFICATE_OF_CLASS_SHARE',
}

export interface StockSearchCondition {
    keyword: string;
    marketType: MarketType | 'ALL';
    stockType: StockType | 'ALL';
    department: Department | 'ALL';
    securitiesType: SecuritiesType | 'ALL';
}

export interface StockResponse {
    id: number;
    standardCode: string;
    shortCode: string;
    korName: string;
    korAbbrName: string;
    engName: string;
    listedDate: string;

    // marketType: MarketType;
    marketTypeName: string;

    // securitiesType: SecuritiesType;
    securitiesTypeDescription: string;

    // department: Department;
    departmentName: string;

    // stockType: StockType;
    stockTypeName: string;

    faceValue: number;
    listedShares: number;
}