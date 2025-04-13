'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/lib/database.types';
import { toast } from 'sonner';
import { FileText, Factory, Ruler, Package, Clock, User, Users, UserCircle, UserCircle2, ShieldCheck, ClipboardCheck, Save } from 'lucide-react';

type Operator = Database['public']['Tables']['operator']['Row'];
type Product = Database['public']['Tables']['product_details']['Row'];
type MachineSpeed = Database['public']['Tables']['machine_speed']['Row'];
type Shift = Database['public']['Tables']['shift_time']['Row'];
type Line = Database['public']['Tables']['line']['Row'];

interface ProductionDataFormProps {
  onProductionDataCreated?: (id: string) => void;
}

export default function ProductionDataForm({ onProductionDataCreated }: ProductionDataFormProps) {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [machineSpeeds, setMachineSpeeds] = useState<MachineSpeed[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [lines, setLines] = useState<Line[]>([]);
  const [formData, setFormData] = useState({
    line_id: '',
    size: '',
    product_id: '',
    machine_speed_id: '',
    operator_id: '',
    assistant_operator_id: '',
    rm_operator1_id: '',
    rm_operator2_id: '',
    shift_incharge_id: '',
    quality_operator_id: '',
    shift_id: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [savedProductionData, setSavedProductionData] = useState<any>(null);
  const [productLines, setProductLines] = useState<any[]>([]);
  const [productDetails, setProductDetails] = useState<any[]>([]);
  const [operatorDetails, setOperatorDetails] = useState<any[]>([]);
  const [shiftDetails, setShiftDetails] = useState<any[]>([]);
  const [showSavedData, setShowSavedData] = useState(true);

  useEffect(() => {
    fetchData();
    seedInitialData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      //fetch line
      const lineData = await supabase
        .from('line')
        .select('*')
        .order('name');
      
      if (lineData.error) {
        console.error('Error fetching lines:', lineData.error);
      } else {
        console.log('Lines fetched:', lineData.data.length);
        setLines(lineData.data || []);
      }
      
      // Fetch operators
      const operatorsData = await supabase
        .from('operator')
        .select('*')
        .order('operator_name');
      
      if (operatorsData.error) {
        console.error('Error fetching operators:', operatorsData.error);
      } else {
        console.log('Operators fetched:', operatorsData.data.length);
        setOperators(operatorsData.data || []);
      }
      
      // Fetch products
      const productsData = await supabase
        .from('product_details')
        .select('*')
        .order('product_code');
      
      if (productsData.error) {
        console.error('Error fetching products:', productsData.error);
      } else {
        console.log('Products fetched:', productsData.data.length);
        setProducts(productsData.data || []);
      }
      
      // Fetch machine speeds
      const machineSpeedsData = await supabase
        .from('machine_speed')
        .select('*')
        .order('size');
      
      if (machineSpeedsData.error) {
        console.error('Error fetching machine speeds:', machineSpeedsData.error);
      } else {
        console.log('Machine speeds fetched:', machineSpeedsData.data.length);
        setMachineSpeeds(machineSpeedsData.data || []);
        
        // Set initial values for the form if there's data
        if (machineSpeedsData.data?.[0]) {
          setFormData(prev => ({
            ...prev,
            size: machineSpeedsData.data[0].size,
            machine_speed_id: machineSpeedsData.data[0].id
          }));
        }
      }
      
      // Fetch shifts
      const shiftsData = await supabase
        .from('shifts')
        .select('*')
        .order('shift_name');
      
      if (shiftsData.error) {
        console.error('Error fetching shifts:', shiftsData.error);
      } else {
        console.log('Shifts fetched:', shiftsData.data.length);
        setShifts(shiftsData.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSizeChange = (size: string) => {
    const machineSpeed = machineSpeeds.find(ms => ms.size === size);
    if (machineSpeed) {
      setFormData(prev => ({
        ...prev,
        size,
        machine_speed_id: machineSpeed.id
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Validate required fields
      if (!formData.line_id) {
        toast.error('Please select a line');
        setSubmitting(false);
        return;
      }
      if (!formData.product_id) {
        toast.error('Please select a product');
        setSubmitting(false);
        return;
      }
      if (!formData.operator_id) {
        toast.error('Please select an operator');
        setSubmitting(false);
        return;
      }
      if (!formData.shift_id) {
        toast.error('Please select a shift');
        setSubmitting(false);
        return;
      }

      console.log('Submitting form data:', formData);
      
      // Prepare data for insertion - convert empty strings to null for optional fields
      const dataToInsert = {
        line_id: formData.line_id,
        size: formData.size,
        product_id: formData.product_id,
        machine_speed_id: formData.machine_speed_id,
        operator_id: formData.operator_id,
        assistant_operator_id: formData.assistant_operator_id,
        rm_operator1_id: formData.rm_operator1_id,
        rm_operator2_id: formData.rm_operator2_id,
        shift_incharge_id: formData.shift_incharge_id,
        quality_operator_id: formData.quality_operator_id,
        shift_id: formData.shift_id,
        date: formData.date
      };
      
      const { data, error } = await supabase
        .from('production_data')
        .insert([dataToInsert])
        .select();

      if (error) {
        console.error('Error inserting data:', error);
        toast.error(`Error saving data: ${error.message}`);
        throw error;
      }
      
      console.log('Production data added successfully:', data);
      
      // Call the callback with the created ID if available
      if (onProductionDataCreated && data && data.length > 0) {
        onProductionDataCreated(data[0].id);
        
        // Fetch the complete production data details after saving
        fetchProductionDataDetails(data[0].id);
      }
      
      // Show success message
      toast.success('Production data saved successfully!');
      
      // Reset form
      setFormData({
        line_id: '',
        size: machineSpeeds[0]?.size || '',
        product_id: '',
        machine_speed_id: machineSpeeds[0]?.id || '',
        operator_id: '',
        assistant_operator_id: '',
        rm_operator1_id: '',
        rm_operator2_id: '',
        shift_incharge_id: '',
        quality_operator_id: '',
        shift_id: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      // Reset submitting state
      setSubmitting(false);
    } catch (error) {
      console.error('Error inserting data:', error);
      toast.error('Error saving production data. Please try again.');
      setSubmitting(false);
    }
  };

  const seedInitialData = async () => {
    try {
      // Insert operators if they don't exist
      const operatorData = [
        { operator_name: 'John Smith' },
        { operator_name: 'Maria Garcia' },
        { operator_name: 'David Johnson' },
        { operator_name: 'Sarah Lee' },
        { operator_name: 'Michael Brown' },
        { operator_name: 'Lisa Chen' },
        { operator_name: 'Robert Wilson' },
        { operator_name: 'Emily Davis' }
      ];

      const { error: operatorError } = await supabase
        .from('operator')
        .upsert(operatorData, { onConflict: 'operator_name' });

      if (operatorError) throw operatorError;

      // Insert machine speeds if they don't exist
      const speedData = [
        { size: '200ml', speed: 120 },
        { size: '500ml', speed: 100 },
        { size: '750ml', speed: 80 },
        { size: '1000ml', speed: 60 }
      ];

      const { error: speedError } = await supabase
        .from('machine_speed')
        .upsert(speedData, { onConflict: 'size' });

      if (speedError) throw speedError;

      // Insert product details if they don't exist
      const productData = [
        { product_description: 'Mineral Water', product_code: 'MW001' },
        { product_description: 'Sparkling Water', product_code: 'SW001' },
        { product_description: 'Flavored Water - Lemon', product_code: 'FW001' },
        { product_description: 'Flavored Water - Orange', product_code: 'FW002' },
        { product_description: 'Energy Drink', product_code: 'ED001' }
      ];

      const { error: productError } = await supabase
        .from('product_details')
        .upsert(productData, { onConflict: 'product_code' });

      if (productError) throw productError;

      // Insert shift times if they don't exist
      const shiftData = [
        { shift_name: 'Morning', shift_timing: '06:00-14:00' },
        { shift_name: 'Afternoon', shift_timing: '14:00-22:00' },
        { shift_name: 'Night', shift_timing: '22:00-06:00' }
      ];

      const { error: shiftError } = await supabase
        .from('shift_time')
        .upsert(shiftData, { onConflict: 'shift_name' });

      if (shiftError) throw shiftError;

      // Insert delay reasons if they don't exist
      const delayData = [
        { delaytype: 'Planned', delayhead: 'Maintenance', delaydescription: 'Scheduled maintenance' },
        { delaytype: 'Planned', delayhead: 'Break', delaydescription: 'Regular break time' },
        { delaytype: 'Unplanned', delayhead: 'Machine', delaydescription: 'Machine breakdown' },
        { delaytype: 'Unplanned', delayhead: 'Material', delaydescription: 'Material shortage' },
        { delaytype: 'Unplanned', delayhead: 'Quality', delaydescription: 'Quality issues' }
      ];

      const { error: delayError } = await supabase
        .from('delay_reasons')
        .upsert(delayData);

      if (delayError) throw delayError;

      console.log('Initial data seeded successfully');
      fetchData(); // Refresh the data after seeding
    } catch (error) {
      console.error('Error seeding initial data:', error);
    }
  };

  const fetchProductionDataDetails = async (id: string) => {
    try {
      // Fetch the production data with related information
      const { data: productionData, error } = await supabase
        .from('production_data')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching production data details:', error);
        toast.error(`Error fetching production data details: ${error.message}`);
        return;
      }

      // Set the saved production data
      setSavedProductionData(productionData);

      // Fetch related data for display
      await Promise.all([
        fetchLineDetails(productionData.line_id),
        fetchProductDetails(productionData.product_id),
        fetchOperatorDetails([
          productionData.operator_id,
          productionData.assistant_operator_id,
          productionData.rm_operator1_id,
          productionData.rm_operator2_id,
          productionData.shift_incharge_id,
          productionData.quality_operator_id
        ].filter(Boolean)),
        fetchShiftDetails(productionData.shift_id)
      ]);

    } catch (error) {
      console.error('Error fetching production data details:', error);
      toast.error('Error fetching production data details');
    }
  };

  const fetchLineDetails = async (lineId: string) => {
    if (!lineId) return;
    
    const { data, error } = await supabase
      .from('line')
      .select('*')
      .eq('id', lineId);
    
    if (error) {
      console.error('Error fetching line details:', error);
    } else {
      setProductLines(data);
    }
  };

  const fetchProductDetails = async (productId: string) => {
    if (!productId) return;
    
    const { data, error } = await supabase
      .from('product_details')
      .select('*')
      .eq('id', productId);
    
    if (error) {
      console.error('Error fetching product details:', error);
    } else {
      setProductDetails(data);
    }
  };

  const fetchOperatorDetails = async (operatorIds: string[]) => {
    if (!operatorIds.length) return;
    
    const { data, error } = await supabase
      .from('operator')
      .select('*')
      .in('id', operatorIds);
    
    if (error) {
      console.error('Error fetching operator details:', error);
    } else {
      setOperatorDetails(data);
    }
  };

  const fetchShiftDetails = async (shiftId: string) => {
    if (!shiftId) return;
    
    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('id', shiftId);
    
    if (error) {
      console.error('Error fetching shift details:', error);
    } else {
      setShiftDetails(data);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="production-form-card mb-3 overflow-hidden border-0 shadow-lg">
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-2">
        <h2 className="text-lg font-bold text-white flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          Production Data Entry
        </h2>
      </div>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {/* Date Field - Now First */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <Clock className="h-3 w-3 text-blue-500" />
                Date
              </Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="h-7 text-xs"
              />
            </div>

            {/* Shift Field - Now Second */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <Clock className="h-3 w-3 text-blue-500" />
                Shift
              </Label>
              <Select
                value={formData.shift_id}
                onValueChange={(value) => setFormData({ ...formData, shift_id: value })}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map((shift) => (
                    <SelectItem key={shift.id} value={shift.id}>
                      {shift.shift_name} ({shift.shift_timing})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Production Line */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <Factory className="h-3 w-3 text-blue-500" />
                Line
              </Label>
              <Select
                value={formData.line_id}
                onValueChange={(value) => setFormData({ ...formData, line_id: value })}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Select line" />
                </SelectTrigger>
                <SelectContent> 
                  {lines.map((line) => (
                    <SelectItem key={line.id} value={line.id}>
                      {line.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Size */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <Ruler className="h-3 w-3 text-blue-500" />
                Size
              </Label>
              <Select
                value={formData.size}
                onValueChange={handleSizeChange}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {machineSpeeds.map((speed) => (
                    <SelectItem key={speed.id} value={speed.size}>
                      {speed.size} ({speed.speed} units/min)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <Package className="h-3 w-3 text-blue-500" />
                Product
              </Label>
              <Select
                value={formData.product_id}
                onValueChange={(value) => setFormData({ ...formData, product_id: value })}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.product_code} - {product.product_description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Main Operator */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <User className="h-3 w-3 text-blue-500" />
                Main Operator
              </Label>
              <Select
                value={formData.operator_id}
                onValueChange={(value) => setFormData({ ...formData, operator_id: value })}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((operator) => (
                    <SelectItem key={operator.id} value={operator.id}>
                      {operator.operator_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Assistant Operator */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <Users className="h-3 w-3 text-blue-500" />
                Assistant
              </Label>
              <Select
                value={formData.assistant_operator_id}
                onValueChange={(value) => setFormData({ ...formData, assistant_operator_id: value })}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Select assistant" />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((operator) => (
                    <SelectItem key={operator.id} value={operator.id}>
                      {operator.operator_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* RM Operator 1 */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <UserCircle className="h-3 w-3 text-blue-500" />
                RM Op. 1
              </Label>
              <Select
                value={formData.rm_operator1_id}
                onValueChange={(value) => setFormData({ ...formData, rm_operator1_id: value })}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Select RM op. 1" />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((operator) => (
                    <SelectItem key={operator.id} value={operator.id}>
                      {operator.operator_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* RM Operator 2 */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <UserCircle2 className="h-3 w-3 text-blue-500" />
                RM Op. 2
              </Label>
              <Select
                value={formData.rm_operator2_id}
                onValueChange={(value) => setFormData({ ...formData, rm_operator2_id: value })}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Select RM op. 2" />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((operator) => (
                    <SelectItem key={operator.id} value={operator.id}>
                      {operator.operator_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Shift Incharge */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-blue-500" />
                Incharge
              </Label>
              <Select
                value={formData.shift_incharge_id}
                onValueChange={(value) => setFormData({ ...formData, shift_incharge_id: value })}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Select incharge" />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((operator) => (
                    <SelectItem key={operator.id} value={operator.id}>
                      {operator.operator_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Quality Operator */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <ClipboardCheck className="h-3 w-3 text-blue-500" />
                Quality
              </Label>
              <Select
                value={formData.quality_operator_id}
                onValueChange={(value) => setFormData({ ...formData, quality_operator_id: value })}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Select quality" />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((operator) => (
                    <SelectItem key={operator.id} value={operator.id}>
                      {operator.operator_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Save Button */}
            <div className="space-y-1 flex items-end">
              <Button 
                type="submit"
                className="h-7 px-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white hover:from-blue-700 hover:to-purple-800 text-xs whitespace-nowrap w-full"
                disabled={submitting}
              >
                <Save className="h-3 w-3 mr-1" />
                {submitting ? 'Saving...' : 'Save Data'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
      
      {/* Display saved production data with toggle functionality */}
      {savedProductionData && (
        <div className="mt-0 bg-blue-50 p-2 rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-blue-700 flex items-center">
              <FileText className="h-3 w-3 mr-1" />
              Last Saved Production Data
            </h3>
            <Button
              variant="outline"
              onClick={() => setShowSavedData(!showSavedData)}
              className="text-xs h-6 px-2"
            >
              {showSavedData ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>
          
          {showSavedData && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs">
              <div className="bg-white rounded-md p-1.5 shadow-sm">
                <span className="font-medium text-gray-700">ID:</span> {savedProductionData.id}
              </div>
              <div className="bg-white rounded-md p-1.5 shadow-sm">
                <span className="font-medium text-gray-700">Date:</span> {savedProductionData.date || 'Not specified'}
              </div>
              <div className="bg-white rounded-md p-1.5 shadow-sm">
                <span className="font-medium text-gray-700">Shift:</span> {shiftDetails?.[0]?.shift_name || 'Not specified'}
              </div>
              <div className="bg-white rounded-md p-1.5 shadow-sm">
                <span className="font-medium text-gray-700">Line:</span> {productLines?.[0]?.name || 'Not specified'}
              </div>
              <div className="bg-white rounded-md p-1.5 shadow-sm">
                <span className="font-medium text-gray-700">Size:</span> {savedProductionData.size || 'Not specified'}
              </div>
              <div className="bg-white rounded-md p-1.5 shadow-sm">
                <span className="font-medium text-gray-700">Product:</span> {productDetails?.[0]?.product_code ? `${productDetails[0].product_code} - ${productDetails[0].product_description}` : 'Not specified'}
              </div>
              <div className="bg-white rounded-md p-1.5 shadow-sm">
                <span className="font-medium text-gray-700">Main Operator:</span> {operatorDetails?.find(op => op.id === savedProductionData.operator_id)?.operator_name || 'Not specified'}
              </div>
              <div className="bg-white rounded-md p-1.5 shadow-sm">
                <span className="font-medium text-gray-700">Assistant:</span> {operatorDetails?.find(op => op.id === savedProductionData.assistant_operator_id)?.operator_name || 'Not specified'}
              </div>
              <div className="bg-white rounded-md p-1.5 shadow-sm">
                <span className="font-medium text-gray-700">RM Op. 1:</span> {operatorDetails?.find(op => op.id === savedProductionData.rm_operator1_id)?.operator_name || 'Not specified'}
              </div>
              <div className="bg-white rounded-md p-1.5 shadow-sm">
                <span className="font-medium text-gray-700">RM Op. 2:</span> {operatorDetails?.find(op => op.id === savedProductionData.rm_operator2_id)?.operator_name || 'Not specified'}
              </div>
              <div className="bg-white rounded-md p-1.5 shadow-sm">
                <span className="font-medium text-gray-700">Shift Incharge:</span> {operatorDetails?.find(op => op.id === savedProductionData.shift_incharge_id)?.operator_name || 'Not specified'}
              </div>
              <div className="bg-white rounded-md p-1.5 shadow-sm">
                <span className="font-medium text-gray-700">Quality Op.:</span> {operatorDetails?.find(op => op.id === savedProductionData.quality_operator_id)?.operator_name || 'Not specified'}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
