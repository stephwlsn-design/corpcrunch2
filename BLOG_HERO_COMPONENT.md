# Blog Hero Component Documentation

## Overview

The **BlogHero** component is a full-screen, modern hero section designed specifically for blog pages. It features:

- ✨ Beautiful animated blue gradient background
- 📝 Large, eye-catching title with customizable highlighted text
- 🎨 Circular media display (supports both images and videos)
- 👤 Journalist/author information with avatar
- 🎯 "Book a free consultation" call-to-action button
- 🎭 Decorative elements (yellow spirals, stars, category badges)
- 📱 Fully responsive design
- 🌙 Dark mode support
- 🔤 Uses **Urbanist** font throughout

## File Structure

```
components/elements/
  ├── BlogHero.js          # Main component file
  └── BlogHero.module.css  # Component styles

pages/
  ├── blog/
  │   └── index.js         # Blog page using BlogHero
  └── blog-hero-demo.js    # Standalone demo page
```

## Installation & Setup

### 1. Font Import

The component uses the **Urbanist** font family. Make sure to include it in your page:

```jsx
import Head from "next/head";

<Head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
  <link 
    href="https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500;600;700;800;900&display=swap" 
    rel="stylesheet" 
  />
</Head>
```

### 2. Font Awesome Icons

Include Font Awesome for icons:

```html
<link 
  rel="stylesheet" 
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
/>
```

## Usage

### Basic Usage

```jsx
import BlogHero from "@/components/elements/BlogHero";

export default function MyBlogPage() {
  return (
    <BlogHero />
  );
}
```

### Advanced Usage with Custom Props

```jsx
import BlogHero from "@/components/elements/BlogHero";

export default function MyBlogPage() {
  return (
    <BlogHero 
      title="Smart Digital Marketing that turns strategy into growth."
      highlightText="Digital Marketing"
      subtitle="We combine strategy, creativity, and performance marketing to help digital brands grow, compete, and scale with confidence."
      mediaUrl="/assets/img/blog/blog01.jpg"
      mediaType="image"
      journalistName="Miranda H. Halim"
      journalistTitle="Head Of Idea"
      journalistImage="/assets/img/others/about_me.png"
      showBuyButton={true}
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | "Smart Digital Marketing that turns strategy into growth." | Main heading text |
| `highlightText` | string | "Digital Marketing" | Part of title to highlight in blue |
| `subtitle` | string | "We combine strategy, creativity..." | Subtitle/description text |
| `mediaUrl` | string | "/assets/img/blog/blog01.jpg" | URL for image or video |
| `mediaType` | string | "image" | Type of media: "image" or "video" |
| `journalistName` | string | "Miranda H. Halim" | Journalist/author name |
| `journalistTitle` | string | "Head Of Idea" | Journalist/author title |
| `journalistImage` | string | "/assets/img/others/about_me.png" | URL for journalist avatar |
| `showBuyButton` | boolean | false | Show/hide "Buy This Template" button |

## Features

### 1. Animated Gradient Background

The component features a beautiful animated gradient background that smoothly transitions between multiple colors:

- Purple (#667eea)
- Deep purple (#764ba2)
- Pink (#f093fb)
- Blue (#4facfe)
- Cyan (#00f2fe)

The gradient animates continuously, creating a dynamic, engaging visual effect.

### 2. Highlighted Title Text

You can highlight specific parts of your title in blue (#2D31FA) by specifying the `highlightText` prop. The component automatically finds and styles this text.

### 3. Media Display

The central circular media area supports:

- **Images**: Static images with hover effects
- **Videos**: HTML5 video with custom play/pause button

The media is displayed in a circular frame with decorative elements around it.

### 4. Decorative Elements

- **Yellow Spirals**: Animated spiral patterns at top and bottom
- **Stars**: Twinkling star elements (✦ and ★)
- **Category Badges**: "JEWELRY" and "ACCESSORIES" labels (customizable)
- **Watch Reel Label**: Bottom label on the media circle

### 5. Journalist/Author Section

Displays journalist information with:

- Circular avatar image with blue border
- Name (bold, large font)
- Title (smaller, gray text)
- White rounded background with shadow

### 6. Call-to-Action Button

Black rounded button with:

- Text: "Book a free consultation"
- Hover effect: Changes to blue (#2D31FA)
- Smooth animations

### 7. "Made in Framer" Badge

Bottom-right badge with:

- Lightning bolt icon
- Black background
- Blue accent color for icon

## Responsive Design

The component is fully responsive with breakpoints at:

- **1200px**: Reduces media circle size to 320px
- **968px**: Converts to vertical layout, repositions consultation section
- **768px**: Further size reductions, mobile-optimized spacing
- **480px**: Smallest screens, minimal sizes

### Mobile Behavior

On mobile devices:

- Title font size adjusts dynamically
- Media circle scales down appropriately
- Consultation section moves to static position below content
- All elements stack vertically
- Touch-friendly button sizes

## Styling & Customization

### CSS Modules

The component uses CSS Modules for scoped styling. All styles are in `BlogHero.module.css`.

### Customizing Colors

To change the primary accent color (blue), update these CSS variables:

```css
/* In BlogHero.module.css */

