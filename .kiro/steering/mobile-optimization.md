# Mobile-First Optimization Guide (Android 60% + iOS 40%)

## Core Principles

### 1. Compact Spacing
- Use `p-3` instead of `p-6` for mobile
- Use `space-y-2` or `space-y-3` instead of `space-y-6`
- Use `gap-2` instead of `gap-4` or `gap-6`
- Use responsive: `p-3 md:p-6`, `space-y-2 md:space-y-4`

### 2. Typography Scale
- Headings: `text-base md:text-xl` or `text-lg md:text-2xl`
- Body text: `text-xs md:text-sm`
- Labels: `text-[10px] md:text-xs`
- Small text: `text-[9px] md:text-[10px]`
- **IMPORTANT**: Input fields MUST use `font-size: 16px` minimum to prevent iOS auto-zoom

### 3. Component Sizing
- Buttons: `h-10 md:h-11` with `text-sm md:text-base` (48px+ touch target for both platforms)
- Icons: `h-4 w-4 md:h-5 md:w-5`
- Avatars: `h-10 w-10 md:h-12 md:h-12`
- Cards: `rounded-lg md:rounded-xl`

### 4. Grid & Layout
- Single column on mobile, grid on desktop
- Use `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- For cards: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Never use fixed widths, always use `max-w-*` with `w-full`

### 5. Viewport & Zoom Prevention

**Next.js App Router (layout.tsx):**
```typescript
import type { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
}
```

**iOS Safe Area (globals.css):**
```css
/* Support for iPhone notch/Dynamic Island */
.safe-top {
  padding-top: env(safe-area-inset-top);
}

.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-left {
  padding-left: env(safe-area-inset-left);
}

.safe-right {
  padding-right: env(safe-area-inset-right);
}

/* Prevent iOS double-tap zoom */
* {
  touch-action: manipulation;
}
```

### 6. Input Styles (Prevent iOS Auto-Zoom)

```tsx
<Input
  style={{ fontSize: '16px' }} // CRITICAL: Prevent iOS zoom
  autoComplete="off"
  autoCorrect="off"
  autoCapitalize="off"
  spellCheck="false"
  className="text-base" // Use text-base (16px) not text-sm (14px)
/>
```

### 7. Touch Targets (Android & iOS)

- Minimum 48x48px (iOS HIG standard, better for Android too)
- Add `touch-manipulation` class to prevent double-tap delays
- Use `active:` states for visual feedback
- Example: `h-12 px-6` for buttons (48px height)

### 8. Scrolling (Smooth on Both Platforms)

**Container:**
```tsx
<div className="overflow-y-auto overscroll-contain">
  {/* content */}
</div>
```

**iOS Smooth Scrolling:**
```css
.scroll-smooth-ios {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}
```

**Fixed/Sticky Elements (Avoid iOS Home Indicator):**
```tsx
<div className="fixed bottom-0 left-0 right-0 pb-safe">
  {/* iOS home indicator area protected */}
</div>
```

### 9. Font Fallbacks (Android & iOS)

```css
/* In globals.css or tailwind.config */
font-family: 
  'YourCustomFont', 
  -apple-system,        /* iOS San Francisco */
  BlinkMacSystemFont,   /* macOS */
  'Roboto',             /* Android */
  'Noto Sans',          /* Android fallback */
  'Segoe UI',           /* Windows */
  sans-serif;
```

### 10. Test Resolutions

**Android Priority (60%):**
- 360x800 (Samsung A-series, common budget)
- 393x873 (Pixel, many Android flagships)
- 412x915 (Samsung S-series)
- 320x568 (very small screens)

**iOS Priority (40%):**
- 375x667 (iPhone SE, iPhone 8)
- 390x844 (iPhone 13, 14)
- 393x852 (iPhone 15)
- 428x926 (iPhone Plus/Pro Max models)

### 11. Performance Optimizations

**Images:**
```tsx
import Image from 'next/image';

<Image
  src="/image.webp"
  alt="Description"
  width={800}
  height={600}
  loading="lazy"
  className="w-full h-auto"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

**Lazy Loading:**
```tsx
'use client';
import { useState, useEffect } from 'react';

// Load heavy content only after mount
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

if (!mounted) return <Skeleton />;
```

### 12. Anti-Bug Checklist

- ✅ No horizontal scroll (`overflow-x: hidden` on body)
- ✅ Forms work with Android/iOS keyboards
- ✅ Modals/dropdowns closeable on both platforms
- ✅ Test portrait ↔ landscape orientation
- ✅ No JavaScript errors on resize
- ✅ Test on 3G speed (Network throttling)

### 13. Cookie & Storage Best Practices

**Minimal Cookies:**
```typescript
// Only for auth/session
document.cookie = "session=token; path=/; max-age=86400; secure; samesite=strict";

// Use localStorage for non-sensitive data
localStorage.setItem('theme', 'dark');

// Use sessionStorage for temporary data
sessionStorage.setItem('tempData', JSON.stringify(data));
```

## Complete Example Pattern

```tsx
export default function MobileFriendlyPage() {
  return (
    <div className="w-full min-h-screen bg-slate-50">
      {/* Sticky Header - Safe Area for iOS */}
      <div className="bg-white border-b px-4 py-3 sticky top-0 z-10 safe-top">
        <h1 className="text-base md:text-xl font-bold">Title</h1>
      </div>

      {/* Content - Compact Spacing */}
      <div className="p-3 md:p-4 space-y-3 md:space-y-4 max-w-4xl mx-auto">
        {/* Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card className="p-3 md:p-4 rounded-lg">
            <h2 className="text-sm md:text-base font-bold mb-2">Section</h2>
            <p className="text-xs md:text-sm text-slate-600">Content</p>
          </Card>
        </div>

        {/* Touch-Friendly Button */}
        <button className="w-full h-12 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-lg touch-manipulation">
          Action Button (48px height)
        </button>

        {/* Form with iOS-Safe Input */}
        <input
          type="text"
          style={{ fontSize: '16px' }}
          className="w-full h-12 px-4 border border-slate-200 rounded-lg text-base"
          placeholder="Input field"
        />
      </div>

      {/* Fixed Bottom - Safe for iOS Home Indicator */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 safe-bottom">
        <button className="w-full h-12 bg-blue-600 text-white rounded-lg">
          Fixed Button
        </button>
      </div>
    </div>
  );
}
```

## Testing Commands

```bash
# Run development server
npm run dev

# Test on local network (Android/iPhone)
# Find your local IP: ipconfig (Windows) / ifconfig (Mac/Linux)
# Access from phone: http://192.168.x.x:3000

# Build for production (test performance)
npm run build
npm run start
```

## Warna Consistency
- Primary: `blue-600`, `blue-700` (hover), `blue-800` (active)
- Background: `white`, `slate-50`, `slate-100`
- Border: `slate-200`
- Text: `slate-900` (heading), `slate-600` (body), `slate-400` (muted)

