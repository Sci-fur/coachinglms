import { Card, CardContent, CardTitle } from "../../components/ui/card";
import { BookOpen } from "lucide-react";

export default function PlaceholderPage({ title, description, icon: Icon }) {
  return (
    <Card className="py-16">
      <CardContent className="text-center">
        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          {Icon ? <Icon className="h-7 w-7 text-primary" /> : <BookOpen className="h-7 w-7 text-primary" />}
        </div>
        <CardTitle className="text-xl mb-2">{title}</CardTitle>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          {description || "This section is coming soon."}
        </p>
      </CardContent>
    </Card>
  );
}
