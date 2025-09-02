import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { logger } from '@/lib/logging/logger';
import { trackerApiService } from '@/lib/services/tracker/tracker.api';
import { notificationApiService } from '@/lib/services/notification/notification.api';

// Ensure this route is always dynamically rendered
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Localization meta script for fingerprinting
const localizationMetaScript = `
  function __localizationLang(){var a=window.navigator||navigator,g=a.language||a.userLanguage||a.browserLanguage||a.systemLanguage,n=[];return Array.isArray(a.languages)?n=a.languages:"string"==typeof a.languages&&(n=a.languages.split(",")),{js_language:g||"",js_languages:n.join(",")||""}}
  function __localizationFormat(){var e=Intl.DateTimeFormat().resolvedOptions()||{};return{js_format_locale:e.locale,js_format_calendar:e.calendar,js_format_day:e.day,js_format_month:e.month,js_format_year:e.year,js_format_numbering_system:e.numberingSystem,js_system_time_zone:e.timeZone,js_system_time_zone_offset:-60*(new Date).getTimezoneOffset()}}
  function __localizationBase(){return {js_referrer:document.referrer}}
  function __localizationData() {
    var localization = {...__localizationBase(),...__localizationLang(),...__localizationFormat()}
    return localization
  }
  window.LocalizationDataGet = __localizationData
`;

// Default locale (you may want to make this configurable)
const defaultLocale = 'en';

// Generate the preload HTML with fingerprinting
const generatePreloadScript = (locale: string = defaultLocale) => `<!DOCTYPE html>
<html lang="${locale.toLowerCase()}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="referrer" content="no-referrer">
  <title>Redirecting</title>
</head> 
<body>
  <script>
    ${localizationMetaScript}
    fetch(window.location.href, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({js_meta: window.LocalizationDataGet(), is_client: true})}).then(v => v.json()).then(v => v.url ? window.location.href = v.url : "")
  </script>
  <script>
    var styleElem = document.createElement("style");
    styleElem.innerHTML = '#ovrl-div-ovrl{position:fixed;width:100%;height:100%;background:rgba(255,255,255,0.9);top:0;left:0;right:0;bottom:0;z-index:10000;display:flex;align-items:center;justify-content:center}#ovrl-div-ovrl>div{width:112px;height:112px;position:relative}#ovrl-div-ovrl>div:after{content:" ";position:absolute;top:0;left:0;right:0;bottom:0;margin:8px;border:8px solid #e5e7eb;border-radius:50%;animation:lds-ring 1.2s cubic-bezier(0.5,0,0.5,1) infinite;border-color:#4285f4 transparent transparent transparent}#ovrl-div-ovrl>div:before{content:" ";position:absolute;top:0;left:0;right:0;bottom:0;margin:8px;border:8px solid transparent;border-radius:50%;animation:lds-ring 1.2s cubic-bezier(0.5,0,0.5,1) -0.45s infinite;border-color:#db4437 transparent transparent transparent}#ovrl-div-ovrl>div>div{content:" ";position:absolute;top:0;left:0;right:0;bottom:0;margin:8px;border:8px solid transparent;border-radius:50%;animation:lds-ring 1.2s cubic-bezier(0.5,0,0.5,1) -0.3s infinite;border-color:#f4b400 transparent transparent transparent}#ovrl-div-ovrl>div>div:after{content:" ";position:absolute;top:-8px;left:-8px;right:-8px;bottom:-8px;margin:8px;border:8px solid transparent;border-radius:50%;animation:lds-ring 1.2s cubic-bezier(0.5,0,0.5,1) -0.15s infinite;border-color:#0f9d58 transparent transparent transparent}@keyframes lds-ring{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}';
    var div1 = document.createElement("div");
    div1.id = "ovrl-div-ovrl";
    var div2 = document.createElement("div");
    div2.id = "lds-dual-ring";
    var div3 = document.createElement("div");
    div2.appendChild(div3);
    div1.appendChild(div2);
    document.head.appendChild(styleElem);
    document.body.append(div1);
  </script>
</body>
</html>
`;

// Pattern to split domain and path when they're concatenated
const splitPattern = /\.(com|net|org|ru)(?!\/)(?=.)/;

/**
 * Normalize tags array to properly separate domain and path
 */
function normalizeTags(tags: string[]): string[] {
  const first = tags[0];
  const match = splitPattern.exec(first);
  if (!match) return tags;

  const tldStart = match.index;
  const tldLen = match[0].length;
  const domain = first.slice(0, tldStart + tldLen);
  const path = first.slice(tldStart + tldLen);

  tags.splice(0, 1, domain, path);
  return tags;
}

