// app/discover/face-shape/page.tsx
import DiscoverSectionPage from '../_components/discover-section-template'

const faceShapes = [
  {
    name: 'Oval',
    tip: 'The most versatile face shape that suits almost any hairstyle. Balanced proportions allow for creative and diverse haircut options.',
    description: 'Characterized by balanced features with slightly wider cheekbones and a gentle tapering towards the forehead and chin.',
    img: '/images/educate/face/oval.webp',
  },
  {
    name: 'Round',
    tip: 'Choose hairstyles that add height and create the illusion of length. Avoid styles that add width to the sides of your face.',
    description: 'Features soft, curved lines with cheeks being the widest part of the face, and a similar width and length.',
    img: '/images/educate/face/round.webp',
  },
  {
    name: 'Square',
    tip: 'Soften angular features with textured cuts, side-swept styles, or slightly longer top with shorter sides.',
    description: 'Characterized by a strong jawline, broad forehead, and cheekbones of similar width, creating a angular appearance.',
    img: '/images/educate/face/square.webp',
  },
  {
    name: 'Heart',
    tip: 'Balance a wider forehead with styles that add volume at the chin, like textured bobs or layered cuts.',
    description: 'Wider forehead and cheekbones that taper down to a narrow, pointed chin, creating a distinctive heart-like shape.',
    img: '/images/educate/face/heart.webp',
  },
]

export default function FaceShapePage() {
  return (
    <DiscoverSectionPage 
      title="Face Shape" 
      items={faceShapes} 
    />
  )
}