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
  shift_name: z.string().min(1, "Shift name is required"),
  shift_timing: z.string().min(1, "Shift timing is required"),
})

export default function ShiftTimeForm() {
  const [loading, setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shift_name: "",
      shift_timing: "",
    },
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const { error } = await supabase.from("shift_time").insert([data])
      if (error) throw error
      toast.success("Shift time data saved successfully")
      form.reset()
    } catch (error) {
      toast.error("Error saving shift time data")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shift Time Entry</CardTitle>
        <CardDescription>
          Add new shift timing information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="shift_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shift Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter shift name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shift_timing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shift Timing</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., 06:00 - 14:00" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save Shift Time"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
