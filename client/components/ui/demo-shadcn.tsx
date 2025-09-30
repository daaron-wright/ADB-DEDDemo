import React from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Input } from './input';
import { Label } from './label';
import { Badge } from './badge';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { AI_ASSISTANT_PROFILE } from "@/lib/profile";
import { Separator } from './separator';
import { Progress } from './progress';
import { Switch } from './switch';
import { Checkbox } from './checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from './select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Textarea } from './textarea';

export const ShadCNDemo = () => {
  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">ShadCN UI Components</h1>
        <p className="text-muted-foreground">
          Beautiful, accessible components built with Radix UI and Tailwind CSS
        </p>
      </div>

      {/* Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>Various button styles and sizes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">🚀</Button>
          </div>
        </CardContent>
      </Card>

      {/* Form Components */}
      <Card>
        <CardHeader>
          <CardTitle>Form Components</CardTitle>
          <CardDescription>Input fields, selects, and form controls</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="Enter your email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uae">United Arab Emirates</SelectItem>
                  <SelectItem value="usa">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" placeholder="Type your message here..." />
          </div>
          <Checkbox
            id="terms"
            label="Accept terms and conditions"
            onCheckedChange={() => {}}
            className="bg-white"
            checkboxClassName="border-primary text-primary focus-visible:ring-primary"
          />
          <div className="flex items-center space-x-2">
            <Switch id="notifications" />
            <Label htmlFor="notifications">Enable notifications</Label>
          </div>
        </CardContent>
      </Card>

      {/* Display Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Avatar and badges showcase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar>
                <AvatarImage src={AI_ASSISTANT_PROFILE.avatar} alt={AI_ASSISTANT_PROFILE.name} />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">AI Business Assistant</p>
                <p className="text-sm text-muted-foreground">AI-powered business guide</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge>Business Expert</Badge>
              <Badge variant="secondary">Active</Badge>
              <Badge variant="outline">UAE Certified</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress Tracking</CardTitle>
            <CardDescription>Progress indicators and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Application Progress</span>
                <span>68%</span>
              </div>
              <Progress value={68} />
            </div>
            <Separator />
            <div className="space-y-1">
              <p className="text-sm font-medium">Next Steps:</p>
              <p className="text-sm text-muted-foreground">
                Complete business license documentation
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Components */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Components</CardTitle>
          <CardDescription>Dialogs, tabs, and interactive elements</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Business License Information</DialogTitle>
                  <DialogDescription>
                    This dialog demonstrates ShadCN dialog component with proper accessibility.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="business-name">Business Name</Label>
                    <Input id="business-name" placeholder="Enter business name" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Submit</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-4">
              <p className="text-sm text-muted-foreground">
                Overview tab content showing business dashboard overview.
              </p>
            </TabsContent>
            <TabsContent value="analytics" className="mt-4">
              <p className="text-sm text-muted-foreground">
                Analytics tab showing business performance metrics.
              </p>
            </TabsContent>
            <TabsContent value="settings" className="mt-4">
              <p className="text-sm text-muted-foreground">
                Settings tab for configuring business preferences.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
