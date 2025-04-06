"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"

const formSchema = z.object({
  line_id: z.string().min(1, "Line is required"),
  size: z.string().min(1, "Size is required"),
  product_id: z.string().min(1, "Product is required"),
  machine_speed_id: z.string().min(1, "Machine speed is required"),
  operator_id: z.string().min(1, "Operator is required"),
  assistant_operator_id: z.string(),
  rm_operator1_id: z.string(),
  rm_operator2_id: z.string(),
  shift_incharge_id: z.string(),
  quality_operator_id: z.string(),
  shift_id: z.string().min(1, "Shift is required"),
})

interface ProductionDataFormProps {
  onProductionDataCreated?: (id: string) => void;
}

export default function ProductionDataForm({ onProductionDataCreated }: ProductionDataFormProps) {
  const [loading, setLoading] = useState(false)
  const [operators, setOperators] = useState([])
  const [products, setProducts] = useState([])
  const [shifts, setShifts] = useState([])
  const [machineSpeeds, setMachineSpeeds] = useState([])
  const [lines, setLines] = useState([])

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      line_id: "",
      size: "",
      product_id: "",
      machine_speed_id: "",
      operator_id: "",
      assistant_operator_id: "none",
      rm_operator1_id: "none",
      rm_operator2_id: "none",
      shift_incharge_id: "none",
      quality_operator_id: "none",
      shift_id: "",
    },
  })

  const fetchReferenceData = async () => {
    try {
      const { data: operatorData } = await supabase.from("operator").select("*")
      setOperators(operatorData || [])

      const { data: productData } = await supabase.from("product_details").select("*")
      setProducts(productData || [])

      const { data: shiftData } = await supabase.from("shifts").select("id, shift_name")
      setShifts(shiftData || [])
      
      const { data: speedData } = await supabase.from("machine_speed").select("*")
      setMachineSpeeds(speedData || [])
      
      // Fetch lines from the line table
      const { data: lineData } = await supabase.from("line").select("id, name")
      setLines(lineData || [])
    } catch (error) {
      toast.error("Error fetching reference data")
    }
  }

  useEffect(() => {
    fetchReferenceData()
  }, [])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      // Convert "none" values to null for optional fields
      const formattedData = {
        ...data,
        assistant_operator_id: data.assistant_operator_id === "none" ? null : data.assistant_operator_id,
        rm_operator1_id: data.rm_operator1_id === "none" ? null : data.rm_operator1_id,
        rm_operator2_id: data.rm_operator2_id === "none" ? null : data.rm_operator2_id,
        shift_incharge_id: data.shift_incharge_id === "none" ? null : data.shift_incharge_id,
        quality_operator_id: data.quality_operator_id === "none" ? null : data.quality_operator_id,
      };

      const { data: insertedData, error } = await supabase
        .from("production_data")
        .insert([formattedData])
        .select();

      if (error) throw error;
      
      toast.success("Production data saved successfully");
      
      // Call the callback with the created ID if available
      if (onProductionDataCreated && insertedData && insertedData.length > 0) {
        onProductionDataCreated(insertedData[0].id);
      }
      
      form.reset();
    } catch (error) {
      toast.error("Error saving production data");
      console.error("Error saving production data:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Production Data Entry</CardTitle>
        <CardDescription>
          Enter production details for a specific shift
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="line_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Line</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select line" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {lines.map((line) => (
                          <SelectItem key={line.id} value={line.id}>
                            {line.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="shift_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shift</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select shift" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {shifts.map((shift) => (
                          <SelectItem key={shift.id} value={shift.id}>
                            {shift.shift_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="operator_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Main Operator</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select operator" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {operators.map((operator) => (
                          <SelectItem key={operator.id} value={operator.id}>
                            {operator.operator_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="assistant_operator_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assistant Operator</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assistant operator" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {operators.map((operator) => (
                          <SelectItem key={operator.id} value={operator.id}>
                            {operator.operator_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="rm_operator1_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RM Operator 1</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select RM operator 1" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {operators.map((operator) => (
                          <SelectItem key={operator.id} value={operator.id}>
                            {operator.operator_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="rm_operator2_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RM Operator 2</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select RM operator 2" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {operators.map((operator) => (
                          <SelectItem key={operator.id} value={operator.id}>
                            {operator.operator_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="shift_incharge_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shift Incharge</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select shift incharge" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {operators.map((operator) => (
                          <SelectItem key={operator.id} value={operator.id}>
                            {operator.operator_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="quality_operator_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quality Operator</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select quality operator" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {operators.map((operator) => (
                          <SelectItem key={operator.id} value={operator.id}>
                            {operator.operator_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="product_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.product_description} ({product.product_code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size</FormLabel>
                    <FormControl>
                      <Input {...field} type="text" placeholder="Enter size" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="machine_speed_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Machine Speed</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select machine speed" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {machineSpeeds.map((speed) => (
                          <SelectItem key={speed.id} value={speed.id}>
                            {speed.size} - {speed.speed} units/min
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save Production Data"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
