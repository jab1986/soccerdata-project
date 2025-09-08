import React from 'react';

/**
 * Screen Reader Announcer Component
 * Provides live regions for dynamic content updates
 * 
 * @param {Object} props - Component props
 * @param {Array} announcements - Array of announcement objects
 * @param {string} className - Additional CSS classes
 * @returns {JSX.Element} Announcer component
 */
const ScreenReaderAnnouncer = ({ announcements = [], className = '' }) => {
  return (
    <>
      {/* Polite announcements for non-urgent updates */}
      <div
        id="sr-announcer-polite"
        aria-live="polite"
        aria-atomic="true"
        className={`sr-only ${className}`}
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0
        }}
      >
        {announcements
          .filter(a => a.priority === 'polite')
          .map(announcement => (
            <div key={announcement.id}>
              {announcement.message}
            </div>
          ))
        }
      </div>

      {/* Assertive announcements for urgent updates */}
      <div
        id="sr-announcer-assertive"
        aria-live="assertive"
        aria-atomic="true"
        className={`sr-only ${className}`}
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0
        }}
      >
        {announcements
          .filter(a => a.priority === 'assertive')
          .map(announcement => (
            <div key={announcement.id}>
              {announcement.message}
            </div>
          ))
        }
      </div>

      {/* Status announcements for form validation and loading states */}
      <div
        id="sr-announcer-status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={`sr-only ${className}`}
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0
        }}
      >
        {announcements
          .filter(a => a.priority === 'status')
          .map(announcement => (
            <div key={announcement.id}>
              {announcement.message}
            </div>
          ))
        }
      </div>
    </>
  );
};

export default ScreenReaderAnnouncer;
