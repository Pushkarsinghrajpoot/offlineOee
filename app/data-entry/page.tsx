"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DelayReasonsForm from "@/components/forms/DelayReasonsForm"
import DowntimeForm from "@/components/forms/DowntimeForm"
import MachineSpeedForm from "@/components/forms/MachineSpeedForm"
import OperatorForm from "@/components/forms/OperatorForm"
import ProductDetailsForm from "@/components/forms/ProductDetailsForm"
import ProductionDataForm from "@/components/forms/ProductionDataForm"
import ShiftTimeForm from "@/components/forms/ShiftTimeForm"

export default function DataEntryPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">OEE Dashboard Data Entry</h1>
      
      <Tabs defaultValue="production" className="w-full">
        <TabsList className="grid grid-cols-7 mb-6">
          <TabsTrigger value="production">Production</TabsTrigger>
          <TabsTrigger value="operator">Operator</TabsTrigger>
          <TabsTrigger value="product">Product</TabsTrigger>
          <TabsTrigger value="machine-speed">Machine Speed</TabsTrigger>
          <TabsTrigger value="shift">Shift</TabsTrigger>
          <TabsTrigger value="downtime">Downtime</TabsTrigger>
          <TabsTrigger value="delay-reasons">Delay Reasons</TabsTrigger>
        </TabsList>
        
        <TabsContent value="production" className="space-y-4">
          <ProductionDataForm />
        </TabsContent>
        
        <TabsContent value="operator" className="space-y-4">
          <OperatorForm />
        </TabsContent>
        
        <TabsContent value="product" className="space-y-4">
          <ProductDetailsForm />
        </TabsContent>
        
        <TabsContent value="machine-speed" className="space-y-4">
          <MachineSpeedForm />
        </TabsContent>
        
        <TabsContent value="shift" className="space-y-4">
          <ShiftTimeForm />
        </TabsContent>
        
        <TabsContent value="downtime" className="space-y-4">
          <DowntimeForm />
        </TabsContent>
        
        <TabsContent value="delay-reasons" className="space-y-4">
          <DelayReasonsForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
