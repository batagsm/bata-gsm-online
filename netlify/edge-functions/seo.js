export default async (request, context) => {
  try {
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const slug = pathParts[pathParts.length - 1];

    const response = await context.next();
    let html = await response.text();

    const firestoreUrl = 'https://firestore.googleapis.com/v1/projects/bata-gsm-online/databases/(default)/documents/artifacts/bata-gsm-online/public/data/products';
    const fbRes = await fetch(firestoreUrl);
    const fbData = await fbRes.json();

    let matchedProduct = null;

    if (fbData.documents) {
      for (const doc of fbData.documents) {
        const fields = doc.fields;
        if (!fields || !fields.name) continue;

        const name = fields.name.stringValue;
        const docSlug = name.toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace(/[^\w\-]+/g, '')
                            .replace(/\-\-+/g, '-')
                            .replace(/^-+/, '')
                            .replace(/-+$/, '');

        if (docSlug === slug) {
          // Anan mun tabbatar ya duba dukkan wuraren da za a iya ajiye hoto a database din ka
          const imgUrl = fields.imageLink?.stringValue || fields.image?.stringValue || fields.imageUrl?.stringValue || 'https://placehold.co/512x512/16a34a/ffffff?text=B';

          matchedProduct = {
            name: name,
            description: fields.description ? fields.description.stringValue : 'Bata GSM Online Marketplace',
            image: imgUrl,
            price: fields.price ? (fields.price.integerValue || fields.price.doubleValue || 0) : 0
          };
          break;
        }
      }
    }

    if (matchedProduct) {
      const cleanDesc = matchedProduct.description.substring(0, 120).replace(/"/g, "'") + "...";
      const formattedPrice = Number(matchedProduct.price).toLocaleString();
      const newTitle = `${matchedProduct.name} - ₦${formattedPrice}`;

      html = html.replace(/<title>.*?<\/title>/i, `<title>${newTitle} | Bata GSM Online</title>`);
      html = html.replace(/<meta\s+name="description"\s+content="[^"]*"/i, `<meta name="description" content="${cleanDesc}"`);
      html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"/i, `<meta property="og:title" content="${newTitle}"`);
      html = html.replace(/<meta\s+property="og:description"\s+content="[^"]*"/i, `<meta property="og:description" content="${cleanDesc}"`);
      
      const ogImageTag = `<meta property="og:image" content="${matchedProduct.image}">\n` +
                         `<meta property="og:image:width" content="1200">\n` +
                         `<meta property="og:image:height" content="630">\n` +
                         `<meta name="twitter:card" content="summary_large_image">`;
      html = html.replace(/<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/i, ogImageTag);

      html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"/i, `<meta property="og:url" content="https://www.batagsm.com.ng/product/${slug}"`);
    }

    return new Response(html, {
      headers: { 'content-type': 'text/html;charset=UTF-8' }
    });

  } catch (err) {
    return context.next();
  }
};
