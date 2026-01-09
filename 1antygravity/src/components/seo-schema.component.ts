import {
  Component,
  ChangeDetectionStrategy,
  computed,
  inject,
} from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { ConfigService } from "../services/config.service";

@Component({
  selector: "app-seo-schema",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<!-- JSON-LD injected via innerHTML -->`,
  host: {
    "[innerHtml]": "jsonLD()",
    style: "display: none",
  },
})
export class SeoSchemaComponent {
  private sanitizer = inject(DomSanitizer);
  private configService = inject(ConfigService);

  jsonLD = computed((): SafeHtml => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: "ServiceCalefones Montevideo",
      image: "assets/images/brand.webp",

      telephone: "+" + this.configService.phoneCallEncodigo(),
      url: "https://servicecalefones.com",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Montevideo",
        addressRegion: "Montevideo",
        addressCountry: "UY",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: -34.9011,
        longitude: -56.1645,
      },
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "00:00",
        closes: "23:59",
      },
      areaServed: [
        "Pocitos",
        "Carrasco",
        "Malvín",
        "Centro",
        "Cordón",
        "Prado",
        "La Blanqueada",
      ],
      priceRange: "$$",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "124",
      },
      description:
        "Servicio técnico de calefones en Montevideo. Reparación de James, Ariston, Copper y Enxuta. Urgencia 24hs.",
    };

    return this.sanitizer.bypassSecurityTrustHtml(
      `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
    );
  });
}
