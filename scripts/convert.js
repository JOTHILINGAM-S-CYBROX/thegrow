const fs = require('fs');
const path = require('path');

const rootDir = "d:/Downloads/stitch_the_grove_website_strategy_prd/stitch_the_grove_website_strategy_prd";
const srcAppDir = path.join(rootDir, "the-grove-nextjs", "src", "app");

const pages = {
  "the_grove_dynamic_ordering_menu": "dynamic-ordering-menu",
  "the_grove_experience_gallery": "experience-gallery",
  "the_grove_interactive_menu": "interactive-menu",
  "the_grove_memberships": "memberships",
  "the_grove_refined_homepage": "refined-homepage",
  "the_grove_reservations": "reservations",
  "the_grove_sms_auth_checkout": "sms-auth-checkout",
  "the_grove_venue_booking": "venue-booking",
  "verdant_estate": "verdant-estate"
};

function convertHtmlToJsx(html) {
  // Extract custom <style>
  let styles = "";
  const styleMatch = html.match(/<style>([\s\S]*?)<\/style>/);
  if (styleMatch) {
    styles = styleMatch[1];
  }

  // Extract body innerHTML
  let body = "";
  let bodyClass = "";
  const bodyMatch = html.match(/<body([^>]*)>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    bodyClass = (bodyMatch[1].match(/class="([^"]+)"/) || [])[1] || "";
    body = bodyMatch[2];
  } else {
    body = html; // fallback
  }

  // basic JSX transformations
  body = body
    .replace(/class=/g, 'className=')
    .replace(/for=/g, 'htmlFor=')
    // convert inline styles simple cases
    .replace(/style="font-variation-settings: 'FILL' 1;"/g, "style={{fontVariationSettings: \"'FILL' 1\"}}")
    .replace(/style="font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;"/g, "style={{fontVariationSettings: \"'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24\"}}")
    // self closing tags
    .replace(/<img(.*?)>/g, (match, pt) => {
      if (pt.endsWith('/')) return match;
      return `<img${pt}/>`;
    })
    .replace(/<input(.*?)>/g, (match, pt) => {
      if (pt.endsWith('/')) return match;
      return `<input${pt}/>`;
    })
    .replace(/<hr(.*?)>/g, (match, pt) => {
      if (pt.endsWith('/')) return match;
      return `<hr${pt}/>`;
    })
    .replace(/<br(.*?)>/g, (match, pt) => {
      if (pt.endsWith('/')) return match;
      return `<br${pt}/>`;
    })
    .replace(/<!--[\s\S]*?-->/g, ''); // remove comments to avoid issues

  // replace arbitrary inline style blocks (risky, but usually there are few)
  body = body.replace(/style="([^"]+)"/g, (match, p1) => {
      // Very naive inline style to React Object
      if (p1.includes("font-variation-settings")) return match; // already handled
      if(p1.includes("background-image")) {
           return `style={{backgroundImage: \`${p1.split(':')[1].replace(';', '').trim()}\`}}`;
      }
      return match;
  });

  return { jsxBody: body, cssStyles: styles, bodyClass };
}

Object.entries(pages).forEach(([folder, route]) => {
  const codePath = path.join(rootDir, folder, "code.html");
  if (!fs.existsSync(codePath)) return;
  
  const rawHtml = fs.readFileSync(codePath, "utf-8");
  const { jsxBody, cssStyles, bodyClass } = convertHtmlToJsx(rawHtml);

  // Parse cssStyles to CSS module syntaxes
  let moduleCss = cssStyles
     .replace(/([^{]*)\{([\s\S]*?)\}/g, (match, selectors, body) => {
         const pureSelectors = selectors.split(',').filter(s => s.trim().startsWith('.')).join(', ');
         if (!pureSelectors) return '';
         return `${pureSelectors} {${body}}`;
     })
     .replace(/\.([a-zA-Z0-9_-]+)/g, (m, c1) => `.${c1.replace(/-([a-z])/g, (g) => g[1].toUpperCase())}`);

  // Write module css
  const outputDir = path.join(srcAppDir, route);
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  let styleImport = "";
  if (moduleCss.trim().length > 0) {
     fs.writeFileSync(path.join(outputDir, "page.module.css"), moduleCss);
     styleImport = `import styles from './page.module.css';\n`;
  }

  // Naively inject styles references if matched in jsxBody
  let finalJsx = jsxBody;
  if(moduleCss.includes("glassNav")) finalJsx = finalJsx.replace(/className="([^"]*?)(glass-nav)([^"]*?)"/g, "className={`$1 $3 \\${styles.glassNav}`}");
  if(moduleCss.includes("editorialShadow")) finalJsx = finalJsx.replace(/className="([^"]*?)(editorial-shadow)([^"]*?)"/g, "className={`$1 $3 \\${styles.editorialShadow}`}");
  if(moduleCss.includes("materialSymbolsOutlined")) finalJsx = finalJsx.replace(/className="([^"]*?)(material-symbols-outlined)([^"]*?)"/g, "className={`$1 $3 \\${styles.materialSymbolsOutlined}`}");


  const componentSource = `
import Link from 'next/link';
${styleImport}

export default function Page() {
  return (
    <div className="${bodyClass}">
      ${finalJsx}
    </div>
  );
}
`;

  fs.writeFileSync(path.join(outputDir, "page.js"), componentSource);
  console.log("Converted", folder, "->", route);
});

