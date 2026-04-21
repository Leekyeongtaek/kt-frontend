export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    last: boolean;
    first: boolean;
    number: number;
    size: number;
    numberOfElements: number;
    empty: boolean;
}

export interface ApiResponse<T> {
    status: number;
    message: string;
    data: T;
}