
import React, { useState } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, User } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from '@/components/ui/use-toast';

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  availability: string[];
}

const AppointmentBooking = () => {
  const { user } = useAuth();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);

  // Mock doctors data
  const doctors: Doctor[] = [
    { 
      id: 'doctor-1', 
      name: 'Dr. Smith', 
      specialization: 'General Medicine',
      availability: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM']
    },
    { 
      id: 'doctor-2', 
      name: 'Dr. Johnson', 
      specialization: 'Cardiology',
      availability: ['9:30 AM', '10:30 AM', '1:30 PM', '2:30 PM', '4:30 PM']
    },
    { 
      id: 'doctor-3', 
      name: 'Dr. Wilson', 
      specialization: 'Pediatrics',
      availability: ['8:00 AM', '10:00 AM', '12:00 PM', '2:00 PM', '4:00 PM'] 
    },
  ];

  const handleBookAppointment = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select a doctor, date, and time to book an appointment.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, you would save the appointment to a database here
    const formattedDate = format(selectedDate, 'PPP');
    
    toast({
      title: "Appointment Booked!",
      description: `Your appointment with ${selectedDoctor.name} on ${formattedDate} at ${selectedTime} has been booked.`,
    });
    
    // Reset form
    setSelectedDoctor(null);
    setSelectedDate(undefined);
    setSelectedTime(undefined);
  };

  // Filter out past dates
  const isDateDisabled = (date: Date) => {
    return date < new Date(new Date().setHours(0, 0, 0, 0));
  };

  return (
    <div className="min-h-screen bg-health-green p-4">
      <div className="health-container py-6">
        <h1 className="text-3xl font-bold mb-6 text-health-dark">Book an Appointment</h1>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
              Schedule Your Appointment
            </CardTitle>
            <CardDescription>
              Select a doctor, date, and time for your appointment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Doctor</label>
                <Select onValueChange={(value) => setSelectedDoctor(doctors.find(d => d.id === value) || null)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        <div className="flex flex-col">
                          <span>{doctor.name}</span>
                          <span className="text-xs text-gray-500">{doctor.specialization}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={isDateDisabled}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Time</label>
                <Select 
                  onValueChange={setSelectedTime} 
                  disabled={!selectedDoctor}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={selectedDoctor ? "Select a time" : "First select a doctor"} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedDoctor?.availability.map((time) => (
                      <SelectItem key={time} value={time}>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          <span>{time}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={handleBookAppointment} 
                  className="w-full"
                  disabled={!selectedDoctor || !selectedDate || !selectedTime}
                >
                  Book Appointment
                </Button>
              </div>
              
              {selectedDoctor && selectedDate && selectedTime && (
                <div className="mt-4 p-4 bg-blue-50 rounded-md">
                  <h3 className="text-sm font-medium text-blue-800">Appointment Summary</h3>
                  <div className="mt-2 text-sm text-blue-700 space-y-1">
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>{selectedDoctor.name} ({selectedDoctor.specialization})</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <span>{format(selectedDate, 'PPP')}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>{selectedTime}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentBooking;
