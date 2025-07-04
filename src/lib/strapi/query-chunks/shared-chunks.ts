// src/lib/strapi/query-chunks/shared-chunks.ts

/**
 * Shared query chunks that can be reused across different page loaders
 */

export const seoQueryChunk = {
  fields: ["metaTitle", "metaDescription", "keywords", "canonicalURL"],
  populate: {
    metaImage: { fields: ["url", "width", "height"] },
    metaSocial: {
      fields: ["socialNetwork", "title", "description"],
      populate: {
        image: { fields: ["url", "width", "height"] },
      },
    },
  },
};

export const breadcrumbsQueryChunk = {
  fields: ["breadCrumbText", "breadCrumbUrl"],
};

export const authorQueryChunk = {
  fields: [
    "firstName",
    "lastName",
    "slug",
    "linkedInLink",
    "twitterLink",
    "facebookLink",
    "content1",
    "jobTitle",
    "experience",
    "areaOfWork",
    "specialization",
  ],
  populate: {
    photo: {
      fields: ["url", "width", "height", "alternativeText"],
    },
  },
};

export const imageQueryChunk = {
  fields: ["url", "width", "height", "alternativeText", "mime"],
};

export const providerQueryChunk = {
  fields: ["title", "slug"],
  populate: {
    images: {
      fields: ["url", "width", "height"],
    },
  },
};

export const categoryQueryChunk = {
  fields: ["title", "slug"],
  populate: {
    images: {
      fields: ["url", "width", "height"],
    },
  },
};

export const casinoTableQueryChunk = (
  includeFullData = false
) => ({
  fields: includeFullData
    ? ["title", "slug", "ratingAvg", "ratingCount", "publishedAt", "Badges"]
    : ["title", "slug", "ratingAvg"],
  populate: {
    images: imageQueryChunk,
    casinoBonus: { fields: ["bonusUrl", "bonusLabel", "bonusCode"] },
    ...(includeFullData && {
      noDepositSection: { fields: ["bonusAmount", "termsConditions"] },
      freeSpinsSection: { fields: ["bonusAmount", "termsConditions"] },
      termsAndConditions: { fields: ["copy", "gambleResponsibly"] },
      bonusSection: {
        fields: ["bonusAmount", "termsConditions", "cashBack", "freeSpin"],
      },
    }),
  },
});

/**
 * Enhanced game query chunks that match actual usage patterns
 * across homepage-data-loader.ts and custom-page-loader.ts
 */
export const gameQueryChunk = {
  // Minimal for basic displays (cards, lists)
  minimal: {
    fields: ["title", "slug", "ratingAvg"],
    populate: {
      images: { fields: ["url", "width", "height"] },
      provider: { fields: ["title", "slug"] },
    },
  },
  
  // Standard for most carousel and listing use cases
  // This matches the pattern used in both homepage and custom page loaders
  standard: {
    fields: [
      "title",
      "slug", 
      "ratingAvg",
      "ratingCount",
      "createdAt",
      "publishedAt" // Added this - it's used in both loaders
    ],
    populate: {
      images: {
        fields: ["url", "alternativeText", "width", "height"]
      },
      provider: providerQueryChunk, // Reuse existing chunk
      categories: categoryQueryChunk, // Reuse existing chunk
    },
  },
  
  // Detailed for full game pages and rich displays
  detailed: {
    fields: [
      "title",
      "slug",
      "ratingAvg", 
      "ratingCount",
      "views", // Used in homepage loader
      "createdAt",
      "publishedAt",
      "isGameDisabled",
      "gameDisableText",
    ],
    populate: {
      images: imageQueryChunk, // Use full image chunk
      provider: providerQueryChunk,
      categories: categoryQueryChunk,
      embedCode: {
        fields: ["desktopEmbedCode", "mobileEmbedCode"]
      },
    },
  },
  
  // For homepage specifically (matches current fetchGamesForProviders)
  homepage: {
    fields: [
      "title",
      "slug",
      "ratingAvg",
      "ratingCount", 
      "createdAt",
      "views", // Homepage uses this
      "publishedAt",
    ],
    populate: {
      images: {
        fields: ["url", "alternativeText", "width", "height"],
      },
      provider: {
        fields: ["title", "slug"],
      },
      categories: {
        fields: ["title", "slug"],
      },
    },
  },
  
  // For custom page carousels (matches current enrichGameCarousels)
  carousel: {
    fields: ["title", "slug", "ratingAvg", "createdAt", "publishedAt"],
    populate: {
      images: {
        fields: ["url", "alternativeText", "width", "height"],
      },
      provider: { fields: ["title", "slug"] },
      categories: { fields: ["title", "slug"] },
    },
  },
};

