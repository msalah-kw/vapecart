interface CategoryPageProps {
  params: { slug: string };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  return (
    <div>
      <h1>القسم: {params.slug}</h1>
    </div>
  );
}
