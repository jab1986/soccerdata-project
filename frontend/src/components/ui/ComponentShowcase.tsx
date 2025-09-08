import React, { useState } from 'react';
import { Button, Card, Badge, LoadingSpinner } from './index';
import { PlayIcon, PauseIcon } from '@heroicons/react/24/solid';

// Component showcase for testing the enhanced component library
const ComponentShowcase: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);

  const handleLoadingTest = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  const handleOverlayTest = () => {
    setShowOverlay(true);
    setTimeout(() => setShowOverlay(false), 3000);
  };

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Enhanced UI Component Library</h1>
      
      {/* Button Showcase */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Enhanced Buttons with Framer Motion</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" startIcon={<PlayIcon className="w-5 h-5" />}>
            Primary Button
          </Button>
          <Button variant="secondary" loading={loading} onClick={handleLoadingTest}>
            {loading ? 'Loading...' : 'Test Loading'}
          </Button>
          <Button variant="danger" endIcon={<PauseIcon className="w-5 h-5" />}>
            Danger Button
          </Button>
          <Button variant="ghost" size="sm">
            Ghost Small
          </Button>
          <Button variant="primary" size="lg" disabled>
            Large Disabled
          </Button>
        </div>
      </Card>

      {/* Card Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card shadow="sm" padding="sm">
          <h3 className="font-semibold">Small Card</h3>
          <p>This is a small card with motion animations.</p>
        </Card>
        <Card interactive onClick={() => alert('Card clicked!')} shadow="md">
          <h3 className="font-semibold">Interactive Card</h3>
          <p>Click me to see the interaction!</p>
        </Card>
        <Card shadow="betting" padding="lg">
          <h3 className="font-semibold">Betting Club Style</h3>
          <p>Using the custom betting shadow.</p>
        </Card>
      </div>

      {/* Badge Showcase */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Enhanced Badges with Heroicons</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Badge.Status status="available" />
          <Badge.Status status="live" />
          <Badge.Status status="finished" />
          <Badge.Status status="pending" />
          <Badge.Status status="cancelled" />
          <Badge.League league="ENG-Premier League" />
          <Badge.Count count={5} />
          <Badge.Count count={15} max={10} />
          <Badge variant="primary">Custom Badge</Badge>
        </div>
      </Card>

      {/* Loading Spinner Showcase */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Enhanced Loading Spinners</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <LoadingSpinner size="sm" />
            <LoadingSpinner size="md" color="primary" />
            <LoadingSpinner size="lg" color="gray" />
          </div>
          <div>
            <Button onClick={handleOverlayTest}>Show Loading Overlay</Button>
          </div>
          <LoadingSpinner.Content message="Loading betting data..." />
          <LoadingSpinner.Betting type="fixtures" />
        </div>
      </Card>

      {/* Loading Overlay */}
      <LoadingSpinner.Overlay 
        visible={showOverlay} 
        message="Testing overlay animation..." 
      />

      {/* Feature Summary */}
      <Card className="p-6 bg-gradient-to-r from-red-50 to-yellow-50">
        <h2 className="text-xl font-semibold mb-4">🎉 Component Library Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-green-700">✅ Accessibility</h3>
            <ul className="text-sm text-gray-700 mt-2 space-y-1">
              <li>• ARIA attributes and roles</li>
              <li>• Keyboard navigation support</li>
              <li>• Screen reader compatibility</li>
              <li>• Focus management</li>
              <li>• Color contrast compliance</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-blue-700">🎨 Enhanced Design</h3>
            <ul className="text-sm text-gray-700 mt-2 space-y-1">
              <li>• Framer Motion animations</li>
              <li>• Heroicons integration</li>
              <li>• Betting club color scheme</li>
              <li>• Mobile-first responsive design</li>
              <li>• Consistent component API</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ComponentShowcase;
