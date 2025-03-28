"use client"

import { useState } from "react"
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
  operator_name: z.string().min(2, "Name must be at least 2 characters"),
})

export default function OperatorForm() {
  const [loading, setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      operator_name: "",
    },
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const { error } = await supabase.from("operator").insert([data])
      if (error) throw error
      toast.success("Operator data saved successfully")
      form.reset()
    } catch (error) {
      toast.error("Error saving operator data")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Operator Data Entry</CardTitle>
        <CardDescription>
          Add new operator information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="operator_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operator Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter operator name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save Operator Data"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
