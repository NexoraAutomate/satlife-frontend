"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Satellite } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { UserRole } from "@/lib/dummy-data";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@satlife.com");
  const [password, setPassword] = useState("password123");
  const [role, setRole] = useState<UserRole>("Admin");
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login(email, role);
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/5" />
      </div>
      <Card className="relative w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <Satellite className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">SatLife</CardTitle>
          <CardDescription className="text-muted-foreground">
            Satellite Lifecycle Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="text-foreground">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Entry Operator">Entry Operator</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full mt-2">
              Sign In
            </Button>
            <p className="text-center text-xs text-muted-foreground pt-2">
              Demo credentials are pre-filled. Select a role and sign in.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
