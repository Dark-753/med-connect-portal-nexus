
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, UserCheck, UserX, Trash2, PlusCircle, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";

const AdminDashboard = () => {
  const { user, approveDoctorRegistration, getAllDoctors } = useAuth();
  
  // Fetch all doctors from auth context
  const [pendingDoctors, setPendingDoctors] = useState<any[]>([]);
  const [approvedDoctors, setApprovedDoctors] = useState<any[]>([]);
  
  // Mock data for users
  const [users] = useState([
    { id: 'user-1', name: 'Test User', email: 'user@example.com' },
    { id: 'user-2', name: 'Jane Doe', email: 'jane@example.com' },
    { id: 'user-3', name: 'Bob Smith', email: 'bob@example.com' },
  ]);

  // State for hospital details form
  const [doctorToEdit, setDoctorToEdit] = useState<string | null>(null);
  const [hospitalDetails, setHospitalDetails] = useState({
    hospital: '',
    experience: '',
    specialization: '',
    emergencyPhone: '',
    emergencyEmail: ''
  });

  useEffect(() => {
    // Get all doctors and separate them into pending and approved
    const allDoctors = getAllDoctors();
    
    const pending = allDoctors.filter(doctor => !doctor.approved);
    const approved = allDoctors.filter(doctor => doctor.approved);
    
    setPendingDoctors(pending);
    setApprovedDoctors(approved);
  }, [getAllDoctors]);

  const handleApprove = (doctorId: string) => {
    approveDoctorRegistration(doctorId);
    
    // Move doctor from pending to approved
    const doctorToMove = pendingDoctors.find(doctor => doctor.id === doctorId);
    if (doctorToMove) {
      const updatedApproved = [...approvedDoctors, {
        ...doctorToMove,
        approved: true
      }];
      setApprovedDoctors(updatedApproved);
      setPendingDoctors(pendingDoctors.filter(doctor => doctor.id !== doctorId));
      
      toast({
        title: "Doctor Approved",
        description: `${doctorToMove.name} has been approved and can now access the system`,
      });
    }
  };

  const handleRemoveDoctor = (doctorId: string) => {
    setApprovedDoctors(approvedDoctors.filter(doctor => doctor.id !== doctorId));
    toast({
      title: "Doctor Removed",
      description: "The doctor has been removed from the system",
    });
  };

  const handleUpdateHospitalDetails = () => {
    if (!doctorToEdit) return;
    
    setApprovedDoctors(approvedDoctors.map(doctor => {
      if (doctor.id === doctorToEdit) {
        return {
          ...doctor,
          hospital: hospitalDetails.hospital,
          experience: hospitalDetails.experience,
          specialization: hospitalDetails.specialization || doctor.specialization,
          emergencyPhone: hospitalDetails.emergencyPhone,
          emergencyEmail: hospitalDetails.emergencyEmail
        };
      }
      return doctor;
    }));
    
    toast({
      title: "Doctor Details Updated",
      description: "The doctor's details have been updated successfully",
    });
    
    setDoctorToEdit(null);
    setHospitalDetails({
      hospital: '',
      experience: '',
      specialization: '',
      emergencyPhone: '',
      emergencyEmail: ''
    });
  };

  const openEditDialog = (doctor: any) => {
    setDoctorToEdit(doctor.id);
    setHospitalDetails({
      hospital: doctor.hospital || '',
      experience: doctor.experience || '',
      specialization: doctor.specialization || '',
      emergencyPhone: doctor.emergencyPhone || '',
      emergencyEmail: doctor.emergencyEmail || ''
    });
  };

  return (
    <div className="min-h-screen bg-health-green p-4">
      <div className="health-container py-6">
        <div className="flex items-center mb-6">
          <Shield className="text-secondary mr-2 h-6 w-6" />
          <h1 className="text-3xl font-bold text-health-dark">Admin Dashboard</h1>
        </div>
        
        <div className="bg-white rounded-lg p-6 mb-8 shadow-md">
          <h2 className="text-xl font-semibold mb-2">Welcome, {user?.name}</h2>
          <p className="text-gray-600">
            As the system administrator, you can manage doctors, approve registrations, and oversee all users.
          </p>
        </div>
        
        <div className="mb-8">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserCheck className="mr-2 h-5 w-5 text-primary" />
                Pending Doctor Approvals
              </CardTitle>
              <CardDescription>
                New doctor registration requests that require your approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingDoctors.length === 0 ? (
                <p className="text-gray-500">No pending doctor registration requests.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingDoctors.map(doctor => (
                      <TableRow key={doctor.id}>
                        <TableCell>{doctor.name}</TableCell>
                        <TableCell>{doctor.email}</TableCell>
                        <TableCell>{doctor.specialization || 'Not specified'}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            className="border-green-500 text-green-500 hover:bg-green-50"
                            onClick={() => handleApprove(doctor.id)}
                          >
                            Approve
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCheck className="mr-2 h-5 w-5 text-primary" />
                  Approved Doctors
                </CardTitle>
                <CardDescription>
                  Currently active doctor accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>Hospital</TableHead>
                      <TableHead>Emergency</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedDoctors.map(doctor => (
                      <TableRow key={doctor.id}>
                        <TableCell>{doctor.name}</TableCell>
                        <TableCell>{doctor.email}</TableCell>
                        <TableCell>{doctor.specialization || 'Not set'}</TableCell>
                        <TableCell>
                          {doctor.hospital ? `${doctor.hospital} (${doctor.experience})` : 'Not set'}
                        </TableCell>
                        <TableCell>
                          {doctor.emergencyPhone && 
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 mr-1">
                              <Phone className="h-3 w-3 mr-1" /> {doctor.emergencyPhone}
                            </Badge>
                          }
                        </TableCell>
                        <TableCell className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-blue-500 border-blue-500 hover:bg-blue-50"
                                onClick={() => openEditDialog(doctor)}
                              >
                                <PlusCircle className="h-4 w-4 mr-1" /> Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Update Doctor Details</DialogTitle>
                                <DialogDescription>
                                  Add or update details for {doctor.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                  <Label htmlFor="specialization">Specialization</Label>
                                  <Input 
                                    id="specialization" 
                                    value={hospitalDetails.specialization}
                                    onChange={(e) => setHospitalDetails({...hospitalDetails, specialization: e.target.value})}
                                    placeholder="e.g. Cardiology"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="hospital">Hospital</Label>
                                  <Input 
                                    id="hospital" 
                                    value={hospitalDetails.hospital}
                                    onChange={(e) => setHospitalDetails({...hospitalDetails, hospital: e.target.value})}
                                    placeholder="e.g. St. Mary's Hospital"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="experience">Experience</Label>
                                  <Input 
                                    id="experience" 
                                    value={hospitalDetails.experience}
                                    onChange={(e) => setHospitalDetails({...hospitalDetails, experience: e.target.value})}
                                    placeholder="e.g. 10 years"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="emergencyPhone">Emergency Phone</Label>
                                  <Input 
                                    id="emergencyPhone" 
                                    value={hospitalDetails.emergencyPhone}
                                    onChange={(e) => setHospitalDetails({...hospitalDetails, emergencyPhone: e.target.value})}
                                    placeholder="e.g. +1 234 567 8900"
                                  />
                                </div>
                                <div className="grid gap-2">
                                  <Label htmlFor="emergencyEmail">Emergency Email</Label>
                                  <Input 
                                    id="emergencyEmail" 
                                    value={hospitalDetails.emergencyEmail}
                                    onChange={(e) => setHospitalDetails({...hospitalDetails, emergencyEmail: e.target.value})}
                                    placeholder="e.g. emergency@hospital.com"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button type="button" variant="secondary">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleUpdateHospitalDetails}>Save Changes</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-500 border-red-500 hover:bg-red-50"
                            onClick={() => handleRemoveDoctor(doctor.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="mr-2 h-5 w-5 text-primary" />
                  Registered Patients
                </CardTitle>
                <CardDescription>
                  All patient accounts in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-500">Active</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
