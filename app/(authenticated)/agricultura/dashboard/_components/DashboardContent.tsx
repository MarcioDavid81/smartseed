"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getToken } from "@/lib/auth-client";
import { IndustryProduct } from "@/types";
import { useEffect, useState } from "react";

const DashboardContent = () => {
  const [products, setProducts] = useState<IndustryProduct[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      console.log("Fetching products...");
      const token = getToken();
      if (!token) {
        console.error("Token não encontrado.");
        return;
      }
      const response = await fetch("/api/industry/product", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log("Dados retornados:", data)
      setProducts(data);
    };
    fetchProducts();
  }, []);

  return ( 
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-normal">Produtos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length > 0 ? (
              products.map((product) => (
                <p key={product.id} className="text-2xl font-medium">
                  {product.name}
                </p>
              ))
          ) : (
            <p>Nenhum produto cadastrado.</p>
          )}
        </CardContent>
      </Card>
    </div>
   );
}
 
export default DashboardContent;