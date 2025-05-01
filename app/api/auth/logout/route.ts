import { NextResponse } from "next/server";

export async function GET() {
    const response = NextResponse.json({ message: "Logout efetuado" });

    //destruir o cookie e retornar  para a página de logi
    response.cookies.delete("token");
    return response;
    
}