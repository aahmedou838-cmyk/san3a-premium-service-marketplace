import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="text-center space-y-6 max-w-lg">
        <h1 className="text-4xl font-bold">About</h1>
        <p className="text-muted-foreground">
          This is a second page demonstrating multi-page routing with React Router layout routes.
        </p>
        <Button asChild variant="outline">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
