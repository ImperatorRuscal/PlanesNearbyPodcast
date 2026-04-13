const { AIRPORT_FACTS } = require('../data/airportFacts');

const EMERGENCY_PHRASES = {
  emergency_7700: 'This airplane is broadcasting a general emergency signal!',
  emergency_7500: 'This airplane has reported a hijacking emergency!',
  emergency_7600: 'This airplane has lost radio contact with air traffic control!',
};

/**
 * ICAO 3-letter airline prefix → { name, callsign }
 * name    — full display name used on first mention ("American Airlines 717")
 * callsign — radio callsign used on subsequent mentions ("American")
 */
const AIRLINE_CALLSIGNS = {
  // ── US majors ─────────────────────────────────────────────────────────────
  AAL: { name: 'American Airlines',   callsign: 'American'   },
  DAL: { name: 'Delta Air Lines',     callsign: 'Delta'       },
  UAL: { name: 'United Airlines',     callsign: 'United'      },
  SWA: { name: 'Southwest Airlines',  callsign: 'Southwest'   },
  ASA: { name: 'Alaska Airlines',     callsign: 'Alaska'      },
  JBU: { name: 'JetBlue Airways',     callsign: 'JetBlue'     },
  NKS: { name: 'Spirit Airlines',     callsign: 'Spirit'      },
  FFT: { name: 'Frontier Airlines',   callsign: 'Frontier'    },
  HAL: { name: 'Hawaiian Airlines',   callsign: 'Hawaiian'    },
  BTA: { name: 'Breeze Airways',      callsign: 'Breeze'      },
  SLG: { name: 'Sun Country Airlines',callsign: 'Sun Country' },
  VRD: { name: 'Virgin America',      callsign: 'Redwood'     },
  JSX: { name: 'JSX',                 callsign: 'JSX Air'     },

  // ── US regional ───────────────────────────────────────────────────────────
  SKW: { name: 'SkyWest Airlines',    callsign: 'SkyWest'     },
  RPA: { name: 'Republic Airways',    callsign: 'Brickyard'   },
  ENY: { name: 'Envoy Air',           callsign: 'Envoy'       },
  GJS: { name: 'GoJet Airlines',      callsign: 'Trans States'},
  AWI: { name: 'Air Wisconsin',       callsign: 'Air Wisconsin'},
  PDT: { name: 'Piedmont Airlines',   callsign: 'Piedmont'    },
  JKA: { name: 'LeTourneau University', callsign: 'Jacket'    },
  EDV: { name: 'Endeavor Air',        callsign: 'Endeavor'    },
  JIA: { name: 'PSA Airlines',        callsign: 'Speed'       },
  AAY: { name: 'Allegiant Air',       callsign: 'Allegiant'   },
  SCX: { name: 'Sun Country Airlines',callsign: 'Sun Country' },
  KAP: { name: 'Cape Air',            callsign: 'Cape Air'    },
  MHO: { name: 'Mokulele Airlines',   callsign: 'Mokulele'    },
  VTE: { name: 'Contour Airlines',    callsign: 'Contour'     },
  VXP: { name: 'Avelo Airlines',      callsign: 'Avelo'       },
  ASH: { name: 'Mesa Airlines',       callsign: 'Air Shuttle' },
  SIL: { name: 'Silver Airways',      callsign: 'Silver'      },
  BTQ: { name: 'Boutique Air',        callsign: 'Boutique'    },
  WUP: { name: 'Wheels Up',           callsign: 'Wheels Up'   },
  MXY: { name: 'Breeze Airways',      callsign: 'Breeze'      },
  RCH: { name: 'Air Mobility Command',callsign: 'Reach'       },

  // ── US cargo ──────────────────────────────────────────────────────────────
  FDX: { name: 'FedEx',              callsign: 'FedEx'        },
  UPS: { name: 'UPS',                callsign: 'UPS'          },
  GTI: { name: 'Atlas Air',          callsign: 'Giant'        },
  ABX: { name: 'ABX Air',            callsign: 'Abex'         },
  ATN: { name: 'Air Transport International', callsign: 'Cargo Express' },
  CLX: { name: 'Cargolux',           callsign: 'Cargolux'     },
  PAC: { name: 'Polar Air Cargo',    callsign: 'Polar'        },
  CKS: { name: 'Kalitta Air',        callsign: 'Connie'       },
  OAE: { name: 'Omni Air International', callsign: 'Omni Express' },
  WGN: { name: 'Western Global Airlines', callsign: 'Western Global' },
  NAC: { name: 'Northern Air Cargo', callsign: 'Yukon'        },
  DHK: { name: 'DHL Air',            callsign: 'World Express'},
  DHX: { name: 'DHL International',  callsign: 'Dilmun'       },

  // ── Canada & Mexico ───────────────────────────────────────────────────────
  ACA: { name: 'Air Canada',         callsign: 'Air Canada'   },
  WJA: { name: 'WestJet',            callsign: 'WestJet'      },
  TSC: { name: 'Air Transat',        callsign: 'Transat'      },
  JZA: { name: 'Jazz Air',           callsign: 'Jazz'         },
  CAW: { name: 'Cargojet Airways',   callsign: 'Cargojet'     },
  FLE: { name: 'Flair Airlines',     callsign: 'Flair'        },
  WEN: { name: 'WestJet Encore',     callsign: 'Encore'       },
  AMX: { name: 'Aeromexico',         callsign: 'Aeromexico'   },
  VOI: { name: 'Volaris',            callsign: 'Volaris'      },
  VIV: { name: 'VivaAerobus',        callsign: 'VivaAerobus'  },

  // ── Caribbean & Central/South America ────────────────────────────────────
  BWA: { name: 'Caribbean Airlines', callsign: 'Caribbean'    },
  CMP: { name: 'Copa Airlines',      callsign: 'Copa'         },
  LAN: { name: 'LATAM Airlines',     callsign: 'LAN'          },
  TAM: { name: 'LATAM Brasil',       callsign: 'LATAM'        },
  AVA: { name: 'Avianca',            callsign: 'Avianca'      },
  GLO: { name: 'GOL',                callsign: 'Gol'          },
  AZU: { name: 'Azul Brazilian Airlines', callsign: 'Azul'    },
  ARG: { name: 'Aerolíneas Argentinas', callsign: 'Argentina' },

  // ── Europe ────────────────────────────────────────────────────────────────
  BAW: { name: 'British Airways',    callsign: 'Speedbird'    },
  DLH: { name: 'Lufthansa',          callsign: 'Lufthansa'    },
  AFR: { name: 'Air France',         callsign: 'Air France'   },
  KLM: { name: 'KLM',               callsign: 'KLM'          },
  IBE: { name: 'Iberia',             callsign: 'Iberia'       },
  VLG: { name: 'Vueling',            callsign: 'Vueling'      },
  AEA: { name: 'Air Europa',         callsign: 'Europa'       },
  TAP: { name: 'TAP Air Portugal',   callsign: 'Air Portugal' },
  VIR: { name: 'Virgin Atlantic',    callsign: 'Virgin'       },
  EZY: { name: 'easyJet',            callsign: 'Easy'         },
  RYR: { name: 'Ryanair',            callsign: 'Ryanair'      },
  TUI: { name: 'TUI Airways',        callsign: 'TUI'          },
  EWG: { name: 'Eurowings',          callsign: 'Eurowings'    },
  BEL: { name: 'Brussels Airlines',  callsign: 'Beeline'      },
  SAS: { name: 'Scandinavian Airlines', callsign: 'Scandinavian' },
  NAX: { name: 'Norwegian Air Shuttle', callsign: 'Norwegian' },
  FIN: { name: 'Finnair',            callsign: 'Finnair'      },
  OAL: { name: 'Olympic Air',        callsign: 'Olympic'      },
  AZA: { name: 'ITA Airways',        callsign: 'Italia'       },
  CSA: { name: 'Czech Airlines',     callsign: 'Czech'        },
  LOT: { name: 'LOT Polish Airlines',callsign: 'LOT'          },
  AUI: { name: 'Ukraine International Airlines', callsign: 'Ukraine' },
  AFL: { name: 'Aeroflot',           callsign: 'Aeroflot'     },
  EIN: { name: 'Aer Lingus',         callsign: 'Shamrock'     },
  SWR: { name: 'Swiss International Air Lines', callsign: 'Swiss' },
  AUA: { name: 'Austrian Airlines',  callsign: 'Austrian'     },
  AEE: { name: 'Aegean Airlines',    callsign: 'Aegean'       },
  WZZ: { name: 'Wizz Air',           callsign: 'Wizzair'      },
  PGT: { name: 'Pegasus Airlines',   callsign: 'Pegasus'      },
  TRA: { name: 'Transavia',          callsign: 'Transavia'    },
  CFG: { name: 'Condor',             callsign: 'Condor'       },
  CTN: { name: 'Croatia Airlines',   callsign: 'Croatia'      },
  ICE: { name: 'Icelandair',         callsign: 'Iceair'       },
  WIF: { name: 'Widerøe',            callsign: 'Wideroe'      },
  FLI: { name: 'Atlantic Airways',   callsign: 'Faroeline'    },
  LOG: { name: 'Loganair',           callsign: 'Logan'        },
  BCY: { name: 'CityJet',            callsign: 'City Jet'     },
  AWC: { name: 'Titan Airways',      callsign: 'Zap'          },
  TVF: { name: 'Transavia France',   callsign: 'France Soleil'},
  VOE: { name: 'Volotea',            callsign: 'Volotea'      },
  ANE: { name: 'Air Nostrum',        callsign: 'Nostrum'      },
  IBS: { name: 'Iberia Express',     callsign: 'Iberexpress'  },
  FBU: { name: 'French Bee',         callsign: 'French Bee'   },
  BTI: { name: 'Air Baltic',         callsign: 'Air Baltic'   },
  BRU: { name: 'Belavia',            callsign: 'Belarus Avia' },
  ROT: { name: 'Tarom',              callsign: 'Tarom'        },
  TVS: { name: 'Smartwings',         callsign: 'Skytravel'    },
  LGL: { name: 'Luxair',             callsign: 'Luxair'       },
  OAW: { name: 'Helvetic Airways',   callsign: 'Helvetic'     },
  EDW: { name: 'Edelweiss Air',      callsign: 'Edelweiss'    },
  GEC: { name: 'Lufthansa Cargo',    callsign: 'Lufthansa Cargo' },
  CLH: { name: 'Lufthansa CityLine', callsign: 'Hansaline'    },
  UTA: { name: 'UTair Aviation',     callsign: 'Utair'        },
  SBI: { name: 'S7 Airlines',        callsign: 'Siberian Airlines' },
  SDM: { name: 'Rossiya Airlines',   callsign: 'Russia'       },
  SVR: { name: 'Ural Airlines',      callsign: 'Sverdlovsk Air' },

  // ── Middle East & Africa ──────────────────────────────────────────────────
  UAE: { name: 'Emirates',           callsign: 'Emirates'     },
  QTR: { name: 'Qatar Airways',      callsign: 'Qatari'       },
  ETD: { name: 'Etihad Airways',     callsign: 'Etihad'       },
  FDB: { name: 'flydubai',           callsign: 'Flydubai'     },
  GFA: { name: 'Gulf Air',           callsign: 'Gulf Air'     },
  SVA: { name: 'Saudia',             callsign: 'Saudia'       },
  ELY: { name: 'El Al',              callsign: 'El Al'        },
  ETH: { name: 'Ethiopian Airlines', callsign: 'Ethiopian'    },
  KQA: { name: 'Kenya Airways',      callsign: 'Kenya'        },
  RAM: { name: 'Royal Air Maroc',    callsign: 'Marocair'     },
  MSR: { name: 'EgyptAir',           callsign: 'Egyptair'     },
  SAA: { name: 'South African Airways', callsign: 'Springbok' },
  THY: { name: 'Turkish Airlines',   callsign: 'Turkish'      },
  MEA: { name: 'Middle East Airlines', callsign: 'Cedar Jet'  },
  OMA: { name: 'Oman Air',           callsign: 'Oman Air'     },
  RJA: { name: 'Royal Jordanian',    callsign: 'Jordanian'    },
  PIA: { name: 'Pakistan International Airlines', callsign: 'Pakistan' },
  ABY: { name: 'Air Arabia',         callsign: 'Arabia'       },
  KNE: { name: 'Flynas',             callsign: 'Nas Express'  },
  KAC: { name: 'Kuwait Airways',     callsign: 'Kuwaiti'      },
  IAW: { name: 'Iraqi Airways',      callsign: 'Iraqi'        },
  RWD: { name: 'RwandAir',           callsign: 'Rwandair'     },
  LAM: { name: 'LAM Mozambique Airlines', callsign: 'Mozambique' },
  UGD: { name: 'Uganda Airlines',    callsign: 'Crested'      },

  // ── Asia Pacific ──────────────────────────────────────────────────────────
  QFA: { name: 'Qantas',             callsign: 'Qantas'       },
  SIA: { name: 'Singapore Airlines', callsign: 'Singapore'    },
  CPA: { name: 'Cathay Pacific',     callsign: 'Cathay'       },
  JAL: { name: 'Japan Airlines',     callsign: 'Japan Air'    },
  ANA: { name: 'ANA',                callsign: 'All Nippon'   },
  KAL: { name: 'Korean Air',         callsign: 'Korean Air'   },
  AAR: { name: 'Asiana Airlines',    callsign: 'Asiana'       },
  CAL: { name: 'China Airlines',     callsign: 'Dynasty'      },
  CES: { name: 'China Eastern',      callsign: 'China Eastern'},
  CSN: { name: 'China Southern',     callsign: 'China Southern'},
  CCA: { name: 'Air China',          callsign: 'Air China'    },
  MAS: { name: 'Malaysia Airlines',  callsign: 'Malaysian'    },
  THA: { name: 'Thai Airways',       callsign: 'Thai'         },
  VNA: { name: 'Vietnam Airlines',   callsign: 'Vietnam Airlines' },
  PAL: { name: 'Philippine Airlines',callsign: 'Philippine'   },
  GIA: { name: 'Garuda Indonesia',   callsign: 'Indonesia'    },
  IGO: { name: 'IndiGo',             callsign: 'IndiGo'       },
  AIC: { name: 'Air India',          callsign: 'Air India'    },
  ANZ: { name: 'Air New Zealand',    callsign: 'New Zealand'  },
  JST: { name: 'Jetstar Airways',    callsign: 'Jetstar'      },
  VOZ: { name: 'Virgin Australia',   callsign: 'Velocity'     },
  EVA: { name: 'EVA Air',            callsign: 'Eva'          },
  CEB: { name: 'Cebu Pacific',       callsign: 'Cebu Air'     },
  ALK: { name: 'SriLankan Airlines', callsign: 'Sri Lankan'   },
  AXM: { name: 'AirAsia',            callsign: 'AirAsia'      },
  LNI: { name: 'Lion Air',           callsign: 'Lion'         },
  BTK: { name: 'Batik Air',          callsign: 'Batik'        },
  SEJ: { name: 'SpiceJet',           callsign: 'Spicejet'     },
  FJI: { name: 'Fiji Airways',       callsign: 'Fiji'         },
  CHH: { name: 'Hainan Airlines',    callsign: 'Hainan'       },
  CXA: { name: 'Xiamen Airlines',    callsign: 'Xiamen Air'   },
  CSC: { name: 'Sichuan Airlines',   callsign: 'Si Chuan'     },
  CSZ: { name: 'Shenzhen Airlines',  callsign: 'Shenzhen Air' },
  CQH: { name: 'Spring Airlines',    callsign: 'Air Spring'   },
  DKH: { name: 'Juneyao Airlines',   callsign: 'Air Juneyao'  },
  JNA: { name: 'Jin Air',            callsign: 'Jin Air'      },
  JJA: { name: 'Jeju Air',           callsign: 'Jeju Air'     },
  TWB: { name: "T'way Air",          callsign: 'Twayair'      },
  TGW: { name: 'Scoot',              callsign: 'Scooter'      },
  NOK: { name: 'Nok Air',            callsign: 'Nok Air'      },
  VJC: { name: 'Vietjet Air',        callsign: 'Vietjet'      },
  BBC: { name: 'Biman Bangladesh Airlines', callsign: 'Bangladesh' },
  KOR: { name: 'Air Koryo',          callsign: 'Air Koryo'    },
  RBA: { name: 'Royal Brunei Airlines', callsign: 'Brunei'    },
  MGL: { name: 'MIAT Mongolian Airlines', callsign: 'Mongol Air' },
  QLK: { name: 'QantasLink',         callsign: 'Qlink'        },
  RXA: { name: 'Rex Airlines',       callsign: 'Rex'          },

  // ── NetJets / fractional ──────────────────────────────────────────────────
  EJA: { name: 'NetJets',            callsign: 'EJA'          },
  LJX: { name: 'Flexjet',            callsign: 'Flexjet'      },
};

