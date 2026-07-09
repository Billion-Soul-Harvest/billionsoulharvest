interface Props {
  title: string | null;
  config: Record<string, unknown>;
}

export function RichTextBlock({ title, config }: Props) {
  const html = (config.html as string) ?? "";
  if (!html) return null;

  return (
    <section className="py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {title && (
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-white mb-6 text-center">
            {title}
          </h2>
        )}
        <div
          className="text-gray-300 leading-relaxed prose prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </section>
  );
}
