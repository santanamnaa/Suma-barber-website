// app/discover/maintenance/page.tsx
import DiscoverSectionPage from '../_components/discover-section-template'

const maintenanceGuides = [
  {
    name: 'Daily Care',
    tip: 'Establish a simple routine: gentle washing, conditioning, and minimal heat styling to maintain hair health.',
    description: 'Consistent, gentle care prevents damage and keeps hair looking fresh and vibrant throughout the week.',
    img: '/images/educate/maintenance/daily-care.png',
  },
  {
    name: 'Scalp Health',
    tip: 'Invest in scalp treatments and use gentle, targeted shampoos to maintain a healthy foundation for hair growth.',
    description: 'A healthy scalp is crucial for strong, vibrant hair. Regular cleansing and occasional treatments can make a significant difference.',
    img: '/images/educate/maintenance/scalp-care.png',
  },
  {
    name: 'Hydration & Nutrition',
    tip: 'Focus on internal health with a balanced diet, proper hydration, and supplements that support hair strength.',
    description: 'What you consume directly impacts hair health. Proteins, vitamins, and adequate water intake are key to maintaining lustrous hair.',
    img: '/images/educate/maintenance/nutrition.png',
  },
  {
    name: 'Styling Protection',
    tip: 'Use heat protectants, minimize chemical treatments, and be gentle when styling to prevent damage.',
    description: 'Protect your hair from heat, chemical, and mechanical damage to maintain its natural strength and shine.',
    img: '/images/educate/maintenance/protection.png',
  },
]

export default function MaintenancePage() {
  return (
    <DiscoverSectionPage 
      title="Hair Maintenance" 
      items={maintenanceGuides} 
    />
  )
}