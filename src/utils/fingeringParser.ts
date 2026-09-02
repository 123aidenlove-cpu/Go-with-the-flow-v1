export const parseBrassFingering = (fingeringString: string): Set<string> => {
  const active = new Set<string>();
  const s = fingeringString.toLowerCase();
  
  if (s.includes('1')) active.add('1');
  if (s.includes('2')) active.add('2');
  if (s.includes('3')) active.add('3');
  
  return active;
};

export const parseViolinFingering = (fingeringString: string): Set<string> => {
  const active = new Set<string>();
  const s = fingeringString.toLowerCase();
  const tokens = s.split(/[\s,]+/);
  tokens.forEach(token => {
    const match = token.match(/([gdae])(\d[\+\-]?)/i);
    if (match) {
      let pos = match[2];
      if (pos === '4-') pos = '3+';
      active.add(`${match[1].toUpperCase()}${pos}`);
    }
  });
  
  return active;
};

export const parseFluteFingering = (fingeringString: string): Set<string> => {
  const active = new Set<string>();
  const s = fingeringString.toLowerCase();
  
  if (s.includes('thumb b') || s.includes('t1')) active.add('T1');
  if (s.includes('thumb bb') || s.includes('t2')) active.add('T2');
  
  const parts = fingeringString.split(',').map(p => p.trim().toLowerCase());
  const holeGroups = parts.filter(p => /^[123_\s]+$/.test(p) && p.length > 0);
  
  if (holeGroups.length > 0) {
    const lh = holeGroups[0];
    if (lh.includes('1')) active.add('LH1');
    if (lh.includes('2')) active.add('LH2');
    if (lh.includes('3')) active.add('LH3');
  }
  if (holeGroups.length > 1) {
    const rh = holeGroups[1];
    if (rh.includes('1')) active.add('RH1');
    if (rh.includes('2')) active.add('RH2');
    if (rh.includes('3')) active.add('RH3');
  }

  if (s.includes('lh1') || s.includes('lh 1')) active.add('LH1');
  if (s.includes('lh2') || s.includes('lh 2')) active.add('LH2');
  if (s.includes('lh3') || s.includes('lh 3')) active.add('LH3');
  if (s.includes('rh1') || s.includes('rh 1')) active.add('RH1');
  if (s.includes('rh2') || s.includes('rh 2')) active.add('RH2');
  if (s.includes('rh3') || s.includes('rh 3')) active.add('RH3');

  if (s.includes('l4') || (s.includes('l1') && !s.includes('trill1') && !s.includes('trill 1')) || s.includes('g#')) active.add('L1');

  if (s.includes('trill 1') || s.includes('trill1')) active.add('Trill1');
  if (s.includes('trill 2') || s.includes('trill2')) active.add('Trill2');
  if (s.includes('sk1') || s.includes('d trill')) active.add('SK1');

  if (s.includes('r1') || s.includes('eb')) active.add('R1');
  if (s.includes('r2') || s.includes('c#')) active.add('R2');
  if (s.includes('r3') || s.includes('c key') || (s.includes('c') && s.includes('right pinky'))) active.add('R3');
  if (s.includes('r4') || s.includes('b key') || (s.includes('b') && s.includes('right pinky'))) active.add('R4');

  fingeringString.split('-').forEach(t => {
    if (['T1','T2','LH1','LH2','LH3','RH1','RH2','RH3','L1','Trill1','Trill2','SK1','R1','R2','R3','R4'].includes(t)) {
      active.add(t);
    }
  });

  return active;
};

export const parseSaxophoneFingering = (fingeringString: string): Set<string> => {
  const active = new Set<string>();
  const s = fingeringString.toLowerCase();
  
  if (s.includes('thumb') || s.includes('8ve') || s.includes('octave')) active.add('8ve');

  const parts = fingeringString.split(',').map(p => p.trim().toLowerCase());
  const holeGroups = parts.filter(p => /^[123_\s]+$/.test(p) && p.length > 0);
  
  if (holeGroups.length > 0) {
    const lh = holeGroups[0];
    if (lh.includes('1')) active.add('LH1');
    if (lh.includes('2')) active.add('LH2');
    if (lh.includes('3')) active.add('LH3');
  }
  if (holeGroups.length > 1) {
    const rh = holeGroups[1];
    if (rh.includes('1')) active.add('RH1');
    if (rh.includes('2')) active.add('RH2');
    if (rh.includes('3')) active.add('RH3');
  }

  if (s.includes('lh1') || s.includes('lh 1')) active.add('LH1');
  if (s.includes('lh2') || s.includes('lh 2')) active.add('LH2');
  if (s.includes('lh3') || s.includes('lh 3')) active.add('LH3');
  if (s.includes('rh1') || s.includes('rh 1')) active.add('RH1');
  if (s.includes('rh2') || s.includes('rh 2')) active.add('RH2');
  if (s.includes('rh3') || s.includes('rh 3')) active.add('RH3');

  if (s.includes('sk1') || s.includes('side 1') || s.includes('side bb')) active.add('SK1');
  if (s.includes('sk2') || s.includes('side 2') || s.includes('side c')) active.add('SK2');
  if (s.includes('sk3') || s.includes('side 3') || s.includes('high e')) active.add('SK3');

  if (s.includes('palm d')) active.add('PalmD');
  if (s.includes('palm eb')) active.add('PalmEb');
  if (s.includes('palm f')) active.add('PalmF');
  if (s.includes('front f')) active.add('FrontF');

  if (s.includes('bis') || s.includes('bis bb')) active.add('Bis');

  if (s.includes('alt f#') || s.includes('alternate f#') || s.includes('altf#')) active.add('AltF#');

  if (s.includes('l1') || s.includes('g#')) active.add('L1');
  if (s.includes('l2') || s.includes('c#')) active.add('L2');
  if (s.includes('l3') || s.includes('b key') || (s.includes('b') && s.includes('left pinky'))) active.add('L3');
  if (s.includes('l4') || s.includes('low bb')) active.add('L4');

  if (s.includes('r1') || s.includes('eb key') || s.includes('low eb')) active.add('R1');
  if (s.includes('r2') || s.includes('c key') || s.includes('low c')) active.add('R2');

  fingeringString.split('-').forEach(t => {
    if (['8ve','LH1','LH2','LH3','RH1','RH2','RH3','SK1','SK2','SK3','PalmD','PalmEb','PalmF','FrontF','Bis','AltF#','L1','L2','L3','L4','R1','R2'].includes(t)) {
      active.add(t);
    }
  });

  return active;
};

