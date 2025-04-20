"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format, addMinutes, parse } from "date-fns"
import { Calendar as CalendarIcon, Clock, CheckCircle2, Scissors, Sparkles, Droplet, Palette, QrCode, CreditCard, Wallet, Loader2 } from "lucide-react"
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
  "10:00", "11:00", "12:00", "13:00", "14:00",
  "15:00", "16:00", "17:00", "18:00", "19:00"
]

const PAYMENT_METHODS = [
  { 
    id: 'qris', 
    name: 'QRIS', 
    icon: <QrCode className="h-5 w-5" />,
    description: 'Pay using any QRIS-compatible e-wallet'
  },
  { 
    id: 'bca', 
    name: 'Virtual BCA', 
    icon: <CreditCard className="h-5 w-5" />,
    description: 'Get virtual account number for bank transfer'
  },
  { 
    id: 'gopay', 
    name: 'GoPay', 
    icon: <Wallet className="h-5 w-5" />,
    description: 'Pay directly with your GoPay balance'
  }
]

const SERVICES_CONFIG = [
  {
    category: "Haircuts",
    icon: <Scissors className="h-5 w-5" />,
    items: [
      { name: "Gentleman's Cut", description: "Classic grooming experience" },
      { name: "Gentleman's Cut (Capster by Request)", description: "Premium cut with your preferred stylist" },
      { name: "Gentleman's Cut + 30 Min Full Back Massage", description: "Relaxing combination of cut and massage" },
      { name: "Gentleman's Cut + Bekam Kering", description: "Traditional therapy with modern styling" },
      { name: "Gentleman's Cut + Ear Candle", description: "Therapeutic ear treatment with styling" },
      { name: "Gentleman's Cut (Long Trim)", description: "Specialized long hair trimming" }
    ]
  },
  {
    category: "Styling",
    icon: <Sparkles className="h-5 w-5" />,
    items: [
      { name: "Perm + Gentleman's Cut", description: "Classic perm with precision cut" },
      { name: "Korean Perm + Gentleman's Cut", description: "K-style perm treatment" },
      { name: "Down Perm", description: "Subtle, natural-looking waves" }
    ]
  },
  {
    category: "Coloring",
    icon: <Palette className="h-5 w-5" />,
    items: [
      { name: "Full Hair Coloring", description: "Complete color transformation" },
      { name: "Full Hair Bleach", description: "Professional lightening service" },
      { name: "Highlight", description: "Dimensional color accents" },
      { name: "Polish (Semir)", description: "Quick color refresh" }
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
  payment_method: z.string({
    required_error: "Please select a payment method",
  }),
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

interface PaymentDetails {
  qr_code?: string
  virtual_account?: string
  deeplink?: string
  expires_at: string
}

export default function ServicesPage() {
  const [locations, setLocations] = useState<any[]>([])
  const [locationServices, setLocationServices] = useState<LocationService[]>([])
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [selectedService, setSelectedService] = useState<LocationService | null>(null)
  const [loading, setLoading] = useState(true)
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showPaymentDetails, setShowPaymentDetails] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('')
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
      payment_method: '',
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
          service:services (
            name,
            description
          )
        `)
        .eq('location_id', selectedLocation)

      if (error) {
        toast.error('Failed to load services')
        return
      }

      setLocationServices(data || [])
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
        .select('booking_time, seat_id')
        .eq('booking_date', format(selectedDate, 'yyyy-MM-dd'))
        .in('payment_status', ['completed', 'processing'])

      if (error) {
        toast.error('Failed to check availability')
        return
      }

      // Calculate available time slots and seats
      const slots = BASE_TIME_SLOTS.map(time => {
        const slotStart = parse(time, 'HH:mm', selectedDate)
        const slotEnd = addMinutes(slotStart, selectedService.duration)

        // Get bookings that overlap with this time slot
        const overlappingBookings = bookings?.filter(booking => {
          const bookingStart = parse(booking.booking_time, 'HH:mm', selectedDate)
          const bookingEnd = addMinutes(bookingStart, selectedService.duration)

          return (
            (slotStart >= bookingStart && slotStart < bookingEnd) ||
            (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
            (slotStart <= bookingStart && slotEnd >= bookingEnd)
          )
        })

        // Get seats that are available for this time slot
        const bookedSeatIds = overlappingBookings?.map(b => b.seat_id) || []
        const availableSeats = locationSeats
          .filter(seat => !bookedSeatIds.includes(seat.id))
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

      // Double-check seat availability before submitting
      const { data: conflictingBookings, error: checkError } = await supabase
        .from('bookings')
        .select('seat_id, booking_time')
        .eq('booking_date', format(values.date, 'yyyy-MM-dd'))
        .eq('seat_id', values.seat)
        .in('payment_status', ['completed', 'processing'])

      if (checkError) throw checkError

      // Check for time slot conflicts
      const bookingStart = parse(values.time, 'HH:mm', values.date)
      const bookingEnd = addMinutes(bookingStart, selectedService.duration)

      const hasConflict = conflictingBookings?.some(booking => {
        const existingStart = parse(booking.booking_time, 'HH:mm', values.date)
        const existingEnd = addMinutes(existingStart, selectedService.duration)

        return (
          (bookingStart >= existingStart && bookingStart < existingEnd) ||
          (bookingEnd > existingStart && bookingEnd <= existingEnd) ||
          (bookingStart <= existingStart && bookingEnd >= existingEnd)
        )
      })

      if (hasConflict) {
        toast.error("This seat is no longer available. Please select another seat or time.")
        return
      }

      setShowPaymentDialog(true)
    } catch (error) {
      toast.error("Failed to process booking. Please try again.")
    }
  }

  async function processPayment(paymentMethod: string) {
    try {
      setPaymentProcessing(true)
      setSelectedPaymentMethod(paymentMethod)
      form.setValue('payment_method', paymentMethod)

      const values = form.getValues()

      // Create initial booking with pending status
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          customer_name: values.name,
          customer_email: values.email,
          customer_phone: values.phone,
          booking_date: format(values.date, 'yyyy-MM-dd'),
          booking_time: values.time,
          seat_id: values.seat,
          total_duration: selectedService!.duration,
          total_price: selectedService!.price,
          payment_status: 'processing',
          payment_method: paymentMethod,
          payment_details: null,
          terms_accepted: values.terms_accepted,
          payment_expiry: format(addMinutes(new Date(), 15), "yyyy-MM-dd'T'HH:mm:ssXXX")
        })
        .select()
        .single()

      if (bookingError) throw bookingError

      // Create booking service record
      const { error: serviceError } = await supabase
        .from('booking_services')
        .insert({
          booking_id: booking.id,
          location_service_id: selectedService!.id
        })

      if (serviceError) throw serviceError

      // Simulate payment gateway integration
      const mockPaymentDetails: PaymentDetails = {
        expires_at: format(addMinutes(new Date(), 15), "yyyy-MM-dd'T'HH:mm:ssXXX")
      }

      switch (paymentMethod) {
        case 'qris':
          mockPaymentDetails.qr_code = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=mockqrcode'
          break
        case 'bca':
          mockPaymentDetails.virtual_account = '8277083398'
          break
        case 'gopay':
          mockPaymentDetails.deeplink = 'gojek://gopay/payment'
          break
      }

      // Update booking with payment details
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ 
          payment_details: mockPaymentDetails,
          payment_id: `PAY-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        })
        .eq('id', booking.id)

      if (updateError) throw updateError

      setPaymentDetails(mockPaymentDetails)
      setShowPaymentDetails(true)

      // Simulate payment completion after 2 seconds
      setTimeout(async () => {
        const { error: completeError } = await supabase
          .from('bookings')
          .update({ payment_status: 'completed' })
          .eq('id', booking.id)

        if (completeError) {
          toast.error("Payment verification failed")
          return
        }

        setShowPaymentDialog(false)
        setShowPaymentDetails(false)
        handleSuccess()
        toast.success("Payment successful! Booking confirmed.")
      }, 2000)

    } catch (error) {
      toast.error("Payment failed. Please try again.")
    } finally {
      setPaymentProcessing(false)
    }
  }

  function PaymentDetailsContent({ method, details }: { method: string, details: PaymentDetails }) {
    switch (method) {
      case 'qris':
        return (
          <div className="text-center">
            <img src={details.qr_code} alt="QRIS Code" className="mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              Scan this QR code using any QRIS-compatible e-wallet
            </p>
          </div>
        )
      case 'bca':
        return (
          <div className="text-center">
            <p className="text-2xl font-mono mb-2">{details.virtual_account}</p>
            <p className="text-sm text-muted-foreground">
              Transfer to this Virtual Account number before it expires
            </p>
          </div>
        )
      case 'gopay':
        return (
          <div className="text-center">
            <Button
              onClick={() => window.open(details.deeplink, '_blank')}
              className="mb-4 bg-[#00AA13] hover:bg-[#00AA13]/90 transition-colors"
            >
              Open GoPay App
            </Button>
            <p className="text-sm text-muted-foreground">
              Click the button above to open GoPay and complete your payment
            </p>
          </div>
        )
      default:
        return null
    }
  }

  const isKiaraArthaLocation = locations.find(loc => loc.id === selectedLocation)?.name === 'KIARA ARTHA'

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
                {isKiaraArthaLocation ? (
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4">Coming Soon!</h2>
                    <p className="text-muted-foreground">
                      Our Kiara Artha location is currently under construction. 
                      Please check back later or visit our other locations.
                    </p>
                  </div>
                ) : (
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
                              Proceed to Payment
                            </Button>
                          </div>
                        </Card>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </form>
        </Form>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Complete Your Payment</DialogTitle>
              <DialogDescription>
                Choose your preferred payment method
              </DialogDescription>
            </DialogHeader>

            {!showPaymentDetails ? (
              <div className="grid gap-4 py-4">
                {PAYMENT_METHODS.map((method) => (
                  <Card
                    key={method.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all duration-300",
                      selectedPaymentMethod === method.id
                        ? "ring-2 ring-primary bg-primary/5"
                        : "hover:bg-accent/5 hover:shadow-md",
                      paymentProcessing && "pointer-events-none opacity-50"
                    )}
                    onClick={() => processPayment(method.id)}
                  >
                    <div className="flex items-center gap-3">
                      {method.icon}
                      <div>
                        <p className="font-medium">{method.name}</p>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="py-6">
                {paymentProcessing ? (
                  <div className="text-center py-4">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Processing your payment...</p>
                   </div>
                ) : (
                  <>
                    <PaymentDetailsContent 
                      method={selectedPaymentMethod} 
                      details={paymentDetails!}
                    />
                    <p className="text-sm text-muted-foreground text-center mt-4">
                      Payment expires in 15 minutes
                    </p>
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}