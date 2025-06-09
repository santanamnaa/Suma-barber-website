// Shared template for discover section pages
import Image from 'next/image'
import { NextPage } from 'next'

type DiscoverItem = {
  name: string
  tip: string
  img: string
  description?: string
}

type DiscoverPageProps = {
  title: string
  items: DiscoverItem[]
}

const DiscoverSectionPage: NextPage<DiscoverPageProps> = ({ title, items }) => (
  <div className="space-y-12">
    {items.map((item, index) => (
      <div
        key={item.name}
        className={`
          grid grid-cols-1 md:grid-cols-2 gap-8 
          bg-card rounded-3xl overflow-hidden 
          shadow-lg hover:shadow-2xl 
          transition-all duration-300
          group
        `}
      >
        {/* Image Section */}
        <div 
          className={`
            relative aspect-square 
            ${index % 2 === 1 ? 'md:order-last' : ''}
            overflow-hidden
          `}
        >
          <Image
            src={item.img}
            alt={item.name}
            fill
            className="
              object-cover 
              group-hover:scale-105 
              transition-transform 
              duration-300
            "
          />
          <div 
            className="
              absolute inset-0 
              bg-black/30 
              opacity-0 
              group-hover:opacity-100 
              transition-opacity 
              duration-300
              flex items-end 
              p-6
            "
          >
            <p className="text-white text-sm font-medium">
              {item.name} Style Details
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div 
          className="
            p-8 
            flex flex-col 
            justify-center 
            space-y-4
          "
        >
          <h2 
            className="
              text-3xl 
              font-bold 
              mb-4 
              text-foreground 
              group-hover:text-primary 
              transition-colors
            "
          >
            {item.name} {title}
          </h2>

          <div className="space-y-4">
            <p 
              className="
                text-muted-foreground 
                text-lg 
                leading-relaxed
              "
            >
              {item.tip}
            </p>

            {item.description && (
              <p 
                className="
                  text-muted-foreground 
                  text-base 
                  italic
                "
              >
                {item.description}
              </p>
            )}
          </div>

          <div 
            className="
              mt-6 
              flex 
              items-center 
              text-primary 
              group-hover:text-primary/80 
              transition-colors
            "
          >
            <span className="mr-2 font-semibold">Learn More</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 transform transition-transform group-hover:translate-x-1" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    ))}
  </div>
)

// Instead, export a valid Next.js page component as default
const sampleItems: DiscoverItem[] = [
  {
    name: "Classic Fade",
    tip: "A timeless look that suits everyone.",
    img: "/images/fade.jpg",
    description: "Perfect for a clean, professional appearance."
  },
  {
    name: "Modern Pompadour",
    tip: "Add volume and style to your hair.",
    img: "/images/pompadour.jpg",
    description: "Great for those who want to stand out."
  }
]

const DiscoverPage = () => (
  <DiscoverSectionPage title="Discover Styles" items={sampleItems} />
)

export default DiscoverPage