export const parseGenericFingering = (fingeringString: string): Set<string> => {
  const active = new Set<string>();
  const s = fingeringString.toLowerCase();
  
  if (s.includes('thumb')) active.add('thumb');
  if (s.includes('8ve') || s.includes('register') || s.includes('+8ve')) active.add('register');
  if (s.includes('no thumb')) active.delete('thumb');

  const parts = fingeringString.split(',').map(p => p.trim().toLowerCase());
  const holeGroups = parts.filter(p => /^[123_\s]+$/.test(p) && p.length > 0);
  
  if (holeGroups.length > 0) {
    const lh = holeGroups[0];
    if (lh.includes('1')) active.add('LH1');
    if (lh.includes('2')) active.add('LH2');
    if (lh.includes('3')) active.add('LH3');
  }
  if (holeGroups.length > 1) {
    const rh = holeGroups[1];
    if (rh.includes('1')) active.add('RH1');
    if (rh.includes('2')) active.add('RH2');
    if (rh.includes('3')) active.add('RH3');
  }

  if (s.includes('sk1') || s.includes('side 1')) active.add('SK1');
  if (s.includes('sk2') || s.includes('side 2')) active.add('SK2');
  if (s.includes('sk3') || s.includes('side 3')) active.add('SK3');
  if (s.includes('sk4') || s.includes('side 4')) active.add('SK4');
  if (s.includes('side key') || s.includes('side of pointer')) active.add('SK1');

  if (s.includes(' a ') || s.includes('a key') || s.match(/\ba\b/)) active.add('A');
  if (s.includes('g#') || s.includes('ab')) active.add('G#');

  if (s.includes('l1') || s.includes('left 1')) active.add('L1');
  if (s.includes('l2') || s.includes('left 2')) active.add('L2');
  if (s.includes('l3') || s.includes('left 3')) active.add('L3');
  if (s.includes('l4') || s.includes('left 4')) active.add('L4');
  if (s.includes('left pinky') || s.includes('l pinky')) active.add('L1');

  if (s.includes('r1') || s.includes('right 1')) active.add('R1');
  if (s.includes('r2') || s.includes('right 2')) active.add('R2');
  if (s.includes('r3') || s.includes('right 3')) active.add('R3');
  if (s.includes('r4') || s.includes('right 4')) active.add('R4');
  if (s.includes('right pinky') || s.includes('r pinky') || s.includes('r2 pinky')) active.add('R2');

  if (s.includes('banana')) {
    if (s.includes('l banana') || s.includes('left banana')) active.add('L_Banana');
    else active.add('R_Banana');
  }

  fingeringString.split('-').forEach(t => {
    if (['thumb','register','LH1','LH2','LH3','RH1','RH2','RH3','SK1','SK2','SK3','SK4','A','G#','L1','L2','L3','L4','R1','R2','R3','R4','L_Banana','R_Banana'].includes(t)) {
      active.add(t);
    }
  });

  return active;
};

export const getParsedFingeringKeys = (instrument: string, fingeringString: string): string[] => {
  if (instrument === 'Trumpet' || instrument === 'Baritone/Euphonium' || instrument === 'Tuba' || instrument === 'French Horn') {
    return Array.from(parseBrassFingering(fingeringString)).sort();
  } else if (instrument === 'Flute') {
    return Array.from(parseFluteFingering(fingeringString)).sort();
  } else if (instrument === 'Alto Saxophone' || instrument === 'Tenor Saxophone') {
    return Array.from(parseSaxophoneFingering(fingeringString)).sort();
  } else if (instrument === 'Violin' || instrument === 'Viola' || instrument === 'Cello' || instrument === 'Double Bass') {
    return Array.from(parseViolinFingering(fingeringString)).sort();
  } else {
    return Array.from(parseGenericFingering(fingeringString)).sort();
  }
};
