// src/app/casino/recensione/[slug]/page.tsx

import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
  getCasinoPageDataWithGames,
  getCasinoMetadata,
} from "@/lib/strapi/casino-data-loader";
import { getLayoutData } from "@/lib/strapi/data-loader";
import { generateMetadata as generateSEOMetadata } from "@/lib/utils/seo";
import { CasinoHero } from "@/components/casino/CasinoHero/CasinoHero";
import { CasinoContent } from "@/components/casino/CasinoContent/CasinoContent";
import { BreadcrumbsWithLayout } from "@/components/layout/Breadcrumbs";
import type { CasinoPageData, FAQ, HowToStep } from "@/types/casino-page.types";
import type { BreadcrumbItem } from "@/types/breadcrumbs.types";

// Force static generation with ISR
export const dynamic = "force-static";
export const revalidate = 300; // 5 minutes

interface CasinoPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for all casino pages
export async function generateStaticParams() {
  // This would fetch all casino slugs from Strapi
  // For now, return empty array to allow dynamic generation
  return [];
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: CasinoPageProps): Promise<Metadata> {
  // Await params as required in Next.js 15
  const { slug } = await params;

  try {
    // Use lightweight metadata query for better performance
    const casinoMetadata = await getCasinoMetadata(slug);

    if (!casinoMetadata) {
      return {};
    }

    const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/casino/recensione/${slug}`;

    return generateSEOMetadata({
      title: casinoMetadata.seo?.metaTitle || `${casinoMetadata.title} Review`,
      description:
        casinoMetadata.seo?.metaDescription ||
        casinoMetadata.introduction?.substring(0, 160),
      keywords: casinoMetadata.seo?.keywords,
      canonicalUrl,
    });
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {};
  }
}

export default async function CasinoPage({ params }: CasinoPageProps) {
  // Await params as required in Next.js 15
  const { slug } = await params;

  // Fetch casino data with games and layout data in parallel
  const [casinoResponse, { layout, translations }] = await Promise.all([
    getCasinoPageDataWithGames(slug, { cached: true, gamesLimit: 12 }),
    getLayoutData({ cached: true }),
  ]);

  if (!casinoResponse.casinoData) {
    notFound();
  }

  const { casinoData, games } = casinoResponse;

  if (!casinoData) {
    notFound();
  }

  // Get all layout breadcrumb collections
  const layoutBreadcrumbs: Record<string, BreadcrumbItem[]> = {};
  Object.keys(layout).forEach((key) => {
    if (key.endsWith("Breadcrumbs") && Array.isArray(layout[key])) {
      layoutBreadcrumbs[key] = layout[key];
    }
  });

  // Generate structured data for SEO
  const structuredData = generateStructuredData(casinoData);

  return (
    <>
      {/* Structured Data */}
      {structuredData.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      {/* Breadcrumbs - Outside hero section to match other pages */}
      <BreadcrumbsWithLayout
        items={[
          {
            breadCrumbText: casinoData.title,
            breadCrumbUrl: "", // Empty URL for current page
          },
        ]}
        breadcrumbKey="casinoBreadcrumbs"
        layoutBreadcrumbs={layoutBreadcrumbs}
        showHome={false}
      />

      {/* Hero Section - Consistent with other pages */}
      <section className="featured-header relative overflow-hidden bg-gradient-to-b from-background-900 from-30% via-background-700 via-80% to-background-500 rounded-b-3xl">
        <div className="container relative mx-auto lg:px-4 z-10">
          {/* Casino Hero Component */}
          <CasinoHero casino={casinoData} translations={translations} />
        </div>

        {/* Starry Sky Background Effect - Same as other pages */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="stars absolute inset-0" />
          <div className="twinkling absolute inset-0" />
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-2 py-8">
        <CasinoContent
          casino={casinoData}
          games={games}
          translations={translations}
        />
      </div>
    </>
  );
}

/**
 * Generate structured data for SEO
 */
function generateStructuredData(
  casino: CasinoPageData
): object[] {
  const schemas: object[] = [];

  // Organization schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "OnlineGamingWebsite",
    name: casino.title,
    url: casino.casinoGeneralInfo?.website || "",
    description: casino.introduction || "",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: casino.ratingAvg,
      reviewCount: casino.ratingCount,
      bestRating: 5,
      worstRating: 1,
    },
  };
  schemas.push(organizationSchema);

  // FAQ Schema
  if (casino.faqs && casino.faqs.length > 0) {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: casino.faqs.map((faq: FAQ) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };
    schemas.push(faqSchema);
  }

  // HowTo Schema
  if (casino.howTo?.howToGroup && casino.howTo.howToGroup.length > 0) {
    const howToSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: casino.howTo.title,
      description: casino.howTo.description,
      step: casino.howTo.howToGroup.map((step: HowToStep, index: number) => ({
        "@type": "HowToStep",
        position: index + 1,
        name: step.heading,
        text: step.copy,
      })),
    };
    schemas.push(howToSchema);
  }

  return schemas;
}
