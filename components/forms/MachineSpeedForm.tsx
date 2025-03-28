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
  size: z.string().min(1, "Size is required"),
  speed: z.coerce.number().min(0, "Speed must be a positive number"),
})

export default function MachineSpeedForm() {
  const [loading, setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      size: "",
      speed: 0,
    },
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      const { error } = await supabase.from("machine_speed").insert([data])
      if (error) throw error
      toast.success("Machine speed data saved successfully")
      form.reset()
    } catch (error) {
      toast.error("Error saving machine speed data")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Machine Speed Entry</CardTitle>
        <CardDescription>
          Add machine speed settings for different sizes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Enter size" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="speed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Speed</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" step="1" placeholder="Enter speed" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save Machine Speed"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