/* Change #2D31FA to your preferred color */
.highlightText {
  color: #YOUR_COLOR;
}

.buyButton {
  background: #YOUR_COLOR;
}

.consultationButton:hover {
  background: #YOUR_COLOR;
}
```

### Customizing the Gradient

Edit the gradient colors in `.gradientBg`:

```css
.gradientBg {
  background: linear-gradient(
    135deg, 
    #YOUR_COLOR_1 0%, 
    #YOUR_COLOR_2 25%, 
    #YOUR_COLOR_3 50%, 
    #YOUR_COLOR_4 75%, 
    #YOUR_COLOR_5 100%
  );
}
```

## Dark Mode Support

The component includes dark mode styles that activate when the `dark-theme` class is applied to the body:

```css
:global(.dark-theme) .blogHero {
  /* Dark mode styles */
}
```

Dark mode changes:

- Background becomes darker (#0a0a0a)
- Title text becomes white
- Subtitle becomes light gray
- Buttons and cards get darker backgrounds

## Browser Support

Tested and working in:

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

1. **Images**: Use optimized images (WebP format recommended)
2. **Videos**: Keep video files small and compressed
3. **Fonts**: Font files are loaded from Google Fonts CDN
4. **Animations**: CSS animations are GPU-accelerated

## Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus states on buttons
- Alt text support for images

## Examples

### Example 1: Technology Blog

```jsx
<BlogHero 
  title="Revolutionizing Tech through Innovation and Code."
  highlightText="Innovation"
  subtitle="Exploring the latest in technology, AI, and software development."
  mediaUrl="/assets/img/technology/tech_01.jpg"
  mediaType="image"
  journalistName="John Doe"
  journalistTitle="Tech Editor"
  journalistImage="/assets/img/avatars/john.png"
/>
```

### Example 2: With Video

```jsx
<BlogHero 
  title="Watch Our Latest Brand Stories Come to Life."
  highlightText="Brand Stories"
  subtitle="Creative storytelling through visual media."
  mediaUrl="/videos/brand-reel.mp4"
  mediaType="video"
  journalistName="Sarah Chen"
  journalistTitle="Creative Director"
  journalistImage="/assets/img/avatars/sarah.png"
  showBuyButton={false}
/>
```

## Testing

### View the Demo

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to:
   - Full blog page: `http://localhost:3000/blog`
   - Standalone demo: `http://localhost:3000/blog-hero-demo`

## Troubleshooting

### Font Not Loading

**Issue**: Urbanist font doesn't appear

**Solution**: Ensure the Google Fonts link is in your `<Head>` component

### Image Not Displaying

**Issue**: Image doesn't show in the circle

**Solution**: Check that:
- Image path is correct
- Image exists in `public/assets/img/`
- Next.js Image optimization is configured

### Layout Breaking on Mobile

**Issue**: Elements overflow or don't stack properly

**Solution**: 
- Check viewport meta tag in `_document.js`
- Ensure no fixed widths in parent containers

### Video Not Playing

**Issue**: Video doesn't play when clicking play button

**Solution**:
- Verify video format (MP4 recommended)
- Check video file path
- Ensure video is not too large

## Future Enhancements

Potential improvements:

- [ ] Add more media type support (embedded YouTube/Vimeo)
- [ ] Customizable decorative elements
- [ ] Animation controls (pause/play gradient)
- [ ] Multiple gradient themes
- [ ] Parallax scrolling effects
- [ ] More category badge customization

## Credits

- **Font**: Urbanist by Google Fonts
- **Icons**: Font Awesome
- **Framework**: Next.js + React
- **Styling**: CSS Modules

## License

This component is part of the CorpCrunch project.

---

**Created**: January 2026
**Last Updated**: January 2026
**Version**: 1.0.0

For questions or support, please contact the development team.

