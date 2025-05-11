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

          <div className="mt-6 flex justify-between items-center">
            <Link
              href="/book-consultation"
              className="
                flex 
                items-center 
                text-primary 
                group-hover:text-primary/80 
                transition-colors
              "
            >
              <span className="mr-2 font-semibold">Book Consultation</span>
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
            </Link>

            <div 
              className="
                text-muted-foreground 
                text-sm 
                italic
                opacity-70
                group-hover:opacity-100
                transition-opacity
              "
            >
              Expert Guided
            </div>
          </div>
        </div>
      </div>
    ))}

    <div className="text-center py-12">
      <Link 
        href="/services" 
        className="
          inline-flex 
          items-center 
          px-6 
          py-3 
          bg-primary 
          text-primary-foreground 
          rounded-xl 
          hover:bg-primary/90 
          transition-colors
          group
        "
      >
        View All Services
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 ml-2 transform transition-transform group-hover:translate-x-1" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </Link>
    </div>
  </div>
)

export default DiscoverSectionPage