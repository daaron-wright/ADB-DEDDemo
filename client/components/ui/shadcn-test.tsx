import React from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { Input } from './input';
import { Label } from './label';

/**
 * Simple test component to verify ShadCN integration
 * This can be imported and used anywhere to test the setup
 */
export const ShadCNTest = () => {
  return (
    <Card className="w-96 mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ShadCN Test
          <Badge variant="secondary">Working!</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-input">Test Input</Label>
          <Input 
            id="test-input" 
            placeholder="ShadCN components are working" 
            defaultValue="✅ Integration successful!"
          />
        </div>
        
        <div className="flex gap-2">
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button variant="outline">Outline</Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          If you can see this card with proper styling, ShadCN is working correctly!
        </div>
      </CardContent>
    </Card>
  );
};
