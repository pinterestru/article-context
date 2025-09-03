/**
 * Enhanced client-side localization script
 */

const localizationBaseScript = `
async function __getSha256Hash(str) {
  if (!str || typeof crypto.subtle === 'undefined') {
    return '';
  }
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (e) {
    return '';
  }
}
async function __updateLocalizationSettings(localizationMeta, executionTimeMs) {
  try {
    var requestOptions = {
      method: "POST",
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        localization_meta: localizationMeta,
        url: window.location.href,
        execution_time_ms: executionTimeMs
      })
    }
    const response = await fetch('/api/localization', requestOptions);
    const result = await response.json();
    return result;
  } catch(e) {
    console.error(e);
    return {ok: false, localized: false, message: e.message};
  }
}
`;

const localizationMetaScript = `
function __localizationLang() {
  var nav = window.navigator || navigator;
  var lang = nav.language || nav.userLanguage || nav.browserLanguage || nav.systemLanguage;
  var langs = [];
  if (Array.isArray(nav.languages)) {
    langs = nav.languages;
  } else if (typeof nav.languages === 'string') {
    langs = nav.languages.split(',');
  }
  return {
    js_language: lang || '',
    js_languages: langs.join(',') || ''
  };
}

function __localizationFormat() {
  var intl = {};
  try {
    intl = Intl.DateTimeFormat().resolvedOptions() || {};
  } catch(e) {}
  return {
    js_format_locale: intl.locale || '',
    js_format_calendar: intl.calendar || '',
    js_format_day: intl.hourCycle || '',
    js_format_month: intl.month || '',
    js_format_year: intl.year || '',
    js_format_numbering_system: intl.numberingSystem || '',
    js_system_time_zone: intl.timeZone || '',
    js_system_time_zone_offset: -60 * new Date().getTimezoneOffset()
  };
}

function __localizationScreen() {
  var s = window.screen || {};
  return {
    js_screen_width: s.width || 0,
    js_screen_height: s.height || 0,
    js_screen_color_depth: s.colorDepth || 0,
    js_screen_pixel_depth: s.pixelDepth || 0,
    js_screen_available_width: s.availWidth || 0,
    js_screen_available_height: s.availHeight || 0,
    js_screen_device_pixel_ratio: window.devicePixelRatio || 1,
    js_screen_inner_width: window.innerWidth || 0,
    js_screen_inner_height: window.innerHeight || 0
  };
}

function __localizationDevice() {
  var nav = window.navigator || {};
  return {
    js_platform: nav.platform || '',
    js_hardware_concurrency: nav.hardwareConcurrency || 0,
    js_device_memory: nav.deviceMemory || 0,
    js_touch_max_points: nav.maxTouchPoints || 0,
    js_vendor: nav.vendor || '',
    js_vendor_sub: nav.vendorSub || '',
    js_product: nav.product || '',
    js_product_sub: nav.productSub || '',
    js_app_code_name: nav.appCodeName || '',
    js_app_name: nav.appName || '',
    js_app_version: nav.appVersion || '',
    js_ua: nav.userAgent || ''
  };
}

function __localizationBrowser() {
  var nav = window.navigator || {};
  return {
    js_is_cookie_enabled: nav.cookieEnabled,
    js_online: nav.onLine,
    js_dnt: nav.doNotTrack || window.doNotTrack || nav.msDoNotTrack || '0',
    js_plugins_count: nav.plugins ? nav.plugins.length : 0
  };
}

async function __localizationCanvas() {
  var data = {};
  try {
    var canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 60;
    var ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      
      ctx.fillStyle = '#069';
      ctx.font = '11pt no-real-font-123';
      ctx.fillText('Cwm fjordbank glyphs vext quiz', 2, 15);
      
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.font = '18pt Arial';
      ctx.fillText('Cwm fjordbank glyphs vext quiz', 4, 45);
      
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgb(255,0,255)';
      ctx.beginPath();
      ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = 'rgb(0,255,255)';
      ctx.beginPath();
      ctx.arc(100, 50, 50, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
      
      ctx.fillStyle = 'rgb(255,255,0)';
      ctx.beginPath();
      ctx.arc(75, 100, 50, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.fill();
      
      const dataUrl = canvas.toDataURL();
      data.js_canvas = await __getSha256Hash(dataUrl); 
    }
  } catch(e) {
  }
  return data;
}

function __localizationWebGL() {
  var data = {};
  try {
    var canvas = document.createElement('canvas');
    var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl) {
      var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      data.js_webgl_vendor = debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR);
      data.js_webgl_renderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
      data.js_webgl_version = gl.getParameter(gl.VERSION) || '';
      data.token_11 = gl.getParameter(gl.SHADING_LANGUAGE_VERSION) || ''; //js_webgl_shading_language_version
      
      var exts = gl.getSupportedExtensions() || [];
      data.token_12 = exts.length.toString(); //js_webgl_extensions_count
      exts.sort()
      data.token_13 = exts.join(','); //js_webgl_extensions_hash
    } else {
      data.js_webgl_vendor = 'not_supported';
      data.js_webgl_renderer = 'not_supported';
    }
  } catch(e) {
    data.js_webgl_vendor = 'error';
    data.js_webgl_renderer = 'error';
  }
  return data;
}

async function __localizationMediaDevices() {
    const data = {
        js_has_device_enumeration: false,
        js_has_microphone: false,
        js_has_webcam: false,
        js_has_speakers: false,
        js_media_devices_json: '[]'
    };
    const nav = window.navigator || {};
    if (nav.mediaDevices && typeof nav.mediaDevices.enumerateDevices === 'function') {
        data.js_has_device_enumeration = true;
        try {
            const devices = await nav.mediaDevices.enumerateDevices();
            const deviceSummary = [];
            devices.forEach(device => {
                if (device.kind === 'audioinput') data.js_has_microphone = true;
                if (device.kind === 'videoinput') data.js_has_webcam = true;
                if (device.kind === 'audiooutput') data.js_has_speakers = true;
                deviceSummary.push({ kind: device.kind, deviceId: device.deviceId ? 'exists' : 'none' });
            });
            data.js_media_devices_json = JSON.stringify(deviceSummary);
        } catch (e) { }
    }
    return data;
}

function __localizationAudio() {
  var data = {};
  try {
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      var audioCtx = new AudioContext();
      data.js_audio_sample_rate = audioCtx.sampleRate || 0;
      data.js_audio_state = audioCtx.state || '';
      audioCtx.close();
    }
  } catch(e) {}
  return data;
}

async function __localizationClientHints() {
  const data = {
    token_14: '',       // Mapped from: architecture
    token_15: '',       // Mapped from: model
    ua_os_version: '',  // Mapped from: platformVersion
  };
  const nav = window.navigator || {};
  if (nav.userAgentData && typeof nav.userAgentData.getHighEntropyValues === 'function') {
    try {
      const hints = await nav.userAgentData.getHighEntropyValues([
        "architecture", 
        "model", 
        "platformVersion"
      ]);

      data.token_14 = hints.architecture || '';
      data.token_15 = hints.model || '';
      data.ua_os_version = hints.platformVersion || '';

    } catch (e) {
      //console.warn("Could not retrieve high-entropy client hints.", e);
    }
  }
  return data;
}

function __localizationSpeechVoices() {
  return new Promise((resolve) => {
    const data = { js_speech_synthesis_voices: '' };
    try {
      if ('speechSynthesis' in window && typeof window.speechSynthesis.getVoices === 'function') {
        const processAndResolve = () => {
          const voices = window.speechSynthesis.getVoices() || [];
          if (voices.length > 0) {
            const voiceNames = voices.map(v => v.name);
            voiceNames.sort();
            data.js_speech_synthesis_voices = voiceNames.join(',');
            resolve(data);
          }
        };
        const initialVoices = window.speechSynthesis.getVoices() || [];
        if (initialVoices.length > 0) {
          processAndResolve();
        } else {
          window.speechSynthesis.onvoiceschanged = processAndResolve;
        }
        setTimeout(() => resolve(data), 250);
      } else {
        resolve(data);
      }
    } catch (e) {
      resolve(data);
    }
  });
}

async function __localizationPermissions() {
  const data = {
    js_permissions_json: '' // Mapped to the dedicated JSON field
  };
  const nav = window.navigator || {};

  // Check if the Permissions API is supported.
  if (nav.permissions && typeof nav.permissions.query === 'function') {
    try {
      // Define the list of permissions we are interested in.
      const permissionsToCheck = [
        'geolocation', 
        'notifications', 
        'camera', 
        'microphone', 
        'clipboard-read', 
        'clipboard-write'
      ];

      // Query all permissions in parallel for performance.
      const permissionStates = await Promise.all(
        permissionsToCheck.map(name => nav.permissions.query({ name }))
      );

      // Create a stable and compact JSON string from the results.
      const permissionsObject = {};
      permissionStates.forEach((status, index) => {
        permissionsObject[permissionsToCheck[index]] = status.state;
      });
      data.js_permissions_json = JSON.stringify(permissionsObject);
      
    } catch (e) {
      // Fail silently if an error occurs (e.g., an unsupported permission name).
      //console.warn("Could not retrieve permissions state.", e);
    }
  }

  return data;
}

function __localizationBase() {
  return {
    js_url: window.location.href,
    js_referrer: document.referrer || ''
  };
}

function __localizationUser() {
  var userId = localStorage.getItem('uid') || '';
  if (!userId) {
    userId = 'u_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    try {
      localStorage.setItem('uid', userId);
    } catch(e) {}
  }
  return {
    marketing_device_id: userId
  };
}

async function __getLocalizationDataAsync() {
  const results = await Promise.all([
    Promise.resolve(__localizationBase()),
    Promise.resolve(__localizationUser()),
    Promise.resolve(__localizationLang()),
    Promise.resolve(__localizationFormat()),
    Promise.resolve(__localizationScreen()),
    Promise.resolve(__localizationDevice()),
    Promise.resolve(__localizationBrowser()),
    __localizationCanvas(),
    __localizationMediaDevices(),
    Promise.resolve(__localizationWebGL()),
    Promise.resolve(__localizationAudio()),
    __localizationClientHints(),
    __localizationSpeechVoices(),
    __localizationPermissions()
  ]);
  
  return Object.assign({}, ...results);
}
window.LocalizationDataGet = __getLocalizationDataAsync;
`;

// Main initialization script
const localizationInitScript = `
(async function() {
  if (window.__localizationProcessed) return;
  window.__localizationProcessed = true;
    
  try {
    const startTime = performance.now();
    const localizationMeta = window.LocalizationDataGet ? await window.LocalizationDataGet() : {};
    const executionTimeMs = performance.now() - startTime;
    localizationMeta.js_script_time_milliseconds = executionTimeMs;
    
    const result = await __updateLocalizationSettings(localizationMeta, executionTimeMs);

    if (result && result.localized === true) {
      document.documentElement.classList.add('is-localized');
    }
  } catch (e) {
    console.error('Localization script failed:', e);
  }
})();
`;

export const getLocalizationScripts = () => {
  // Combine all scripts in proper order
  const unified = `
${localizationBaseScript}
${localizationMetaScript}
${localizationInitScript}
`;

  return {
    unified: unified.trim()
  };
};