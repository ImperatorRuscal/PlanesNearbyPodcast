/**
 * Kid-friendly fun facts about the city/region served by each airport.
 * Keyed by ICAO airport code.
 * Facts: 1-2 sentences, ages 6-12, present tense, about the city/region (not the airport).
 *
 * Coverage:
 *   - US NPIAS Primary Commercial Service airports (~382 airports)
 *   - Major international airports (10M+ passengers/year globally)
 */
const AIRPORT_FACTS = {

  // ── Alabama ───────────────────────────────────────────────────────────────
  KBHM: 'Birmingham played a huge role in the American Civil Rights Movement — Kelly Ingram Park and the 16th Street Baptist Church right downtown are powerful landmarks where brave people changed history!',
  KHSV: 'Huntsville is called "Rocket City" because NASA\'s Marshall Space Flight Center is here — the massive Saturn V rocket that carried astronauts to the Moon was designed and built in Huntsville!',
  KMOB: 'Mobile is the birthplace of Mardi Gras in America, celebrating the colorful parade festival every year since 1703 — even before New Orleans started doing it!',
  KDHN: 'Dothan is the "Peanut Capital of the World" — the southeastern corner of Alabama grows more peanuts than almost anywhere else in the country, and there is a giant peanut statue in town to prove it!',

  // ── Alaska ────────────────────────────────────────────────────────────────
  PANC: 'Anchorage is Alaska\'s largest city and is surrounded by so much wilderness that moose regularly wander into the suburbs, and on a clear day you can see Denali — the tallest peak in North America — from the city!',
  PAFA: 'Fairbanks is one of the best places on Earth to see the Northern Lights — those magical glowing curtains of green and purple that dance across the winter sky on many nights each year!',
  PAJN: 'Juneau is the only US state capital you can\'t reach by road — the only ways in are by plane or boat — and glaciers come right down to the edge of town, making it one of the most dramatic capitals in the world!',
  PADQ: 'Kodiak Island is home to the famous Kodiak bear, the largest brown bear on Earth, which can weigh over 1,500 pounds — as heavy as a small car!',
  PAOM: 'Nome is the finish line of the famous Iditarod sled dog race, where mushers and their dogs travel over 1,000 miles through the frozen Alaskan wilderness — one of the toughest races on the planet!',
  PAOT: 'Kotzebue sits above the Arctic Circle and the Inupiat people have hunted whales and caribou on this spit of land for over 10,000 years, long before anyone else explored this part of the world!',
  PABE: 'Bethel is a hub for dozens of Yupik Eskimo villages in western Alaska, where traditional fishing, dog sledding, and Native arts have been part of daily life for thousands of years!',
  PASM: 'St. Mary\'s is a Yupik community on the Yukon River where salmon runs every summer bring so many fish that families can fill a whole year\'s worth of food in just a few weeks!',
  PASN: 'St. Paul Island is in the middle of the Bering Sea and every summer more than a million fur seals crowd its beaches in one of the greatest wildlife spectacles in North America!',
  PAIL: 'Iliamna is the gateway to Lake Iliamna, one of Alaska\'s largest lakes and home to a population of mysterious freshwater seals — the only landlocked harbor seals in the world!',

  // ── Arizona ───────────────────────────────────────────────────────────────
  KPHX: 'Phoenix is the only US state capital that is also the largest city in its state, sitting in the Sonoran Desert where giant saguaro cacti take 75 years just to grow their first arm!',
  KTUS: 'Tucson is surrounded by five different mountain ranges and the Sonoran Desert here is home to more species of plants and animals than almost any other desert in the world!',
  KFHU: 'Sierra Vista is close to the Huachuca Mountains, one of the best places in North America to spot rare hummingbirds — over 15 different species visit here on their migrations!',
  KFLAG: 'Flagstaff sits at nearly 7,000 feet in a Ponderosa pine forest and is the closest big town to the Grand Canyon — one of the Seven Natural Wonders of the World!',
  KPRC: 'Prescott holds the world\'s oldest continuous rodeo — the Frontier Days has been running every summer since 1888, making it a true piece of living American West history!',
  KSEZ: 'Sedona is famous for its spectacular red rock formations that glow orange and pink at sunset, and some people believe the area has special energy "vortexes" that make you feel calm and peaceful!',
  KYUM: 'Yuma gets more sunshine than almost any other city on Earth — about 4,000 hours of sun per year — making it one of the sunniest spots in the entire United States!',
  KROW: 'The area near Roswell is world-famous for a 1947 incident when something mysterious crashed in the desert, and today the city calls itself the "UFO Capital of the World" complete with alien-themed street decorations!',

  // ── Arkansas ──────────────────────────────────────────────────────────────
  KLIT: 'Little Rock has the Clinton Presidential Library, which juts out over the Arkansas River and is one of the most uniquely designed presidential libraries in the country — it looks like a giant bridge!',
  KXNA: 'The Fayetteville area is home to Crystal Bridges Museum of American Art, which a Walmart heiress built in the Ozark forest — the spectacular museum is free to enter and drew millions of visitors from day one!',
  KFSM: 'Fort Smith was a famous Wild West outpost where Judge Isaac Parker, known as "the Hanging Judge," kept order on the frontier with an iron fist in the 1870s and 80s!',

  // ── California ────────────────────────────────────────────────────────────
  KLAX: 'Los Angeles is the entertainment capital of the world — more movies and TV shows are made here than anywhere else on Earth — and on a clear day you can see dolphins swimming just off its beaches!',
  KSFO: 'San Francisco\'s Golden Gate Bridge uses enough wire cable to wrap around the Earth three times, and the bridge is so tall that ships from 70 other countries sail underneath it!',
  KSAN: 'San Diego has the best weather of any big US city, and its world-famous Zoo is one of the first in the world to house animals in open enclosures instead of cages — it holds over 3,500 animals from every continent!',
  KSNA: 'Orange County is home to Disneyland, the very first Disney theme park ever built, which opened in 1955 and has since welcomed more than 700 million visitors!',
  KOAK: 'Oakland sits across San Francisco Bay from one of America\'s most famous cities and is the birthplace of many important musicians, artists, and social movements that changed American culture!',
  KSJC: 'San Jose is the heart of Silicon Valley, where Apple, Google, Intel, and dozens of other companies that invented modern technology were born and still call home!',
  KBUR: 'Burbank is in the middle of Hollywood — studios like Warner Bros. and Disney are right here — and many of your favorite cartoons, superhero movies, and TV shows were made in this city!',
  KLGB: 'Long Beach has one of the busiest cargo ports on Earth, where enormous container ships bring toys, electronics, and clothing from all over the world into the United States!',
  KONT: 'Ontario is the gateway to the Inland Empire and sits at the foot of the San Gabriel Mountains, where you can ski in the morning and be at the beach in less than two hours!',
  KPSP: 'Palm Springs is in the Coachella Valley surrounded by mountains, and every spring the desert explodes in color when millions of wildflowers bloom after the winter rains!',
  KSMF: 'Sacramento is California\'s capital and was the western end of the Pony Express — brave young riders on horseback carried mail 1,900 miles from Missouri to California in just 10 days!',
  KFAT: 'Fresno is close to three incredible national parks — Yosemite, Kings Canyon, and Sequoia — where the giant sequoia trees are the largest living things on Earth by volume!',
  KBAK: 'Bakersfield is in the San Joaquin Valley, which grows so much food — almonds, grapes, oranges, and pistachios — that California produces almost half of all the fruits and vegetables eaten in the United States!',
  KSBP: 'San Luis Obispo is close to Hearst Castle, a jaw-dropping mansion a newspaper billionaire built with its own private zoo, art treasures from around the world, and a famous Neptune Pool!',
  KSBA: 'Santa Barbara is nicknamed the "American Riviera" because its red-tile roofs and Mediterranean climate make it look remarkably like the south of France!',
  KCRQ: 'Carlsbad is home to LEGOLAND California, where everything from miniature cities to roller coasters is built from those colorful plastic bricks — kids of all ages love it!',
  KMRY: 'Monterey Bay is so full of sea life — otters, sea lions, humpback whales, and sardines — that John Steinbeck wrote his famous novel "Cannery Row" about the fishermen who worked here!',
  KACV: 'Arcata and Eureka are in Humboldt County, home to the tallest trees on Earth — coast redwoods can stand taller than a 35-story building and live for over 2,000 years!',
  KRDD: 'Redding is the gateway to Lassen Volcanic National Park, where boiling mud pots and steaming hot springs mark the southernmost active volcano in the Cascade mountain chain!',
  KMOD: 'Modesto is where George Lucas grew up and the setting of his movie "American Graffiti" — the fun Friday-night car-cruise culture the film celebrates still lives on here!',
  KSTS: 'Santa Rosa is in Sonoma wine country and was home to Luther Burbank, the gardening genius who spent decades here creating over 800 new kinds of plants, including the Shasta daisy!',

  // ── Colorado ──────────────────────────────────────────────────────────────
  KDEN: 'Denver is exactly one mile above sea level — there\'s a marker on the state capitol steps showing the precise spot — and the Rocky Mountains begin right at the edge of the city!',
  KCOS: 'Colorado Springs sits at the foot of Pikes Peak, the mountain that inspired the song "America the Beautiful," and is home to the US Air Force Academy where future pilots train!',
  KGJT: 'Grand Junction is close to Dinosaur National Monument, where paleontologists have found some of the most complete dinosaur skeletons ever discovered — including huge Brachiosaurus bones!',
  KASE: 'Aspen started as a silver-mining boom town in the 1880s and today is one of the most famous ski resorts in the world, drawing Olympic champions and adventure seekers from every continent!',
  KEGE: 'Eagle County is the gateway to Vail ski resort, which has more than 5,000 acres of skiable terrain — one of the largest ski areas in all of North America!',
  KDRO: 'Durango is a frontier-era railroad town where you can still ride a historic narrow-gauge steam train through the cliffs and canyons of the San Juan Mountains, just like in the old days!',
  KMTJ: 'Montrose is the gateway to the Black Canyon of the Gunnison, whose walls are so steep and narrow that sunlight only touches the river at the bottom for a few minutes each day!',
  KPUB: 'Pueblo is home to the Colorado State Fair and sits at the edge of the grasslands where giant herds of bison once stretched beyond the horizon before they were nearly wiped out!',
  KGUC: 'Gunnison County has one of the coldest climates in the lower 48 states — temperatures have dropped below minus 60°F — yet it is a gateway to spectacular wilderness and blue-ribbon trout streams!',
  KSBS: 'Steamboat Springs is famous for its "champagne powder" snow — so light and dry that it puffs like a cloud when you ski through it — and its natural hot springs have warmed weary travelers for over a century!',

  // ── Connecticut ───────────────────────────────────────────────────────────
  KBDL: 'Hartford is where the author Mark Twain lived and wrote classics like "The Adventures of Tom Sawyer" — you can tour his beautiful Victorian home right in the city today!',

  // ── Delaware ──────────────────────────────────────────────────────────────
  KILG: 'Wilmington is home to more companies than any other US state — Delaware\'s business-friendly laws make it the official home of over one million corporations from all over the world!',

  // ── Florida ───────────────────────────────────────────────────────────────
  KMCO: 'Orlando is the most visited city in the United States, with Walt Disney World, Universal Studios, SeaWorld, and so many other theme parks that you could spend months exploring them all!',
  KMIA: 'Miami is one of the only US cities with a warm tropical climate, a world-famous music scene, and the largest concentration of Art Deco buildings anywhere in the country!',
  KFLL: 'Fort Lauderdale is sometimes called the "Venice of America" because it has more miles of inland waterways and canals than the real Venice in Italy!',
  KTPA: 'Tampa Bay is one of the best places in the world to spot wild manatees — those gentle, slow-moving sea cows that warm themselves near the heated waters of power plants in winter!',
  KPIE: 'St. Petersburg has more sunny days than almost any city on the East Coast, and its Salvador Dalí Museum holds the largest collection of the surrealist painter\'s work outside of Europe!',
  KPBI: 'Palm Beach County is famous for gorgeous beaches, but it is also at the edge of the Everglades — a vast "river of grass" that is home to alligators, Florida panthers, and hundreds of bird species!',
  KJAX: 'Jacksonville is the largest city by area in the continental United States — bigger than Los Angeles or New York City — and its beaches stretch for miles along the Atlantic Ocean!',
  KRSW: 'Fort Myers is where Thomas Edison and Henry Ford had neighboring winter estates on the Caloosahatchee River — they were best friends, and you can visit both homes today!',
  KPNS: 'Pensacola has some of the whitest sand beaches in the world — the sand is pure quartz crystal ground down by ancient glaciers, and it squeaks when you walk on it!',
  KTLH: 'Tallahassee is Florida\'s capital and is surrounded by the Apalachicola National Forest, one of the largest national forests in the eastern US and home to the endangered red-cockaded woodpecker!',
  KGNV: 'Gainesville is home to Paynes Prairie, a wild savanna just minutes from the city where bison and wild horses roam free — one of the few places in Florida where these animals have been reintroduced!',
  KDAB: 'Daytona Beach is famous for car races that used to be held right on the hard-packed sand beach before the famous Daytona International Speedway was built — the "Great American Race" still happens here every February!',
  KPFN: 'Panama City Beach has 27 miles of pure white sand along the Gulf of Mexico and crystal-clear water that is so calm it is one of the best spots in the country to learn to swim!',
  KEYW: 'Key West is the southernmost city in the continental United States, just 90 miles from Cuba, and author Ernest Hemingway lived here for years — his house is still full of six-toed cats descended from his own pet!',
  KSRQ: 'Sarasota is home to the Ringling Museum of Art, founded by circus owner John Ringling, whose collection of European masterpieces and circus history is one of the most unusual museums in America!',
  KOCF: 'Ocala is the "Horse Capital of the World" — more thoroughbred racehorses are bred in Marion County than anywhere outside of Kentucky, and thousands of horses graze its rolling green pastures!',
  KTIX: 'Titusville is right across the water from Kennedy Space Center, so close that residents can watch rocket launches light up the night sky from their own backyards!',
  KVRB: 'Vero Beach is on Florida\'s "Treasure Coast," named for the Spanish gold coins that still wash up on its beaches from a fleet of ships that sank in a hurricane in 1715!',
  KMKG: 'The Muskegon area in Michigan sits on Lake Michigan, where some of the tallest freshwater sand dunes in the world rise along the shoreline — you can actually ski down them in winter!',
  KVPS: 'Valparaiso is next to Eglin Air Force Base, the largest military installation in the world by area, covering over 460,000 acres of Florida Panhandle forest and coastline!',

  // ── Georgia ───────────────────────────────────────────────────────────────
  KATL: 'Atlanta is home to the world\'s largest aquarium — the Georgia Aquarium — with whale sharks, the biggest fish on Earth, swimming in tanks so enormous that divers can swim alongside them!',
  KSAV: 'Savannah is one of America\'s most beautiful cities, with 22 moss-draped squares full of ancient oak trees, and it was the first planned city in the United States, laid out in 1733 like a giant puzzle!',
  KAGS: 'Augusta is home to the Masters Tournament, one of the most famous golf events in the world, held every April at the perfectly manicured Augusta National Golf Club!',
  KMCN: 'Macon is the "Cherry Blossom Capital of the World" — every spring more than 350,000 Yoshino cherry trees burst into pink blossoms and the whole city smells like flowers!',
  KABY: 'Albany is in southwest Georgia\'s peach and pecan country, and the rich red Georgia soil here produces some of the sweetest peaches and crunchiest pecans you\'ll ever taste!',

  // ── Hawaii ────────────────────────────────────────────────────────────────
  PHNL: 'Honolulu is the only US state capital in the Pacific Ocean, and the Pearl Harbor memorial nearby honors the history of the 1941 attack that brought America into World War II!',
  PHOG: 'Maui is home to Haleakala, a massive volcano whose crater is so enormous that the entire island of Manhattan could fit inside it — watching the sunrise from the summit is breathtaking!',
  PHKO: 'The Big Island of Hawaii has active volcanoes still making new land right now — Kilauea has been erupting almost continuously since 1983 — so the island is literally getting bigger every day!',
  PHLI: 'Kauai is the "Garden Isle" and one of the wettest places on Earth — Mount Waialeale gets almost 460 inches of rain per year — creating spectacular waterfalls and lush green valleys!',
  PHMK: 'Molokai has the tallest sea cliffs in the world — over 3,000 feet of dramatic rock plunging straight into the Pacific Ocean — and traditional Hawaiian culture is still practiced there every day!',

  // ── Idaho ─────────────────────────────────────────────────────────────────
  KBOI: 'Boise has one of the largest Basque communities outside Spain — Basque shepherds came to Idaho in the 1800s and never left, and their restaurants and festivals are a beloved part of city life!',
  KIDA: 'Idaho Falls is close to the Craters of the Moon National Monument, a strange black lava landscape that looks so much like the Moon that Apollo astronauts practiced their Moon walks there!',
  KPIH: 'Pocatello is near the world-record potato fields of eastern Idaho — Idaho grows more potatoes than any other state, and some fields stretch farther than the eye can see!',
  KSUN: 'Sun Valley was the very first purpose-built ski resort in the United States, opened in 1936, and famous people and world champions have been skiing its perfect slopes ever since!',
  KLWS: 'Lewiston is the farthest inland seaport on the West Coast — ocean-going ships travel 465 miles up the Columbia and Snake rivers from the Pacific Ocean just to reach this city!',

  // ── Illinois ──────────────────────────────────────────────────────────────
  KORD: 'Chicago is called the Windy City, built the world\'s first skyscraper in 1885, and reversed the flow of its own river using only engineering so that sewage would flow away from Lake Michigan instead of into it!',
  KMDW: 'Chicago\'s South Side is the birthplace of house music — the electronic dance music style that spread from the city\'s clubs in the 1980s to dance floors all over the world!',
  KPIA: 'Peoria was considered such a perfectly average American city that marketers used to say "Will it play in Peoria?" meaning "Will regular people like it?" — it was the ultimate test of an idea!',
  KSPI: 'Springfield is Abraham Lincoln\'s hometown — you can visit his law office, his home, and his tomb all within walking distance, making it one of the most historically important small cities in America!',
  KBMI: 'Bloomington-Normal is where the first Steak \'n Shake restaurant opened in 1934, and it is the world headquarters of State Farm Insurance, the largest auto insurer in the United States!',
  KRFD: 'Rockford has a proud manufacturing history — its machine tool factories helped make the weapons and equipment that won World War II — and the city still builds important industrial products today!',

  // ── Indiana ───────────────────────────────────────────────────────────────
  KIND: 'Indianapolis hosts the Indianapolis 500, the world\'s largest single-day sporting event by attendance, where race cars zoom around a giant oval track at over 220 miles per hour!',
  KSBN: 'South Bend is home to the University of Notre Dame, whose golden dome and famous Fighting Irish football team are known all over the world — and the university has produced more Rhodes Scholars than almost any other school!',
  KFWA: 'Fort Wayne has the third-largest children\'s zoo in the United States, where kids can ride a camel, pet a stingray, and explore a full-scale replica of a Madagascar rainforest!',
  KEVV: 'Evansville sits on a big bend of the Ohio River and is home to the LST 325, a World War II landing ship that veterans sailed all the way from Greece back to its permanent museum home here!',

  // ── Iowa ──────────────────────────────────────────────────────────────────
  KDSM: 'Des Moines hosts the Iowa State Fair, one of the largest state fairs in America, famous for its butter sculptures — artists carve full-size cows and famous faces out of thousands of pounds of real butter!',
  KCID: 'Cedar Rapids is close to the American Gothic house, the very farmhouse shown in Grant Wood\'s iconic painting — one of the most recognized images in all of American art!',
  KDBQ: 'Dubuque sits dramatically on the Mississippi River bluffs and has the Fenelon Place Elevator, one of the world\'s steepest and shortest funicular railroads, which has been hauling people up the bluff since 1882!',
  KSUX: 'Sioux City sits at the point where Iowa, Nebraska, and South Dakota all nearly meet, and the wide Missouri River here was the highway that Lewis and Clark paddled on their famous expedition west!',

  // ── Kansas ────────────────────────────────────────────────────────────────
  KICT: 'Wichita is the "Air Capital of the World" — more private aircraft are built here than anywhere else on the planet, including planes from famous companies like Cessna, Beechcraft, and Learjet!',
  KMHK: 'Manhattan, Kansas is surrounded by the Flint Hills, one of the last large tallgrass prairie ecosystems left on Earth — a sea of waving grass that once stretched across the entire middle of the continent!',
  KGCK: 'Garden City is in the High Plains where massive center-pivot irrigation systems create perfect green circles of cropland that look like giant polka dots when you see them from an airplane!',
  KHYS: 'Hays is on the old Chisholm Trail, where millions of longhorn cattle were driven north by cowboys after the Civil War, and the Sternberg Museum has some of the most amazing dinosaur fossils ever found in Kansas!',

  // ── Kentucky ──────────────────────────────────────────────────────────────
  KSDF: 'Louisville is home to the Kentucky Derby, the most famous horse race in America — held every May at Churchill Downs, where fans wear enormous colorful hats and horses thunder around the track!',
  KCVG: 'The Greater Cincinnati/Northern Kentucky area is one of the world\'s biggest cargo hub cities — the UPS Worldport here handles over a million packages every single night!',
  KLEX: 'Lexington is in the heart of the Bluegrass Region, where the famous blue-tinged grass and rich limestone soil produce some of the fastest thoroughbred racehorses in history — including Triple Crown champions!',
  KPAH: 'Paducah is known as the "Quilt City" because the National Quilt Museum celebrates the art of quilting with some of the most beautiful and intricate fabric creations you\'ll ever see!',

  // ── Louisiana ─────────────────────────────────────────────────────────────
  KMSY: 'New Orleans is famous for jazz music, colorful Mardi Gras parades, and incredible Creole food — and the whole city sits below sea level, surrounded by massive levees that hold back Lake Pontchartrain and the Mississippi River!',
  KBTR: 'Baton Rouge is Louisiana\'s capital, sitting on a dramatic bend of the mighty Mississippi River, and the Old State Capitol looks like a Gothic castle — one of the most unusual government buildings in America!',
  KSHV: 'Shreveport hosted the Louisiana Hayride radio show in the 1950s, which launched the career of a young singer named Elvis Presley before he became the biggest rock star in the world!',
  KLFT: 'Lafayette is the capital of Cajun Country, where spicy food, lively zydeco music, and pure joie de vivre — the joy of living — make this one of the most spirited and fun regions in all of America!',

  // ── Maine ─────────────────────────────────────────────────────────────────
  KBGR: 'Bangor is the hometown of author Stephen King, who set many of his famous spooky novels in Maine\'s forests and small towns — including "It," "Pet Sematary," and "The Shining"!',
  KPWM: 'Portland is famous for its fresh lobster — Maine catches more Atlantic lobster than anywhere else in the world — and its beautiful Old Port district has 19th-century brick buildings right on Casco Bay!',

  // ── Maryland ──────────────────────────────────────────────────────────────
  KBWI: 'Baltimore is where the Star-Spangled Banner was raised after an 1814 battle, inspiring the poem that became the US national anthem — "Oh say can you see" was written right here!',
  KHGR: 'Hagerstown is the gateway to Antietam, the site of the bloodiest single day of the entire Civil War, where 23,000 soldiers were killed or wounded in just one terrible September day in 1862.',

  // ── Massachusetts ─────────────────────────────────────────────────────────
  KBOS: 'Boston is the birthplace of American independence — the Boston Tea Party, Paul Revere\'s midnight ride, and the very first battles of the Revolution all happened here — and Harvard and MIT are both right in the city!',
  KORH: 'Worcester is home to the American Antiquarian Society, which holds the largest collection of early American printed materials in the world — including newspapers and books from the very first printing presses in the colonies!',
  KHYA: 'Hyannis is in the heart of Cape Cod, a hook-shaped arm of land that juts 70 miles into the Atlantic Ocean and has some of the most beautiful lighthouses and whale-watching waters in all of New England!',
  KACK: 'Nantucket was the whaling capital of the world in the 1800s — brave sailors from this tiny island 30 miles out to sea hunted sperm whales in the Pacific and supplied the oil that lit the world\'s lamps!',
  KMVY: 'Martha\'s Vineyard is an island with "gingerbread cottages" painted in wild rainbow colors, built in the 1860s by a summer camp community — they look like something straight out of a fairy tale!',

  // ── Michigan ──────────────────────────────────────────────────────────────
  KDTW: 'Detroit is the birthplace of the American automobile industry — Henry Ford\'s moving assembly line, invented here, changed how factories make things all over the world and launched the age of the car!',
  KGRR: 'Grand Rapids hosts ArtPrize, one of the world\'s largest and most unusual art competitions, where thousands of artists display work all over the city and the public votes for the winner!',
  KLAN: 'Lansing is where the Oldsmobile — one of America\'s very first cars — was built by Ransom Olds in 1897, making it one of the true birthplaces of the American automobile age!',
  KFNT: 'Flint was the birthplace of General Motors and site of the famous 1936-37 sit-down strike, where workers occupying car factories won rights that helped working people across America!',
  KTRA: 'Traverse City is the "Cherry Capital of the World" — Michigan produces about 75 percent of all the tart cherries grown in the United States, and the orchards around this city bloom pink every spring!',
  KAZO: 'Kalamazoo is home to the Air Zoo aerospace museum, where you can see NASA spacesuits, a full-size space shuttle replica, and climb into a real flight simulator for an amazing adventure!',
  KESC: 'Escanaba is the gateway to Michigan\'s Upper Peninsula, a wild land of pine forests and the Pictured Rocks — where colorful cliffs of sandstone rise straight out of Lake Superior in dazzling colors!',

  // ── Minnesota ─────────────────────────────────────────────────────────────
  KMSP: 'Minneapolis-St. Paul has the most miles of indoor skyway walkways of any US city — the famous Skyway System lets you walk 80 blocks without going outside, even in the bitterest Minnesota winter!',
  KDLH: 'Duluth sits on Lake Superior, the largest freshwater lake in the world by surface area, and giant ore ships called "lakers" sail under the famous Aerial Lift Bridge right through the heart of the harbor!',
  KRST: 'Rochester is home to the Mayo Clinic, one of the greatest hospitals on Earth — patients travel from every country to see its brilliant doctors and get treatment for the most complicated diseases known to medicine!',
  KINL: 'International Falls is the "Icebox of the Nation," regularly recording the coldest temperatures in the lower 48 states — it sometimes drops to 40 below zero in January!',

  // ── Mississippi ───────────────────────────────────────────────────────────
  KJAN: 'Jackson is Mississippi\'s capital and gateway to the Mississippi Delta, the birthplace of the blues — the deeply soulful music that eventually inspired rock and roll, jazz, and almost all of modern American music!',
  KGPT: 'Gulfport-Biloxi has pristine white barrier islands just offshore where sea turtles nest and sugar-white sand beaches are accessible only by boat — a beautiful, wild piece of Gulf Coast!',
  KTUP: 'Tupelo is the birthplace of Elvis Presley — the King of Rock and Roll — and his tiny two-room shotgun house where he was born is now a museum that fans visit from all over the world!',

  // ── Missouri ──────────────────────────────────────────────────────────────
  KSTL: 'St. Louis is home to the Gateway Arch, the tallest monument in the United States at 630 feet tall — you can ride a tiny pod elevator up inside the curved steel arch to see the city from the very top!',
  KMCI: 'Kansas City is famous for its slow-smoked barbecue and has more barbecue restaurants per person than any other US city — the local style of smoky, sauce-slathered ribs is beloved across the whole country!',
  KSGF: 'Springfield is in the Ozarks, a region of ancient rounded mountains and thousands of caves, and Bass Pro Shops — the enormous outdoor sporting goods store — was born right here!',

  // ── Montana ───────────────────────────────────────────────────────────────
  KBIL: 'Billings is Montana\'s largest city and the gateway to Yellowstone National Park — the world\'s very first national park, famous for more geysers than anywhere else on Earth!',
  KGTF: 'Great Falls is named for the five spectacular waterfalls on the Missouri River that Lewis and Clark had to carry their canoes around during their famous 1804 expedition to explore the American West!',
  KBZN: 'Bozeman is the gateway to Yellowstone, where Old Faithful geyser shoots hot water 100-180 feet into the air every 90 minutes like clockwork — one of the most reliable natural wonders in the world!',
  KHLN: 'Helena is Montana\'s capital, born as a gold-rush town called "Last Chance Gulch" in 1864 when miners struck it rich, and the downtown main street still follows that original gold-rush gulch!',
  KMSO: 'Missoula sits where five rivers come together, surrounded by wilderness so vast that grizzly bears, mountain lions, and wolves still roam freely through the mountains right outside of town!',
  KFCA: 'Kalispell is the gateway to Glacier National Park, which has over 700 miles of hiking trails and glaciers that have carved some of the most dramatic mountain scenery on the North American continent!',

  // ── Nebraska ──────────────────────────────────────────────────────────────
  KOMA: 'Omaha is the hometown of Warren Buffett, one of the wealthiest people in the world, who still lives in the modest house he bought there in 1958 for $31,500!',
  KLNK: 'Lincoln is Nebraska\'s capital and home to Chimney Rock, one of the most important landmarks on the Oregon Trail — millions of pioneers in covered wagons looked up at this rocky spire on their journey west!',
  KGRI: 'Grand Island is along the Platte River, where every spring hundreds of thousands of Sandhill Cranes stop to rest during their migration — the world\'s largest gathering of these amazing birds!',

  // ── Nevada ────────────────────────────────────────────────────────────────
  KLAS: 'Las Vegas is so brightly lit that astronauts on the International Space Station can see its glow from space — it has more hotel rooms on a single street than anywhere else in the world!',
  KRNO: 'Reno is close to Lake Tahoe, one of the clearest and deepest lakes in all of North America, sitting at 6,225 feet above sea level with water so clear you can see the bottom 70 feet down!',

  // ── New Hampshire ─────────────────────────────────────────────────────────
  KMHT: 'Manchester is New Hampshire\'s largest city, and the Amoskeag Mills along the Merrimack River were once the largest textile manufacturing complex in the world — the enormous red brick buildings still line the river today!',

  // ── New Jersey ────────────────────────────────────────────────────────────
  KACY: 'Atlantic City is where the Monopoly board game got its street names — Boardwalk, Park Place, Marvin Gardens, and all the rest are real streets in this seaside city, which also has the world\'s oldest wooden boardwalk!',

  // ── New Mexico ────────────────────────────────────────────────────────────
  KABQ: 'Albuquerque hosts the world\'s largest hot-air balloon festival every October — the International Balloon Fiesta — where over 500 colorful balloons fill the sky at the same time in a stunning rainbow of color!',
  KSAF: 'Santa Fe is the oldest state capital in the United States, founded in 1610, and the Palace of the Governors on the plaza is the oldest continuously occupied government building in North America!',
  KROW: 'Roswell is world-famous for the 1947 incident when something mysterious crashed in the desert, and the city fully embraces being the "UFO Capital of the World" with alien-themed shops and an extraterrestrial museum!',

  // ── New York ──────────────────────────────────────────────────────────────
  KJFK: 'New York City has more than 800 languages spoken within its borders — more than any other city on Earth — making it the most linguistically diverse place on the entire planet!',
  KLGA: 'New York City\'s Central Park took 20 years and the moving of 10 million cartloads of stone and soil to create — today it is 843 acres of trees, ponds, and meadows right in the middle of a forest of skyscrapers!',
  KEWR: 'The New York/New Jersey area is home to the Statue of Liberty, a gift from France, which at 305 feet was the tallest structure in New York when she was unveiled in 1886 — visitors can climb 354 steps to her crown!',
  KBUF: 'Buffalo is right next to Niagara Falls, where more than 750,000 gallons of water rush over the edge every single second — making it one of the most powerful waterfalls in the world!',
  KSYR: 'Syracuse gets more snow per year than almost any other major US city — sometimes over 120 inches — and sits in the middle of the Finger Lakes, where 11 long, glacially carved lakes create beautiful scenery!',
  KROC: 'Rochester was home to George Eastman, who founded Kodak and invented roll-film photography — changing how the entire world captures memories — and the city\'s Eastman Theatre is one of the greatest music halls in America!',
  KALB: 'Albany is one of the oldest continuously occupied European settlements in the United States — Dutch traders built a fort here in 1614 — and it sits on the Hudson River that flows all the way to New York City!',
  KITH: 'Ithaca is home to Cornell University and is surrounded by spectacular gorges with more waterfalls per square mile than almost anywhere else in the eastern United States!',
  KELM: 'Elmira is the hometown of Mark Twain, who spent summers writing in his famous octagonal study on a hilltop — parts of "Adventures of Huckleberry Finn" were written right here!',
  KART: 'Watertown is near the Thousand Islands region of the St. Lawrence River, where over 1,800 islands — some barely big enough for a single house — dot the river between the United States and Canada!',
  KPBG: 'Plattsburgh is on Lake Champlain, the long skinny lake between New York and Vermont, and a famous 1814 naval battle here helped prevent the British from invading the United States during the War of 1812!',

  // ── North Carolina ────────────────────────────────────────────────────────
  KCLT: 'Charlotte is the second-largest banking city in the United States after New York, and it is the home of NASCAR — the most popular motorsport in America — with the famous Charlotte Motor Speedway nearby!',
  KRDU: 'Raleigh-Durham is the heart of the "Research Triangle," where three major universities — Duke, UNC, and NC State — make this one of the most innovative and educated regions in all of America!',
  KGSO: 'Greensboro is where four Black college students sat down at a Woolworth\'s lunch counter in 1960 and refused to leave — their brave sit-in sparked a civil rights movement that helped change America forever!',
  KAVL: 'Asheville is tucked in the Blue Ridge Mountains and is home to the Biltmore Estate — the largest private home ever built in the United States, with 178,926 square feet, 35 bedrooms, and its own winery!',
  KFAY: 'Fayetteville is home to Fort Liberty (formerly Fort Bragg), one of the world\'s largest military installations, and the Airborne and Special Operations Museum honors America\'s elite paratroopers!',
  KEWN: 'New Bern was North Carolina\'s first colonial capital and the birthplace of Pepsi-Cola — a pharmacist named Caleb Bradham invented the fizzy drink right here in 1893!',
  KPGV: 'Greenville is home to East Carolina University and is the main medical hub for the entire eastern part of North Carolina, serving patients from dozens of counties across the region!',
  KILM: 'Wilmington has some of the East Coast\'s most beautiful beaches and is nicknamed "Hollywood East" because so many movies and TV shows are filmed there, drawn by the tax incentives and gorgeous scenery!',

  // ── North Dakota ──────────────────────────────────────────────────────────
  KFAR: 'Fargo sits on the Red River of the North, one of the few rivers in the US that flows northward, and every spring the flat valley can flood spectacularly when all the snow melts at once!',
  KBIS: 'Bismarck is North Dakota\'s capital, close to where Lewis and Clark spent the winter of 1804-05 learning from the Mandan and Hidatsa people how to survive the harsh northern plains!',
  KGFK: 'Grand Forks is home to the University of North Dakota and sits in one of the flattest places on Earth — you can literally see for 50 miles in every direction across the endless prairie!',

  // ── Ohio ──────────────────────────────────────────────────────────────────
  KCLE: 'Cleveland is on the shore of Lake Erie and is home to the Rock and Roll Hall of Fame, which sits right on the water and celebrates the musicians, songwriters, and producers who created the music the whole world loves!',
  KCMH: 'Columbus is home to Ohio State University, one of the largest universities in America, whose football stadium holds over 102,000 fans — one of the loudest and most electric sporting atmospheres in the country!',
  KCVG: 'The Cincinnati area has the oldest professional baseball team in the world — the Reds were the first all-professional baseball club in America, founded in 1869 — and Cincinnati chili, served over spaghetti, is a one-of-a-kind local delight!',
  KTOL: 'Toledo is the "Glass City" — for over a century its factories made more glass than anywhere else in the world — and the Toledo Museum of Art has one of the most spectacular glass collections anywhere on Earth!',
  KDAY: 'Dayton is the birthplace of aviation — Orville and Wilbur Wright grew up, lived, and ran their bicycle shop here — and the National Museum of the United States Air Force nearby has more military aircraft than any other aviation museum in the world!',
  KCAK: 'Akron was the rubber capital of the world for much of the 20th century — nearly every tire on every American car was made here — and the iconic Goodyear Blimp was born in Akron!',

  // ── Oklahoma ──────────────────────────────────────────────────────────────
  KOKC: 'Oklahoma City sits on top of one of the biggest oil fields ever found in North America — in the early 1900s, oil derricks were drilled right on the state capitol grounds — and cowboy culture runs deep in this proud Western city!',
  KTUL: 'Tulsa was once called the "Oil Capital of the World" and has a stunning collection of Art Deco skyscrapers built with oil wealth in the 1920s — the beautiful buildings make downtown Tulsa look like a city frozen in a glamorous golden age!',
  KLAW: 'Lawton is home to Fort Sill, a historic military post where Apache leader Geronimo was held as a prisoner of war and is buried — one of the most historically significant military sites in the American West!',

  // ── Oregon ────────────────────────────────────────────────────────────────
  KPDX: 'Portland is famous for its coffee shops and quirky culture, and Powell\'s Books — one of the world\'s largest independent bookstores — covers an entire city block and holds about a million books!',
  KEUG: 'Eugene is "Track Town USA," where the University of Oregon Ducks produce Olympic distance runners, and Nike was born right here — co-founder Phil Knight\'s coach Bill Bowerman famously poured rubber into a waffle iron to make the first waffle-soled running shoe!',
  KMFR: 'Medford is the gateway to Crater Lake, the deepest lake in the United States — at 1,943 feet deep, the water is so pure and clear it is an almost impossibly vivid shade of blue!',
  KRDM: 'Redmond is in central Oregon\'s high desert, and nearby Smith Rock State Park has sheer volcanic cliffs that make it one of the top rock-climbing destinations in the entire world!',
  KOTG: 'North Bend is near the Oregon Dunes, the largest expanse of coastal sand dunes in North America — some towering 500 feet above the sea, where you can sandboard down massive slopes!',
  KPDT: 'Pendleton is famous for the Pendleton Round-Up, one of the greatest rodeos in America, celebrating cowboy and Native American heritage every September since 1910!',

  // ── Pennsylvania ──────────────────────────────────────────────────────────
  KPHL: 'Philadelphia is where both the Declaration of Independence and the US Constitution were written and signed — making it one of the most important birthplaces of American freedom and democracy in all of history!',
  KPIT: 'Pittsburgh has 446 bridges — more than any other city on the planet — earning it the nickname "City of Bridges," and it was once the steel capital of the world whose iron made the skeleton of modern America!',
  KABE: 'Allentown is in the Lehigh Valley, home to the Liberty Bell for safekeeping during the Revolutionary War, and surrounded by Pennsylvania Dutch communities where horse-drawn buggies still share the road with cars!',
  KAVP: 'Scranton inspired the TV show "The Office" and is home to Steamtown National Historic Site, which celebrates the golden age of American trains with a roundhouse and real steam locomotives!',
  KIPT: 'Williamsport is the birthplace of Little League Baseball, founded here in 1939 — kids from all 50 states and dozens of countries come to play in the Little League World Series every August!',
  KERI: 'Erie sits on Lake Erie and Presque Isle State Park — a curved sand peninsula that juts into the lake — is one of the most visited state parks in Pennsylvania, with beaches and amazing bird migration!',

  // ── Rhode Island ──────────────────────────────────────────────────────────
  KPVD: 'Providence is home to the Rhode Island School of Design, one of the most respected art schools in the world, and the city\'s Federal Hill neighborhood is famous for some of the best Italian food in all of New England!',

  // ── South Carolina ────────────────────────────────────────────────────────
  KCHS: 'Charleston is one of America\'s most beautiful and historic cities, with pastel "Rainbow Row" houses, cobblestone streets, and Fort Sumter in its harbor where the very first shots of the Civil War were fired in 1861!',
  KCAE: 'Columbia is South Carolina\'s capital and home to Fort Jackson, the largest US Army training base in the country — about a third of all Army soldiers complete their basic training right here!',
  KGSP: 'Greenville-Spartanburg is the US home of BMW\'s largest factory in the world — more BMWs roll off the line here in the South Carolina foothills than anywhere else on the entire planet!',
  KMYR: 'Myrtle Beach has 60 miles of Atlantic coastline and more golf courses per square mile than almost anywhere else in America — it is one of the top beach and golf destinations on the entire East Coast!',

  // ── South Dakota ──────────────────────────────────────────────────────────
  KRAP: 'Rapid City is the gateway to Mount Rushmore, where the 60-foot stone faces of four US presidents are carved into the granite of the Black Hills — sculptor Gutzon Borglum and 400 workers spent 14 years completing it!',
  KFSD: 'Sioux Falls gets its name from the beautiful cascading waterfalls on the Big Sioux River right in the middle of downtown, made of striking pink quartzite rock that is 1.7 billion years old!',

  // ── Tennessee ─────────────────────────────────────────────────────────────
  KBNA: 'Nashville is the country music capital of the world and home to the Grand Ole Opry, which has been broadcasting live country music radio every week since 1925 — it is the longest-running live radio show in history!',
  KMEM: 'Memphis is the birthplace of rock and roll and the blues, and the legendary Sun Studio is where Elvis Presley, Johnny Cash, Jerry Lee Lewis, and Roy Orbison all recorded their very first professional songs!',
  KTYS: 'Knoxville is the gateway to Great Smoky Mountains National Park, the most visited national park in the United States, where you can spot black bears, see synchronized fireflies, and discover hundreds of spectacular waterfalls!',
  KCHA: 'Chattanooga was reinvented from a smoky industrial city into a vibrant outdoor adventure hub — it was the first city in America to offer citywide gigabit internet service to all residents!',
  KTRI: 'The Tri-Cities area is where country music recorded its very first commercially successful songs in 1927 — the "Bristol Sessions" are often called the "Big Bang of Country Music"!',

  // ── Texas ─────────────────────────────────────────────────────────────────
  KDFW: 'The Dallas/Fort Worth Metroplex is one of the fastest-growing areas in the United States, and is home to the legendary State Fair of Texas, where you can find all kinds of amazing deep-fried foods — including deep-fried butter!',
  KIAH: 'Houston is the only city in the world with its own "Mission Control" — NASA\'s Johnson Space Center directs every human spaceflight from here, and you can tour the actual room that guided Apollo astronauts to the Moon!',
  KSAT: 'San Antonio is home to the Alamo, where 189 brave defenders held off a Mexican army of thousands in 1836, and the beautiful River Walk winds through the heart of the city lined with restaurants and flowers!',
  KAUS: 'Austin is the "Live Music Capital of the World" with more live music venues per person than any other city on Earth, and South by Southwest (SXSW) draws hundreds of thousands of music fans and tech innovators every spring!',
  KELP: 'El Paso sits right on the Rio Grande at the tip of Texas, directly across the river from Juárez, Mexico, making it one of the largest international border communities in the world — the two cities share culture, family, and food!',
  KDAL: 'Dallas is home to the Sixth Floor Museum at Dealey Plaza, which tells the story of President Kennedy\'s 1963 assassination here, and the city has more restaurants per capita than New York City!',
  KHOU: 'Houston is the most ethnically diverse large city in the United States — people from over 145 countries call it home — and its Texas Medical Center is the largest medical complex on the entire planet!',
  KAMA: 'Amarillo is right in the middle of the Texas Panhandle, and the Cadillac Ranch roadside attraction just outside town has 10 old Cadillacs buried nose-first in the earth — a famous and quirky American artwork!',
  KCLL: 'College Station is home to Texas A&M University, one of the largest universities in the United States, whose beloved "12th Man" tradition has fans standing for every play to show they are always ready to join their team!',
  KCRP: 'Corpus Christi is the gateway to Padre Island National Seashore, the longest undeveloped barrier island in the world, where endangered Kemp\'s ridley sea turtles hatch on the beach every summer!',
  KLUB: 'Lubbock is the hometown of Buddy Holly, one of rock and roll\'s great pioneers, who grew up here and recorded some of the earliest rock songs before dying in a tragic plane crash at age 22!',
  KMAF: 'Midland-Odessa is in the heart of the Permian Basin, one of the most productive oil fields on Earth, and the land here is so flat that you can see thunderstorms approaching from 50 miles away!',
  KSJT: 'San Angelo is known as the "Wool and Mohair Capital of the World" because more sheep and Angora goats graze the ranches around it than anywhere else in the United States!',
  KTYR: 'Tyler is the "Rose Capital of America" — over 20 percent of all the rosebushes sold in the United States are grown here, and the city\'s municipal rose garden has over 38,000 blooming roses to walk through!',
  KWAC: 'Waco is on the Brazos River and is where Dr Pepper was invented in 1885 at Old Corner Drug Store — the spicy-sweet fizzy drink was first sold from a soda fountain right here!',
  KBPT: 'Beaumont is close to Spindletop, where the greatest oil gusher in history shot oil 150 feet into the air for nine days in 1901 and launched the entire modern petroleum industry!',
  KGGG: 'Longview is in the Piney Woods of East Texas, surrounded by towering loblolly pines, and nearby Caddo Lake is the only natural lake in Texas, with a mystical cypress forest that looks like another world!',
  KTXK: 'Texarkana sits right on the state line between Texas and Arkansas — the US Post Office there straddles the border, making it the only building in America that sits in two states at the same time!',
  KCOT: 'Cotulla is in South Texas brush country close to the vast King Ranch — one of the largest ranches in the world, bigger than the state of Rhode Island — where longhorn cattle have roamed for generations!',
  KLRD: 'Laredo is the largest inland port on the US-Mexico border — more trade crosses here between the two countries than at any other land crossing in the entire United States!',
  KGRK: 'Killeen is next to Fort Cavazos (formerly Fort Hood), one of the largest military bases in the world, covering more than 340 square miles of central Texas!',
  KABI: 'Abilene was once a famous cattle drive destination at the end of the Chisholm Trail, and today the city punches above its weight with three universities and a world-class Western heritage museum!',
  KSPS: 'Wichita Falls famously lost its original natural waterfall in an 1886 flood — so the city built an artificial waterfall to replace it — making it the only American city to rebuild its own namesake landmark!',

  // ── Utah ──────────────────────────────────────────────────────────────────
  KSLC: 'Salt Lake City sits next to the Great Salt Lake — so salty that almost nothing can live in it except brine shrimp — and the surrounding mountains get the famous "Greatest Snow on Earth," some of the best powder skiing anywhere!',
  KPVU: 'Provo is close to Bryce Canyon National Park, where thousands of red, orange, and white "hoodoo" spire-shaped rocks create a landscape that looks like a city carved by ancient giants!',
  KSGU: 'St. George is the gateway to Zion National Park, where towering red cliffs rise 2,000 feet above the Virgin River and some slot canyons are so narrow you can touch both walls with your outstretched arms!',
  KVEL: 'Vernal is the "Dinosaur Capital of the World" — the rocky badlands around this small Utah city are packed with fossils, and scientists have found some of the most complete dinosaur skeletons ever unearthed right here!',
  KCDC: 'Cedar City hosts the Utah Shakespeare Festival every year, with world-class performances in a replica Elizabethan theater — it has been bringing Shakespeare\'s plays to life in the Utah desert for over 60 years!',

  // ── Vermont ───────────────────────────────────────────────────────────────
  KBTV: 'Burlington sits on the eastern shore of Lake Champlain, and Vermont produces more maple syrup per person than any other state — the sweet sap flows from millions of sugar maple trees every late winter!',
  KMPV: 'Montpelier is the smallest US state capital by population — just about 8,000 people — giving it the feel of a cozy village rather than a government center, with a beautiful gold-domed statehouse!',

  // ── Virginia ──────────────────────────────────────────────────────────────
  KIAD: 'Washington DC is home to the Smithsonian Institution — the world\'s largest museum and research complex — with 19 free museums holding 154 million objects collected from every corner of human history!',
  KDCA: 'Washington DC is where the Lincoln Memorial, the Washington Monument, the White House, and the US Capitol all stand — you can walk between all of them and feel the whole sweep of American history in one afternoon!',
  KRIC: 'Richmond served as the capital of the Confederacy during the Civil War, and today its canal walk along the James River and the Virginia Museum of Fine Arts make it one of the most vibrant cultural cities in the South!',
  KROA: 'Roanoke is the gateway to the Blue Ridge Parkway, the most visited road in America\'s entire national park system — a winding, scenic drive through breathtaking mountain beauty for 469 miles!',
  KLYH: 'Lynchburg is close to Appomattox Court House, the small Virginia town where General Robert E. Lee surrendered to Ulysses S. Grant in April 1865, ending the Civil War and reuniting the United States!',
  KNGU: 'Norfolk is home to Naval Station Norfolk, the largest naval station in the world — over 75 ships, submarines, and 130 aircraft are based here, making it the mightiest naval base on the entire planet!',

  // ── Washington ────────────────────────────────────────────────────────────
  KSEA: 'Seattle is famous for its coffee culture — Starbucks was founded here in 1971 — and the Space Needle, built for the 1962 World\'s Fair, offers incredible views of Mount Rainier, Puget Sound, and the Cascade Mountains!',
  KGEG: 'Spokane hosted the 1974 World\'s Fair — the first World Expo ever focused on the environment — and its downtown waterfall drops 120 feet right in the city center, one of the most dramatic urban waterfalls in America!',
  KPSC: 'Pasco is in the Tri-Cities region where the Yakima, Snake, and Columbia rivers all meet, and the surrounding Columbia Valley is Washington State\'s premier wine country — the second-largest wine producing region in the US!',
  KYKM: 'Yakima is in the heart of Washington\'s apple country — the state grows more apples than anywhere else in America — and the Yakima Valley produces world-class wines enjoyed by people around the globe!',
  KBLI: 'Bellingham is just 20 miles from the Canadian border and the gateway to the San Juan Islands, where orca whales, bald eagles, and harbor seals can be spotted on almost any boat trip through the channels!',
  KOLM: 'Olympia is Washington\'s capital city at the southern end of Puget Sound, and the Nisqually National Wildlife Refuge nearby is one of the most important salmon and bird habitats in the entire Pacific Northwest!',
  KBFI: 'Seattle\'s Boeing Field area is home to the Museum of Flight, which has over 150 historic aircraft including a real Air Force One jet that carried US presidents — and the exhibits explain how humans conquered the sky!',

  // ── West Virginia ─────────────────────────────────────────────────────────
  KCRW: 'Charleston is West Virginia\'s capital sitting where the Elk and Kanawha rivers meet, and the nearby New River Gorge — one of the deepest gorges in the eastern United States — became a national park in 2020!',
  KHTS: 'Huntington is home to Marshall University, whose football team was nearly wiped out in a 1970 plane crash — the town\'s remarkable recovery was made into the inspiring film "We Are Marshall"!',

  // ── Wisconsin ─────────────────────────────────────────────────────────────
  KMKE: 'Milwaukee is famous for its beer brewing history and the Milwaukee Art Museum, whose enormous white "wings" open and close like a giant bird every day — one of the most spectacular buildings in all of America!',
  KMSN: 'Madison is one of only two US state capitals on an isthmus — a narrow strip of land between two lakes — giving it stunning waterfront views in every direction and a sailing culture that thrives all summer!',
  KGRB: 'Green Bay is home to the Green Bay Packers — the only publicly owned non-profit major professional sports team in the United States — so the fans literally own the team and vote for its board of directors!',
  KATW: 'Appleton is the hometown of Harry Houdini, the world\'s greatest escape artist and magician, who was born here in 1874 and learned his first tricks as a young boy in Wisconsin!',

  // ── Wyoming ───────────────────────────────────────────────────────────────
  KCYS: 'Cheyenne holds the Cheyenne Frontier Days rodeo every July — one of the biggest outdoor rodeos in the world, where bull riders, barrel racers, and trick ropers have shown off incredible skills since 1897!',
  KJAC: 'Jackson Hole is surrounded by the Teton Range, some of the most dramatic and jagged mountains in North America, and both Grand Teton National Park and Yellowstone are right at its doorstep!',
  KCOD: 'Cody was named for Buffalo Bill Cody, the famous Wild West showman, and the Buffalo Bill Center of the West has five world-class museums about the American West, Native American culture, and Rocky Mountain natural history!',
  KLAR: 'Laramie is home to the University of Wyoming — the only four-year university in the state — and the Wyoming Territorial Prison where outlaw Butch Cassidy was once locked up is now a fascinating history museum!',
  KGCC: 'Gillette is in the Powder River Basin, which produces more coal than any other region in the United States — trains of 100+ cars run day and night carrying coal to power plants across the country!',

  // ── International: Canada ─────────────────────────────────────────────────
  CYYZ: 'Toronto is one of the most diverse cities in the entire world — over half of its residents were born outside Canada, and more than 180 languages are spoken there — and the CN Tower held the title of world\'s tallest freestanding structure for 34 years!',
  CYVR: 'Vancouver sits between snow-capped mountains and the Pacific Ocean, making it one of the most spectacularly beautiful cities in North America — you can ski in the morning and walk on the beach in the afternoon!',
  CYMX: 'Montreal is North America\'s largest French-speaking city, with incredible food, an underground city of 19 miles of tunnels, and the world-famous Montreal Jazz Festival drawing the greatest musicians on Earth every July!',
  CYUL: 'Montreal\'s underground city — called RÉSO — has over 19 miles of tunnels connecting shopping centers, hotels, and subway stations so residents can travel all winter without braving the cold above ground!',
  CYYC: 'Calgary hosts the Calgary Stampede every July — the "Greatest Outdoor Show on Earth" — with the world\'s biggest rodeo, wild chuckwagon races, and Western celebrations that draw over a million visitors!',
  CYEG: 'Edmonton is Canada\'s northernmost major city and the gateway to Jasper National Park, where skies so dark and clear make it one of the best places in the world to see the glittering Milky Way and Northern Lights!',
  CYOW: 'Ottawa is Canada\'s capital city, and every winter the Rideau Canal freezes to become the world\'s largest naturally frozen ice-skating rink — stretching 5 miles right through the heart of the city!',
  CYHZ: 'Halifax is on one of the world\'s largest natural harbors and was the first port where survivors and victims of the Titanic were brought after the disaster in 1912 — the Maritime Museum of the Atlantic has actual deck chairs from the ship!',
  CYWG: 'Winnipeg sits exactly at the geographic center of North America and is home to the Canadian Museum for Human Rights — the first museum in the world dedicated entirely to the history and struggle for human rights!',
  CYQB: 'Quebec City is the only walled city north of Mexico in North America, with 400-year-old stone ramparts you can walk on, and its famous winter carnival builds an enormous palace entirely from blocks of snow and ice!',

  // ── International: Mexico ─────────────────────────────────────────────────
  MMMX: 'Mexico City is one of the oldest cities in the Americas — built by the Aztecs in 1325 on an island in a lake — and the city now slowly sinks as the ancient lakebed compresses beneath it!',
  MMGL: 'Guadalajara is the birthplace of both mariachi music and tequila — the blue agave plants used to make tequila grow all around the city in the state of Jalisco!',
  MMMY: 'Monterrey is Mexico\'s industrial powerhouse, nestled in a dramatic ring of jagged mountains — the famous Cerro de la Silla peak looks exactly like a giant saddle sitting on the city\'s horizon!',
  MMTJ: 'Tijuana is one of the most-crossed international borders in the world — millions of people travel between Tijuana and San Diego every year, blending the cultures of Mexico and the United States!',
  MMUN: 'Cancún sits on the Caribbean coast near ancient Mayan ruins and the Mesoamerican Barrier Reef — the second-longest coral reef in the world — full of dazzling tropical fish and sea turtles!',
  MMAS: 'Aguascalientes is famous for the San Marcos Festival, one of Mexico\'s biggest fairs, held every April since the 1820s with music, art, bullfights, and celebrations that fill the whole city with color!',
  MMSP: 'San Luis Potosí has a stunning colonial city center with baroque cathedrals, and nearby Las Pozas is a surreal concrete jungle sculpture garden built deep in the rainforest by a British eccentric in the 1940s!',
  MMLP: 'La Paz is the capital of Baja California Sur and the gateway to the Sea of Cortez — what scientists call "the aquarium of the world" because whale sharks, manta rays, sea lions, and 900 species of fish all live there!',
  MMPW: 'Puerto Vallarta is nestled in Banderas Bay, one of the largest natural bays in North America, where humpback whales come every winter to give birth and raise their calves in the warm, protected water!',
  MMZC: 'Zacatecas is a beautiful colonial city built in a canyon where silver mines were so rich in the 1600s that silver from here helped fund the entire Spanish Empire for centuries!',
  MMMD: 'Mérida is the cultural capital of the Yucatán Peninsula, close to Chichén Itzá — the ancient Mayan pyramid that is one of the Seven Wonders of the Modern World!',
  MMHO: 'Hermosillo is the capital of Sonora state, home to giant saguaro cacti and the beloved Sonoran hot dog — a bacon-wrapped hot dog loaded with toppings that has become famous on both sides of the US-Mexico border!',

  // ── International: Caribbean / Central America ────────────────────────────
  MUHA: 'Havana\'s streets are full of 1950s American cars that Cubans have kept running with incredible ingenuity for over 60 years — the colorful, chrome-covered "almendrones" are rolling works of art!',
  MDSD: 'Santo Domingo was the first permanent European settlement in the Americas, founded in 1498, with the first cathedral, first university, and first hospital ever built in the Western Hemisphere!',
  MKJP: 'Kingston is the birthplace of reggae music and the home of Bob Marley, whose infectious rhythms and messages of love and peace spread from this small Caribbean island to dance floors all over the world!',
  MPTO: 'Panama City is right next to the Panama Canal — one of the greatest engineering achievements in history — a shortcut that lets massive ships travel between the Atlantic and Pacific Oceans without sailing around South America!',
  MROC: 'San José is in tiny Costa Rica, a country so dedicated to nature that it has no army — the money saved goes to education and conservation instead — and lush rainforests full of sloths and toucans cover a quarter of the country!',
  MGGT: 'Guatemala City is close to Tikal — one of the greatest ancient Mayan cities — where towering stone temples rise above the jungle canopy and howler monkeys bark from the treetops at dawn!',

  // ── International: South America ──────────────────────────────────────────
  SBGR: 'São Paulo is the largest city in the Western Hemisphere, home to over 22 million people, and has the biggest Japanese community outside of Japan — over 1.5 million Japanese-Brazilians make it their home!',
  SBGL: 'Rio de Janeiro has the world\'s biggest carnival celebration — an entire city dances for five days straight — and Christ the Redeemer statue stands with open arms on the mountaintop above the city, visible from miles away!',
  SBBR: 'Brasília was built from scratch in just 41 months starting in 1956, and its futuristic buildings designed by Oscar Niemeyer make it look like a city from a science fiction movie — it is a UNESCO World Heritage Site!',
  SBKP: 'Campinas is in São Paulo state\'s tech and agriculture heartland, home to UNICAMP university where some of Brazil\'s most important scientific discoveries — including breakthroughs in tropical disease research — have been made!',
  SBSV: 'Salvador is the African heart of Brazil — West African culture brought during centuries of slavery lives on in the city\'s Candomblé music, acarajé bean fritters, and the colorful Pelourinho old town!',
  SBFZ: 'Fortaleza is on Brazil\'s northeastern coast where strong trade winds make it one of the world\'s top kitesurfing destinations, and the stunning sand dunes nearby are so beautiful that locals toboggan down them on wooden boards!',
  SBMN: 'Manaus is a city of two million people right in the middle of the Amazon Rainforest, and just outside the city the dark Rio Negro and the muddy Amazon flow side by side without mixing for miles — a spectacular "Meeting of the Waters"!',
  SBCT: 'Curitiba invented Bus Rapid Transit — the efficient bus-lane system that now helps hundreds of cities around the world move millions of people quickly and cheaply — this urban innovation started right here!',
  SBPA: 'Porto Alegre is at the southern tip of Brazil, where the "Gaucho" cowboy culture thrives — locals drink mate tea from a gourd, ride horses on the pampas, and have their own proud traditions quite unlike the rest of Brazil!',
  SBBE: 'Belém is the gateway to the Amazon River, at the very mouth of the world\'s largest river system — the Amazon pours a fifth of all the world\'s fresh water into the Atlantic Ocean every single day!',
  SAEZ: 'Buenos Aires is called the "Paris of South America" for its grand European-style boulevards and amazing tango culture — and it is the home city of Pope Francis, the leader of the Catholic Church!',
  SAME: 'Mendoza is at the foot of the Andes mountains and is Argentina\'s wine country — the Malbec grapes grown in the high-altitude vineyards here produce some of the richest red wines in the world!',
  SACO: 'Córdoba is Argentina\'s second-largest city and home to one of the oldest universities in Latin America, founded in 1613 — the city\'s centuries of intellectual life earned it the proud nickname "La Docta" (The Learned)!',
  SCEL: 'Santiago is wedged between the towering Andes and the Pacific Ocean, making it one of the most dramatically situated capitals in South America and the gateway to world-class skiing and renowned wine country!',
  SKBO: 'Bogotá is one of the world\'s highest capital cities at 8,660 feet above sea level — so high that visitors sometimes feel dizzy — and the Gold Museum holds over 55,000 pre-Colombian gold objects, the largest such collection in the world!',
  SKMD: 'Medellín transformed itself from one of the world\'s most dangerous cities into one of the most innovative in Latin America — it built cable cars up steep hillsides to connect poor communities to jobs and schools, changing thousands of lives!',
  SPIM: 'Lima is Peru\'s capital and famous for ceviche — raw fish "cooked" in lime juice with chili — and the ruins of pre-Incan civilizations right within the city limits, including pyramid temples that are 1,500 years old!',
  SEQM: 'Quito is the highest official capital city in the world at 9,350 feet above sea level, and its colonial old town is so perfectly preserved that it was one of the very first cities designated a UNESCO World Heritage Site in 1978!',

  // ── International: Europe ─────────────────────────────────────────────────
  EGLL: 'London is one of the world\'s most visited cities, home to Buckingham Palace, the Tower of London, and the British Museum — which holds over 8 million objects collected from every corner of human history!',
  EGKK: 'The greater London area is one of the world\'s most culturally rich places, home to more world-class museums, theaters, and concert halls than almost anywhere else on Earth!',
  EGGW: 'Luton is close to Woburn Abbey estate, where a safari park lets you drive through herds of giraffes, rhinos, and rare animals right in the English countryside — just an hour from central London!',
  EGSS: 'The area north of London is the gateway to Cambridge, where one of the world\'s greatest universities has been training brilliant minds — including Isaac Newton and Charles Darwin — for over 800 years!',
  EGNX: 'The East Midlands is close to Sherwood Forest, the legendary woodland home of Robin Hood — some of the ancient oak trees there are over 1,000 years old and still growing!',
  EGCC: 'Manchester was the world\'s first industrial city, launching the Industrial Revolution in the 1700s that changed how everything is made, and today it is one of Europe\'s most exciting cities for music and football!',
  EGPD: 'Aberdeen is Scotland\'s "Granite City" on the North Sea coast — the oil capital of Europe — and dolphins regularly swim right in the harbor, visible from the city waterfront!',
  EGPH: 'Edinburgh is dominated by its dramatic medieval castle on an ancient volcanic rock, and every August the city hosts the Edinburgh Festival Fringe — the world\'s largest arts festival — with thousands of shows in every corner of the city!',
  EGBB: 'Birmingham is the second-largest city in the UK and home to Cadbury\'s chocolate factory, where you can tour the Cadbury World museum and learn how some of the world\'s most beloved chocolate bars are made!',
  EIDW: 'Dublin is the capital of Ireland, famous for its friendly people, beautiful green countryside, and — because Irish monks preserved learning during the Dark Ages — it has some of the world\'s oldest illuminated manuscripts!',
  LFPG: 'Paris is the most visited city in the world, home to the Eiffel Tower, the Louvre museum (the world\'s most visited art museum), and some of the greatest food — from flaky croissants to rich chocolate mousse — you will ever taste!',
  LFPO: 'The Paris area is home to the Palace of Versailles, whose Hall of Mirrors is 240 feet long and lined with 357 mirrors reflecting golden chandeliers — it was built for the Sun King Louis XIV 350 years ago!',
  LFLL: 'Lyon is the food capital of France, famous for its "bouchon" restaurants and traditional Lyonnaise cooking, and the city\'s old town is a UNESCO World Heritage Site with incredible Renaissance buildings!',
  LFMN: 'Nice sits on the French Riviera along the glittering Mediterranean Sea, where the turquoise water, palm trees, and colorful old town make it one of the most beautiful cities in all of Europe!',
  LFBO: 'Toulouse is the aerospace capital of Europe — Airbus builds its enormous A380 double-decker planes, the largest passenger jets in the world, right here in a giant factory!',
  LFRS: 'Nantes is where Jules Verne was born — the inventor of science fiction adventures like "20,000 Leagues Under the Sea" and "Around the World in 80 Days" grew up dreaming of impossible journeys in this French port city!',
  EDDF: 'Frankfurt is the financial heart of Europe with skyscraping bank towers, yet just outside the city are medieval castles, vineyards, and the beautiful Rhine River full of fairy-tale legends!',
  EDDM: 'Munich is famous for Oktoberfest, the world\'s largest folk festival, and Neuschwanstein Castle — the fairy-tale castle that inspired Sleeping Beauty\'s castle at Disneyland — is just a short drive away in the Alps!',
  EDDB: 'Berlin was divided by the famous Berlin Wall from 1961 to 1989 — when it finally came down, it was one of the most joyful moments of the 20th century — and today Berlin is one of Europe\'s most creative and exciting cities!',
  EDDH: 'Hamburg is Germany\'s great port city, and it is where the Beatles famously played in tiny clubs before they became the most famous band in history — you can still visit the legendary Star-Club neighborhood!',
  EDDS: 'Stuttgart is the birthplace of the automobile — both Mercedes-Benz and Porsche were founded here — and you can visit their world-class museums to see the very first cars ever built by Karl Benz and Gottlieb Daimler!',
  EDDL: 'Düsseldorf is on the Rhine River and is famous for its fashion and art scene — the elegant Königsallee shopping boulevard is lined with luxury boutiques and beautiful chestnut trees!',
  EDDC: 'Dresden is called the "Florence of the Elbe" for its stunning Baroque palaces and churches, many of which were painstakingly rebuilt after World War II — the Frauenkirche dome glows gold over the city!',
  EHAM: 'Amsterdam has more bicycles than people — over 900,000 bikes for 800,000 residents — and its 165 canals crossed by 1,500 bridges make it one of the most unique and charming cities in all of Europe!',
  EBBR: 'Brussels is the capital of both Belgium and the European Union, and is famous for inventing Belgian waffles, Belgian chocolate, and Belgian fries — so some of the world\'s most beloved snack foods were born in this small country!',
  LEMD: 'Madrid is the highest capital city in the European Union, sitting at 2,188 feet above sea level, and its Prado Museum holds masterpieces by Velázquez, Goya, and El Greco — some of the most powerful paintings ever created!',
  LEBL: 'Barcelona is home to the Sagrada Família, a church designed by Antoni Gaudí that has been under construction since 1882 and is still not finished — it may be the most unique building in the entire world!',
  LEPA: 'Palma de Mallorca is on a gorgeous Mediterranean island surrounded by turquoise water, olive groves, and mountains, where orange and almond trees bloom pink and white every February!',
  LEMG: 'Málaga is the birthplace of Pablo Picasso, the most influential artist of the 20th century, who invented cubism — a revolutionary style showing faces and objects from multiple angles at once!',
  LEZL: 'Seville is famous for flamenco dancing, tapas, and the Alcázar palace — one of the oldest royal palaces still in use in Europe, built 600 years ago with gorgeous Islamic-influenced architecture!',
  LEBB: 'Bilbao transformed itself by building the spectacular Guggenheim Museum, covered in titanium scales designed by Frank Gehry — the museum is so beautiful it literally changed how the world thinks about what buildings can be!',
  LEVC: 'Valencia invented paella, the famous Spanish rice dish — the recipe was born in the rice paddies around this beautiful Mediterranean city centuries ago, and no one makes it better than the Valencians do today!',
  LIRF: 'Rome is called the Eternal City and is home to the Colosseum where gladiators fought 2,000 years ago, the Vatican — the world\'s smallest country — and Michelangelo\'s breathtaking Sistine Chapel ceiling!',
  LIML: 'Milan is the fashion capital of the world, home to the legendary La Scala opera house, and Leonardo da Vinci\'s famous "The Last Supper" painting is right here on the wall of a church in the city!',
  LIMC: 'Milan\'s other airport serves a city whose Duomo Cathedral has 3,400 statues — more statues than any other cathedral in the world — and is one of the largest Gothic churches ever built by human hands!',
  LIPZ: 'Venice is built on 118 small islands connected by 400 bridges, with gondolas gliding through canals instead of cars on roads — and it has been slowly, mysteriously sinking for centuries!',
  LIRN: 'Naples is one of the oldest continuously inhabited cities in Europe and is famous for inventing pizza — the original Neapolitan margherita, with tomato, mozzarella, and basil, is the ancestor of every pizza on Earth!',
  LIRQ: 'Florence is the birthplace of the Renaissance, where Leonardo da Vinci, Michelangelo, and Botticelli created some of the most beautiful paintings and sculptures in human history — and the Uffizi Gallery holds hundreds of them!',
  LICJ: 'Palermo is the capital of Sicily, the largest island in the Mediterranean, where thousands of years of Greek, Arab, Norman, and Spanish rule left behind a dazzling mixture of cultures, architecture, and incredible food!',
  LPPT: 'Lisbon is the westernmost capital city in continental Europe and one of the world\'s oldest cities — Portuguese sailors set out from here in the 1400s to discover sea routes to India and Brazil, changing the whole world!',
  LPFR: 'Faro is the gateway to the Algarve, Portugal\'s famous southern coast, where dramatic golden-orange sea cliffs, sea caves, and gorgeous sandy beaches make it one of the most beautiful coastlines in Europe!',
  LPPR: 'Porto gave its name to Port wine — the sweet, rich dessert wine that has been made in the Douro Valley vineyards above the city and shipped from its harbor to the world for centuries!',
  LSZH: 'Zurich is Switzerland\'s largest city and regularly tops the charts as the city with the best quality of life on Earth — crystal-clear lake swimming, mountain views, and the world\'s finest watches and chocolate!',
  LSGG: 'Geneva is home to more international organizations than almost any other city — the United Nations, the Red Cross, and the World Health Organization are all headquartered here, making it a global hub of peace!',
  LOWW: 'Vienna is the "City of Music" — Mozart, Beethoven, Schubert, Strauss, and Brahms all lived and created masterpieces here — and the Hofburg Palace, home to Habsburg emperors for 600 years, has 5,000 people living and working inside it!',
  LHBP: 'Budapest is actually two cities — Buda and Pest — separated by the Danube River and connected by the famous Chain Bridge, and together they form one of Europe\'s most beautiful and dramatic capitals!',
  EPWA: 'Warsaw has one of the most dramatic stories of any city in Europe — it was almost completely destroyed during World War II, then rebuilt by its citizens to look exactly as it did before, brick by careful brick!',
  LKPR: 'Prague has one of the best-preserved medieval old towns in Europe, dating back over 1,000 years, and its Charles Bridge is lined with 30 baroque statues of saints that have guarded the river crossing since the 1700s!',
  EKCH: 'Copenhagen is one of the happiest cities in one of the happiest countries in the world, and Tivoli Gardens — the world\'s second-oldest amusement park — has been delighting children and families since 1843!',
  ENGM: 'Oslo is Norway\'s capital, and the Viking Ship Museum holds real 1,000-year-old Viking longboats that once sailed across the Atlantic to North America — some of the most astonishing wooden ships ever preserved!',
  ESSA: 'Stockholm is built on 14 islands and has 57 bridges connecting them — and the Vasa Museum holds a spectacular 64-gun warship that sank on its very first voyage in 1628 and was raised from the harbor almost perfectly preserved in 1961!',
  EFHK: 'Helsinki is the capital of Finland, a country that has been ranked the happiest in the world multiple years in a row, where there are more saunas than cars and Finns love relaxing in them no matter the weather!',
  BIRK: 'Reykjavik is the world\'s northernmost capital city, where you can see the Northern Lights from downtown, swim in geothermally heated outdoor pools in the middle of winter, and explore lava fields just minutes from the city!',
  UUEE: 'Moscow is the largest city in Europe, home to the colorful onion-domed St. Basil\'s Cathedral on Red Square, and its subway stations are so ornate — with chandeliers, mosaics, and marble — they are like underground palaces!',
  ULLI: 'St. Petersburg was built by Tsar Peter the Great to be Russia\'s "Window on Europe" and its Hermitage Museum holds over 3 million pieces of art — more than any single person could see in a lifetime!',
  LTBA: 'Istanbul is the only city in the world that sits on two continents — Europe and Asia — and the magnificent Hagia Sophia, built in 537 AD, was for nearly a thousand years the largest cathedral in the entire world!',
  LTFM: 'Istanbul\'s Grand Bazaar is one of the world\'s oldest and largest covered markets, with over 4,000 shops under a vaulted roof — it has been bustling with merchants and shoppers for over 560 years!',
  LTAC: 'Ankara is Turkey\'s capital city, and nearby the ancient ruins of the Hittite civilization at Hattusha — over 3,000 years old — show that this region has been a crossroads of great empires for thousands of years!',
  LTAI: 'Antalya is on the Turkish Riviera along the Mediterranean Sea, surrounded by ancient ruins of Greek and Roman cities where you can walk past 2,000-year-old temples and columns right on the beach!',

  // ── International: Middle East ────────────────────────────────────────────
  OMDB: 'Dubai is a city that rose from the desert in just a few decades — the Burj Khalifa is the tallest building on Earth at 2,717 feet — and you can ski on real snow in a giant indoor slope even when temperatures outside reach 115°F!',
  OMAA: 'Abu Dhabi is home to the Sheikh Zayed Grand Mosque, one of the most beautiful mosques in the world, with 82 domes, 1,000 columns, and the world\'s largest hand-knotted carpet covering its prayer hall floor!',
  OTHH: 'Doha is Qatar\'s capital, a tiny country whose remarkable Museum of Islamic Art holds one of the world\'s finest collections of Islamic art in a stunning waterfront building, and Qatar hosted the 2022 FIFA World Cup!',
  OERK: 'Riyadh transformed from a desert oasis of 30,000 people in 1950 into a modern metropolis of over 7 million — and nearby are the ruins of Diriyah, the birthplace of the first Saudi state 300 years ago!',
  OEJN: 'Jeddah is the gateway to Mecca, the holiest city in Islam, and more than 2 million Muslim pilgrims from every country on Earth travel through here every year on the Hajj — one of the largest human gatherings on the planet!',
  LLBG: 'Tel Aviv is right next to Jerusalem — the ancient holy city sacred to three major world religions — and Israel has more startups per capita than any country on Earth, earning it the nickname "Startup Nation"!',
  OJAI: 'Amman is just a short drive from Petra — the "Rose City" carved directly into rose-colored sandstone cliffs by the Nabataean people 2,000 years ago, making it one of the most spectacular ancient sites on Earth!',

  // ── International: Africa ─────────────────────────────────────────────────
  FAOR: 'Johannesburg is South Africa\'s largest city and sits on the world\'s richest gold reef — the Witwatersrand has produced about 40 percent of all the gold ever mined on Earth — and nearby Soweto was home to Nelson Mandela!',
  FACT: 'Cape Town sits at the foot of Table Mountain, a flat-topped peak that looks like the world\'s largest table, and just off its coast you can see great white sharks, African penguins waddling on the beach, and stunning vineyards!',
  FALE: 'Durban is on the warm Indian Ocean coast of South Africa, with beautiful golden beaches and warm water that make it one of the top surf destinations in the entire world!',
  HECA: 'Cairo is next to the Great Pyramids of Giza — the only one of the Seven Wonders of the Ancient World still standing — built 4,500 years ago and still the largest stone structures ever constructed by human hands!',
  HAAB: 'Addis Ababa is the capital of one of the oldest countries in the world — Ethiopia was never colonized — and "Lucy," one of the most important human ancestor fossils ever discovered, was found in the Ethiopian desert nearby!',
  HKJK: 'Nairobi is the only capital city in the world with a national park right inside its city limits — you can watch lions, giraffes, and rhinos against a backdrop of skyscrapers from the edge of Nairobi National Park!',
  DNMM: 'Lagos is one of Africa\'s largest cities and the heart of "Nollywood" — Nigeria\'s film industry — which produces more movies each year than any film industry in the world except India\'s Bollywood!',
  DGAA: 'Accra is Ghana\'s vibrant capital, and Ghana was the first sub-Saharan African country to gain independence from colonial rule in 1957 — an event that inspired freedom movements across the entire continent!',
  GMMN: 'Casablanca is Morocco\'s largest city and home to the Hassan II Mosque — one of the largest mosques in the world, built partly over the Atlantic Ocean, with a laser beam from its minaret visible from 30 miles at sea!',
  FMMI: 'Antananarivo is the capital of Madagascar, the world\'s fourth-largest island, where 90 percent of the plants and animals are found nowhere else on Earth — including dozens of species of lemurs!',
  DTTA: 'Tunis is right next to ancient Carthage — one of the most powerful cities of the ancient world, which battled Rome for supremacy — making this one of the most historically rich locations in the entire Mediterranean!',
  HTDA: 'Dar es Salaam is Tanzania\'s largest city and the gateway to the Serengeti, where the largest animal migration on Earth takes place — over 1.5 million wildebeest and hundreds of thousands of zebras thunder across the plains every year!',

  // ── International: South / East Asia ─────────────────────────────────────
  ZBAA: 'Beijing has been China\'s capital for most of the last 700 years, and the Forbidden City — a palace complex with 9,999 rooms — was so sacred that ordinary people were forbidden from entering for 500 years!',
  ZSPD: 'Shanghai is China\'s largest city, where the futuristic Pudong skyline faces the elegant 1930s buildings of the Bund across the Huangpu River — a stunning city of contrasts between the old and the new!',
  ZGGG: 'Guangzhou has been a trading city for over 2,000 years and is where dim sum was born — the beloved tradition of sharing small dishes of dumplings, steamed buns, and other treats that has spread to every Chinese restaurant in the world!',
  ZUCK: 'Chengdu is famous for two things above all: giant pandas and fiery Sichuan food! The Chengdu Giant Panda Breeding Base lets you get close to the beloved black-and-white bears, and the local spicy dishes will tingle your tongue!',
  ZGSZ: 'Shenzhen transformed from a tiny fishing village to a megacity of 12 million people in just 40 years — the fastest urbanization in human history — and is now the drone capital of the world, home to DJI which makes the sky robots that filmmakers everywhere use!',
  ZHCC: 'Zhengzhou is close to the ancient Shaolin Temple, where Buddhist monks have practiced the legendary kung fu martial art for over 1,500 years — the original home of the most famous fighting style in history!',
  ZSHC: 'Hangzhou is famous for its West Lake, a scenic body of water surrounded by temples, pagodas, and gardens that has inspired Chinese poets and painters for over 1,000 years — and it is the birthplace of Chinese tea culture!',
  ZLXY: 'Xi\'an is home to the Terracotta Army — an underground force of 8,000 life-size clay soldiers, horses, and chariots created 2,200 years ago to guard China\'s first emperor — discovered by farmers digging a well in 1974!',
  ZBTJ: 'Tianjin has a beautifully preserved European concession quarter with French, Italian, and British colonial buildings, and is famous for its goubuli steamed dumplings, beloved across China for over 150 years!',
  ZSAM: 'Xiamen is a beautiful coastal city famous for its car-free Gulangyu Island, where only bicycles and pedestrians wind through gardens and old colonial villas — a peaceful little paradise just off the busy mainland!',
  ZPPP: 'Kunming is called the "Spring City" because its high-altitude climate gives it mild, flower-filled weather almost year-round — and the Stone Forest nearby is a magical "forest" of grey limestone pillars formed over 270 million years!',
  ZHHH: 'Wuhan sits at the heart of China where great rivers and railways meet, and the Yellow Crane Tower on the Yangtze River bluffs has inspired Chinese poets and travelers for over 1,700 years!',
  RJTT: 'Tokyo is the world\'s largest metropolitan area, home to over 37 million people, and has the most Michelin-starred restaurants of any city on Earth — Japanese food culture is so rich and precise that it is recognized as a UNESCO Intangible Cultural Heritage!',
  RJAA: 'The Tokyo/Narita area is the gateway to Japan, a country where ancient samurai temples, tea ceremonies, and centuries-old festivals exist side-by-side with bullet trains and robot technology!',
  RJBB: 'Osaka is Japan\'s kitchen — famous for its incredible street food culture — and the Japanese phrase "kuidaore" (eat until you drop) is basically the city\'s motto for how seriously Osakans take their food!',
  RJCC: 'Sapporo is on Hokkaido, Japan\'s northern island, famous for its magnificent snow festival every February where artists carve enormous sculptures from ice and snow — some as tall as a five-story building!',
  RJFF: 'Fukuoka is famous for its tonkotsu ramen — a rich, creamy pork broth noodle soup — that is eaten in tiny noodle shops called "yatai" that set up along the riverbank every night like a magical outdoor dining festival!',
  RKSI: 'Seoul is a city where 600-year-old royal palaces sit right next to futuristic skyscrapers — you can visit the ancient Gyeongbokgung Palace in a traditional hanbok dress and then walk to a K-pop studio in the same afternoon!',
  RKPC: 'Jeju Island is a volcanic island off South Korea famous for its "haenyeo" — brave women free divers who plunge to the ocean floor without breathing equipment to collect seafood — a tradition honored by UNESCO!',
  RCTP: 'Taipei is home to Taipei 101, which was the tallest building in the world from 2004 to 2010, and Taiwan is where bubble tea was invented in the 1980s — the chewy tapioca pearl drink now enjoyed around the planet!',
  RPLL: 'Manila, Philippines, is one of the world\'s most densely populated cities, on an archipelago of over 7,600 islands where some of the world\'s most stunning beaches — including the famous white sand of Palawan — await!',
  WSSS: 'Singapore is a tiny island city-state that became one of the wealthiest countries on Earth through trade and innovation — and Changi Airport has a seven-story waterfall inside the terminal that cascades from the roof!',
  WMKK: 'Kuala Lumpur is home to the Petronas Twin Towers, which were the world\'s tallest buildings from 1998 to 2004, and the city\'s street food culture — especially nasi lemak and roti canai — is beloved across all of Asia!',
  WADD: 'Bali is known as the "Island of the Gods" and is famous for its terraced rice paddies carved in giant steps into hillsides, colorful Hindu temples draped in flowers, and warm tropical waters full of sea turtles!',
  WIII: 'Jakarta is Southeast Asia\'s largest city and is so worried about sinking into the sea that Indonesia is building a brand-new capital city — called Nusantara — on the island of Borneo!',
  VHHH: 'Hong Kong has more skyscrapers than any other city on Earth, and every night it puts on a stunning laser-light show over Victoria Harbour — 13 minutes of music and light that draws visitors from all over the world!',
  VTBS: 'Bangkok is one of the world\'s most visited cities, famous for its ornate temples, incredible street food available at any hour, and the Grand Palace — home to the Thai royal family for over 200 years!',
  VTSP: 'Phuket is a beautiful Thai island in the Andaman Sea surrounded by clear emerald water, dramatic limestone cliffs rising from the sea, and colorful coral reefs full of sea turtles and tropical fish!',
  VTCC: 'Chiang Mai is surrounded by misty mountain forests and is famous for its Loi Krathong lantern festival, when thousands of glowing paper lanterns are released into the night sky and float upward like tiny rising stars!',
  VVNB: 'Hanoi is Vietnam\'s ancient capital where streets in the old quarter are still named after what was sold there 500 years ago — "Silk Street," "Paper Street," "Tin Street" — and the whole neighborhood buzzes with motorbikes and street food!',
  VVTS: 'Ho Chi Minh City is Vietnam\'s biggest, most energetic city, with millions of motorbikes weaving through streets lined with French colonial buildings, street food stalls, and ancient pagodas beside modern high-rise towers!',
  VVDA: 'Da Nang is close to the ancient town of Hoi An, whose lantern-lit streets and centuries-old trading houses are so perfectly preserved that the entire old town is a UNESCO World Heritage Site!',
  VIDP: 'Delhi has been a great capital city for thousands of years — the Red Fort, built by the Mughal Emperor Shah Jahan in 1638, is a magnificent red sandstone fortress that still stands at the heart of old Delhi!',
  VABB: 'Mumbai is the heart of Bollywood — the world\'s largest film industry by number of movies produced — and its famous "dabbawala" lunch deliverers bicycle hot home-cooked meals to over 130,000 office workers every single day!',
  VOBL: 'Bengaluru (Bangalore) is India\'s Silicon Valley, where companies like Infosys and Wipro were born and global tech giants have set up their Indian headquarters — the city earned its nickname from its thousands of technology workers!',
  VOMM: 'Chennai is the center of Tamil culture, famous for its classical Carnatic music, Bharatanatyam dance, and colorful silk saris woven in intricate patterns — it is one of the great cultural capitals of South Asia!',
  VOHS: 'Hyderabad is famous for its spicy Hyderabadi biryani rice dish, the magnificent 1591 Charminar gateway, and its huge tech industry — the city is sometimes called "Cyberabad" for all its software companies!',
  VECC: 'Kolkata was the capital of British India and is the "City of Joy," famous for its Durga Puja festival when enormous goddess statues are paraded through the streets for five days in one of the most spectacular celebrations anywhere in the world!',
  OPKC: 'Karachi is Pakistan\'s largest city and economic hub on the Arabian Sea coast, where the ancient Indus Valley Civilization — one of the world\'s very first great civilizations — flourished in the plains to the north 4,500 years ago!',
  OPLM: 'Lahore is Pakistan\'s cultural heart, where the magnificent Badshahi Mosque — one of the largest mosques in the world — faces the Lahore Fort across a grand courtyard in one of the most impressive architectural scenes in all of Asia!',
  VGZR: 'Dhaka, Bangladesh, is one of the world\'s most densely populated cities — over 23,000 people per square kilometer — making it one of the busiest and most vibrant urban places on the entire planet!',
  VNKT: 'Kathmandu is the gateway to the Himalayas — the world\'s tallest mountain range — and is less than 100 miles from Mount Everest, the highest point on Earth, where brave climbers attempt the summit every year!',

  // ── International: Oceania ────────────────────────────────────────────────
  YSSY: 'Sydney is famous for its iconic Opera House, whose roof looks like a series of shells opening toward the harbor, and Bondi Beach is one of the most famous surf beaches in the entire world!',
  YMML: 'Melbourne is regularly ranked one of the world\'s most livable cities and has the world\'s largest tram network — you can ride the trams for free in the inner city and explore one of Australia\'s great cultural capitals!',
  YBBN: 'Brisbane hosted the 2032 Olympic Games and sits in Queensland, Australia\'s "Sunshine State," where the Great Barrier Reef — the world\'s largest coral reef system — is just a short flight away!',
  YPPH: 'Perth is the most remote major city on Earth — closer to Singapore than to Sydney — and its beaches have some of the whitest sand you will ever see, formed from pure quartz washed up over millions of years!',
  YPAD: 'Adelaide is known as Australia\'s "Festival City" and hosts the Adelaide Fringe each February — the second-largest arts festival in the world — while the nearby Barossa Valley produces some of the world\'s finest Shiraz wines!',
  NZAA: 'Auckland is built on a field of 53 volcanoes — some of them are city parks where people have picnics on top of extinct craters — and the harbor views across the Waitemata are some of the most beautiful in the South Pacific!',
  NZWN: 'Wellington is the world\'s windiest capital city and the home of Weta Workshop, the special-effects studio that created the creatures, costumes, and miniature worlds for the "Lord of the Rings" and "Avatar" films!',
  NZCH: 'Christchurch is the main departure point for scientific expeditions to Antarctica — the world\'s most remote and coldest continent — and gateway to the stunning Southern Alps and Aoraki/Mount Cook!',
  NFFN: 'Fiji is an archipelago of over 330 islands in the South Pacific, famous for its crystal-clear waters, colorful coral reefs, and some of the most genuinely friendly and welcoming people you will ever meet!',
  NTAA: 'Papeete, Tahiti, is the capital of French Polynesia — a collection of stunning islands that inspired the painter Paul Gauguin and many other artists with their breathtaking beauty and vibrant island culture!',

};

module.exports = { AIRPORT_FACTS };
