// app/discover/hair-type/page.tsx
import DiscoverSectionPage from '../_components/discover-section-template'

const hairTypes = [
  {
    name: 'Straight',
    tip: 'Versatile hair type that works well with most modern cuts. Focus on texture and layering to add movement.',
    description: 'Smooth, sleek hair that falls directly from the roots without significant curl or wave.',
    img: '/images/educate/hair-type/straight.png',
  },
  {
    name: 'Wavy',
    tip: 'Embrace natural texture with medium-length cuts that enhance your hair\'s natural movement.',
    description: 'Hair that forms loose, S-shaped waves with varying degrees of definition and volume.',
    img: '/images/educate/hair-type/wavy.png',
  },
  {
    name: 'Curly',
    tip: 'Opt for cuts that reduce bulk while maintaining shape. Layered styles work best to manage volume.',
    description: 'Tightly coiled or spiral-shaped hair strands that create significant volume and texture.',
    img: '/images/educate/hair-type/curly.png',
  },
  {
    name: 'Coily',
    tip: 'Choose styles that minimize shrinkage and showcase natural texture. Low manipulation cuts are ideal.',
    description: 'Tightly coiled hair with a Z-pattern that appears very dense and has significant shrinkage.',
    img: '/images/educate/hair-type/coily.png',
  },
]

export default function HairTypesPage() {
  return (
    <DiscoverSectionPage 
      title="Hair Type" 
      items={hairTypes} 
    />
  )
}