export interface CategoryNode {
  name: string;
  slug: string;
  url: string;
  icon: string;
  subcategories?: CategoryNode[];
}

export const CATEGORIES_CONFIG: CategoryNode[] = [
  {
    name: "فيب",
    slug: "vape",
    url: "/category/vape",
    icon: "💨",
  },
  {
    name: "سحبة زقارة",
    slug: "pod-system",
    url: "/category/pod-system",
    icon: "🔌",
  },
  {
    name: "سحبات جاهزة",
    slug: "disposable",
    url: "/category/disposable",
    icon: "🔋",
  },
  {
    name: "ايقوص",
    slug: "iqos",
    url: "/category/iqos",
    icon: "🚬",
  },
  {
    name: "اكياس نيكوتين",
    slug: "nicotine-pouches",
    url: "/category/nicotine-pouches",
    icon: "📦",
  },
  {
    name: "نكهات",
    slug: "flavors", // Parent categories are sometimes mock pages or general category pages
    url: "/category/flavors",
    icon: "🧪",
    subcategories: [
      {
        name: "نكهات فيب",
        slug: "freebase-eliquids",
        url: "/category/freebase-eliquids",
        icon: "🧪",
      },
      {
        name: "نكهات سولت",
        slug: "saltnic-flavors",
        url: "/category/saltnic-flavors",
        icon: "🧂",
      },
    ],
  },
  {
    name: "بودات",
    slug: "pods",
    url: "/category/pods",
    icon: "📦",
    subcategories: [
      {
        name: "بودات جاهزة",
        slug: "closed-pods",
        url: "/category/closed-pods",
        icon: "📦",
      },
      {
        name: "بودات تعبئة",
        slug: "refillable-pods",
        url: "/category/refillable-pods",
        icon: "🔄",
      },
    ],
  },
  {
    name: "كويلات",
    slug: "coils",
    url: "/category/coils",
    icon: "⚡",
  },
  {
    name: "زقاير وتبغ",
    slug: "tobacco",
    url: "/category/tobacco",
    icon: "🍂",
  },
  {
    name: "شيشة ومعسل",
    slug: "hookah",
    url: "/category/hookah",
    icon: "🫧",
  },
];
