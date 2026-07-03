interface Props {
  config: Record<string, unknown>;
}

export function ImageBlock({ config }: Props) {
  const url = config.url as string;
  const alt = (config.alt as string) ?? "";
  const caption = config.caption as string | undefined;

  if (!url) return null;

  return (
    <section className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <figure>
          <img
            src={url}
            alt={alt}
            className="w-full rounded-2xl"
          />
          {caption && (
            <figcaption className="text-gray-400 text-sm text-center mt-3">
              {caption}
            </figcaption>
          )}
        </figure>
      </div>
    </section>
  );
}
