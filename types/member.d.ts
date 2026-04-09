export interface CustomerAdress {
    id: string;
    stateRegistration?: string | null;
    zip: string;
    adress: string;
    number?: string | null;
    complement?: string | null;
    district?: string | null;
    state: string;
    city: string;
    memberId: string;
}
 
export interface Member {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    cpf?: string | null;
    adresses: CustomerAdress[];
}