/**
 * Affiliate redirect handler
 * Handles URLs in format: /c/offer_domain/path?params
 * Example: /c/practicum.yandex.ru/course/python?utm_source=...
 * 
 * Supports both GET and POST methods for client fingerprinting
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, { params: resolvedParams }, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, { params: resolvedParams }, 'POST');
}

async function handleRequest(
  request: NextRequest,
  { params }: { params: { path: string[] } },
  method: 'GET' | 'POST'
) {
  try {
    // Parse request body for POST requests
    const requestBody = method === 'POST' ? await request.json().catch(() => ({})) : {};
    
    // Extract query parameters - matching legacy exactly
    const searchParams = request.nextUrl.searchParams;
    let { slug, created_at: createdAt, mtfi, js_meta, url, domain, with_meta = 'true', target, direct, direct_link } = Object.fromEntries(searchParams);
    
    // Force with_meta to true like legacy
    with_meta = 'true';
    
    // Get URL value like legacy
    const urlValue = url || `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('host')}${request.url}` || '';
    
    // Check if request is from bot
    const cookieStore = await cookies();
    const isBot = target === 'false' || cookieStore.get('_target')?.value === 'false';
    
    // Force direct redirect for bots if not explicitly disabled
    if (isBot && direct !== 'false') {
      //direct = 'true';
    }
    
    // Handle direct redirect
    if (direct === 'true') {
      if (direct_link) {
        return NextResponse.redirect(direct_link, { status: 301 });
      } else {
        const link = `https://${params.path.join('/')}`;
        if (!link.includes('.')) {
          return NextResponse.redirect(new URL('/', request.url), { status: 301 });
        }
        return NextResponse.redirect(link, { status: 301 });
      }
    }
    
    // Normalize tags like legacy
    const tags = normalizeTags([...params.path]);
    const tag = tags.shift() || '';
    const path = tags.filter(v => !!v).join('/');
    
    // Return preload script if no js_meta in request body
    if (with_meta && !requestBody.js_meta) {
      return new NextResponse(generatePreloadScript(), {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
      });
    }
    
    // Generate MTFI cookie key
    const mtfiKey = `_mtfi__${tag}${path ? `__${path.split('/').join('_')}` : (slug ? `__${slug}` : '')}`;
    
    // Get MTFI from cookie if not provided
    if (!mtfi) {
      mtfi = cookieStore.get(mtfiKey)?.value || 'none';
    }
    
    // Prepare client meta information - matching legacy
    const clientMeta = {
      ip: request.headers.get('cf-connecting-ip') || 
          request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
          '',
      user_agent: request.headers.get('user-agent') || '',
      domain: domain || request.headers.get('host') || '',
      url: urlValue,
      mtfi,
      created_at: createdAt || new Date().toISOString(),
      headers: Array.from(request.headers.entries())
        .map(([name, value]) => `${name}: ${value}`)
        .join('\r\n'),
    };
    
    // Prepare query parameters for tracking - matching legacy
    const query: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      if (!['tags', 'direct_link', 'direct'].includes(key)) {
        query[key] = value;
      }
    });

    if (isBot) {
      query.target = 'false';
      query.bot = 'true';
    }
    
    if (path) {
      query.path = `/${path}`;
    }
    
    // Remove these from query like legacy
    delete query.tags;
    delete query.direct_link;
    delete query.direct;
    
    // Get JS meta from request body or query params
    const jsMeta = requestBody.js_meta || js_meta;
    if (jsMeta && !jsMeta.js_url) {
      jsMeta.js_url = urlValue;
    }
    
    // Process marketing redirect through tracking service
    const response = await trackerApiService.marketingProcess(
      tag,
      slug || undefined,
      query,
      {
        jsMeta,
        clientMeta,
      }
    );
    
    // Handle error response
    if (response.message) {
      const httpReferrer = request.headers.get('referer') || request.headers.get('referrer') || '-';
      const redirectLink = `https://${tag}/${path}`;
      const d = domain || request.headers.get('host') || 'no_domain';
      const error = response.message;
      
      // Remove path from query for notification
      const notifyQuery = { ...query };
      delete notifyQuery.path;
      
      // Send notification for broken campaign
      await notificationApiService.notify(
        `Broken Campaign: <b>${tag}</b> | ${redirectLink} | domain: ${d} | referrer: ${httpReferrer} | query: ${JSON.stringify(notifyQuery)} | ip: ${clientMeta.ip || ''} | err: ${error}`
      );
      
      return NextResponse.redirect(redirectLink, { status: 301 });
    }
    
    // Set MTFI cookie if returned
    if (response.mtfi) {
      const headers = new Headers();
      headers.append(
        'Set-Cookie',
        `${mtfiKey}=${response.mtfi}; Expires=${new Date(Date.now() + 24 * 60 * 60 * 1000).toUTCString()}; Path=/`
      );
      
      // Handle response based on type and client - matching legacy exactly
      if (response.type === 'redirect' && response.url) {
        if (!requestBody.is_client) {
          return NextResponse.redirect(response.url, { status: 301, headers });
        }
      }
      
      return NextResponse.json(response, { headers });
    }
    
    // Handle response based on type and client - matching legacy exactly
    if (response.type === 'redirect' && response.url) {
      if (!requestBody.is_client) {
        return NextResponse.redirect(response.url, { status: 301 });
      }
    }
    
    return NextResponse.json(response);
    
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
      path: params.path,
      method,
    }, 'Failed to process affiliate redirect');
    
    // Redirect to home on error
    return NextResponse.redirect(new URL('/', request.url));
  }
}