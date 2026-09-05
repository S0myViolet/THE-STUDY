import type { Curiosity } from "@/lib/domain/types";

/**
 * The Cabinet: twenty curiosities. Each is a mechanism, not a fact;
 * where the popular story is contested the text says so.
 * `connects` are canonical Archive ids (src/content/archive-ids.ts).
 */
export const CURIOSITIES: Curiosity[] = [
  {
    id: "cur-east-at-the-top",
    title: "Why old maps put east at the top",
    hook: "For most of the Middle Ages a European map was held with sunrise at the top, and the word for finding your way still remembers it.",
    body:
      "The medieval mappa mundi was not a navigation aid. It was a diagram of a world with a theological shape, and the shape was fixed by scripture, not by the compass. Genesis placed Paradise in the east, so the east went at the top, where the eye began; Jerusalem sat at the centre; the three known continents were fitted into a circle divided by a T of water, the Mediterranean as the stem, the Don and the Nile as the crossbar. The Hereford map of about 1300 is the largest survivor. To arrange a map this way was to orient it, from the Latin oriens, the rising sun, and the verb outlived the convention.\n\nOther traditions chose differently and for equally good reasons. Islamic cartographers, al-Idrisi among them, often put south at the top, and Chinese maps tended toward north, perhaps because the emperor faced south and the map was drawn from his position.\n\nNorth-up won in Europe for two practical reasons. Ptolemy's Geography, recovered in Latin in the early fifteenth century, gave a grid with north at the top, and the magnetic compass gave sailors a north that was the same on every ship. Portolan charts were drawn from compass bearings, so their frame was the compass rose. Mercator's 1569 projection was built for those charts, and printing fixed the habit. The convention feels natural now only because it is old.",
    connects: ["renaissance", "printing-press", "silk-road", "istanbul"],
    domain: "geography",
    origin: "seeded",
  },
  {
    id: "cur-michelin-and-the-tyre",
    title: "How a tyre company came to grade restaurants",
    hook: "The Michelin stars exist because two brothers needed the French to drive more.",
    body:
      "In 1900 France had a few thousand motor cars and the Michelin brothers made tyres for them. Tyres wear out with distance, so the brothers' revenue rose with every kilometre driven, and the obstacle to driving was not the car but the country: no reliable maps, few garages, no way of knowing where you could sleep or eat. Their first guide, printed in a run of about 35,000 and given away, was a manual for the road. It explained how to change a tyre, listed mechanics, petrol sellers and hotels, and carried maps. A restaurant is a reason to make a journey, and a journey wears tyres. The guide was a complement to the product, in the economist's sense: something that raises demand for the thing you actually sell.\n\nThe restaurant grading came later and by degrees. The company says André Michelin saw a stack of free guides propping up a workbench in a garage and concluded that people only respect what they pay for; from 1920 the guide cost seven francs. That story is told by Michelin and may be tidied. What is documented is the sequence: paid restaurant listings were dropped, a restaurant section grew, a single star for a good table appeared in 1926, and the three-tier scheme, with its language of a detour and a special journey, followed in 1931 for the provinces and 1933 for Paris. Anonymous inspectors who pay their own bills were the mechanism that made the stars credible, and credibility was the whole asset.",
    connects: ["michelin-guide", "coffeehouses", "containerization"],
    domain: "food",
    origin: "seeded",
  },
  {
    id: "cur-runway-numbers",
    title: "Why runways are numbered as they are",
    hook: "A runway's number is a compass bearing with a digit cut off, which is why it occasionally has to be repainted.",
    body:
      "Runway 27 does not mean there are at least twenty-seven runways. It means the runway points at a magnetic heading of about 270 degrees, due west, rounded to the nearest ten and with the final zero dropped. Every runway is two runways, one for each direction, and the two numbers differ by 18, because the opposite heading is 180 degrees away: 09 and 27, 04 and 22, 18 and 36. There is no runway 00; north is 36. When an airport has parallel runways they share a number and gain a letter, L, C or R for left, centre and right as seen on approach. Where there are more parallels than letters, as at some large hubs, one pair is given the neighbouring number even though it points the same way.\n\nThe scheme works because a pilot on final approach already has a heading in front of them, and a number painted on the tarmac that matches the compass is a check that costs nothing. The complication is that magnetic north moves. The magnetic pole drifts, so the magnetic bearing of a fixed strip of concrete changes by a fraction of a degree a year; when the drift carries a runway across a rounding boundary, the number is wrong and it is repainted and every chart updated. Tampa's main runway became 19R/1L in 2011 for that reason. Near the poles, where magnetic bearings are unreliable, runways are numbered by true north instead.",
    connects: ["dubai", "containerization", "suez-canal"],
    domain: "technology",
    origin: "seeded",
  },
  {
    id: "cur-straight-borders",
    title: "Why some borders are perfectly straight",
    hook: "A straight border is a line that was easier to write down than to walk.",
    body:
      "Rivers, ridgelines and old field boundaries make wandering borders; treaties made at a table make straight ones. A parallel or a meridian can be written in a sentence, agreed by people who have never seen the land, and found later by anyone with a sextant. Surveying a watershed across a thousand kilometres of forest costs years. So the straight border is a record of who drew it and what they knew: the 49th parallel between the United States and British North America was fixed in 1818 and extended to the Pacific in 1846, long before most of it was surveyed. Much of the map of Africa was drawn in European capitals in the decades after the Berlin Conference of 1884 to 1885 by negotiators working from sparse maps, and the interior of the Arabian peninsula was partitioned in the same way.\n\nTwo consequences follow. The first is that the line on paper, once ratified, usually prevails over the ground. Surveyors of the western United States missed their intended parallels by hundreds of metres in places, and the marked line, not the mathematical one, is the legal border. The second is that two straight lines drawn at different times can disagree. Egypt and Sudan inherited an 1899 border on the 22nd parallel and a 1902 administrative line that departs from it; each state claims the version that gives it the coastal Hala'ib triangle, and neither claims the inland Bir Tawil, which is why a patch of desert is one of the few pieces of land on earth that no state claims.",
    connects: ["peace-of-westphalia", "ottoman-empire", "suez-canal"],
    domain: "politics",
    origin: "seeded",
  },
  {
    id: "cur-why-venice-was-powerful",
    title: "Why Venice was powerful",
    hook: "A city with no farmland, no timber and no fresh water ran the eastern Mediterranean for three centuries.",
    body:
      "Venice's first asset was a defect. The lagoon was too shallow for a war fleet and too wet for an army, so the settlement that grew on its mudbanks from the sixth century was safe while the mainland was fought over. Its early trade was salt and fish, then the carriage of goods between Byzantium and the passes into the Alps. Position did the rest: Venice sat where the Adriatic reaches furthest into Europe, at the end of the sea routes from Constantinople and Alexandria, and its merchants gained tax exemptions across the Byzantine empire in 1082 as the price of naval help.\n\nThe mechanism was organisation rather than heroism. The state built and owned the great galleys and auctioned space on them; sailings went in armed convoys, the mude, on fixed schedules to fixed destinations, which cut losses to piracy and let a merchant plan a year ahead. The Arsenal, a state shipyard employing thousands, could fit out a galley in a day from standardised parts. Risk was shared by the colleganza, a contract in which a stay-at-home investor funded a travelling partner and they split the profit, so small capital could join large ventures. In 1204 the Fourth Crusade, diverted by Venetian debt, sacked Constantinople and left Venice with ports along the whole route east.\n\nThe decline was a change in geometry. When Portuguese ships reached India round Africa in 1498, and the Ottomans took the eastern shore, the spices Venice had carried overland and by galley went by a route that did not pass the lagoon.",
    connects: ["venetian-republic", "silk-road", "ottoman-empire", "double-entry-bookkeeping"],
    domain: "history",
    origin: "seeded",
  },
  {
    id: "cur-how-auction-houses-work",
    title: "How an auction house actually works",
    hook: "The hammer price is not what the buyer pays, not what the seller receives, and the early bids may have come from the ceiling.",
    body:
      "An auction house is an agent for the seller that also charges the buyer. The seller agrees a reserve, a confidential minimum below which the lot will not be sold, and pays a commission on the hammer price. The buyer pays the hammer price plus a buyer's premium, a percentage which Christie's introduced in London in 1975 and which now runs, on a sliding scale, from about a quarter of the price downward. The premium lets the house cut the seller's commission, sometimes to nothing, to win a desirable consignment; the seller sees a better headline, and buyers, bidding against each other rather than the house, tend to discount the premium less than they should.\n\nThe chandelier bid is the part that surprises people. Until the reserve is reached the auctioneer may call bids that no one made, taking them, as the phrase goes, from the chandelier. This is legal in London and New York provided the conditions of sale disclose it and no fictitious bid is placed at or above the reserve. The reasoning is that the reserve is the seller's own bid and the auctioneer may voice it, though it means an opening flurry may be entirely artificial.\n\nFor large lots the house may guarantee the seller a price, or sell that guarantee to a third party paid a share of any overage. That third party is often bidding in the room. The catalogue notes such arrangements with a small symbol, and reading the symbols is most of knowing what you are watching.",
    connects: ["english-auction", "game-theory", "impressionism"],
    domain: "business",
    origin: "seeded",
  },
  {
    id: "cur-two-timers",
    title: "Why chess clocks have two timers",
    hook: "The chess clock was invented to stop a man taking two and a half hours over a single move, and it changed what the game measured.",
    body:
      "Early tournament chess had no time limit, and the first great international tournament, London 1851, showed why one was needed: games ran for a working day, and one player was noted for thinking for hours over a move while his opponent waited. The first remedy, used at Anderssen's match with Kolisch in 1861, was an hourglass for each player, turned when it was your turn; the first mechanical chess clock, two pendulum clocks on a see-saw base so that tilting one stopped it and started the other, was built by Thomas Bright Wilson and used at London in 1883. The button-press design followed.\n\nTwo timers because time is a resource of the player, not of the game. A single clock would measure how long the game lasted; what matters is how much thought each side has spent. Pressing your button stops your clock and starts your opponent's, so the sum of the two dials is the length of the game and each dial is one player's account. That makes time something you can lose: if your flag falls before the required number of moves you lose, however good the position. Players began to bank time in the opening and spend it where the position was hard, and the clock created whole new forms, from blitz to the increment, patented by Bobby Fischer in 1989, which adds a few seconds per move so that a won position cannot be lost merely to the clock. The device did not just police the game; it added a second scarce resource to it.",
    connects: ["game-theory", "coffeehouses", "prisoners-dilemma"],
    domain: "technology",
    origin: "seeded",
  },
  {
    id: "cur-diplomatic-immunity",
    title: "How diplomatic immunity developed",
    hook: "The rule that an ambassador cannot be arrested grew out of a Russian ambassador's arrest for debt in London.",
    body:
      "Envoys have been protected for as long as there have been envoys, because a message cannot be sent if the messenger will be killed. Greek heralds were sacred; the Romans held the person of a legate inviolable. But these were protections for a visitor who would go home. The modern problem arose when the Italian states of the fifteenth century began keeping permanent ambassadors in each other's capitals. A resident is a neighbour: he rents a house, runs up bills, employs servants, may commit crimes. Whose law governs him?\n\nThe answer was reciprocity made into custom. In 1708 Andrey Matveev, the Russian ambassador in London, was pulled from his coach and jailed by creditors. Peter the Great demanded the bailiffs' heads; Queen Anne could not deliver them under English law, and Parliament instead passed the Diplomatic Privileges Act, declaring such arrests void. Every state that wanted its own envoys safe had reason to grant the same. Grotius had argued in 1625 that an ambassador should be treated as if outside the territory, a fiction the twentieth century replaced with a plainer rationale: immunity exists because the mission could not function without it, not because the diplomat is special.\n\nThe Vienna Convention of 1961 codified the custom and is among the most widely ratified treaties there is. It also contains the safety valves. Immunity belongs to the sending state, which can waive it; the host can declare any diplomat persona non grata and expel them without reasons. The system holds because every state is both host and sender.",
    connects: ["diplomatic-immunity", "venetian-republic", "peace-of-westphalia"],
    domain: "law",
    origin: "seeded",
  },
  {
    id: "cur-grammatical-gender",
    title: "Why some languages sort their nouns into genders",
    hook: "German gives the moon a masculine article and the sun a feminine one, and the reason has almost nothing to do with sex.",
    body:
      "Grammatical gender is a system of noun classes with agreement. Every noun belongs to a class, and other words that refer to it, articles, adjectives, sometimes verbs, change their form to match. The number of classes varies: French has two, German three, Bantu languages such as Swahili have well over a dozen, sorted roughly by things like people, trees, tools and abstractions. The word gender in this sense is from Latin genus, a kind, and only two of the kinds in European languages happen to align, loosely, with the sexes; the rest is assignment by sound, by suffix or by history. German Mädchen, girl, is neuter because all nouns ending in -chen are neuter.\n\nWhy have such a thing? The consensus answer is redundancy. Agreement lets a listener track which noun a later pronoun or adjective refers to, even across a noisy room or a long sentence, and it lets the grammar be recovered when a word is misheard. Systems like this arise from old classifier words or demonstratives that fused onto nouns and then spread by analogy. Once in place they are stable, but they can be lost. English had three genders in the Old English period; when its endings eroded, in part through contact with Norse speakers who shared vocabulary but not inflections, the agreement went with them, and the class system collapsed. Persian, Turkish, Finnish and Mandarin never had one of this type. Whether gender shapes how speakers think about objects is a live research question; the effects reported are small and contested.",
    connects: ["rosetta-stone", "the-odyssey", "mongol-empire"],
    domain: "science",
    origin: "seeded",
  },
  {
    id: "cur-the-first-deadline",
    title: "Where the deadline comes from",
    hook: "Before it was a date, a deadline was a line in a prison camp, and crossing it was fatal.",
    body:
      "The word is American and its earliest recorded sense is grim. In the Confederate prison at Andersonville, Georgia, in 1864, a light fence ran a few metres inside the stockade wall; a prisoner who stepped past it was shot by the guards on the parapet. Contemporary accounts and the trial of the camp's commandant, Henry Wirz, call it the dead-line, and the same device was used in other camps on both sides. An older, rarer use in angling, for a fishing line that does not move, is recorded, and the two may be independent; the prison sense is the one that spread.\n\nThe transfer to time came through printing. By the early twentieth century printers used dead-line for a mark on the bed of a press beyond which type would not print, the edge of the usable page. Newspapers had the word in the building and the thing it named already: a moment after which copy could not go in, because the press was locked and the trains left with the edition. Trade dictionaries record deadline as the hour for closing a page by the 1920s, and from newsrooms it went into general use for any last moment.\n\nThe path is worth noticing because it is typical. Words for abstract constraints are very often old words for physical ones, and the physical one is usually a boundary that is enforced. A deadline retains that: it is not the end of the work but the line after which the work no longer counts.",
    connects: ["printing-press", "coffeehouses"],
    domain: "history",
    origin: "seeded",
  },
  {
    id: "cur-tacoma-narrows",
    title: "What actually brought down the Tacoma Narrows bridge",
    hook: "The bridge that twisted itself apart in 1940 is still taught as a case of resonance, and that is probably the wrong lesson.",
    body:
      "The first Tacoma Narrows Bridge opened in July 1940 and fell into Puget Sound on 7 November. Its main span was 853 metres and its deck was stiffened by plate girders only 2.4 metres deep, a slenderness its designer, Leon Moisseiff, had argued was safe under the deflection theory then in fashion. It heaved vertically in modest winds from the day it opened, hence Galloping Gertie, and on the morning of the collapse a wind of about 19 metres per second set off something new: a torsional motion, the two edges of the deck rising and falling in opposition, twisting through tens of degrees about once every five seconds until the suspenders tore loose.\n\nThe textbook story is resonance: wind supplying periodic pushes at the deck's natural frequency, like a swing. But wind has no such steady rhythm, and the frequency of vortices shed from the deck did not match the twisting. Billah and Scanlan showed in 1991 that the mechanism was aeroelastic flutter: the deck's own motion changed the airflow round it in a way that fed energy back into the motion. Each twist altered the pressure on the deck so as to push the next twist harder: a self-excited oscillation with negative damping, needing no external beat. A narrow H-section deck in steady wind is enough.\n\nThe practical lesson was learned fast: suspension bridge decks are now tested as models in wind tunnels and stiffened, slotted or shaped like aerofoils so that motion damps itself. The pedagogical lesson took longer.",
    connects: ["falsifiability", "suez-canal"],
    domain: "science",
    origin: "seeded",
  },
  {
    id: "cur-fourth-of-july-1826",
    title: "Two presidents, one afternoon, the fiftieth Fourth of July",
    hook: "John Adams and Thomas Jefferson both died on 4 July 1826, and the question is what, if anything, that coincidence is evidence of.",
    body:
      "Adams died at Quincy, Massachusetts, in the late afternoon of 4 July 1826, aged ninety; Jefferson died at Monticello, Virginia, around one o'clock the same day, aged eighty-three. It was the fiftieth anniversary of the Declaration of Independence, of which Jefferson had been the drafter and Adams the loudest advocate in Congress. Adams's reported last words, Thomas Jefferson survives, are attested by family tradition rather than by anyone certain of hearing them, and some versions have him say only the name. Jefferson, drifting in and out of consciousness the night before, is reported to have asked whether it was yet the Fourth. Five years later James Monroe died on 4 July too.\n\nThere are two explanations on offer, and they are not exclusive. One is that dying people can sometimes hold on for a date that matters to them, a hypothesis that has been tested statistically on birthdays and holidays with mixed and mostly weak results; the effect, where it appears at all, is small. The other is selection. Of the fifty-six signers, and of the early presidents, any striking date of death would have been noticed and retold, and the number of possible coincidences is far larger than the one that happened. The right question is not how improbable this event was, which is easy to make very small, but how many equally memorable events could have occurred instead. Contemporaries did not ask it; they read the day as a sign, and it was reported across the country as one.",
    connects: ["base-rate-fallacy", "availability-heuristic", "napoleon-bonaparte"],
    domain: "history",
    origin: "seeded",
  },
  {
    id: "cur-pantheon-dome",
    title: "Why the Pantheon's dome is still standing",
    hook: "The largest unreinforced concrete dome in the world was poured under Hadrian, and its concrete is in some respects better than ours.",
    body:
      "The Pantheon in Rome was completed around 126 CE, and its dome, 43.3 metres across with an oculus more than eight metres wide open to the sky, has never been matched in unreinforced concrete. Three decisions explain it. The dome is thick at the base, about six metres, and thins toward the top to under two; the coffers cut weight where it matters least; and the aggregate in the concrete was graded, dense travertine and brick low down, light volcanic scoria and pumice in the upper rings, so that the dome weighs least where it is highest. The load path is a hemisphere on a drum whose walls are six metres thick and honeycombed with relieving arches. Roman concrete also has almost no tensile strength, and the Romans knew it; the shape was chosen so that the dome works almost entirely in compression.\n\nThe material itself is the second half of the answer. Roman concrete, opus caementicium, mixed lime with volcanic ash, notably the pozzolana quarried around Naples and Rome, and the ash reacted with the lime to form crystalline compounds that keep growing for centuries. Recent work has shown that Roman harbour concrete grew new minerals as seawater percolated through it, and that lumps of unreacted lime in the mix, long taken for poor quality control, fill cracks when water reaches them. Modern Portland cement is stronger in the short term but has none of this. And there is one more reason the dome has not fallen: it contains no steel, so there is nothing inside it to rust.",
    connects: ["renaissance", "istanbul", "venetian-republic"],
    domain: "technology",
    origin: "seeded",
  },
  {
    id: "cur-bank-run",
    title: "How a bank run works",
    hook: "A bank run is not a discovery that the bank is broke; it is a bet that everyone else is about to make the same bet.",
    body:
      "A bank takes deposits that can be withdrawn on demand and lends most of them for years. Only a fraction is kept as cash. This is not fraud; it is the service. Savers get liquidity, borrowers get long money, and the bank lives on the difference, because on an ordinary day withdrawals are a predictable trickle. The arrangement has one flaw. Deposits are paid in the order demanded, and a mortgage cannot be called in to meet them. If enough depositors ask at once, a solvent bank cannot pay, and the last in line get nothing.\n\nDiamond and Dybvig's 1983 model, which won them a Nobel in 2022, showed why the same facts produce two stable outcomes. If you expect others to stay, staying is best, and the bank is fine. If you expect others to run, you should run first, and your running makes the expectation true. No new information about the bank is required; a rumour will do, because the rumour is information about the other depositors. Northern Rock in 2007 was solvent when the queues formed. Silicon Valley Bank lost 42 billion dollars of deposits in one day in March 2023, mostly through banking apps: the queue can now be invisible.\n\nThe remedies address expectations rather than cash. Deposit insurance, American since 1933, removes the reason to run: you will be paid either way. A lender of last resort, lending freely against good collateral at a penalty rate in Bagehot's 1873 formulation, lets a solvent bank meet any queue. Both work best by never being used.",
    connects: ["central-banks", "fiat-money", "game-theory", "prisoners-dilemma"],
    domain: "economics",
    origin: "seeded",
  },
  {
    id: "cur-circle-of-fifths",
    title: "The circle of fifths in one paragraph",
    hook: "Twelve steps of the same interval bring you back where you started, and that closed loop is the map of Western harmony.",
    body:
      "Take any note and go up a perfect fifth, seven semitones; do it twelve times and you have visited all twelve pitches of the chromatic scale once each and arrived, seven octaves higher, back at the name you began with. Arrange those twelve as a clock face, C at the top, G at one o'clock, D at two, and you have the circle of fifths. Its use is that neighbours on the circle are close in every sense a composer cares about. The major scales of C and G share six of their seven notes; move one step clockwise and the key signature gains one sharp, one step anticlockwise and it gains one flat, so the circle is also a chart of key signatures. A chord tends to resolve to the chord a fifth below it, one step anticlockwise, which is why the progression through the circle sounds like homecoming and why a piece can modulate to a nearby key without the listener noticing the join, while a jump across the circle sounds like a door slamming. There is a catch, and it built the modern piano. Twelve pure fifths, each a frequency ratio of 3 to 2, do not quite equal seven octaves; they overshoot by about 1.4 percent, the Pythagorean comma, so the circle does not truly close. Equal temperament spreads that error evenly, making every fifth very slightly flat and every key equally usable. Bach's Well-Tempered Clavier, twenty-four preludes and fugues through every key, demonstrated that a tuning which tolerates this could go all the way round.",
    connects: ["johann-sebastian-bach", "impressionism"],
    domain: "music",
    origin: "seeded",
  },
  {
    id: "cur-marshmallow-test",
    title: "The marshmallow test, and what happened when it was rerun",
    hook: "A child who waits fifteen minutes for a second marshmallow was supposed to be showing willpower; a larger study suggests it was showing something else.",
    body:
      "Around 1970 Walter Mischel and colleagues sat four-year-olds at a table in Stanford's Bing Nursery School with a treat in front of them. They could eat it now, or wait alone for up to twenty minutes and receive two. The original experiments were about strategy: children who covered their eyes, sang, or thought of the marshmallow as a cloud waited far longer, and Mischel's point was that self-control is a skill of attention, not a fixed quantity of grit. The famous part came later: follow-ups in the late 1980s on fewer than a hundred of those children found that seconds of waiting at four correlated with parental ratings of competence and with SAT scores. The result travelled as a claim that one childhood moment predicts a life.\n\nIn 2018 Tyler Watts, Greg Duncan and Haonan Quan ran the closest thing to a replication, with over nine hundred children far more varied in family income than the Stanford nursery. The raw correlation with achievement at fifteen was about half the original; after adjusting for family circumstances and early cognitive ability it shrank to little, and most of what remained lay between waiting under twenty seconds and waiting at all. A 2013 study had already shown that children wait longer for an adult who has kept a promise a few minutes earlier. Waiting, in other words, is partly a judgement about whether the second marshmallow will really come, and children who have reason to doubt it are not being weak; they are being calibrated.",
    connects: ["base-rate-fallacy", "falsifiability", "availability-heuristic"],
    domain: "psychology",
    origin: "seeded",
  },
  {
    id: "cur-railway-time",
    title: "Why time zones exist",
    hook: "Until the railways, every town kept its own noon, and the trains could not be timetabled against a thousand clocks.",
    body:
      "Before the nineteenth century time was local by definition. Noon was when the sun was highest, and since the sun reaches Bristol about ten minutes after it reaches London, Bristol's clocks ran ten minutes behind. Nobody minded, because nothing moved fast enough for the difference to matter. Railways did. A timetable written in London time was wrong at every station to the west, and on a single track, where trains passing in opposite directions depend on each being where the schedule says, a disagreement of minutes was a collision. The Great Western Railway adopted London time across its network in 1840, others followed, and by the mid-1850s most British public clocks showed Greenwich time, a few towns keeping a second minute hand for local time out of pride. The law caught up in 1880.\n\nThe United States had the harder problem, since it spans about four hours of sun, and its railways ran on dozens of separate operating times. On 18 November 1883, the day of two noons, the railway companies switched to four zones an hour apart, each centred on a meridian a multiple of fifteen degrees from Greenwich. Most cities followed within weeks, because the station clock was the one people had to obey. Congress did not make it law until 1918. In 1884 an international conference in Washington chose Greenwich as the prime meridian for the world, largely because most shipping already used its charts. Time zones are what happens when a coordination problem is solved by whoever bears the cost of leaving it unsolved.",
    connects: ["containerization", "gold-standard", "suez-canal"],
    domain: "history",
    origin: "seeded",
  },
  {
    id: "cur-baltic-amber",
    title: "The Baltic amber trade",
    hook: "Fossil resin from a vanished forest was carried across Europe for three thousand years, and the chemistry can still prove where a bead was born.",
    body:
      "Baltic amber is the resin of conifers that grew in northern Europe around forty-four million years ago, buried, hardened and eventually washed out of a layer of blue clay on the Sambian coast near Kaliningrad, where after storms it can still be picked up on the beach. Nine-tenths of the world's amber comes from this one stretch of shore. Supply was concentrated at a single point and demand was everywhere, the recipe for long-distance trade before such trade was ordinary. Amber turns up in Mycenaean shaft graves of the sixteenth century BCE, in Etruscan tombs, and from the first century CE Roman traders travelled a route from the Adriatic port of Aquileia north through Carnuntum on the Danube to the Baltic. Pliny tells of a knight sent north for Nero's games who returned with enough amber to decorate an arena. The stone was light, warm, took a polish, smelled of pine when burned and attracted chaff when rubbed; the Greek word for it, elektron, is why we say electricity.\n\nThe reason we know a Mycenaean bead is Baltic and not Sicilian is succinic acid. Baltic amber contains a few percent of it, most other ambers almost none, and infrared spectroscopy shows a characteristic flat shoulder in the spectrum. The routes were mapped from the finds. In the Middle Ages the Teutonic Order claimed every piece washed up on its coast and hanged unlicensed gatherers; the Hanseatic towns sold the rosary beads made from it across Europe, and the monopoly passed with the land to Prussia.",
    connects: ["silk-road", "hanseatic-league", "the-odyssey"],
    domain: "history",
    origin: "seeded",
  },
  {
    id: "cur-qwerty",
    title: "Why the keyboard is QWERTY",
    hook: "The story that the layout was designed to slow typists down is repeated everywhere, and the evidence for it is thin.",
    body:
      "Christopher Latham Sholes and his partners in Milwaukee built their typewriter through the late 1860s and sold the design to Remington, which put it on sale in 1874. The letter arrangement went through several versions before settling into something close to the modern one, and the question is what drove the changes. The popular account says that fast typists jammed the type bars, which swung up to a common point and could lock if two adjacent bars rose together, so Sholes scattered common pairs of letters to slow the typist. It is plausible, and no contemporary document says it; touch typing had not been invented, and few of Sholes's users were fast.\n\nThe alternative, argued by Koichi and Motoko Yasuoka from the patent sequence, is that the layout evolved to suit telegraph operators, the first professional users, who transcribed Morse code as it came in and needed ambiguous characters within easy reach of each other. That the top row contains every letter of TYPEWRITER, convenient for salesmen, may be coincidence or design; nobody knows. What is not contested is why QWERTY persisted. Once typists were trained on it and machines built for it, no manufacturer could switch alone: a layout's value lay in how many people already knew it. The Dvorak layout of 1936 claimed large speed gains, but the supporting trials were Dvorak's own, and later comparisons found the advantage small. Whether QWERTY is a case of a market locked into an inferior standard, or simply of a standard that was good enough, is still argued.",
    connects: ["printing-press", "game-theory", "containerization"],
    domain: "technology",
    origin: "seeded",
  },
  {
    id: "cur-the-box-and-the-port",
    title: "How the container ship moved the port",
    hook: "The steel box did not just make shipping cheaper; it made the old ports, and the cities built around them, the wrong shape.",
    body:
      "Before 1956 a cargo ship was loaded by hand. Goods came to the quay in sacks, crates, barrels and bales, and gangs of dockers packed them into the hold one by one, which kept a ship in port about as long as it spent at sea and made pilferage routine. Ports were therefore in the middle of cities, where labour and warehouses were: London's docks, Manhattan's finger piers, the Hamburg Speicherstadt. Malcom McLean's first container voyage, Newark to Houston in April 1956, put the same goods in identical steel boxes a crane could lift from lorry to ship in minutes. Loading cost per ton fell by more than an order of magnitude, and the real economies came once the box's dimensions were standardised internationally between 1968 and 1970, so that any crane, chassis, wagon or ship could take any box.\n\nThe consequence for ports was geometric. A container terminal needs deep water, kilometres of flat land to stack boxes, gantry cranes, rail and motorway access, and very few people. None of that describes an old harbour. So the trade left: from London to Tilbury and then Felixstowe, from Manhattan to the marshes of Elizabeth, New Jersey, from the old quays of Rotterdam out to the reclaimed Maasvlakte. London's docks, which had employed tens of thousands, closed between 1967 and 1981 and became housing and offices. The jobs went with the cranes, the ships grew twentyfold, and the price of moving a thing across the world stopped being a reason not to make it somewhere else.",
    connects: ["containerization", "suez-canal", "dubai", "hanseatic-league"],
    domain: "business",
    origin: "seeded",
  },
];
