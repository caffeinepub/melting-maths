/**
 * Wikipedia Math Search utility for Shinchen AI tutor.
 *
 * Searches Wikipedia for a math topic and returns a short summary.
 * Returns null if no result found or topic is not math-related.
 */

const MATH_KEYWORDS = [
  "math",
  "algebra",
  "geometry",
  "calculus",
  "arithmetic",
  "number",
  "fraction",
  "equation",
  "triangle",
  "circle",
  "polynomial",
  "derivative",
  "integral",
  "probability",
  "statistics",
  "matrix",
  "vector",
  "logarithm",
  "trigonometry",
  "prime",
  "factor",
  "decimal",
  "percentage",
  "ratio",
  "sequence",
  "function",
  "graph",
  "coordinate",
  "quadratic",
  "linear",
  "theorem",
  "proof",
  "formula",
  "pi",
  "infinity",
  "set",
  "angle",
  "perimeter",
  "area",
  "volume",
  "division",
  "multiplication",
  "subtraction",
  "addition",
  "integer",
  "rational",
  "irrational",
  "exponent",
  "power",
  "root",
  "square",
  "cube",
  "sine",
  "cosine",
  "tangent",
  "hypotenuse",
  "pythagoras",
  "fibonacci",
  "prime",
  "composite",
  "symmetry",
  "transformation",
  "permutation",
  "combination",
  "binomial",
  "polynomial",
  "parabola",
  "hyperbola",
  "ellipse",
  "asymptote",
  "limit",
  "infinity",
  "absolute",
  "modulus",
];

export interface WikiMathResult {
  summary: string;
  url: string;
  title: string;
}

export async function searchWikipediaMath(
  query: string,
): Promise<WikiMathResult | null> {
  try {
    // Step 1: Search Wikipedia scoped to mathematics
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(`${query} mathematics`)}&format=json&origin=*&srlimit=1`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) return null;
    const searchData = await searchRes.json();
    const results = searchData?.query?.search;
    if (!results || results.length === 0) return null;

    const title: string = results[0].title;

    // Step 2: Check if result is math-related
    const titleLower = `${title} ${query}`.toLowerCase();
    const isMathRelated = MATH_KEYWORDS.some((k) => titleLower.includes(k));
    if (!isMathRelated) return null;

    // Step 3: Fetch page summary from REST API
    const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const summaryRes = await fetch(summaryUrl);
    if (!summaryRes.ok) return null;
    const summaryData = await summaryRes.json();
    const extract: string = summaryData?.extract;
    if (!extract) return null;

    // Step 4: Truncate to ~3 sentences, max 350 chars
    const sentences = extract.match(/[^.!?]+[.!?]+/g) ?? [];
    let truncated = sentences.slice(0, 3).join(" ").trim();
    if (truncated.length > 350) truncated = `${truncated.slice(0, 347)}...`;
    if (!truncated) return null;

    const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, "_"))}`;

    return {
      summary: truncated,
      url: wikiUrl,
      title,
    };
  } catch {
    return null;
  }
}