// ── Altitude phrases — multiple per band, picked deterministically by ident ──
const ALT_BANDS = [
  { min: 40000, phrases: [
    "that's so high the sky above starts to look dark — almost like outer space!",
    "that's higher than Mount Everest twice over!",
    "way above where birds or weather can reach!",
    "the air is so thin up there the engines have to work extra hard!",
  ]},
  { min: 30000, phrases: [
    "that's above most clouds!",
    "higher than Mount Everest, the tallest mountain on Earth!",
    "cruising in the stratosphere where the weather stays below!",
    "up where the outside air is colder than your freezer — about minus 60 degrees!",
  ]},
  { min: 18000, phrases: [
    "way up in the sky!",
    "high enough to see for hundreds of miles in every direction!",
    "above most of the weather happening below it!",
    "where the air is thin and very cold outside the windows!",
  ]},
  { min: 5000, phrases: [
    "high above the rooftops!",
    "at the altitude small planes typically cruise!",
    "probably still climbing to cruise altitude, or beginning its descent!",
    "lower than a big jet usually travels — it might be climbing or coming in to land!",
  ]},
  { min: 0, phrases: [
    "very close to the ground — it just took off or is about to land!",
    "almost at landing altitude — there's likely a runway nearby!",
    "so low you might be able to spot it if you look up right now!",
    "practically skimming the treetops — landing or takeoff in progress!",
  ]},
];