export const blogQueryChunk = {
  fields: [
    "title",
    "slug",
    "blogBrief",
    "excerpt",
    "createdAt",
    "updatedAt",
    "publishedAt",
    "minutesRead",
  ],
  populate: {
    images: imageQueryChunk,
    author: {
      fields: ["firstName", "lastName"],
      populate: {
        photo: { fields: ["url", "width", "height"] },
      },
    },
    blogCategory: { fields: ["blogCategory", "slug"] },
  },
};

/**
 * Define block query chunks with proper typing
 */
type BlockQueryChunk = {
  fields?: string[];
  populate?: Record<string, unknown>;
};

type BlockQueryChunks = {
  [key: string]: BlockQueryChunk | Record<string, unknown>;
};

export const blockQueryChunks: BlockQueryChunks = {
  "shared.single-content": {
    populate: "*",
  },
  "shared.introduction-with-image": {
    fields: ["heading", "introduction"],
    populate: {
      image: imageQueryChunk,
    },
  },
  "shared.image": {
    populate: {
      image: imageQueryChunk,
    },
  },
  "shared.overview-block": {
    fields: ["overview_type"],
    populate: {
      overviews: {
        fields: ["title", "url"],
        populate: {
          card_img: imageQueryChunk,
        },
      },
    },
  },
  "shared.quicklinks": {
    fields: ["showQuickLinks"],
  },
  "homepage.home-game-list": {
    fields: ["numberOfGames", "sortBy", "gameListTitle"],
    populate: {
      providers: {
        populate: {
          slotProvider: providerQueryChunk,
        },
      },
      link: { fields: ["label", "url"] },
    },
  },
  "homepage.home-casino-list": {
    fields: ["casinoTableTitle"],
  },
  "homepage.home-providers": {
    populate: {
      providersList: {
        populate: {
          providers: providerQueryChunk,
        },
      },
    },
  },
  "homepage.home-featured-providers": {
    fields: ["title"],
    populate: {
      homeFeaturedProviders: {
        populate: {
          providers: providerQueryChunk,
        },
      },
    },
  },
  "homepage.home-featured-categories": {
    populate: {
      homeCategoriesList: {
        populate: {
          slot_categories: categoryQueryChunk,
        },
      },
    },
  },
  "homepage.home-testimonies": {
    fields: ["title"],
    populate: {
      homeTestimonies: {
        fields: ["title", "testimony", "testifierName", "testifierTitle"],
        populate: {
          provider: providerQueryChunk,
        },
      },
    },
  },
  "homepage.home-blog-list": {
    fields: ["numOfBlogs"],
    populate: {
      link: { fields: ["label", "url"] },
    },
  },
  "games.games-carousel": {
    fields: ["numberOfGames", "sortBy", "showGameFilterPanel"],
    populate: {
      gameProviders: {
        populate: {
          slotProvider: providerQueryChunk,
        },
      },
      gameCategories: {
        populate: {
          slotCategory: categoryQueryChunk,
        },
      },
    },
  },
  "games.new-and-loved-slots": {
    fields: ["newSlots", "slot_categories", "slot_providers"],
  },
  "casinos.casino-list": {
    fields: ["showCasinoTableHeader"],
    populate: {
      casinosList: {
        fields: ["casinoName"],
        populate: {
          casino: () =>
            casinoTableQueryChunk(true),
        },
      },
    },
  },
};

/**
 * Get block query chunk by component type
 */
export function getBlockQueryChunk(
  componentType: string,
  casinoCountry?: string
): BlockQueryChunk | Record<string, unknown> {
  const chunk = blockQueryChunks[componentType];

  // Special handling for casino-list with dynamic country filter
  if (
    componentType === "casinos.casino-list" &&
    chunk &&
    typeof chunk === "object" &&
    "populate" in chunk
  ) {
    const populateObj = chunk.populate as Record<string, unknown>;
    if (
      populateObj.casinosList &&
      typeof populateObj.casinosList === "object"
    ) {
      const casinosListPopulate = populateObj.casinosList as Record<
        string,
        unknown
      >;
      const casinosPopulate = casinosListPopulate.populate;

      if (
        casinosPopulate &&
        typeof casinosPopulate === "object" &&
        "casino" in casinosPopulate &&
        typeof (casinosPopulate as Record<string, unknown>).casino ===
          "function"
      ) {
        const casinoFunction = (
          casinosPopulate as { casino: (country?: string) => unknown }
        ).casino;
        return {
          ...chunk,
          populate: {
            ...populateObj,
            casinosList: {
              ...casinosListPopulate,
              populate: {
                casino: casinoFunction(casinoCountry),
              },
            },
          },
        };
      }
    }
  }

  return chunk || {};
}
