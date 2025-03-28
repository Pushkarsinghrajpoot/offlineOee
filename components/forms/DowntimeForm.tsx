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
  start_time: z.string().min(1, "Start time is required"),
  end_time: z.string().min(1, "End time is required"),
  delaytype: z.string().min(1, "Delay type is required"),
  delayhead: z.string().min(1, "Delay head is required"),
  delaydescription: z.string().optional(),
})

export default function DowntimeForm() {
  const [loading, setLoading] = useState(false)
  const [delayTypes, setDelayTypes] = useState([])
  const [delayHeads, setDelayHeads] = useState([])
  const [delayDescriptions, setDelayDescriptions] = useState([])
  const [selectedDelayType, setSelectedDelayType] = useState("")
  const [selectedDelayHead, setSelectedDelayHead] = useState("")

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      start_time: "",
      end_time: "",
      delaytype: "",
      delayhead: "",
      delaydescription: "",
    },
  })

  // Fetch unique delay types
  const fetchDelayTypes = async () => {
    try {
      const { data, error } = await supabase
        .from("delay_reasons")
        .select("delaytype")
        .order("delaytype")
      
      if (error) throw error;
      
      // Check if we have any results
      if (!data || data.length === 0) {
        toast.error("No delay types found in the database");
        setDelayTypes([]);
        return;
      }
      
      // Get unique delay types and filter out any empty strings
      const uniqueTypes = [...new Set(data.map(item => item.delaytype))]
        .filter(type => type && type.trim() !== "");
      
      setDelayTypes(uniqueTypes.map(type => ({ value: type, label: type })));
    } catch (error) {
      toast.error("Error fetching delay types");
    }
  }

  // Fetch delay heads based on selected delay type
  const fetchDelayHeads = async (delayType) => {
    if (!delayType) {
      setDelayHeads([]);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("delay_reasons")
        .select("delayhead")
        .eq("delaytype", delayType)
        .order("delayhead");
      
      if (error) throw error;
      
      // Check if we have any results
      if (!data || data.length === 0) {
        toast.error("No delay heads found for the selected type");
        setDelayHeads([]);
        return;
      }
      
      // Get unique delay heads and filter out any empty strings
      const uniqueHeads = [...new Set(data.map(item => item.delayhead))]
        .filter(head => head && head.trim() !== "");
      
      setDelayHeads(uniqueHeads.map(head => ({ value: head, label: head })));
      
      // Reset delay descriptions when delay type changes
      setDelayDescriptions([]);
      form.setValue("delayhead", "");
      form.setValue("delaydescription", "");
    } catch (error) {
      toast.error("Error fetching delay heads");
    }
  }

  // Fetch delay descriptions based on selected delay type and head
  const fetchDelayDescriptions = async (delayType, delayHead) => {
    if (!delayType || !delayHead) {
      setDelayDescriptions([]);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("delay_reasons")
        .select("id, delaydescription")
        .eq("delaytype", delayType)
        .eq("delayhead", delayHead)
        .order("delaydescription");
      
      if (error) throw error;
      
      // Check if we have any results
      if (!data || data.length === 0) {
        toast.error("No delay descriptions found for the selected type and head");
        setDelayDescriptions([]);
        return;
      }
      
      // Map the data and ensure each item has a valid value
      setDelayDescriptions(data.map(item => {
        // For null or empty description, use a special value
        const descValue = item.delaydescription ? item.delaydescription.trim() : "";
        return { 
          value: descValue || "no_description", // Ensure value is never empty string
          label: descValue || "No description",
          id: item.id
        };
      }));
      
      form.setValue("delaydescription", "");
    } catch (error) {
      toast.error("Error fetching delay descriptions");
    }
  }

  useEffect(() => {
    fetchDelayTypes();
  }, []);

  // When delay type changes, fetch corresponding heads
  useEffect(() => {
    fetchDelayHeads(selectedDelayType);
  }, [selectedDelayType]);

  // When delay head changes, fetch corresponding descriptions
  useEffect(() => {
    fetchDelayDescriptions(selectedDelayType, selectedDelayHead);
  }, [selectedDelayType, selectedDelayHead]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Check for special "not found" values
      if (data.delaytype === "no_types_found" || 
          data.delayhead === "no_heads_found" || 
          data.delaydescription === "no_descriptions_found") {
        throw new Error("Please select valid delay reason options");
      }
      
      // Find the delay reason ID based on the selected type, head, and description
      let query = supabase
        .from("delay_reasons")
        .select("id")
        .eq("delaytype", data.delaytype)
        .eq("delayhead", data.delayhead);
      
      // Handle the special case for empty description
      if (data.delaydescription === "no_description") {
        // If the special "no_description" value is selected, look for records with empty or null description
        query = query.is("delaydescription", null);
      } else {
        query = query.eq("delaydescription", data.delaydescription);
      }
      
      const { data: delayReasonData, error: delayReasonError } = await query;
      
      if (delayReasonError) throw delayReasonError;
      
      if (!delayReasonData || delayReasonData.length === 0) {
        throw new Error("Delay reason not found");
      }
      
      const delay_reason_id = delayReasonData[0].id;
      
      // Get current date in ISO format (YYYY-MM-DD)
      const today = new Date().toISOString().split('T')[0];
      
      // Combine current date with selected times
      const startDateTime = `${today}T${data.start_time}:00`;
      const endDateTime = `${today}T${data.end_time}:00`;
      
      // Calculate duration (in minutes)
      const startTime = new Date(startDateTime);
      const endTime = new Date(endDateTime);
      
      // Handle case where end time is earlier than start time (spans midnight)
      let durationInMinutes = (endTime - startTime) / (1000 * 60);
      let downtime_split = "minor_stop";
      if (durationInMinutes < 0) {
        // Add 24 hours (1440 minutes) if end time is on the next day
        durationInMinutes += 1440;
      }
      if(durationInMinutes>=15){
        downtime_split = "break-down";
      }
      // Format duration as PostgreSQL interval: 'HH:MM:SS'
      const hours = Math.floor(durationInMinutes / 60);
      const minutes = Math.floor(durationInMinutes % 60);
      const duration = `${hours}:${minutes}:00`;
      
      const { error } = await supabase.from("downtime").insert([{
        start_time: startDateTime,
        end_time: endDateTime,
        duration: duration,
        delay_reason_id: delay_reason_id,
        downtime_split: downtime_split,
      }]);
      
      if (error) throw error;
      
      toast.success("Downtime data saved successfully");
      form.reset();
      setSelectedDelayType("");
      setSelectedDelayHead("");
    } catch (error) {
      toast.error(`Error saving downtime data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Downtime Data Entry</CardTitle>
        <CardDescription>
          Record machine downtime incidents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input {...field} type="time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input {...field} type="time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="delaytype"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delay Type</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedDelayType(value);
                      }} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select delay type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {delayTypes.length > 0 ? (
                          delayTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no_types_found" disabled>
                            No delay types found
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="delayhead"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delay Head</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setSelectedDelayHead(value);
                      }} 
                      value={field.value}
                      disabled={!selectedDelayType}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select delay head" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {delayHeads.length > 0 ? (
                          delayHeads.map((head) => (
                            <SelectItem key={head.value} value={head.value}>
                              {head.label}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no_heads_found" disabled>
                            No delay heads found
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="delaydescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delay Description</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={!selectedDelayHead}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select delay description" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {delayDescriptions.length > 0 ? (
                          delayDescriptions.map((desc) => (
                            <SelectItem key={desc.id} value={desc.value}>
                              {desc.label}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no_descriptions_found" disabled>
                            No delay descriptions found
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save Downtime Data"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
