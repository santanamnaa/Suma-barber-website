// app/discover/hairstyle/page.tsx
import DiscoverSectionPage from '../_components/discover-section-template'

const hairStyles = [
  {
    name: 'Modern Pompadour',
    tip: 'Classic reimagined with shorter sides and textured, voluminous top. Perfect for those wanting a bold, contemporary look.',
    description: 'Combines vintage charm with modern edge, featuring longer hair on top styled upward and backward.',
    img: '/images/educate/hairstyles/pompadour.webp',
  },
  {
    name: 'Textured Crop',
    tip: 'Short on sides, textured on top. Ideal for low-maintenance styles with maximum impact.',
    description: 'A versatile cut with closely trimmed sides and a slightly longer, textured top that can be styled casually or formally.',
    img: '/images/educate/hairstyles/crop.webp',
  },
  {
    name: 'Korean Soft Perm',
    tip: 'Subtle waves that add movement and texture. Perfect for those wanting a soft, natural-looking style.',
    description: 'Gentle, loose waves that create a relaxed, effortless look with minimal daily styling required.',
    img: '/images/educate/hairstyles/korean-perm.webp',
  },
  {
    name: 'Undercut',
    tip: 'Bold contrast between super short sides and longer top. Maximum versatility in styling.',
    description: 'Dramatically short sides and back with significantly longer hair on top, allowing for multiple styling options.',
    img: '/images/educate/hairstyles/undercut.webp',
  },
]

export default function HairstylesPage() {
  return (
    <DiscoverSectionPage 
      title="Hairstyles" 
      items={hairStyles} 
    />
  )
}