import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl items-center p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Solvelog</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Track challenges, find weaknesses, improve.
          </p>
          <Button>Coming soon</Button>
        </CardContent>
      </Card>
    </main>
  );
}