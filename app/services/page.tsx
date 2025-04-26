"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format, addMinutes, parse } from "date-fns"
import { Calendar as CalendarIcon, Clock, CheckCircle2, Scissors, Sparkles, Palette } from "lucide-react"
import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { BookingTerms } from "@/components/booking-terms"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

const BASE_TIME_SLOTS = [
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", 
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", 
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00"
]

const SERVICES_CONFIG = [
  {
    category: "Haircuts",
    icon: <Scissors className="h-5 w-5" />,
    items: [
      { name: "Gentleman's Cut", description: "Pengalaman grooming klasik untuk pria" },
      { name: "Gentleman's Cut (Capster by Request)", description: "Potongan premium dengan capster pilihan Anda" },
      { name: "Gentleman's Cut + 30 Min Full Back Massage", description: "Kombinasi potong rambut dan pijat punggung 30 menit" },
      { name: "Gentleman's Cut + Bekam Kering", description: "Perawatan bekam kering dengan gaya modern" },
      { name: "Gentleman's Cut + Ear Candle", description: "Perawatan lilin telinga untuk kenyamanan ekstra" },
      { name: "Gentleman's Cut (Long Trim)", description: "Pemangkasan khusus untuk rambut panjang" },
      { name: "Premium Gentleman's Cut", description: "Potong rambut, shampoo, hair wash, hair mask, handuk hangat, dan styling" },
      { name: "Premium Gentleman's Cut (Long trim)", description: "Pemangkasan premium untuk rambut panjang" },
      { name: "Creambath", description: "Perawatan deep conditioning untuk rambut" }
    ]
  },
  {
    category: "Styling",
    icon: <Sparkles className="h-5 w-5" />,
    items: [
      { name: "Perm + Gentleman's Cut", description: "Perm klasik dipadukan dengan potongan presisi" },
      { name: "Korean Perm + Gentleman's Cut", description: "Perawatan perm bergaya Korea" },
      { name: "Down Perm", description: "Gelombang rambut alami yang halus dan rapi" }
    ]
  },
  {
    category: "Coloring",
    icon: <Palette className="h-5 w-5" />,
    items: [
      { name: "Full Hair Coloring", description: "Transformasi warna rambut secara menyeluruh" },
      { name: "Full Hair Bleach", description: "Proses bleaching rambut profesional" },
      { name: "Highlight", description: "Aksen warna untuk memberikan dimensi pada rambut" },
      { name: "Polish (Semir)", description: "Penyegaran warna rambut secara cepat" }
    ]
  }
]


const formSchema = z.object({
  location: z.string({
    required_error: "Please select a location",
  }),
  service: z.string({
    required_error: "Please select a service",
  }),
  date: z.date({
    required_error: "Please select a date",
  }),
  time: z.string({
    required_error: "Please select a time",
  }),
  seat: z.string({
    required_error: "Please select a seat",
  }),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  terms_accepted: z.boolean().refine(val => val === true, {
    message: "You must accept the terms and conditions",
  }),
})

interface LocationService {
  id: string
  location_id: string
  service_id: string
  price: number
  duration: number
  service: {
    name: string
    description: string
  }
}

interface TimeSlot {
  time: string
  available: boolean
  availableSeats: string[]
}