/**
 * Pick a phrase from an array deterministically using the aircraft ident as a seed,
 * so the same aircraft always gets the same description.
 */
function pickPhrase(phrases, ident) {
  const seed = (ident || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return phrases[seed % phrases.length];
}

/**
 * Internal: parse an ICAO callsign and look up the airline entry.
 * Returns { name, callsign, flightNum } or null.
 */
function lookupAirline(ident) {
  if (!ident) return null;
  const m = ident.match(/^([A-Z]{3})(\d+.*)$/);
  if (!m) return null;
  const entry = AIRLINE_CALLSIGNS[m[1]];
  if (!entry) return null;
  return { name: entry.name, callsign: entry.callsign, flightNum: m[2] };
}

/**
 * Expand an ICAO callsign like "AAL717" → "American Airlines 717".
 * Returns the original ident unchanged if no match is found.
 */
function expandCallsign(ident) {
  if (!ident) return 'unknown';
  const airline = lookupAirline(ident);
  if (airline) return `${airline.name} ${airline.flightNum}`;
  return ident;
}

/**
 * Format distance from nautical miles into the appropriate unit:
 *   US visitors → miles  (1 nm ≈ 1.15078 mi)
 *   Everyone else → km  (1 nm = 1.852 km)
 *   Unknown country → nautical miles (fallback)
 */
function formatDistance(nm, countryCode) {
  if (countryCode === 'US') {
    const miles = Math.round(nm * 1.15078 * 10) / 10;
    if (miles < 1) return 'less than one mile';
    return `about ${miles} mile${miles === 1 ? '' : 's'}`;
  }
  if (countryCode) {
    const km = Math.round(nm * 1.852 * 10) / 10;
    if (km < 1) return 'less than one kilometer';
    return `about ${km} kilometer${km === 1 ? '' : 's'}`;
  }
  if (nm < 1) return 'less than one nautical mile';
  return `about ${nm} nautical mile${nm === 1 ? '' : 's'}`;
}

function formatAltitude(altHundreds, ident) {
  if (!altHundreds) return null;
  const feet = altHundreds * 100;
  const formatted = feet.toLocaleString('en-US');
  const band = ALT_BANDS.find(b => feet >= b.min) || ALT_BANDS[ALT_BANDS.length - 1];
  const phrase = pickPhrase(band.phrases, ident);
  return `${formatted} feet — ${phrase}`;
}

function formatTime(isoString) {
  if (!isoString) return null;
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

/**
 * Generates a kid-friendly script string for an enriched aircraft object.
 * @param {object} aircraft - output of processFlights() with distanceNm, friendlyType, interesting, interestingReason
 * @param {string} [countryCode] - ISO 3166-1 alpha-2 country code of the viewer (e.g. 'US')
 * @returns {string}
 */
function generateScript(aircraft, countryCode) {
  const parts = [];
  const type = aircraft.friendlyType || 'airplane';
  const dist = formatDistance(aircraft.distanceNm, countryCode);
  const ident = aircraft.ident || aircraft.registration;

  if (aircraft.interesting && aircraft.interestingReason) {
    if (aircraft.interestingReason === 'military') {
      parts.push('Heads up — there is a military airplane nearby!');
    } else if (aircraft.interestingReason === 'medical') {
      parts.push('There is a medical airplane nearby helping someone!');
    } else if (EMERGENCY_PHRASES[aircraft.interestingReason]) {
      parts.push(`Emergency! ${EMERGENCY_PHRASES[aircraft.interestingReason]}`);
    }
  }

  // First mention: full airline name + flight number (or raw callsign for unknowns)
  const airline = lookupAirline(ident);
  const distCap = dist.charAt(0).toUpperCase() + dist.slice(1);
  if (airline) {
    parts.push(`${distCap} away from you, there is a ${type} on ${airline.name} flight ${airline.flightNum}.`);
  } else {
    const rawIdent = ident || 'unknown';
    parts.push(`${distCap} away from you, there is a ${type} with the callsign ${rawIdent}.`);
  }

  // Route sentence: subsequent mention uses the shorter radio callsign
  if (aircraft.origin?.city && aircraft.destination?.city) {
    const arr = formatTime(aircraft.estimated_on || aircraft.scheduled_on);
    // airline.callsign on second reference ("American is flying…"); "This [type]" for unknowns
    const subject = airline ? airline.callsign : `This ${type}`;
    let route = `${subject} is flying from ${aircraft.origin.city} to ${aircraft.destination.city}`;
    if (arr) route += ` and is expected to arrive around ${arr}`;
    parts.push(route + '.');

    // Destination fun fact — skip for emergency/military/medical flights
    if (!aircraft.interesting) {
      const destCode = aircraft.destination?.code;
      const fact = destCode && AIRPORT_FACTS[destCode];
      if (fact) parts.push(`Fun fact about ${aircraft.destination.city}: ${fact}`);
    }
  }

  const altDesc = formatAltitude(aircraft.last_position?.altitude, ident);
  if (altDesc) parts.push(`Right now it is flying at ${altDesc}.`);

  return parts.join(' ');
}

module.exports = { generateScript, expandCallsign, formatDistance };
