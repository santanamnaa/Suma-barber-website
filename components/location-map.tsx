"use client"

interface LocationMapProps {
  mapUrl: string
}

export function LocationMap({ mapUrl }: LocationMapProps) {
  return (
    <section className="mapbox">
      <figure>
        <iframe 
          width="100%" 
          height="600" 
          src={mapUrl}
          frameBorder="0" 
          scrolling="no" 
          className="rounded-lg"
          style={{ border: 0 }}
          allowFullScreen
        />
      </figure>
    </section>
  )
}