export default function ServicesPage() {
  const [locations, setLocations] = useState<any[]>([])
  const [locationServices, setLocationServices] = useState<LocationService[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [selectedService, setSelectedService] = useState<LocationService | null>(null)
  const [loading, setLoading] = useState(true)
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [locationSeats, setLocationSeats] = useState<any[]>([])
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: '',
      service: '',
      name: '',
      email: '',
      phone: '',
      time: '',
      seat: '',
      date: undefined,
      terms_accepted: false,
    }
  })

  const selectedDate = form.watch('date')
  const selectedTime = form.watch('time')

  useEffect(() => {
    async function fetchLocations() {
      const { data: locations, error } = await supabase
        .from('locations')
        .select('*')
        .order('name')
      
      if (error) {
        toast.error('Failed to load locations')
        return
      }
      
      setLocations(locations || [])
      setLoading(false)
    }
    
    fetchLocations()
  }, [])

  useEffect(() => {
    async function fetchLocationServices() {
      if (!selectedLocation) return
  
      const { data, error } = await supabase
        .from('location_services')
        .select(`
          id,
          location_id,
          service_id,
          price,
          duration,
          service:services!service_id (
            name,
            description
          )
        `)
        .eq('location_id', selectedLocation)
  
      if (error) {
        toast.error('Failed to load services')
        return
      }
  
      setLocationServices(
        (data || []).map((item) => ({
          ...item,
          service: Array.isArray(item.service) ? item.service[0] : item.service,
        }))
      )
    }
  
    async function fetchLocationSeats() {
      if (!selectedLocation) return
  
      const { data: seats, error } = await supabase
        .from('seats')
        .select('*')
        .eq('location_id', selectedLocation)
        .eq('is_active', true)
        .order('name')
  
      if (error) {
        toast.error('Failed to load seats')
        return
      }
  
      setLocationSeats(seats || [])
    }
  
    fetchLocationServices()
    fetchLocationSeats()
  }, [selectedLocation])
  
  

  useEffect(() => {
    async function fetchAvailability() {
      if (!selectedDate || !selectedService?.id || !selectedLocation) {
        setAvailableTimeSlots(BASE_TIME_SLOTS.map(time => ({ 
          time, 
          available: true,
          availableSeats: []
        })))
        return
      }

      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('booking_time, seat_id, total_duration')
        .eq('booking_date', format(selectedDate, 'yyyy-MM-dd'))

      if (error) {
        toast.error('Failed to check availability')
        return
      }

      // Calculate available time slots and seats
      const slots = BASE_TIME_SLOTS.map(time => {
        // Start time of current slot
        const slotStart = parse(time, 'HH:mm', selectedDate)
        // End time based on the selected service duration
        const slotEnd = addMinutes(slotStart, selectedService.duration)
        
        // Get bookings that overlap with this time slot
        const overlappingBookings = bookings?.filter(booking => {
          const bookingTime = booking.booking_time
          const bookingDuration = booking.total_duration || 60 // Default to 60 minutes if not specified
          
          const bookingStart = parse(bookingTime, 'HH:mm', selectedDate)
          const bookingEnd = addMinutes(bookingStart, bookingDuration)

          // Check for any kind of overlap between slots
          const hasOverlap = (
            // Case 1: Slot starts during an existing booking
            (slotStart >= bookingStart && slotStart < bookingEnd) ||
            // Case 2: Slot ends during an existing booking
            (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
            // Case 3: Slot completely contains an existing booking
            (slotStart <= bookingStart && slotEnd >= bookingEnd) ||
            // Case 4: Booking completely contains the slot
            (bookingStart <= slotStart && bookingEnd >= slotEnd)
          )
          
          return hasOverlap
        })

        // Get seats that are booked for this time slot
        const bookedSeatIds = new Set()
        
        overlappingBookings?.forEach(booking => {
          bookedSeatIds.add(booking.seat_id)
        })
        
        // Get available seats for this time slot
        const availableSeats = locationSeats
          .filter(seat => !bookedSeatIds.has(seat.id))
          .map(seat => seat.id)

        return {
          time,
          available: availableSeats.length > 0,
          availableSeats
        }
      })

      setAvailableTimeSlots(slots)
    }

    fetchAvailability()
  }, [selectedDate, selectedService, selectedLocation, locationSeats])

  const handleSuccess = () => {
    setShowSuccess(true)
    setTimeout(() => {
      window.location.reload()
    }, 2000)
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (!selectedService) {
        toast.error("Please select a service")
        return
      }
  
      // Format the booking date
      const formattedDate = format(values.date, 'yyyy-MM-dd')
      const bookingTimeSlot = values.time
      
      // Show loading state
      toast.loading("Processing your booking...", { id: "booking-process" })
      
      // Double-check seat availability before submitting
      const { data: conflictingBookings, error: checkError } = await supabase
        .from('bookings')
        .select('seat_id, booking_time, total_duration')
        .eq('booking_date', formattedDate)
        .eq('seat_id', values.seat)
  
      if (checkError) {
        toast.error("Error checking seat availability", { id: "booking-process" })
        throw checkError
      }
  
      // Parse booking start and end times
      const bookingStart = parse(bookingTimeSlot, 'HH:mm', values.date)
      const bookingEnd = addMinutes(bookingStart, selectedService.duration)
  
      // Check for time slot conflicts with the selected seat
      const hasConflict = conflictingBookings?.some(booking => {
        const existingStart = parse(booking.booking_time, 'HH:mm', values.date)
        const existingDuration = booking.total_duration || 60 // Default to 60 minutes if not specified
        const existingEnd = addMinutes(existingStart, existingDuration)
  
        // Check all overlap cases
        return (
          // Case 1: New booking starts during an existing booking
          (bookingStart >= existingStart && bookingStart < existingEnd) ||
          // Case 2: New booking ends during an existing booking
          (bookingEnd > existingStart && bookingEnd <= existingEnd) ||
          // Case 3: New booking completely contains an existing booking
          (bookingStart <= existingStart && bookingEnd >= existingEnd) ||
          // Case 4: Existing booking completely contains new booking
          (existingStart <= bookingStart && existingEnd >= bookingEnd)
        )
      })
  
      if (hasConflict) {
        toast.error("This seat is no longer available at the selected time. Please select another seat or time.", { id: "booking-process" })
        return
      }
  
      // Handle day boundary crossing (services that end after midnight)
      let crossesDayBoundary = false
      
      // Check if the service ends on the next day
      if (bookingEnd.getDate() > bookingStart.getDate() || 
          bookingEnd.getMonth() > bookingStart.getMonth() || 
          bookingEnd.getFullYear() > bookingStart.getFullYear()) {
        
        crossesDayBoundary = true
        // Additional check for next day conflicts if needed in the future
      }
  
      console.log("Creating booking...")
      
      // Create booking record
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          customer_name: values.name,
          customer_email: values.email,
          customer_phone: values.phone,
          booking_date: formattedDate,
          booking_time: bookingTimeSlot,
          seat_id: values.seat,
          total_duration: selectedService.duration,
          total_price: selectedService.price,
          terms_accepted: values.terms_accepted
        })
        .select()
        .single()
  
      if (bookingError) {
        console.error("Booking error:", bookingError)
        toast.error("Failed to create booking", { id: "booking-process" })
        throw bookingError
      }
  
      // Create booking service record
      const { error: serviceError } = await supabase
        .from('booking_services')
        .insert({
          booking_id: booking.id,
          location_service_id: selectedService.id
        })
  
      if (serviceError) {
        console.error("Service error:", serviceError)
        toast.error("Failed to link service to booking", { id: "booking-process" })
        throw serviceError
      }
  
      // Dismiss loading toast and show success
      toast.success("Booking created successfully!", { id: "booking-process" })
      console.log("Booking created successfully!")
      setShowSuccessDialog(true)
      handleSuccess()
      
    } catch (error) {
      console.error("Submission failed:", error)
      toast.error("Failed to process booking. Please try again.", { id: "booking-process" })
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Book Your Appointment</h1>
          <p className="text-xl text-muted-foreground">
            Select your preferred service and time
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Success Message */}
            {showSuccess && (
              <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg transform transition-all duration-500 animate-in slide-in-from-top">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Booking confirmed! Check your email for details.</span>
                </div>
              </div>
            )}

            {/* Location Selector */}
            <div className="max-w-xl mx-auto">
              <Card className="p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold">Select Location</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                          setSelectedLocation(value)
                          form.setValue('service', '')
                          form.setValue('seat', '')
                          setSelectedService(null)
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12 transition-all hover:ring-2 hover:ring-primary/20 focus:ring-2 focus:ring-primary">
                            <SelectValue placeholder="Choose a location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.map((location) => (
                            <SelectItem 
                              key={location.id} 
                              value={location.id}
                              className="transition-colors hover:bg-primary/5"
                            >
                              {location.name}, {location.area}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>
            </div>

            {selectedLocation && (
              <>
                {/* Services Categories */}
                <div className="space-y-8">
                  {SERVICES_CONFIG.map((category) => (
                    <div key={category.category}>
                      <div className="flex items-center gap-2 mb-4">
                        {category.icon}
                        <h2 className="text-xl font-semibold">{category.category}</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {category.items.map((serviceConfig) => {
                          const locationService = locationServices.find(
                            ls => ls.service.name === serviceConfig.name
                          )
                          
                          if (!locationService) return null

                          return (
                            <Card
                              key={locationService.id}
                              className={cn(
                                "p-4 cursor-pointer transition-all duration-300",
                                selectedService?.id === locationService.id 
                                  ? "ring-2 ring-primary bg-primary/5 transform scale-[1.02]" 
                                  : "hover:bg-accent/5 hover:shadow-lg hover:scale-[1.01]"
                              )}
                              onClick={() => {
                                setSelectedService(locationService)
                                form.setValue("service", locationService.id)
                                form.setValue("time", "")
                                form.setValue("seat", "")
                              }}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium">{serviceConfig.name}</h3>
                                <Badge 
                                  variant={selectedService?.id === locationService.id ? "default" : "outline"}
                                  className="transition-colors"
                                >
                                  {(locationService.price / 1000)}K
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{serviceConfig.description}</p>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{locationService.duration} mins</span>
                              </div>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Booking Form */}
                {selectedService && (
                  <div className="max-w-xl mx-auto mt-12">
                    <Card className="p-8 shadow-lg">
                      <h2 className="text-2xl font-semibold mb-6">Complete Your Booking</h2>
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel>Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant={"outline"}
                                        className={cn(
                                          "w-full pl-3 text-left font-normal h-12 transition-all",
                                          "hover:ring-2 hover:ring-primary/20",
                                          "focus:ring-2 focus:ring-primary",
                                          !field.value && "text-muted-foreground"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={(date) => {
                                        field.onChange(date)
                                        form.setValue('time', '')
                                        form.setValue('seat', '')
                                      }}
                                      disabled={(date) =>
                                        date < new Date() || date < new Date("1900-01-01")
                                      }
                                      initialFocus
                                      className="rounded-md border"
                                    />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="time"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Time</FormLabel>
                                <Select 
                                  onValueChange={(value) => {
                                    field.onChange(value)
                                    form.setValue('seat', '')
                                  }}
                                  value={field.value}
                                  disabled={!selectedDate}
                                >
                                  <FormControl>
                                    <SelectTrigger 
                                      className={cn(
                                        "h-12 transition-all",
                                        "hover:ring-2 hover:ring-primary/20",
                                        "focus:ring-2 focus:ring-primary"
                                      )}
                                    >
                                      <SelectValue placeholder="Select time" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {availableTimeSlots.map((slot) => (
                                      <SelectItem
                                        key={slot.time}
                                        value={slot.time}
                                        disabled={!slot.available}
                                        className={cn(
                                          "flex items-center justify-between transition-colors",
                                          !slot.available ? "opacity-50" : "hover:bg-primary/5"
                                        )}
                                      >
                                        <span>{slot.time}</span>
                                        {!slot.available && (
                                          <Badge variant="destructive" className="ml-2">
                                            Booked
                                          </Badge>
                                        )}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {selectedTime && (
                          <FormField
                            control={form.control}
                            name="seat"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Select Seat (Cap)</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger
                                      className={cn(
                                        "h-12 transition-all",
                                        "hover:ring-2 hover:ring-primary/20",
                                        "focus:ring-2 focus:ring-primary"
                                      )}
                                    >
                                      <SelectValue placeholder="Choose a seat" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {locationSeats.map((seat) => {
                                      const timeSlot = availableTimeSlots.find(
                                        slot => slot.time === selectedTime
                                      )
                                      const isAvailable = timeSlot?.availableSeats.includes(seat.id)

                                      return (
                                        <SelectItem
                                          key={seat.id}
                                          value={seat.id}
                                          disabled={!isAvailable}
                                          className={cn(
                                            "flex items-center justify-between transition-colors",
                                            !isAvailable ? "opacity-50" : "hover:bg-primary/5"
                                          )}
                                        >
                                          <span>{seat.name}</span>
                                          {!isAvailable && (
                                            <Badge variant="destructive" className="ml-2">
                                              Booked
                                            </Badge>
                                          )}
                                        </SelectItem>
                                      )
                                    })}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}

                        <div className="space-y-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="John Doe" 
                                    {...field} 
                                    className={cn(
                                      "h-12 transition-all",
                                      "hover:ring-2 hover:ring-primary/20",
                                      "focus:ring-2 focus:ring-primary"
                                    )}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="email" 
                                      placeholder="john@example.com" 
                                      {...field}
                                      className={cn(
                                        "h-12 transition-all",
                                        "hover:ring-2 hover:ring-primary/20",
                                        "focus:ring-2 focus:ring-primary"
                                      )}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="tel" 
                                      placeholder="+1234567890" 
                                      {...field}
                                      className={cn(
                                        "h-12 transition-all",
                                        "hover:ring-2 hover:ring-primary/20",
                                        "focus:ring-2 focus:ring-primary"
                                      )}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <FormField
                          control={form.control}
                          name="terms_accepted"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <BookingTerms
                                  onAccept={(accepted) => field.onChange(accepted)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="pt-4 border-t">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-muted-foreground">Selected Service</span>
                            <span className="font-medium">{selectedService.service.name}</span>
                          </div>
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-muted-foreground">Duration</span>
                            <span className="font-medium">{selectedService.duration} mins</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Price</span>
                            <span className="font-medium">Rp {selectedService.price.toLocaleString()}</span>
                          </div>
                        </div>

                        <Button 
                          type="submit" 
                          className={cn(
                            "w-full h-12 text-lg font-semibold",
                            "transition-all duration-300",
                            "hover:scale-[1.02] hover:shadow-lg",
                            "active:scale-[0.98]"
                          )}
                        >
                          Confirm Booking
                        </Button>
                      </div>
                    </Card>
                  </div>
                )}
              </>
            )}
          </form>
        </Form>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Booking Confirmed!</DialogTitle>
              <DialogDescription>
                Your appointment has been successfully booked. A confirmation email has been sent to your email address.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center py-6">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full"
            >
              Book Another Appointment
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}