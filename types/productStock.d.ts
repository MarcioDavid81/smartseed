export interface ProductStock {
    id: string;
    productId: string;
    product: {
        id: string;
        name: string;
        class: string;
    };
    farmId: string;
    farm: {
        id: string;
        name: string;
    };
    stock: number;
    companyId: string;
}