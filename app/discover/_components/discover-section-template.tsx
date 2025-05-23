// app/discover/_components/discover-section-template.tsx
import Image from 'next/image'
import { NextPage } from 'next'
import Link from 'next/link'

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
        </div>
      </div>
    ))}
  </div>
)

export default DiscoverSectionPage