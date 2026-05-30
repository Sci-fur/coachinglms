import { Component } from "react";
import { Button } from "./ui/button";
import { AlertTriangle } from "lucide-react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background p-8">
          <div className="text-center max-w-md space-y-4">
            <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
            <h1 className="text-xl font-bold">Something went wrong</h1>
            <p className="text-muted-foreground text-sm">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <Button onClick={() => { this.setState({ hasError: false }); window.location.href = "/"; }}>
              Go Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
