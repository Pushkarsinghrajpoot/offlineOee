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
  delaytype: z.string().min(2, "Type must be at least 2 characters"),
  delayhead: z.string().min(2, "Head must be at least 2 characters"),
  delaydescription: z.string().optional(),
})

export default function DelayReasonsForm() {
  const [loading, setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      delaytype: "",
      delayhead: "",
      delaydescription: "",
    },
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const { error } = await supabase.from("delay_reasons").insert([data])
      if (error) throw error
      toast.success("Delay reason saved successfully")
      form.reset()
    } catch (error) {
      toast.error("Error saving delay reason")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Delay Reasons Entry</CardTitle>
        <CardDescription>
          Add new delay reason types
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="delaytype"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter delay type" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="delayhead"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Head</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter delay head" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="delaydescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter delay description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save Delay Reason"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
