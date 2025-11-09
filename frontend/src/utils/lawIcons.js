// Utility for generating law icons at different sizes

export const createLawIcon = (id, size = 100) => {
  const scale = size / 100;
  
  const iconMap = {
    'aesthetic-usability': {
      viewBox: '0 0 100 100',
      content: `
        <defs>
          <linearGradient id="aestheticGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="${35 * scale}" fill="url(#aestheticGrad-${id})" opacity="0.2"/>
        <path d="M ${30 * scale} ${50 * scale} Q ${50 * scale} ${30 * scale} ${70 * scale} ${50 * scale} Q ${50 * scale} ${70 * scale} ${30 * scale} ${50 * scale}" fill="url(#aestheticGrad-${id})" opacity="0.6"/>
        <circle cx="${50 * scale}" cy="${50 * scale}" r="${8 * scale}" fill="url(#aestheticGrad-${id})" opacity="0.8"/>
      `
    },
    'choice-overload': {
      viewBox: '0 0 100 100',
      content: `
        <defs>
          <linearGradient id="choiceGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="${35 * scale}" fill="url(#choiceGrad-${id})" opacity="0.2"/>
        <circle cx="${30 * scale}" cy="${30 * scale}" r="${8 * scale}" fill="url(#choiceGrad-${id})" opacity="0.7"/>
        <circle cx="${50 * scale}" cy="${30 * scale}" r="${8 * scale}" fill="url(#choiceGrad-${id})" opacity="0.7"/>
        <circle cx="${70 * scale}" cy="${30 * scale}" r="${8 * scale}" fill="url(#choiceGrad-${id})" opacity="0.7"/>
        <circle cx="${30 * scale}" cy="${50 * scale}" r="${8 * scale}" fill="url(#choiceGrad-${id})" opacity="0.7"/>
        <circle cx="${70 * scale}" cy="${50 * scale}" r="${8 * scale}" fill="url(#choiceGrad-${id})" opacity="0.7"/>
        <circle cx="${30 * scale}" cy="${70 * scale}" r="${8 * scale}" fill="url(#choiceGrad-${id})" opacity="0.7"/>
        <circle cx="${50 * scale}" cy="${70 * scale}" r="${8 * scale}" fill="url(#choiceGrad-${id})" opacity="0.7"/>
        <circle cx="${70 * scale}" cy="${70 * scale}" r="${8 * scale}" fill="url(#choiceGrad-${id})" opacity="0.7"/>
      `
    },
    // Add more icons as needed - for now return default
  };
  
  const icon = iconMap[id];
  if (icon) {
    return `<svg viewBox="${icon.viewBox}" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">${icon.content}</svg>`;
  }
  
  // Default icon
  return `<svg viewBox="0 0 ${size} ${size}" class="w-full h-full text-indigo-400" preserveAspectRatio="xMidYMid meet">
    <defs>
      <linearGradient id="defaultGrad-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#6366f1;stop-opacity:1" />
      </linearGradient>
    </defs>
    <circle cx="${size/2}" cy="${size/2}" r="${size * 0.3}" fill="url(#defaultGrad-${id})" opacity="0.3"/>
    <circle cx="${size/2}" cy="${size/2}" r="${size * 0.2}" fill="url(#defaultGrad-${id})" opacity="0.5"/>
    <circle cx="${size/2}" cy="${size/2}" r="${size * 0.1}" fill="url(#defaultGrad-${id})" opacity="0.7"/>
  </svg>`;
};

