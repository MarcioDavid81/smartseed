"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getToken } from "@/lib/auth-client";
import { useEffect, useState } from "react";

const DashboardContent = () => {

  return ( 
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="font-normal">Produtos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Produtos Cadastrados</p>
        </CardContent>
      </Card>
    </div>
   );
}
 
export default DashboardContent;