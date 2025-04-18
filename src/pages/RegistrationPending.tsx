
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ClockIcon } from 'lucide-react';

const RegistrationPending = () => {
  return (
    <div className="min-h-screen bg-health-green flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ClockIcon className="h-16 w-16 text-amber-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Registration Pending</CardTitle>
          <CardDescription>Your doctor account is awaiting approval</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            Thank you for registering as a doctor with HealthHub. Your account has been created, but requires administrator approval before you can access the system.
          </p>
          <p className="mb-4 text-gray-600">
            This process may take 24-48 hours. You will receive an email notification once your account has been approved.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link to="/login">
            <Button className="bg-primary hover:bg-primary/80">
              Back to Login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegistrationPending;
