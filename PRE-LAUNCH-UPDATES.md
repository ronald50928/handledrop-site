# Pre-Launch Updates Required

## Overview
This is a **marketing/landing site** for HandleDrop web app (not yet built).
Similar to how Uber/Airbnb started - we need to show the vision but make it clear the app isn't live yet.

## Changes Needed for All Pages

### 1. Add "Coming Soon" Banner (Top of Every Page)
```html
<!-- COMING SOON BANNER - REMOVE WHEN APP LAUNCHES -->
<div class="coming-soon-banner">
  <div class="wrap">
    <span class="banner-icon">🚀</span>
    <strong>Coming Soon!</strong> We're building something amazing. Join the waitlist to be first to trade.
    <a href="#waitlist" class="banner-cta">Join Waitlist</a>
  </div>
</div>
<!-- END COMING SOON BANNER -->
```

### 2. Update All CTAs
**Change FROM:** "Start Trading" / "Get Started"  
**Change TO:** "Join Waitlist"

### 3. Disable Interactive Features (Mark as Demos)

#### Homepage (`index.html`)
- ❌ Hero search bar → Add "DEMO" badge, disable submit
- ❌ "Start Trading" buttons → Change to "Join Waitlist"
- ✅ Keep: Live trades feed (demo animation is fine)
- ✅ Keep: Visual flows, testimonials, stats (all demo content)

#### Shipping Page (`shipping.html`)
- ❌ Location finder → Add "DEMO" badge, show sample results
- ❌ Shipping calculator → Add "DEMO" badge, calculations still work for preview
- ✅ Keep: Partner info, Keep The Box campaign (educational)

#### Pricing Page (`pricing.html`)
- ❌ "Start Free" → Change to "Join Waitlist"
- ❌ "Try Premium" → Change to "Join Waitlist"
- ✅ Keep: Pricing info (shows future pricing)

#### Help Page (`help.html`)
- ❌ Search box → Add "DEMO" badge, disable
- ❌ "Start Live Chat" → Change to "Contact Us" (email)
- ✅ Keep: FAQ content (helpful for prospects)

#### Community Page (`community.html`)
- ❌ Newsletter signup → Change to waitlist signup
- ✅ Keep: Success stories (aspirational/demo)

### 4. Replace Signup Forms with Waitlist

**Old:**
```html
<form class="signup-form" action="#" method="post">
  <input type="email" placeholder="Enter your email" required />
  <button type="submit" class="btn btn-primary btn-large">Get Started</button>
</form>
```

**New:**
```html
<!-- WAITLIST FORM - Replace with actual signup when app launches -->
<form class="waitlist-form" action="https://forms.google.com/YOUR_FORM_ID" method="GET" target="_blank">
  <input type="email" name="email" placeholder="Enter your email" required aria-label="Email address" />
  <button type="submit" class="btn btn-primary btn-large">Join Waitlist</button>
  <p class="tiny">Be first to know when we launch</p>
</form>
<!-- TODO: Replace with app signup when ready -->
```

### 5. Add Demo Badges

```css
/* Add to styles.css */
.demo-badge {
  display: inline-block;
  background: rgba(244,63,94,.2);
  border: 1px solid rgba(244,63,94,.4);
  color: #F43F5E;
  padding: .25rem .75rem;
  border-radius: 999px;
  font-size: .75rem;
  font-weight: 700;
  margin-left: .5rem;
  vertical-align: middle;
}

.coming-soon-banner {
  background: linear-gradient(135deg, rgba(14,165,233,.15) 0%, rgba(244,63,94,.15) 100%);
  border-bottom: 1px solid rgba(14,165,233,.3);
  padding: 1rem 0;
  text-align: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.coming-soon-banner .wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.banner-icon { font-size: 1.5rem; }
.banner-cta {
  background: var(--brand);
  color: #000;
  padding: .5rem 1rem;
  border-radius: 999px;
  font-weight: 700;
  text-decoration: none;
}
.banner-cta:hover { transform: scale(1.05); }
```

## Files to Update

1. ✅ `index.html` - Add banner, change CTAs, disable search
2. ✅ `how-it-works.html` - Add banner, change CTAs
3. ✅ `safety.html` - Add banner, change CTAs
4. ✅ `shipping.html` - Add banner, disable finder, add demo badges
5. ✅ `pricing.html` - Add banner, change CTAs
6. ✅ `about.html` - Add banner, change CTAs
7. ✅ `community.html` - Add banner, change newsletter to waitlist
8. ✅ `help.html` - Add banner, disable search, change chat CTA
9. ✅ `assets/css/styles.css` - Add coming soon banner styles

## Implementation Steps

1. Create Google Form for waitlist (or use email service)
2. Add coming soon banner CSS to styles.css
3. Update each HTML file with:
   - Coming soon banner at top
   - Demo badges on non-working features
   - Waitlist forms instead of signup
   - Developer TODO comments
4. Test all pages
5. Deploy to S3/CloudFront

## What Stays Active (Demo/Preview)

✅ **Keep These Working:**
- Navigation between pages
- Neural network background animation
- Live trades feed animator (demo data)
- Shipping calculator (demo calculations)
- Counter animations
- Testimonial carousel
- FAQ accordions
- All visual flows and graphics

❌ **Disable/Mark as Demo:**
- Actual signup/login
- Search functionality
- Location finder (or show sample results only)
- Live chat (replace with "Contact Us" email)
- Newsletter signup (or convert to waitlist)

## Developer Notes

When ready to launch the actual app:

1. Remove coming soon banner
2. Enable all forms with actual endpoints
3. Connect to backend API
4. Remove all "DEMO" badges
5. Change "Join Waitlist" back to "Start Trading"
6. Enable search functionality
7. Connect calculator to real pricing
8. Enable live chat integration

## Messaging Update

**Current Numbers (Update to Aspirational):**
- "50,000+ traders" → "Join our growing waitlist"
- "4,287 trades this week" → "Coming soon"
- Specific success stories → Add "(Preview of what's possible)"

Or keep current numbers but add small disclaimer:
"*Projected based on beta testing and market research"

